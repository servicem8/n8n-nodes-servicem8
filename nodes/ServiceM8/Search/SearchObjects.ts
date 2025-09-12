import { INodeProperties } from "n8n-workflow";

export const SearchFieldsObject: INodeProperties[] = [
    {
        displayName: 'Search Query',
        name: 'q',
        type: 'string',
        default: '',
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
    },
    {
        displayName: 'Limit',
        description: 'Max number of results to return',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions:{
            minValue:1,
            maxValue:100
        }
    },   
];

export const GlobalSearchFieldsObject: INodeProperties[] = [
    {
        displayName: 'Search Query',
        name: 'q',
        type: 'string',
        default: '',
    },
    {
        displayName: 'Limit',
        description: 'Max number of results to return',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions:{
            minValue:1,
            maxValue:50
        }
    },
    
];