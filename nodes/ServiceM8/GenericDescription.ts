import { INodeProperties } from 'n8n-workflow';
export const genericDescription: INodeProperties[] = [
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
		displayName: 'Fields',
		name: 'fields',
		type: 'fixedCollection',
		placeholder: 'Add field to update',
		default: {},
			typeOptions: {
				multipleValues: true,
				sortable: true,
				loadOptionsDependsOn:['resource','operation'],
		},
		displayOptions: {
			show: {
				operation: ['update'],
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
]