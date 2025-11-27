import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler } from './types';
import { serviceM8ApiRequest } from '../GenericFunctions';
import type { InboxMessageFields } from '../types';

/**
 * Handler for Inbox resource operations.
 * Fully custom - uses different API patterns than standard resources.
 */
export class InboxHandler implements ResourceHandler {
	readonly resource = 'inbox';

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'get':
				return this.get(ctx);
			case 'getMany':
				return this.getMany(ctx);
			case 'convertToJob':
				return this.convertToJob(ctx);
			case 'createInboxMessage':
				return this.createInboxMessage(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	/**
	 * Get a single inbox message by UUID
	 * @see https://developer.servicem8.com/reference/getinboxmessage
	 */
	private async get(ctx: HandlerContext): Promise<unknown> {
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		if (!uuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'UUID is required to get an inbox message',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const endpoint = `https://api.servicem8.com/api_1.0/inboxmessage/${uuid.trim()}.json`;
		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'GET',
			endpoint,
		);

		return responseData.body;
	}

	/**
	 * List inbox messages with optional filtering
	 * @see https://developer.servicem8.com/reference/listinboxmessages
	 */
	private async getMany(ctx: HandlerContext): Promise<unknown> {
		const endpoint = 'https://api.servicem8.com/api_1.0/inboxmessage.json';
		const inboxFilter = ctx.executeFunctions.getNodeParameter(
			'inboxFilter',
			ctx.itemIndex,
			'all',
		) as string;
		const inboxSearch = ctx.executeFunctions.getNodeParameter(
			'inboxSearch',
			ctx.itemIndex,
			'',
		) as string;
		const limit = ctx.executeFunctions.getNodeParameter(
			'limit',
			ctx.itemIndex,
			50,
		) as number;

		const qs: IDataObject = {
			limit,
		};

		if (inboxFilter && inboxFilter !== 'all') {
			qs['filter'] = inboxFilter;
		}
		if (inboxSearch) {
			qs['search'] = inboxSearch;
		}

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'GET',
			endpoint,
			qs,
		);

		// The API returns { messages: [...], pagination: {...} }
		return responseData.body?.messages ?? responseData.body ?? [];
	}

	/**
	 * Convert an inbox message into a new job
	 * @see https://developer.servicem8.com/reference/convertinboxmessagetojob
	 */
	private async convertToJob(ctx: HandlerContext): Promise<unknown> {
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		if (!uuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'UUID is required to convert an inbox message to job',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const jobTemplateUUID = ctx.executeFunctions.getNodeParameter(
			'jobTemplateUUID',
			ctx.itemIndex,
			'',
		) as string;
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;

		const endpoint = `https://api.servicem8.com/api_1.0/inboxmessage/${uuid.trim()}/convert-to-job.json`;

		const body: IDataObject = {};
		if (jobTemplateUUID) {
			body.template_uuid = jobTemplateUUID;
		}
		if (fields.note) {
			body.note = fields.note;
		}

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'POST',
			endpoint,
			{},
			body,
		);

		return responseData.body;
	}

	/**
	 * Create a new inbox message
	 * @see https://developer.servicem8.com/reference/inboxmessage
	 */
	private async createInboxMessage(ctx: HandlerContext): Promise<unknown> {
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as Partial<InboxMessageFields>;

		const body: IDataObject = {};
		const endpoint = 'https://api.servicem8.com/api_1.0/inboxmessage.json';

		// Required fields
		const requiredFields = ['subject', 'message_text'] as const;
		for (const key of requiredFields) {
			const rawValue = fields[key];
			const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
			if (!value) {
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`"${key}" is required to create an inbox message`,
					{ itemIndex: ctx.itemIndex },
				);
			}
			body[key] = value;
		}

		// Optional string fields
		const optionalKeys = ['from_name', 'from_email', 'regarding_company_uuid'] as const;
		for (const key of optionalKeys) {
			const rawValue = fields[key];
			if (typeof rawValue === 'string') {
				const trimmed = rawValue.trim();
				if (trimmed !== '') {
					body[key] = trimmed;
				}
			}
		}

		// Handle json_data
		const jsonDataValue =
			typeof fields.json_data === 'string'
				? fields.json_data.trim()
				: fields.json_data;
		if (jsonDataValue) {
			let parsedJson: IDataObject;
			if (typeof jsonDataValue === 'string') {
				try {
					parsedJson = JSON.parse(jsonDataValue as string) as IDataObject;
				} catch {
					throw new NodeOperationError(
						ctx.executeFunctions.getNode(),
						'json_data must be a valid JSON string',
						{ itemIndex: ctx.itemIndex },
					);
				}
			} else {
				parsedJson = jsonDataValue as IDataObject;
			}
			if (Object.keys(parsedJson ?? {}).length) {
				body.json_data = parsedJson;
			}
		}

		// Handle jobData
		if (fields.jobData && typeof fields.jobData === 'object') {
			const jobData = { ...(fields.jobData as IDataObject) };
			for (const key of Object.keys(jobData)) {
				if (
					typeof jobData[key] === 'string' &&
					(jobData[key] as string).trim() === ''
				) {
					delete jobData[key];
				}
			}
			if (Object.keys(jobData).length) {
				body.jobData = jobData;
			}
		}

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'POST',
			endpoint,
			{},
			body,
		);

		return responseData.body;
	}
}
