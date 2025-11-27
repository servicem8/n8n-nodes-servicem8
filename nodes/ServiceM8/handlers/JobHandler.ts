import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, CrudConfig } from './types';
import { extractCreatedUuid } from './types';
import { BaseHandler } from './BaseHandler';
import { serviceM8ApiRequest, getAllData } from '../GenericFunctions';

/**
 * Handler for Job resource operations.
 * Extends BaseHandler for standard CRUD, adds custom operations.
 */
export class JobHandler extends BaseHandler {
	readonly resource = 'job';

	protected readonly crudConfig: CrudConfig = {
		apiObject: 'job',
		baseUrl: 'https://api.servicem8.com/api_1.0/job',
		supportsFiltering: true,
		supportsActiveFilter: true,
	};

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'get':
				return this.getWithContacts(ctx);
			case 'getMany':
				return this.standardGetMany(ctx);
			case 'create':
				return this.standardCreate(ctx);
			case 'update':
				return this.standardUpdate(ctx);
			case 'updateContacts':
				return this.updateContacts(ctx);
			case 'delete':
				return this.standardDelete(ctx);
			case 'createFromTemplate':
				return this.createFromTemplate(ctx);
			case 'addNoteToJob':
				return this.addNoteToJob(ctx);
			case 'sendJobToQueue':
				return this.sendJobToQueue(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	private async createFromTemplate(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'createFromTemplate');
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const body = { ...fields };

		// If both company_name and company_uuid are provided, remove company_name
		if (body.company_name && body.company_uuid) {
			delete body.company_name;
		}

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'POST',
			endpoint,
			{},
			body,
		);

		return extractCreatedUuid(responseData);
	}

	private async addNoteToJob(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'addNoteToJob');
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const body = {
			...fields,
			related_object: 'job',
			active: 1,
		};

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'POST',
			endpoint,
			{},
			body,
		);

		return extractCreatedUuid(responseData);
	}

	private async sendJobToQueue(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'sendJobToQueue');
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const body = fields;

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
	 * Get a job with optional contacts included
	 */
	private async getWithContacts(ctx: HandlerContext): Promise<unknown> {
		const jobData = await this.standardGet(ctx);

		const includeContacts = ctx.executeFunctions.getNodeParameter(
			'includeContacts',
			ctx.itemIndex,
			true,
		) as boolean;

		if (!includeContacts) {
			return jobData;
		}

		// Get the job UUID from the parameter
		const jobUuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		// Fetch contacts for this job
		const contacts = await getAllData.call(
			ctx.executeFunctions,
			'https://api.servicem8.com/api_1.0/jobcontact.json',
			{ $filter: `job_uuid eq '${jobUuid.trim()}' and active eq '1'` },
		);

		// jobData from standardGet is an array, get first item
		const job = Array.isArray(jobData) ? jobData[0] : jobData;

		return {
			...(job as object),
			contacts,
		};
	}

	/**
	 * Update a single job contact (upsert by type, or direct update by UUID)
	 */
	private async updateContacts(ctx: HandlerContext): Promise<unknown> {
		const jobUuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		const contactType = ctx.executeFunctions.getNodeParameter(
			'contactType',
			ctx.itemIndex,
			'',
		) as string;

		const contactFields = ctx.executeFunctions.getNodeParameter(
			'contactFields',
			ctx.itemIndex,
			{},
		) as IDataObject;

		// Filter out empty/undefined values for sparse update support
		const filteredData: IDataObject = {};
		for (const [key, value] of Object.entries(contactFields)) {
			if (value !== undefined && value !== null && value !== '') {
				filteredData[key] = value;
			}
		}

		if (contactType === 'uuid') {
			// Direct update by UUID (not an upsert - let API error if not found)
			const contactUuid = ctx.executeFunctions.getNodeParameter(
				'contactUuid',
				ctx.itemIndex,
				'',
			) as string;

			await serviceM8ApiRequest.call(
				ctx.executeFunctions,
				'POST',
				`https://api.servicem8.com/api_1.0/jobcontact/${contactUuid.trim()}.json`,
				{},
				filteredData,
			);

			return { uuid: contactUuid.trim() };
		} else {
			// Upsert by type
			const existing = await getAllData.call(
				ctx.executeFunctions,
				'https://api.servicem8.com/api_1.0/jobcontact.json',
				{ $filter: `job_uuid eq '${jobUuid.trim()}' and type eq '${contactType}' and active eq '1'` },
			);

			if (existing.length > 0) {
				// Update existing
				const contactUuid = (existing[0] as IDataObject).uuid as string;
				await serviceM8ApiRequest.call(
					ctx.executeFunctions,
					'POST',
					`https://api.servicem8.com/api_1.0/jobcontact/${contactUuid}.json`,
					{},
					filteredData,
				);
				return { uuid: contactUuid };
			} else {
				// Create new
				const response = await serviceM8ApiRequest.call(
					ctx.executeFunctions,
					'POST',
					'https://api.servicem8.com/api_1.0/jobcontact.json',
					{},
					{ ...filteredData, job_uuid: jobUuid.trim(), type: contactType },
				);
				return extractCreatedUuid(response);
			}
		}
	}
}
