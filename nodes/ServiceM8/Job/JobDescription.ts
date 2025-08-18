import { INodeProperties } from 'n8n-workflow';
export const jobDescription: INodeProperties[] = [

    {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		options: [
			{
				name: 'Add Note To Job',
				value: 'addNoteToJob',
			},
			{
				name: 'Create',
				value: 'create',
			},
			{
				name: 'Create From Template',
				value: 'createFromTemplate',
			},
			{
				name: 'Delete',
				value: 'delete',
			},
			{
				name: 'Get',
				value: 'get',
			},
			{
				name: 'Update',
				value: 'update',
			},
			{
				name: 'Send Job To Queue',
				value: 'sendJobToQueue',
			},
		],
		displayOptions: {
			show: {
				resource: ['job'],
			},
		},
	},
]