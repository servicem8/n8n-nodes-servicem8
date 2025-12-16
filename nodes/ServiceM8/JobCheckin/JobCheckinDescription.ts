import { INodeProperties } from 'n8n-workflow';

export const jobCheckinDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getMany',
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a job checkin',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get multiple job checkins',
			},
		],
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
			},
		},
	},
	// UUID field for get
	{
		displayName: 'Checkin UUID',
		name: 'uuid',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the job checkin',
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['get'],
			},
		},
	},
	// Job UUID filter for getMany (optional)
	{
		displayName: 'Job UUID',
		name: 'filterJobUUID',
		type: 'string',
		default: '',
		description: 'Filter checkins by Job UUID. Leave empty to get all checkins.',
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['getMany'],
			},
		},
	},
	// Staff UUID filter for getMany (optional)
	{
		displayName: 'Staff Member Name or ID',
		name: 'filterStaffUUID',
		type: 'options',
		default: '',
		description: 'Filter checkins by Staff Member. Leave empty to get all checkins. Choose from the list, or specify Staff UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getStaffMembers',
		},
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['getMany'],
			},
		},
	},
	// Advanced Options for getMany
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['getMany'],
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
];
