import type { IDataObject, INodeExecutionData, IBinaryKeyData } from 'n8n-workflow';
import { NodeOperationError, BINARY_ENCODING } from 'n8n-workflow';
import type { HandlerContext, CrudConfig } from './types';
import { BaseHandler } from './BaseHandler';
import { serviceM8ApiRequest, getAllData } from '../GenericFunctions';
import type { Readable } from 'node:stream';
import FormData from 'form-data';

const BASE_URL = 'https://api.servicem8.com/api_1.0';

/**
 * Handler for Attachment resource operations.
 * Supports get (with optional file download), getMany, create (with file upload), and delete.
 */
export class AttachmentHandler extends BaseHandler {
	readonly resource = 'attachment';

	protected readonly crudConfig: CrudConfig = {
		apiObject: 'attachment',
		baseUrl: `${BASE_URL}/attachment`,
		supportsFiltering: true,
		supportsActiveFilter: true,
	};

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'get':
				return this.getAttachment(ctx);
			case 'getMany':
				return this.getManyAttachments(ctx);
			case 'create':
				return this.createAttachment(ctx);
			case 'delete':
				return this.deleteAttachment(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	/**
	 * Get a single attachment by UUID, with optional file download
	 */
	private async getAttachment(ctx: HandlerContext): Promise<unknown> {
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		const downloadFile = ctx.executeFunctions.getNodeParameter(
			'downloadFile',
			ctx.itemIndex,
			true,
		) as boolean;

		// Get attachment metadata
		const metadataEndpoint = `${BASE_URL}/attachment/${uuid.trim()}.json`;
		const metadataResponse = await getAllData.call(
			ctx.executeFunctions,
			metadataEndpoint,
		);
		const metadata = Array.isArray(metadataResponse) ? metadataResponse[0] : metadataResponse;

		// If not downloading file, just return metadata
		if (!downloadFile) {
			return metadata;
		}

		// Download the file as well
		const binaryPropertyName = ctx.executeFunctions.getNodeParameter(
			'binaryPropertyName',
			ctx.itemIndex,
			'data',
		) as string;

		const fileName = (metadata?.attachment_name as string) || 'file';
		const fileType = (metadata?.file_type as string) || '';
		const fullFileName = fileType && !fileName.endsWith(fileType)
			? fileName + fileType
			: fileName;

		// Download the binary file - the endpoint 302s to S3
		const fileEndpoint = `${BASE_URL}/attachment/${uuid.trim()}.file`;

		const response = await ctx.executeFunctions.helpers.httpRequestWithAuthentication.call(
			ctx.executeFunctions,
			'serviceM8CredentialsApi',
			{
				method: 'GET',
				url: fileEndpoint,
				encoding: 'arraybuffer',
				returnFullResponse: true,
				json: false,
			},
		);

		const binaryBuffer = Buffer.from(response.body as ArrayBuffer);

		// Determine mime type from response headers or file extension
		let mimeType = response.headers?.['content-type'] as string;
		if (!mimeType || mimeType === 'application/octet-stream') {
			mimeType = this.getMimeTypeFromExtension(fileType);
		}

		// Create binary data
		const binaryData = await ctx.executeFunctions.helpers.prepareBinaryData(
			binaryBuffer,
			fullFileName,
			mimeType,
		);

		// Get existing item data
		const items = ctx.executeFunctions.getInputData();
		const item = items[ctx.itemIndex];

		// Create new item with attachment metadata as JSON and binary file data
		const newItem: INodeExecutionData = {
			json: metadata as IDataObject,
			binary: {},
			pairedItem: { item: ctx.itemIndex },
		};

		// Preserve existing binary data from input
		if (item.binary) {
			Object.assign(newItem.binary as IBinaryKeyData, item.binary);
		}

		newItem.binary![binaryPropertyName] = binaryData;

		return newItem;
	}

	/**
	 * Get multiple attachments for a job or client
	 */
	private async getManyAttachments(ctx: HandlerContext): Promise<unknown> {
		const endpoint = `${BASE_URL}/attachment.json`;
		const qs: IDataObject = {};

		const limit = ctx.executeFunctions.getNodeParameter(
			'limit',
			ctx.itemIndex,
			0,
		) as number;

		const includeInactive = ctx.executeFunctions.getNodeParameter(
			'includeInactive',
			ctx.itemIndex,
			false,
		) as boolean;

		const relatedObjectType = ctx.executeFunctions.getNodeParameter(
			'relatedObjectType',
			ctx.itemIndex,
			'',
		) as string;

		const relatedObjectUuid = ctx.executeFunctions.getNodeParameter(
			'relatedObjectUuid',
			ctx.itemIndex,
			'',
		) as string;

		const filterParts: string[] = [];

		if (!includeInactive) {
			filterParts.push("active eq '1'");
		}

		filterParts.push(`related_object eq '${relatedObjectType}'`);
		filterParts.push(`related_object_uuid eq '${relatedObjectUuid.trim()}'`);

		if (filterParts.length > 0) {
			qs['$filter'] = filterParts.join(' and ');
		}

		return getAllData.call(ctx.executeFunctions, endpoint, qs, limit);
	}

	/**
	 * Create a new attachment record and upload the file binary data.
	 * This is a two-step process:
	 * 1. Create the attachment metadata record
	 * 2. Upload the binary file to the attachment
	 */
	private async createAttachment(ctx: HandlerContext): Promise<unknown> {
		const relatedObjectType = ctx.executeFunctions.getNodeParameter(
			'relatedObjectType',
			ctx.itemIndex,
			'',
		) as string;

		const relatedObjectUuid = ctx.executeFunctions.getNodeParameter(
			'relatedObjectUuid',
			ctx.itemIndex,
			'',
		) as string;

		const binaryPropertyName = ctx.executeFunctions.getNodeParameter(
			'binaryPropertyName',
			ctx.itemIndex,
			'data',
		) as string;

		const options = ctx.executeFunctions.getNodeParameter(
			'options',
			ctx.itemIndex,
			{},
		) as IDataObject;

		// Get binary data
		const binaryData = ctx.executeFunctions.helpers.assertBinaryData(
			ctx.itemIndex,
			binaryPropertyName,
		);

		// Get file info from binary data
		const fileName = binaryData.fileName || 'file';
		const mimeType = binaryData.mimeType || 'application/octet-stream';

		// Determine file extension
		let fileType = options.file_type as string;
		if (!fileType) {
			const lastDot = fileName.lastIndexOf('.');
			fileType = lastDot > 0 ? fileName.substring(lastDot) : '';
		}
		// Ensure file_type starts with a dot
		if (fileType && !fileType.startsWith('.')) {
			fileType = '.' + fileType;
		}

		// Determine attachment name
		const attachmentName = (options.attachment_name as string) || fileName;

		// Step 1: Create attachment metadata record
		const attachmentBody: IDataObject = {
			related_object: relatedObjectType,
			related_object_uuid: relatedObjectUuid.trim(),
			attachment_name: attachmentName,
			file_type: fileType,
			active: 1,
		};

		// Add optional fields
		if (options.attachment_source) {
			attachmentBody.attachment_source = options.attachment_source;
		}
		if (options.tags) {
			attachmentBody.tags = options.tags;
		}
		if (options.lat) {
			attachmentBody.lat = options.lat;
		}
		if (options.lng) {
			attachmentBody.lng = options.lng;
		}
		if (options.is_favourite) {
			attachmentBody.is_favourite = options.is_favourite ? '1' : '0';
		}
		if (options.metadata) {
			attachmentBody.metadata = options.metadata;
		}

		const createResponse = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'POST',
			`${BASE_URL}/attachment.json`,
			{},
			attachmentBody,
		);

		const attachmentUuid = createResponse.headers?.['x-record-uuid'];
		if (!attachmentUuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Failed to create attachment record - no UUID returned',
				{ itemIndex: ctx.itemIndex },
			);
		}

