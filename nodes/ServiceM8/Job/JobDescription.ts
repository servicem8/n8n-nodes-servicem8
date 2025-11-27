import { INodeProperties } from 'n8n-workflow';
import { JobAddNoteObject, JobCreateFromTemplateObject, JobCreateObject, JobSendToQueueObject } from './JobObjects';
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
			displayName: 'Fields',
			name: 'fields',
			type: 'collection',
			default: {
				"created_by_staff_uuid": "",
				"date": "",
				"company_uuid": "",
				"billing_address": "",
				"status": "Quote",
				"lng": "",
				"lat": "",
				"payment_date": "",
				"payment_actioned_by_uuid": "",
				"payment_method": "",
				"payment_amount": "",
				"category_uuid": "",
				"payment_note": "",
				"geo_is_valid": 0,
				"purchase_order_number": "",
				"invoice_sent": 0,
				"invoice_sent_stamp": "",
				"geo_country": "",
				"geo_postcode": "",
				"geo_state": "",
				"geo_city": "",
				"geo_street": "",
				"geo_number": "",
				"queue_uuid": "",
				"queue_expiry_date": "",
				"queue_assigned_staff_uuid": "",
				"badges": "",
				"quote_date": "",
				"quote_sent": 0,
				"quote_sent_stamp": "",
				"work_order_date": "",
				"active": 0,
				"edit_date": "",
				"job_address": "",
				"job_description": "",
				"work_done_description": "",
				"generated_job_id": "",
				"total_invoice_amount": "",
				"payment_processed": 0,
				"payment_processed_stamp": "",
				"payment_received": 0,
				"payment_received_stamp": "",
				"completion_date": "",
				"completion_actioned_by_uuid": "",
				"unsuccessful_date": "",
				"job_is_scheduled_until_stamp": ""

			},
			options: JobCreateObject,
			displayOptions: {
				show: {
					resource: ['job'],
					operation: ['create'],
				},
			},
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