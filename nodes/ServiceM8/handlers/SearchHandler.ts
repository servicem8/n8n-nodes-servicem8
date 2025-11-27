import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler } from './types';
import { serviceM8ApiRequest, getEndpoint, getUrlParams } from '../GenericFunctions';

/**
 * Handler for Search resource operations
 */
export class SearchHandler implements ResourceHandler {
	readonly resource = 'search';

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'objectSearch':
				return this.objectSearch(ctx);
			case 'globalSearch':
				return this.globalSearch(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	private async objectSearch(ctx: HandlerContext): Promise<unknown> {
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;

		if (!fields?.q) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'No search query was provided.',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const endpoint = await this.buildEndpoint(ctx, 'objectSearch');
		const qs = { ...fields };
		delete qs.objectType;

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'GET',
			endpoint,
			qs,
		);

		return responseData.body;
	}

	private async globalSearch(ctx: HandlerContext): Promise<unknown> {
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;

		if (!fields?.q) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'No search query was provided.',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const endpoint = await this.buildEndpoint(ctx, 'globalSearch');
		const qs = { ...fields };

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'GET',
			endpoint,
			qs,
		);

		return responseData.body;
	}

	private async buildEndpoint(
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
