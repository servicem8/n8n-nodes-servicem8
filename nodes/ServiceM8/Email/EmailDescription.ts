import { INodeProperties } from 'n8n-workflow';
import { SendEmailObject } from './EmailObjects';
export const emailDescription: INodeProperties[] = [

    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'sendEmail',
		options: [
			{
				name: 'Send Email',
				value: 'sendEmail',
			},
		],
		displayOptions: {
			show: {
				resource: ['email'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'collection',
		default: {
			"to":"",
			"cc":"",
			"replyTo":"",
			"subject":"",
			"htmlBody":"",
			"textBody":"",
			"regardingJobUUID":"",
			"attachments":"",
		},
		options: SendEmailObject,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['sendEmail'],
			},
		},
	},

]