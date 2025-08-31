import { INodeProperties } from "n8n-workflow";

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

export const JobCreateObject: INodeProperties[] = [
  {
    "name": "created_by_staff_uuid",
    "displayName": "created_by_staff_uuid",
    "description": "UUID of the staff member who created this job. Records which staff member initially added the job to the system.",
    "type": "string",
    "default": ""
  },
  {
    "name": "date",
    "displayName": "date",
    "description": "The date the job was created or scheduled. Used for organizing jobs chronologically and for reference in reports.",
    "type": "string",
    "default": ""
  },
  {
    "name": "company_uuid",
    "displayName": "company_uuid",
    "description": "UUID reference to the client/company record associated with this job. Links the job to a client in the system, establishing the client-job relationship for billing and contact purposes.",
    "type": "string",
    "default": ""
  },
  {
    "name": "billing_address",
    "displayName": "billing_address",
    "description": "The address where invoices and billing information should be sent. If not specified, defaults to the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "status",
    "displayName": "status",
    "description": "Current status of the job. Controls where the Job appears in the Dispatch Board..  Valid values are [Quote,Work Order,Unsuccessful,Completed]",
    "type": "options",
    "options": [
      {
        "name": "Quote",
        "value": "Quote"
      },
      {
        "name": "Work Order",
        "value": "Work Order"
      },
      {
        "name": "Unsuccessful",
        "value": "Unsuccessful"
      },
      {
        "name": "Completed",
        "value": "Completed"
      }
    ],
    "default": "Quote"
  },
  {
    "name": "lng",
    "displayName": "lng",
    "description": "The longitude coordinate of the job location.",
    "type": "string",
    "default": ""
  },
  {
    "name": "lat",
    "displayName": "lat",
    "description": "The latitude coordinate of the job location.",
    "type": "string",
    "default": ""
  },
  {
    "name": "category_uuid",
    "displayName": "category_uuid",
    "description": "UUID reference to the job category this job belongs to. Categories help organize jobs by type of work or department.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_is_valid",
    "displayName": "geo_is_valid",
    "description": "Indicates whether the geocoding for the job address is valid. If this is false, the lat, lng, and other geo_ fields should not be used..  Valid values are [0,1]",
    "type": "options",
    "options": [
      {
        "name": "0",
        "value": 0
      },
      {
        "name": "1",
        "value": 1
      }
    ],
    "default": 0
  },
  {
    "name": "purchase_order_number",
    "displayName": "purchase_order_number",
    "description": "Client purchase order reference number for this job. Used for cross-referencing with external accounting or order management systems.",
    "type": "string",
    "default": ""
  },
  {
    "name": "invoice_sent",
    "displayName": "invoice_sent",
    "description": "Indicates whether an invoice has been sent for this job..  Valid values are [0,1]",
    "type": "options",
    "options": [
      {
        "name": "0",
        "value": 0
      },
      {
        "name": "1",
        "value": 1
      }
    ],
    "default": 0
  },
  {
    "name": "invoice_sent_stamp",
    "displayName": "invoice_sent_stamp",
    "description": "The date and time when the invoice was sent.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_country",
    "displayName": "geo_country",
    "description": "The country field of the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_postcode",
    "displayName": "geo_postcode",
    "description": "The postcode/ZIP code field of the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_state",
    "displayName": "geo_state",
    "description": "The state/province field of the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_city",
    "displayName": "geo_city",
    "description": "The city/suburb field of the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_street",
    "displayName": "geo_street",
    "description": "The street name field of the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "geo_number",
    "displayName": "geo_number",
    "description": "The street number field of the job address.",
    "type": "string",
    "default": ""
  },
  {
    "name": "queue_uuid",
    "displayName": "queue_uuid",
    "description": "The UUID of the queue this job belongs to.",
    "type": "string",
    "default": ""
  },
  {
    "name": "queue_expiry_date",
    "displayName": "queue_expiry_date",
    "description": "The date and time when the job expires from the queue.",
    "type": "string",
    "default": ""
  },
  {
    "name": "queue_assigned_staff_uuid",
    "displayName": "queue_assigned_staff_uuid",
    "description": "The UUID of the staff member assigned to this job in the queue.",
    "type": "string",
    "default": ""
  },
  {
    "name": "badges",
    "displayName": "badges",
    "description": "JSON Array of Badge UUIDs",
    "type": "string",
    "default": ""
  },
  {
    "name": "quote_date",
    "displayName": "quote_date",
    "description": "The date and time that the job status was changed to Quote.",
    "type": "string",
    "default": ""
  },
  {
    "name": "work_order_date",
    "displayName": "work_order_date",
    "description": "The date and time that the job status was changed to Work Order.",
    "type": "string",
    "default": ""
  },
  {
    "name": "uuid",
    "displayName": "uuid",
    "description": "Unique identifier for this record",
    "type": "string",
    "default": ""
  },
  {
    "name": "active",
    "displayName": "active",
    "description": "Record active/deleted flag.  Valid values are [0,1]",
    "type": "options",
    "options": [
      {
        "name": "0",
        "value": 0
      },
      {
        "name": "1",
        "value": 1
      }
    ],
    "default": 0
  },
  {
    "name": "edit_date",
    "displayName": "edit_date",
    "description": "Timestamp at which record was last modified",
    "type": "string",
    "default": ""
  },
  {
    "name": "job_address",
    "displayName": "job_address",
    "description": "Physical address where the job is to be performed. This address is used for geocoding to place the job on the map.",
    "type": "string",
    "default": ""
  },
  {
    "name": "job_description",
    "displayName": "job_description",
    "type": "string",
    "default": ""
  },
  {
    "name": "work_done_description",
    "displayName": "work_done_description",
    "description": "Email Address",
    "type": "string",
    "default": ""
  },
  {
    "name": "total_invoice_amount",
    "displayName": "total_invoice_amount",
    "description": "The total amount to be invoiced for this job.",
    "type": "string",
    "default": ""
  },
  {
    "name": "payment_processed",
    "displayName": "payment_processed",
    "description": "Indicates whether the job has been exported to the connected Accounting Package..  Valid values are [0,1]",
    "type": "options",
    "options": [
      {
        "name": "0",
        "value": 0
      },
      {
        "name": "1",
        "value": 1
      }
    ],
    "default": 0
  },
  {
    "name": "payment_processed_stamp",
    "displayName": "payment_processed_stamp",
    "description": "The date and time the job has been exported to the connected Accounting Package.",
    "type": "string",
    "default": ""
  },
  {
    "name": "payment_received",
    "displayName": "payment_received",
    "description": "Indicates whether full payment has been received for this job..  Valid values are [0,1]",
    "type": "options",
    "options": [
      {
        "name": "0",
        "value": 0
      },
      {
        "name": "1",
        "value": 1
      }
    ],
    "default": 0
  },
  {
    "name": "payment_received_stamp",
    "displayName": "payment_received_stamp",
    "description": "The date and time when full payment was received.",
    "type": "string",
    "default": ""
  },
  {
    "name": "completion_date",
    "displayName": "completion_date",
    "description": "The date and time that the job status was changed to Completed.",
    "type": "string",
    "default": ""
  },
  {
    "name": "completion_actioned_by_uuid",
    "displayName": "completion_actioned_by_uuid",
    "description": "UUID of the staff member who marked this job as completed. References a staff record in the system.",
    "type": "string",
    "default": ""
  },
  {
    "name": "unsuccessful_date",
    "displayName": "unsuccessful_date",
    "description": "The date and time that the job status was changed to Unsuccessful.",
    "type": "string",
    "default": ""
  },
  {
    "name": "job_is_scheduled_until_stamp",
    "displayName": "job_is_scheduled_until_stamp",
    "description": "The end date/time of the last scheduled activity for this job. After this date, the job is considered Unscheduled.",
    "type": "string",
    "default": ""
  }
]