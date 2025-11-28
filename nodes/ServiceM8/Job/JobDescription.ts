import { INodeProperties } from 'n8n-workflow';
import { JobAddNoteObject, JobCreateFromTemplateObject, JobSendToQueueObject } from './JobObjects';
export const jobDescription: INodeProperties[] = [
    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getMany',
		options: [
			{
				name: 'Add Note To Job',
				value: 'addNoteToJob',
				action: 'Add job note',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create new job',
			},
			{
				name: 'Create From Template',
				value: 'createFromTemplate',
				action: 'Create job from template',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete job',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get job details',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get multiple jobs',
			},
			{
				name: 'Send Job To Queue',
				value: 'sendJobToQueue',
				action: 'Queue job',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update job details',
			},
			{
				name: 'Update Job Contacts',
				value: 'updateContacts',
				action: 'Update job contact details',
			},
		],
		displayOptions: {
			show: {
				resource: ['job'],
			},
		},
	},
	{
		displayName: 'Job UUID',
		name: 'uuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['get','update','delete','sendJobToQueue','updateContacts'],
			},
		},
	},
	{
		displayName: 'Include Contacts',
		name: 'includeContacts',
		type: 'boolean',
		default: true,
		description: 'Whether to include job contacts (Job Contact, Billing Contact, Property Manager) in the response',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Job Template Name or ID',
		name: 'jobTemplateUUID',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		default: '',
		typeOptions:{
			loadOptionsMethod: 'getJobTemplates',
		},
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['createFromTemplate'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'Quote',
		options: [
			{ name: 'Quote', value: 'Quote' },
			{ name: 'Work Order', value: 'Work Order' },
			{ name: 'Completed', value: 'Completed' },
			{ name: 'Unsuccessful', value: 'Unsuccessful' },
		],
		description: 'Initial status for the new job',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'fields',
		type: 'fixedCollection',
		placeholder: 'Add Field',
		default: {},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Field Name',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFields',
						},
						default: '',
						description: 'Field to set',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to set the field to',
					},
				],
			},
		],
	},
		{
			displayName: 'Fields',
			name: 'fields',
			type: 'collection',
			default: {
				"job_description":"",
				"company_uuid":"",
				"job_address":"",
			},
			options: JobCreateFromTemplateObject,
			displayOptions: {
				show: {
					resource: ['job'],
					operation: ['createFromTemplate'],
				},
			},
		},
		{
			displayName: 'Fields',
			name: 'fields',
			type: 'collection',
			default: {
				"note":"",
				"related_object_uuid":"",
			},
			options: JobAddNoteObject,
			displayOptions: {
				show: {
					resource: ['job'],
					operation: ['addNoteToJob'],
				},
			},
		},
		{
			displayName: 'Fields',
			name: 'fields',
			type: 'collection',
			default: {
				"queue_uuid":"",
				"queue_expiry_date":"",
			},
			options: JobSendToQueueObject,
			displayOptions: {
				show: {
					resource: ['job'],
					operation: ['sendJobToQueue'],
				},
			},
		},
]