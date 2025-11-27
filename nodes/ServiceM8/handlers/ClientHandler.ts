import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, CrudConfig } from './types';
import { BaseHandler } from './BaseHandler';

/**
 * Handler for Client resource operations.
 * Uses standard CRUD from BaseHandler.
 */
export class ClientHandler extends BaseHandler {
	readonly resource = 'client';

	protected readonly crudConfig: CrudConfig = {
		apiObject: 'company',
		baseUrl: 'https://api.servicem8.com/api_1.0/company',
		supportsFiltering: true,
		supportsActiveFilter: true,
	};

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'get':
				return this.standardGet(ctx);
			case 'getMany':
				return this.standardGetMany(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}
}
