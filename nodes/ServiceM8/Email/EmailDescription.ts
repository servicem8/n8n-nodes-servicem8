import { INodeProperties } from 'n8n-workflow';
export const emailDescription: INodeProperties[] = [

    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
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
]