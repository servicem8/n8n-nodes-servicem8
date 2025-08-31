import { INodeProperties } from 'n8n-workflow';
import { ClientCreateObject } from './ClientObjects';

export const clientDescription: INodeProperties[] = [
    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		options: [
			{
				name: 'Get',
				value: 'get',
			},
			{
				name: 'Get Many',
				value: 'getMany',
			},
		],
		displayOptions: {
			show: {
				resource: ['client'],
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
				resource: ['client'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'collection',
		default: {
			"name":""
		},
		options: ClientCreateObject,
		displayOptions: {
			show: {
				resource: ['client'],
				operation: ['create'],
			},
		},
	}
	
	
]

