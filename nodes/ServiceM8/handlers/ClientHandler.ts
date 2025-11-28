import type { IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, CrudConfig } from './types';
import { extractCreatedUuid } from './types';
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
				return this.getManyWithContacts(ctx);
			case 'create':
				return this.standardCreate(ctx);
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
	 * Get multiple clients with optional contacts included
	 * Contacts can only be included when Limit is between 1 and 20
	 */
	private async getManyWithContacts(ctx: HandlerContext): Promise<unknown> {
		const limit = ctx.executeFunctions.getNodeParameter(
			'limit',
			ctx.itemIndex,
			0,
		) as number;

		const includeContacts = ctx.executeFunctions.getNodeParameter(
			'includeContacts',
			ctx.itemIndex,
			false,
		) as boolean;

		// Validate limit when Include Contacts is enabled
		if (includeContacts && (limit < 1 || limit > 20)) {
			throw new NodeOperationError(
				ctx.executeFunctions.getNode(),
				'Include Contacts requires Limit to be between 1 and 20',
				{ itemIndex: ctx.itemIndex },
			);
		}

		const clients = await this.standardGetMany(ctx) as IDataObject[];

		if (!includeContacts) {
			return clients;
		}

		// Fetch contacts for each client
		const clientsWithContacts = await Promise.all(
			clients.map(async (client) => {
				const clientUuid = client.uuid as string;
				const contacts = await getAllData.call(
					ctx.executeFunctions,
					'https://api.servicem8.com/api_1.0/companycontact.json',
					{ $filter: `company_uuid eq '${clientUuid}' and active eq '1'` },
				);
				return { ...client, contacts };
			}),
		);

		return clientsWithContacts;
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
	 * Update a single client contact (upsert by type, or direct update by UUID)
	 */
	private async updateContacts(ctx: HandlerContext): Promise<unknown> {
		const clientUuid = ctx.executeFunctions.getNodeParameter(
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
				`https://api.servicem8.com/api_1.0/companycontact/${contactUuid.trim()}.json`,
				{},
				filteredData,
			);

			return { uuid: contactUuid.trim() };
		} else {
			// Upsert by type
			const existing = await getAllData.call(
				ctx.executeFunctions,
				'https://api.servicem8.com/api_1.0/companycontact.json',
				{ $filter: `company_uuid eq '${clientUuid.trim()}' and type eq '${contactType}' and active eq '1'` },
			);

			if (existing.length > 0) {
				// Update existing
				const contactUuid = (existing[0] as IDataObject).uuid as string;
				await serviceM8ApiRequest.call(
					ctx.executeFunctions,
					'POST',
					`https://api.servicem8.com/api_1.0/companycontact/${contactUuid}.json`,
					{},
					filteredData,
				);
				return { uuid: contactUuid };
			} else {
				// Create new
				const response = await serviceM8ApiRequest.call(
					ctx.executeFunctions,
					'POST',
					'https://api.servicem8.com/api_1.0/companycontact.json',
					{},
					{ ...filteredData, company_uuid: clientUuid.trim(), type: contactType },
				);
				return extractCreatedUuid(response);
			}
		}
	}
}
