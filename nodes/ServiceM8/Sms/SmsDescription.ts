import { INodeProperties } from 'n8n-workflow';
import { SendSmsObject } from './SmsObjects';
export const smsDescription: INodeProperties[] = [

    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'sendSMS',
		options: [
			{
				name: 'Send SMS',
				value: 'sendSMS',
				action: 'Send SMS a sms',
			},
		],
		displayOptions: {
			show: {
				resource: ['sms'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'collection',
		default: {
			"to":"",
			"message":"",
			"regardingJobUUID":""
		},
		options: SendSmsObject,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['sendSMS'],
			},
		},
	},
]