import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler, CrudConfig } from './types';
import { extractCreatedUuid } from './types';
import {
	serviceM8ApiRequest,
	getAllData,
	getEndpoint,
	getUrlParams,
	processFilters,
	processBody,
} from '../GenericFunctions';

/**
 * Base handler providing standard CRUD operations.
 * Resources that follow the standard ServiceM8 API pattern can extend this
 * and get get/getMany/create/update/delete for free.
 */
export abstract class BaseHandler implements ResourceHandler {
	abstract readonly resource: string;
	protected abstract readonly crudConfig: CrudConfig;

	abstract execute(ctx: HandlerContext, operation: string): Promise<unknown>;

	/**
	 * GET a single record by UUID
	 */
	protected async standardGet(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'get');
		return getAllData.call(ctx.executeFunctions, endpoint);
	}

	/**
	 * GET multiple records with optional filtering and pagination
	 */
	protected async standardGetMany(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'getMany');
		const qs: IDataObject = {};

		if (this.crudConfig.supportsFiltering) {
			const filters = ctx.executeFunctions.getNodeParameter(
				'filters',
				ctx.itemIndex,
				{},
			) as IDataObject;
			const filtersString = await processFilters.call(
				ctx.executeFunctions,
				this.resource,
				filters?.filter as IDataObject[],
			);

			const filterParts: string[] = [];
			if (filtersString) {
				filterParts.push(filtersString);
			}

			if (this.crudConfig.supportsActiveFilter) {
				const includeInactive = ctx.executeFunctions.getNodeParameter(
					'includeInactive',
					ctx.itemIndex,
					false,
				) as boolean;
				if (!includeInactive) {
					filterParts.push("active eq '1'");
				}
			}

			if (filterParts.length > 0) {
				qs['$filter'] = filterParts.join(' and ');
			}
		}

		return getAllData.call(ctx.executeFunctions, endpoint, qs);
	}

	/**
	 * CREATE a new record
	 */
	protected async standardCreate(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'create');
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

		return extractCreatedUuid(responseData);
	}

	/**
	 * UPDATE an existing record
	 */
	protected async standardUpdate(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'update');
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const body = await processBody.call(
			ctx.executeFunctions,
			this.resource,
			fields.field as IDataObject[],
		);

		if (!Object.keys(body as IDataObject).length) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'No fields to update were added',
				{ itemIndex: ctx.itemIndex },
			);
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
	 * DELETE a record (soft delete)
	 */
	protected async standardDelete(ctx: HandlerContext): Promise<unknown> {
		const endpoint = await this.buildEndpoint(ctx, 'delete');
		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'DELETE',
			endpoint,
		);
		return responseData.body;
	}

	/**
	 * Build endpoint URL with URL parameter substitution
	 */
	protected async buildEndpoint(
		ctx: HandlerContext,
		operation: string,
	): Promise<string> {
		let endpoint = await getEndpoint.call(
			ctx.executeFunctions,
			this.resource,
			operation,
		);
		const urlParams = await getUrlParams.call(
			ctx.executeFunctions,
			this.resource,
			operation,
		);

		for (const param of urlParams) {
			let tempParam = ctx.executeFunctions.getNodeParameter(
				param,
				ctx.itemIndex,
				'',
			) as string;
			if (!tempParam) {
				const fields = ctx.executeFunctions.getNodeParameter(
					'fields',
					ctx.itemIndex,
					{},
				) as IDataObject;
				tempParam = fields[param] as string;
			}
			endpoint = endpoint.replace('{' + param + '}', tempParam?.trim() ?? '');
		}

		return endpoint;
	}
}
