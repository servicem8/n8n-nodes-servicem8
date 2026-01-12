import { INodeProperties } from 'n8n-workflow';
import { GlobalSearchFieldsObject, SearchFieldsObject } from './SearchObjects';


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
				action: 'Search all objects',
			},
			{
				name: 'Object Search',
				value: 'objectSearch',
				action: 'Search a specific object type',
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
		placeholder: 'Add Search Options',
		default: {
            "q":"",
            "objectType":"job"
        },
		options: SearchFieldsObject,
		displayOptions: {
			show: {
				operation: ['objectSearch'],
			},
		},
		
	},
    {
		displayName: 'Fields',
		name: 'fields',
		type: 'collection',
		placeholder: 'Add Search Options',
		default: {
            "q":""
        },
		options: GlobalSearchFieldsObject,
		displayOptions: {
			show: {
				operation: ['globalSearch'],
			},
		},
		
	},
    
    
    

]