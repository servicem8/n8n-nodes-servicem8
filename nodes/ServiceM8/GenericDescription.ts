import { INodeProperties } from 'n8n-workflow';
import { JobContactFields } from './Job/JobObjects';
export const genericDescription: INodeProperties[] = [
{
		displayName: 'Include Inactive Records',
		name: 'includeInactive',
		type: 'boolean',
		default: false,
		description: 'Whether to include inactive (deleted) records in the results',
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
				resource: ['job', 'client'],
			},
		},
		options:[
			{
				displayName: 'Filter',
				name: 'filter',
				values:[
					{
						displayName: 'Field Name',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFilterFields',
						},
						default: '',
						description: 'Field name to filter',
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
		displayName: 'Fields to Update',
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
						displayName: 'Field Name',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFields',
						},
						default: '',
						description: 'Field name to update',
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
	{
		displayName: 'Job Contact',
		name: 'jobContact',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Contact details for the primary job contact. Only provided fields will be updated.',
		options: JobContactFields,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['updateContacts'],
			},
		},
	},
	{
		displayName: 'Billing Contact',
		name: 'billingContact',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Contact details for billing. Only provided fields will be updated.',
		options: JobContactFields,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['updateContacts'],
			},
		},
	},
	{
		displayName: 'Property Manager Contact',
		name: 'propertyManagerContact',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Contact details for the property manager. Only provided fields will be updated.',
		options: JobContactFields,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['updateContacts'],
			},
		},
	},
]