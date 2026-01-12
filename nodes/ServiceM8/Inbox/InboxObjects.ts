import { INodeProperties } from 'n8n-workflow';

export const InboxJobDataFields: INodeProperties[] = [
    {
        "name": "contact_first",
        "displayName": "Contact First Name",
        "type": "string",
        "default": "",
    },
    {
        "name": "contact_last",
        "displayName": "Contact Last Name",
        "type": "string",
        "default": "",
    },
    {
        "name": "company_name",
        "displayName": "Company Name",
        "type": "string",
        "default": "",
    },
    {
        "name": "email",
        "displayName": "Email",
        "type": "string",
        "default": "",
    },
    {
        "name": "mobile",
        "displayName": "Mobile",
        "type": "string",
        "default": "",
    },
    {
        "name": "phone_1",
        "displayName": "Phone 1",
        "type": "string",
        "default": "",
    },
    {
        "name": "phone_2",
        "displayName": "Phone 2",
        "type": "string",
        "default": "",
    },
    {
        "name": "billing_contact_first",
        "displayName": "Billing Contact First Name",
        "type": "string",
        "default": "",
    },
    {
        "name": "billing_contact_last",
        "displayName": "Billing Contact Last Name",
        "type": "string",
        "default": "",
    },
    {
        "name": "billing_email",
        "displayName": "Billing Email",
        "type": "string",
        "default": "",
    },
    {
        "name": "billing_mobile",
        "displayName": "Billing Mobile",
        "type": "string",
        "default": "",
    },
    {
        "name": "billing_attention",
        "displayName": "Billing Attention",
        "type": "string",
        "default": "",
    },
    {
        "name": "job_description",
        "displayName": "Job Description",
        "type": "string",
        "default": "",
    },
    {
        "name": "job_address",
        "displayName": "Job Address",
        "type": "string",
        "default": "",
    },
    {
        "name": "billing_address",
        "displayName": "Billing Address",
        "type": "string",
        "default": "",
    },
    {
        "name": "work_done_description",
        "displayName": "Work Done Description",
        "type": "string",
        "default": "",
    },
];

export const InboxConvertToJobFields: INodeProperties[] = [
    {
        displayName: 'Note',
        name: 'note',
        type: 'string',
        default: '',
        description: 'Additional notes to include with the created job',
        typeOptions: {
            rows: 4,
        },
    },
];

export const InboxMessageFields: INodeProperties[] = [
    {
        "name": "subject",
        "displayName": "Subject",
        "type": "string",
        "default": "",
        "description": "Subject of the inbox message.",
    },
    {
        "name": "message_text",
        "displayName": "Message Text",
        "type": "string",
        "default": "",
        "description": "Plain text body of the message.",
        "typeOptions": {
            "rows": 4,
        },
    },
    {
        "name": "from_name",
        "displayName": "From Name",
        "type": "string",
        "default": "",
        "description": "Name that should appear as the sender.",
    },
    {
        "name": "from_email",
        "displayName": "From Email",
        "type": "string",
        "default": "",
        "description": "Email address that should appear as the sender.",
    },
    {
        "name": "regarding_company_uuid",
        "displayName": "Regarding Company UUID",
        "type": "string",
        "default": "",
        "description": "UUID of the customer this message relates to.",
    },
    {
        "name": "json_data",
        "displayName": "Additional JSON Data",
        "type": "string",
        "default": "",
        "description": "Optional JSON payload stored with the inbox message. Provide a valid JSON string.",
        "typeOptions": {
            "alwaysOpenEditWindow": true,
            "rows": 4,
        },
    },
    {
        "name": "jobData",
        "displayName": "Job Data",
        "type": "collection",
        "default": {},
        "placeholder": "Add Job Data Field",
        "options": InboxJobDataFields,
        "description": "Structured job data used when converting the message to a job.",
    },
];
