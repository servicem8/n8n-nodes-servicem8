import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, CrudConfig } from './types';
import { BaseHandler } from './BaseHandler';
import { serviceM8ApiRequest, getAllData } from '../GenericFunctions';

/**
 * Handler for Client resource operations.
 * Extends BaseHandler for standard CRUD, adds contact operations.
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
				return this.getWithContacts(ctx);
			case 'getMany':
				return this.standardGetMany(ctx);
			case 'update':
				return this.standardUpdate(ctx);
			case 'delete':
				return this.standardDelete(ctx);
			case 'updateContacts':
				return this.updateContacts(ctx);
			default:
				throw new NodeOperationError(
					ctx.executeFunctions.getNode(),
					`Unknown operation: ${operation}`,
					{ itemIndex: ctx.itemIndex },
				);
		}
	}

	/**
	 * Get a client with optional contacts included
	 */
	private async getWithContacts(ctx: HandlerContext): Promise<unknown> {
		const clientData = await this.standardGet(ctx);

		const includeContacts = ctx.executeFunctions.getNodeParameter(
			'includeContacts',
			ctx.itemIndex,
			true,
		) as boolean;

		if (!includeContacts) {
			return clientData;
		}

		// Get the client UUID from the parameter
		const clientUuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		// Fetch contacts for this client (companycontact endpoint)
		const contacts = await getAllData.call(
			ctx.executeFunctions,
			'https://api.servicem8.com/api_1.0/companycontact.json',
			{ $filter: `company_uuid eq '${clientUuid.trim()}' and active eq '1'` },
		);

		// clientData from standardGet is an array, get first item
		const client = Array.isArray(clientData) ? clientData[0] : clientData;

		return {
			...(client as object),
			contacts,
		};
	}

	/**
	 * Update client contacts (upsert by type)
	 */
	private async updateContacts(ctx: HandlerContext): Promise<unknown> {
		const clientUuid = ctx.executeFunctions.getNodeParameter(
			'uuid',
			ctx.itemIndex,
			'',
		) as string;

		// Process each contact type
		const contactTypes = [
			{ param: 'clientContact', type: 'JOB' },
			{ param: 'billingContact', type: 'BILLING' },
			{ param: 'propertyManagerContact', type: 'Property Manager' },
			{ param: 'propertyOwnerContact', type: 'Property Owner' },
			{ param: 'tenantContact', type: 'Tenant' },
		];

		for (const { param, type } of contactTypes) {
			const contactData = ctx.executeFunctions.getNodeParameter(
				param,
				ctx.itemIndex,
				{},
			) as IDataObject;

			await this.upsertContact(ctx, clientUuid.trim(), type, contactData);
		}

		return { uuid: clientUuid.trim() };
	}

	/**
	 * Create or update a company contact by type (sparse update supported)
	 */
	private async upsertContact(
		ctx: HandlerContext,
		companyUuid: string,
		type: string,
		data: IDataObject,
	): Promise<void> {
		// Filter out empty/undefined values for sparse update support
		const filteredData: IDataObject = {};
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined && value !== null && value !== '') {
				filteredData[key] = value;
			}
		}

		// If no actual data provided, skip
		if (Object.keys(filteredData).length === 0) {
			return;
		}

		// Find existing contact of this type
		const existing = await getAllData.call(
			ctx.executeFunctions,
			'https://api.servicem8.com/api_1.0/companycontact.json',
			{ $filter: `company_uuid eq '${companyUuid}' and type eq '${type}' and active eq '1'` },
		);

		if (existing.length > 0) {
			// Update existing - only sends provided fields (sparse update)
			const contactUuid = (existing[0] as IDataObject).uuid as string;
			await serviceM8ApiRequest.call(
				ctx.executeFunctions,
				'POST',
				`https://api.servicem8.com/api_1.0/companycontact/${contactUuid}.json`,
				{},
				filteredData,
			);
		} else {
			// Create new - requires company_uuid and type
			await serviceM8ApiRequest.call(
				ctx.executeFunctions,
				'POST',
				'https://api.servicem8.com/api_1.0/companycontact.json',
				{},
				{ ...filteredData, company_uuid: companyUuid, type },
			);
		}
	}
}
