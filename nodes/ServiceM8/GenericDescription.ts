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
				displayName: "filter",
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
						description: 'Field name to filter.',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{
								name: 'Equal to',
								value: 'eq',
							},
							{
								name: 'Not equal',
								value: 'ne',
							},
							{
								name: 'Greater than',
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
						displayName: 'Field Name',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFields',
						},
						default: '',
						description: 'Field name to update.',
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