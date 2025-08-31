import { INodeProperties } from 'n8n-workflow';
import { JobCreateFromTemplateObject, JobCreateObject } from './JobObjects';
export const jobDescription: INodeProperties[] = [
    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		options: [
			{
				name: 'Add Note To Job',
				value: 'addNoteToJob',
			},
			{
				name: 'Create',
				value: 'create',
			},
			{
				name: 'Create From Template',
				value: 'createFromTemplate',
			},
			{
				name: 'Delete',
				value: 'delete',
			},
			{
				name: 'Get',
				value: 'get',
			},
			{
				name: 'Get Many',
				value: 'getMany',
			},
			{
				name: 'Update',
				value: 'update',
			},
			{
				name: 'Send Job To Queue',
				value: 'sendJobToQueue',
			},
		],
		displayOptions: {
			show: {
				resource: ['job'],
			},
		},
	},
	{
		displayName: 'UUID',
		name: 'uuid',
		type: 'string',
		default: ' ',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['get','update','delete'],
			},
		},
	},
	{
		displayName: 'Job Template ID Or Name',
		name: 'jobTemplateUUID',
		type: 'options',
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
		}

	
]