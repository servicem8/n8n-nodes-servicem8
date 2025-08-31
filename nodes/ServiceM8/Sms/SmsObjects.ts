import { INodeProperties } from "n8n-workflow";

export const SendSmsObject: INodeProperties[] = [
    {
        "name": "to",
        "displayName": "To",
        "description":"Phone number of the message recipient in E.164 format, including + prefix, country code and area code",
        "type": "string",
        "default": ""
    },
    {
        "name": "message",
        "displayName": "Message",
        "description": "Content of the SMS message. Special characters are not supported. Messages longer than 153 characters will consume multiple SMS credits.",
        "type": "string",
        "default": ""
    },
    {
        "name": "regardingJobUUID",
        "displayName": "Regarding Job UUID",
        "description": "UUID of the job that this message is regarding. This is used to link the message to the job in ServiceM8, causing the SMS to appear in the job diary. If you do not specify a job UUID, the message will not be linked to any job.",
        "type": "string",
        "default": ""
    },
];