		// Step 2: Upload the binary file
		let fileBuffer: Buffer;
		const itemBinaryData = ctx.executeFunctions.helpers.assertBinaryData(
			ctx.itemIndex,
			binaryPropertyName,
		);

		if (itemBinaryData.id) {
			// Large file stored separately - get as stream and convert to buffer
			const stream = await ctx.executeFunctions.helpers.getBinaryStream(itemBinaryData.id);
			fileBuffer = await this.streamToBuffer(stream);
		} else {
			// Small file stored inline as base64
			fileBuffer = Buffer.from(itemBinaryData.data, BINARY_ENCODING);
		}

		// Create multipart form data
		const formData = new FormData();
		formData.append('file', fileBuffer, {
			filename: fileName,
			contentType: mimeType,
		});

		// Upload the file using httpRequestWithAuthentication with form-data
		const uploadEndpoint = `${BASE_URL}/attachment/${attachmentUuid}.file`;

		await ctx.executeFunctions.helpers.httpRequestWithAuthentication.call(
			ctx.executeFunctions,
			'serviceM8CredentialsApi',
			{
				method: 'POST',
				url: uploadEndpoint,
				body: formData,
				headers: formData.getHeaders(),
			},
		);

		return {
			uuid: attachmentUuid,
			attachment_name: attachmentName,
			file_type: fileType,
			related_object: relatedObjectType,
			related_object_uuid: relatedObjectUuid,
		};
	}

	/**
	 * Delete (soft delete) an attachment
	 */
	private async deleteAttachment(ctx: HandlerContext): Promise<unknown> {
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		const endpoint = `${BASE_URL}/attachment/${uuid.trim()}.json`;
		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'DELETE',
			endpoint,
		);
		return responseData.body;
	}

	/**
	 * Convert a readable stream to a buffer
	 */
	private async streamToBuffer(stream: Readable): Promise<Buffer> {
		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(Buffer.from(chunk));
		}
		return Buffer.concat(chunks);
	}

	/**
	 * Get MIME type from file extension
	 */
	private getMimeTypeFromExtension(extension: string): string {
		const ext = extension.toLowerCase().replace(/^\./, '');
		const mimeTypes: Record<string, string> = {
			'pdf': 'application/pdf',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'webp': 'image/webp',
			'svg': 'image/svg+xml',
			'doc': 'application/msword',
			'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'xls': 'application/vnd.ms-excel',
			'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'txt': 'text/plain',
			'csv': 'text/csv',
			'json': 'application/json',
			'xml': 'application/xml',
			'zip': 'application/zip',
			'mp4': 'video/mp4',
			'mp3': 'audio/mpeg',
			'wav': 'audio/wav',
		};
		return mimeTypes[ext] || 'application/octet-stream';
	}
}
