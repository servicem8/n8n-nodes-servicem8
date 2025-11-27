import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, CrudConfig } from './types';
import { extractCreatedUuid } from './types';
import { BaseHandler } from './BaseHandler';
import { serviceM8ApiRequest } from '../GenericFunctions';

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
				return this.standardGet(ctx);
			case 'getMany':
				return this.standardGetMany(ctx);
			case 'create':
				return this.standardCreate(ctx);
			case 'update':
				return this.standardUpdate(ctx);
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
}
