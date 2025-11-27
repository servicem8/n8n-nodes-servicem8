import { INodeProperties } from 'n8n-workflow';
import { ClientCreateObject } from './ClientObjects';

export const clientDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getMany',
		options: [
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete client',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get client details',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get multiple clients',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update client details',
			},
			{
				name: 'Update Client Contacts',
				value: 'updateContacts',
				action: 'Update client contact details',
			},
		],
		displayOptions: {
			show: {
				resource: ['client'],
			},
		},
	},
	{
		displayName: 'Client UUID',
		name: 'uuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['client'],
				operation: ['get', 'update', 'delete', 'updateContacts'],
			},
		},
	},
	{
		displayName: 'Include Contacts',
		name: 'includeContacts',
		type: 'boolean',
		default: true,
		description: 'Whether to include client contacts in the response',
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
			"name": ""
		},
		options: ClientCreateObject,
		displayOptions: {
			show: {
				resource: ['client'],
				operation: ['create'],
			},
		},
	},
]

