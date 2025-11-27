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
				name: 'Create',
				value: 'create',
				action: 'Create job checkin',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete job checkin',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get job checkin',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many job checkins',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update job checkin',
			},
		],
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
			},
		},
	},
	// UUID field for get, update, delete
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
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	// Job UUID for create
	{
		displayName: 'Job UUID',
		name: 'jobUUID',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the job to create the checkin for',
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['create'],
			},
		},
	},
	// Staff Member for create
	{
		displayName: 'Staff Member',
		name: 'staffUUID',
		type: 'options',
		default: '',
		required: true,
		description: 'Choose from the list, or specify Staff UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: 'getStaffMembers',
		},
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['create'],
			},
		},
	},
	// Start Time for create
	{
		displayName: 'Start Time',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'The start date and time of the checkin',
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['create'],
			},
		},
	},
	// End Time for create
	{
		displayName: 'End Time',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'The end date and time of the checkin',
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['create'],
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
		displayName: 'Staff Member',
		name: 'filterStaffUUID',
		type: 'options',
		default: '',
		description: 'Filter checkins by Staff Member. Leave empty to get all checkins. Choose from the list, or specify Staff UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	// Include inactive for getMany
	{
		displayName: 'Include Inactive Records',
		name: 'includeInactive',
		type: 'boolean',
		default: false,
		description: 'Whether to include inactive (deleted) records in the results',
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['getMany'],
			},
		},
	},
	// UPDATE fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['jobCheckin'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'End Time',
				name: 'end_date',
				type: 'dateTime',
				default: '',
				description: 'The end date and time of the checkin',
			},
			{
				displayName: 'Staff Member',
				name: 'staff_uuid',
				type: 'options',
				default: '',
				description: 'Choose from the list, or specify Staff UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getStaffMembers',
				},
			},
			{
				displayName: 'Start Time',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'The start date and time of the checkin',
			},
		],
	},
];
