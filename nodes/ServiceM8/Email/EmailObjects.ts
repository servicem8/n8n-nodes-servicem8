import { INodeProperties } from "n8n-workflow";

export const SendEmailObject: INodeProperties[] = [
    {
        "name": "to",
        "displayName": "To",
        "description":"Recipient email address",
        "type": "string",
        "default": ""
    },
    {
        "name": "cc",
        "displayName": "Cc",
        "description": "Carbon copy recipient email address",
        "type": "string",
        "default": ""
    },
    {
        "name": "replyTo",
        "displayName": "Reply To",
        "description": "Reply-to email address",
        "type": "string",
        "default": ""
    },
    {
        "name": "subject",
        "displayName": "Subject",
        "description": "Email subject line",
        "type": "string",
        "default": ""
    },
    {
        "name": "htmlBody",
        "displayName": "HTML Body",
        "description": "HTML-formatted email body. At least one of htmlBody or textBody must be provided. You can use the <platform-user-signature /> tag to include a staff member's email signature at a specific location. When using the signature tag, you must include the x-impersonate-uuid header.",
        "type": "string",
        "default": ""
    },
    {
        "name": "textBody",
        "displayName": "Plain Text Body",
        "description": "Plain text email body. At least one of htmlBody or textBody must be provided. You can use the <platform-user-signature /> tag to include a staff member's email signature at a specific location (it will be converted to plain text). When using the signature tag, you must include the x-impersonate-uuid header.",
        "type": "string",
        "default": ""
    },
    {
        "name": "regardingJobUUID",
        "displayName": "Regarding Job UUID",
        "description": "UUID of the job that this message is regarding. This is used to link the message to the job in ServiceM8, causing the email to appear in the job diary. If you do not specify a job UUID, the message will not be linked to any job.",
        "type": "string",
        "default": ""
    },
    {
        "name": "attachments",
        "displayName": "Attachments",
        "description": "Array of attachment UUIDs to include with the email. Each UUID must reference an existing attachment in the system.",
        "type": "string",
        "default": ""
    },
    {
        "name": "x-impersonate-uuid",
        "displayName": "x-impersonate-uuid",
        "description": "UUID of the staff member to impersonate when using the <platform-user-signature /> tag. This header is required if you include the signature tag in your email body.",
        "type": "string",
        "default": ""
    },
];