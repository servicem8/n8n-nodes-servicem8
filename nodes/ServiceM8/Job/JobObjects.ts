import { INodeProperties } from "n8n-workflow";

/**
 * Contact fields shared across Job Contact, Billing Contact, and Property Manager Contact
 */
export const JobContactFields: INodeProperties[] = [
	{
		name: 'first',
		displayName: 'First Name',
		type: 'string',
		default: '',
	},
	{
		name: 'last',
		displayName: 'Last Name',
		type: 'string',
		default: '',
	},
	{
		name: 'email',
		displayName: 'Email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
	},
	{
		name: 'mobile',
		displayName: 'Mobile',
		type: 'string',
		default: '',
	},
	{
		name: 'phone',
		displayName: 'Phone',
		type: 'string',
		default: '',
	},
];

export const JobCreateFromTemplateObject: INodeProperties[] = [
    {
        "name": "job_description",
        "displayName": "job_description",
        "type": "string",
        "default": ""
    },
    {
        "name": "job_address",
        "displayName": "Job Address",
        "type": "string",
        "description":"Street address for the job",
        "default": ""
    },
    {
        "name": "company_uuid",
        "displayName": "Company UUID",
        "type": "string",
        "description":"UUID of the company/client. Cannot be used together with Company Name.",
        "default": ""
    },
    {
        "name": "company_name",
        "displayName": "Company/Client Name",
        "type": "string",
        "description":"Name of the company/client. If a company with this name exists, it will be used. Otherwise, a new company will be created. Cannot be used together with Company UUID.",
        "default": ""
    },
];

export const JobSendToQueueObject: INodeProperties[] = [
    
  {
        "name": "queue_uuid",
        "displayName": "Job Queue",
        "type": "options",
        "default": "",
        typeOptions:{
          loadOptionsMethod: 'getJobQueues',
        },
    },
    {
        "name": "queue_expiry_date",
        "displayName": "Queue Expiry Date",
        "type": "string",
        "description":"Expiry date of the Queue.",
        "default": ""
    },
];

export const JobAddNoteObject: INodeProperties[] = [
    {
        "name": "note",
        "displayName": "Note",
        "type": "string",
        "default": ""
    },
    {
        "name": "related_object_uuid",
        "displayName": "Job UUID",
        "type": "string",
        "default": ""
    },
    {
        "name": "action_required",
        "displayName": "Action Required",
        "type": "string",
        "default": ""
    },
    {
        "name": "action_completed_by_staff_uuid",
        "displayName": "Action Completed By Staff UUID",
        "type": "string",
        "default": "",
    },
];