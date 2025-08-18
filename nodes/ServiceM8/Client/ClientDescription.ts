import { INodeProperties } from 'n8n-workflow';
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
			}
		],
		displayOptions: {
			show: {
				resource: ['client'],
			},
		},
	},
	{
		displayName: 'Search',
		name: 'operation',
		type: 'options',
		default: 'get',
		options: [
			{
				name: 'Get',
				value: 'get',
			}
		],
		displayOptions: {
			show: {
				resource: ['client',],
				operation: ['get'],
			},
		},
	},
]