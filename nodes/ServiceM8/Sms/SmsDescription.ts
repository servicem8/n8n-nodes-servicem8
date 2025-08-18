import { INodeProperties } from 'n8n-workflow';
export const smsDescription: INodeProperties[] = [

    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		options: [
			{
				name: 'Send SMS',
				value: 'sendSMS',
			},
		],
		displayOptions: {
			show: {
				resource: ['sms'],
			},
		},
	},
]