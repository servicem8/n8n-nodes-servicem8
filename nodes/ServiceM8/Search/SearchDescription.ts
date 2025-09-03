import { INodeProperties } from 'n8n-workflow';
import { SearchFieldsObject } from './SearchObjects';


export const searchDescription: INodeProperties[] = [
{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'globalSearch',
		options: [
			{
				name: 'Global Search',
				value: 'globalSearch',
				action: 'Search across multiple object types',
			},
			{
				name: 'Search',
				value: 'objectSearch',
				action: 'Search within a specific object type',
			},
		],
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
	},
    {
		displayName: 'Fields',
		name: 'fields',
		type: 'collection',
		placeholder: 'Add field to update',
		default: {
            "q":""
        },
		options: SearchFieldsObject,
		displayOptions: {
			show: {
				operation: ['objectSearch','globalSearch'],
			},
		},
		
	},
    {
        displayName: 'Object Type',
        name: 'objectType',
        type: 'options',
        default: 'job',
        options: [
            {
                name: 'Asset',
                value: 'asset',
            },
            {
                name: 'Attachment',
                value: 'attachment',
            },
            {
                name: 'Company',
                value: 'company',
            },
            {
                name: 'Form Response',
                value: 'formResponse',
            },
            {
                name: 'Job',
                value: 'job',
            },
            {
                name: 'Knowledge Article',
                value: 'knowledgeArticle',
            },
            {
                name: 'Material',
                value: 'material',
            },
            {
                name: 'Material Bundle',
                value: 'materialBundle',
            },
        ]
        

    }
    
    

]