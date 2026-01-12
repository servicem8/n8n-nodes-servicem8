import { INodeProperties } from 'n8n-workflow';
import { JobContactFields } from './Job/JobObjects';
import { ClientContactFields } from './Client/ClientObjects';
export const genericDescription: INodeProperties[] = [
{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['getMany'],
				resource: ['attachment', 'job', 'client'],
			},
		},
	},
	{
		displayName: 'Include Contacts',
		name: 'includeContacts',
		type: 'boolean',
		default: false,
		description: 'Whether to include contacts for each record. Only available when Limit is between 1 and 20.',
		displayOptions: {
			show: {
				operation: ['getMany'],
				resource: ['job', 'client'],
			},
		},
	},
{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		placeholder: 'Add filter',
		default: {},
			typeOptions: {
				multipleValues: true,
				sortable: true,
				loadOptionsDependsOn:['resource','operation'],
		},
		displayOptions: {
			show: {
				operation: ['getMany'],
				resource: ['attachment', 'job', 'client'],
			},
		},
		options:[
			{
				displayName: 'Filter',
				name: 'filter',
				values:[
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFilterFields',
						},
						default: '',
						description: 'Field name to filter. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{
								name: 'Equal To',
								value: 'eq',
							},
							{
								name: 'Not Equal',
								value: 'ne',
							},
							{
								name: 'Greater Than',
								value: 'gt',
							},
							{
								name: 'Less Than',
								value: 'lt',
							},
						],
						default: 'eq',
						description: 'Operator to use in filter',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to apply in the filter',
					},
				]
			}
		]
	},
	{
		displayName: 'Update Fields',
		name: 'fields',
		type: 'fixedCollection',
		placeholder: 'Add Field',
		default: {},
			typeOptions: {
				multipleValues: true,
				sortable: true,
				loadOptionsDependsOn:['resource','operation'],
		},
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['job', 'client'],
			},
		},
		options:[
			{
				displayName: "Field",
				name: 'field',
				values:[
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFields',
						},
						default: '',
						description: 'Field name to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to update the field to',
					},
				]
			}
		]
	},
	// Job Contact Type selector
	{
		displayName: 'Contact Type',
		name: 'contactType',
		type: 'options',
		required: true,
		default: 'Job',
		options: [
			{ name: 'Job', value: 'Job' },
			{ name: 'Billing', value: 'Billing' },
			{ name: 'Property Manager', value: 'Property Manager' },
			{ name: 'Specify UUID', value: 'uuid' },
		],
		description: 'The type of contact to update. If no contact of this type exists, a new one will be created.',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['updateContacts'],
			},
		},
	},
	// Client Contact Type selector
	{
		displayName: 'Contact Type',
		name: 'contactType',
		type: 'options',
		required: true,
		default: 'JOB',
		options: [
			{ name: 'Billing', value: 'BILLING' },
			{ name: 'Job', value: 'JOB' },
			{ name: 'Property Manager', value: 'Property Manager' },
			{ name: 'Property Owner', value: 'Property Owner' },
			{ name: 'Specify UUID', value: 'uuid' },
			{ name: 'Tenant', value: 'Tenant' },
		],
		description: 'The type of contact to update. If no contact of this type exists, a new one will be created.',
		displayOptions: {
			show: {
				resource: ['client'],
				operation: ['updateContacts'],
			},
		},
	},
	// Contact UUID field (shown when "Specify UUID" is selected)
	{
		displayName: 'Contact UUID',
		name: 'contactUuid',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the specific contact to update',
		displayOptions: {
			show: {
				resource: ['job', 'client'],
				operation: ['updateContacts'],
				contactType: ['uuid'],
			},
		},
	},
	// Job Contact Fields
	{
		displayName: 'Contact Fields',
		name: 'contactFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Contact details to update. Only provided fields will be modified.',
		options: JobContactFields,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['updateContacts'],
			},
		},
	},
	// Client Contact Fields
	{
		displayName: 'Contact Fields',
		name: 'contactFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Contact details to update. Only provided fields will be modified.',
		options: ClientContactFields,
		displayOptions: {
			show: {
				resource: ['client'],
				operation: ['updateContacts'],
			},
		},
	},
	// Advanced Options for getMany operations
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['getMany'],
				resource: ['attachment', 'job', 'client'],
			},
		},
		options: [
			{
				displayName: 'Include Inactive Records',
				name: 'includeInactive',
				type: 'boolean',
				default: false,
				description: 'Whether to include inactive (deleted) records in the results',
			},
		],
	},
]