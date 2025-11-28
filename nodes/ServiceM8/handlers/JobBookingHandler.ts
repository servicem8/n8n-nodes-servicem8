import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { DateTime } from 'luxon';
import type { HandlerContext, ResourceHandler } from './types';
import { extractCreatedUuid } from './types';
import { serviceM8ApiRequest, getAllData, toServiceM8DateTime } from '../GenericFunctions';

/**
 * Handler for Job Booking resource operations.
 * Polymorphic resource - flexible bookings use joballocation API,
 * fixed bookings use jobactivity API.
 */
export class JobBookingHandler implements ResourceHandler {
	readonly resource = 'jobBooking';

	async execute(ctx: HandlerContext, operation: string): Promise<unknown> {
		switch (operation) {
			case 'create':
				return this.create(ctx);
			case 'get':
				return this.get(ctx);
			case 'getMany':
				return this.getMany(ctx);
			case 'update':
				return this.update(ctx);
			case 'delete':
				return this.delete(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	/**
	 * Create a job allocation (flexible time) or job activity (fixed time)
	 * @see https://developer.servicem8.com/reference/createjoballocations
	 * @see https://developer.servicem8.com/reference/createjobactivities
	 */
	private async create(ctx: HandlerContext): Promise<unknown> {
		const jobUUID = ctx.executeFunctions.getNodeParameter(
			'jobUUID',
			ctx.itemIndex,
			'',
		) as string;
		const bookingType = ctx.executeFunctions.getNodeParameter(
			'bookingType',
			ctx.itemIndex,
			'flexible',
		) as string;
		const staffUUID = ctx.executeFunctions.getNodeParameter(
			'staffUUID',
			ctx.itemIndex,
			'',
		) as string;

		if (!jobUUID) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Job UUID is required to create a booking',
				{ itemIndex: ctx.itemIndex },
			);
		}
		if (!staffUUID) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Staff Member is required to create a booking',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const body: IDataObject = {
			job_uuid: jobUUID.trim(),
			staff_uuid: staffUUID,
		};

		let endpoint: string;

		if (bookingType === 'flexible') {
			// Job Allocation (flexible time)
			endpoint = 'https://api.servicem8.com/api_1.0/joballocation.json';
			const allocationDate = ctx.executeFunctions.getNodeParameter(
				'allocationDate',
				ctx.itemIndex,
				'',
			) as string;
			const allocationWindowUUID = ctx.executeFunctions.getNodeParameter(
				'allocationWindowUUID',
				ctx.itemIndex,
				'',
			) as string;
			const expiryTimestamp = ctx.executeFunctions.getNodeParameter(
				'expiryTimestamp',
				ctx.itemIndex,
				'',
			) as string;

			if (!allocationDate) {
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					'Allocation Date is required for flexible time bookings',
					{ itemIndex: ctx.itemIndex },
				);
			}

			body.allocation_date = toServiceM8DateTime(allocationDate);
			if (allocationWindowUUID) {
				body.allocation_window_uuid = allocationWindowUUID;
			}
			if (expiryTimestamp) {
				body.expiry_timestamp = toServiceM8DateTime(expiryTimestamp);
			}
		} else {
			// Job Activity (fixed time)
			endpoint = 'https://api.servicem8.com/api_1.0/jobactivity.json';
			const startDate = ctx.executeFunctions.getNodeParameter(
				'startDate',
				ctx.itemIndex,
				'',
			) as string;
			const durationMinutes = ctx.executeFunctions.getNodeParameter(
				'durationMinutes',
				ctx.itemIndex,
				60,
			) as number;

			if (!startDate) {
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					'Start Time is required for fixed time bookings',
					{ itemIndex: ctx.itemIndex },
				);
			}
			if (!durationMinutes || durationMinutes < 1) {
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					'Duration must be at least 1 minute',
					{ itemIndex: ctx.itemIndex },
				);
			}

			// Calculate end_date from start_date + duration
			const startDateTime = DateTime.fromISO(startDate);
			const endDateTime = startDateTime.plus({ minutes: durationMinutes });

			body.start_date = toServiceM8DateTime(startDate);
			body.end_date = toServiceM8DateTime(endDateTime);
			body.activity_was_scheduled = 1;
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

	/**
	 * Get a single job allocation or job activity by UUID
	 */
	private async get(ctx: HandlerContext): Promise<unknown> {
		const bookingType = ctx.executeFunctions.getNodeParameter(
			'bookingType',
			ctx.itemIndex,
			'fixed',
		) as string;
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		if (!uuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Booking UUID is required',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const endpoint =
			bookingType === 'flexible'
				? `https://api.servicem8.com/api_1.0/joballocation/${uuid.trim()}.json`
				: `https://api.servicem8.com/api_1.0/jobactivity/${uuid.trim()}.json`;

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'GET',
			endpoint,
		);

		return responseData.body;
	}

	/**
	 * List job allocations or job activities
	 */
	private async getMany(ctx: HandlerContext): Promise<unknown> {
		const bookingType = ctx.executeFunctions.getNodeParameter(
			'bookingType',
			ctx.itemIndex,
			'fixed',
		) as string;
		const filterJobUUID = ctx.executeFunctions.getNodeParameter(
			'filterJobUUID',
			ctx.itemIndex,
			'',
		) as string;
		const advancedOptions = ctx.executeFunctions.getNodeParameter(
			'advancedOptions',
			ctx.itemIndex,
			{},
		) as IDataObject;
		const includeInactive = advancedOptions.includeInactive as boolean ?? false;

		const filterParts: string[] = [];
		let endpoint: string;

		if (bookingType === 'flexible') {
			endpoint = 'https://api.servicem8.com/api_1.0/joballocation.json';
		} else {
			endpoint = 'https://api.servicem8.com/api_1.0/jobactivity.json';
			// Fixed bookings must be scheduled activities
			filterParts.push("activity_was_scheduled eq '1'");
		}

		if (!includeInactive) {
			filterParts.push("active eq '1'");
		}

		if (filterJobUUID) {
			filterParts.push(`job_uuid eq '${filterJobUUID.trim()}'`);
		}

		const qs: IDataObject = {};
		if (filterParts.length > 0) {
			qs['$filter'] = filterParts.join(' and ');
		}

		return getAllData.call(ctx.executeFunctions, endpoint, qs);
	}

	/**
	 * Update a job allocation or job activity
	 */
	private async update(ctx: HandlerContext): Promise<unknown> {
		const bookingType = ctx.executeFunctions.getNodeParameter(
			'bookingType',
			ctx.itemIndex,
			'fixed',
		) as string;
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;
		const updateFields = ctx.executeFunctions.getNodeParameter(
			'updateFields',
			ctx.itemIndex,
			{},
		) as IDataObject;

		if (!uuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Booking UUID is required',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const body: IDataObject = {};
		let endpoint: string;

		if (bookingType === 'flexible') {
			endpoint = `https://api.servicem8.com/api_1.0/joballocation/${uuid.trim()}.json`;
			// Process datetime fields for flexible bookings
			if (updateFields.allocation_date) {
				body.allocation_date = toServiceM8DateTime(
					updateFields.allocation_date as string,
				);
			}
			if (updateFields.expiry_timestamp) {
				body.expiry_timestamp = toServiceM8DateTime(
					updateFields.expiry_timestamp as string,
				);
			}
			if (updateFields.allocation_window_uuid) {
				body.allocation_window_uuid = updateFields.allocation_window_uuid;
			}
			if (updateFields.staff_uuid) {
				body.staff_uuid = updateFields.staff_uuid;
			}
		} else {
			endpoint = `https://api.servicem8.com/api_1.0/jobactivity/${uuid.trim()}.json`;
			// Process datetime fields for fixed bookings
			if (updateFields.start_date) {
				body.start_date = toServiceM8DateTime(updateFields.start_date as string);
				// If duration is provided along with start_date, calculate end_date
				if (updateFields.duration_minutes) {
					const startDateTime = DateTime.fromISO(updateFields.start_date as string);
					const durationMinutes = updateFields.duration_minutes as number;
					const endDateTime = startDateTime.plus({ minutes: durationMinutes });
					body.end_date = toServiceM8DateTime(endDateTime.toISO() as string);
				}
			}
			if (updateFields.staff_uuid) {
				body.staff_uuid = updateFields.staff_uuid;
			}
		}

		if (!Object.keys(body).length) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'No fields to update were provided',
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
	 * Delete (soft delete) a job allocation or job activity
	 */
	private async delete(ctx: HandlerContext): Promise<unknown> {
		const bookingType = ctx.executeFunctions.getNodeParameter(
			'bookingType',
			ctx.itemIndex,
			'fixed',
		) as string;
		const uuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		if (!uuid) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Booking UUID is required',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const endpoint =
			bookingType === 'flexible'
				? `https://api.servicem8.com/api_1.0/joballocation/${uuid.trim()}.json`
				: `https://api.servicem8.com/api_1.0/jobactivity/${uuid.trim()}.json`;

		const responseData = await serviceM8ApiRequest.call(
			ctx.executeFunctions,
			'DELETE',
			endpoint,
		);

		return responseData.body;
	}
}
