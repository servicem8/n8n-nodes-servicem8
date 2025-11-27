import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler } from './types';
import { serviceM8ApiRequest } from '../GenericFunctions';

/**
 * Handler for SMS resource operations
 */
export class SmsHandler implements ResourceHandler {
	readonly resource = 'sms';

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'sendSMS':
				return this.sendSMS(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	private async sendSMS(ctx: HandlerContext): Promise<unknown> {
		const fields = ctx.executeFunctions.getNodeParameter(
			'fields',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const body = fields;

		const endpoint = 'https://api.servicem8.com/platform_service_sms';

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
