import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler } from './types';
import { serviceM8ApiRequest } from '../GenericFunctions';

/**
 * Handler for Email resource operations
 */
export class EmailHandler implements ResourceHandler {
	readonly resource = 'email';

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'sendEmail':
				return this.sendEmail(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	private async sendEmail(ctx: HandlerContext): Promise<unknown> {
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const body = { ...fields };
		let headers: IDataObject = {};

		const endpoint = 'https://api.servicem8.com/platform_service_email';

		if (body['x-impersonate-uuid']) {
			headers = { 'x-impersonate-uuid': body['x-impersonate-uuid'] };
			delete body['x-impersonate-uuid'];
		}

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'POST',
			endpoint,
			{},
			body,
			headers,
		);

		return responseData.body;
	}
}
