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
				name: 'Create',
				value: 'create',
				action: 'Create a client',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a client',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a client',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get multiple clients',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a client',
			},
			{
				name: 'Update Client Contacts',
				value: 'updateContacts',
				action: 'Update client contacts',
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

