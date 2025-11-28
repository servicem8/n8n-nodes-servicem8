import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler } from './types';
import { serviceM8ApiRequest, getAllData } from '../GenericFunctions';

/**
 * Handler for Job Checkin resource operations.
 * Read-only resource - checkins are job activities where activity_was_recorded=1.
 */
export class JobCheckinHandler implements ResourceHandler {
	readonly resource = 'jobCheckin';

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'get':
				return this.get(ctx);
			case 'getMany':
				return this.getMany(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	private async get(ctx: HandlerContext): Promise<unknown> {
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		if (!uuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Checkin UUID is required',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const endpoint = `https://api.servicem8.com/api_1.0/jobactivity/${uuid.trim()}.json`;
		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'GET',
			endpoint,
		);

		return responseData.body;
	}

	private async getMany(ctx: HandlerContext): Promise<unknown> {
		const filterJobUUID = ctx.executeFunctions.getNodeParameter(
			'filterJobUUID',
			ctx.itemIndex,
			'',
		) as string;
		const filterStaffUUID = ctx.executeFunctions.getNodeParameter(
			'filterStaffUUID',
			ctx.itemIndex,
			'',
		) as string;
		const advancedOptions = ctx.executeFunctions.getNodeParameter(
			'advancedOptions',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const includeInactive = advancedOptions.includeInactive as boolean ?? false;

		const endpoint = 'https://api.servicem8.com/api_1.0/jobactivity.json';

		const filterParts: string[] = [];
		// Only get recorded activities (checkins), not scheduled ones
		filterParts.push("activity_was_recorded eq '1'");

		if (!includeInactive) {
			filterParts.push("active eq '1'");
		}

		if (filterJobUUID) {
			filterParts.push(`job_uuid eq '${filterJobUUID.trim()}'`);
		}

		if (filterStaffUUID) {
			filterParts.push(`staff_uuid eq '${filterStaffUUID}'`);
		}

		const qs: IDataObject = {
			$filter: filterParts.join(' and '),
		};

		return getAllData.call(ctx.executeFunctions, endpoint, qs);
	}
}
