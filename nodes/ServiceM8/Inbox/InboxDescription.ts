import { INodeProperties } from 'n8n-workflow';
import { InboxMessageFields, InboxConvertToJobFields } from './InboxObjects';

export const inboxDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        default: 'getMany',
        options: [
            {
                name: 'Convert To Job',
                value: 'convertToJob',
                action: 'Convert an inbox message to a job',
            },
            {
                name: 'Create',
                value: 'createInboxMessage',
                action: 'Create an inbox message',
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get an inbox message',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                action: 'Get multiple inbox messages',
            },
        ],
        displayOptions: {
            show: {
                resource: ['inbox'],
            },
        },
    },
    {
        displayName: 'UUID',
        name: 'uuid',
        type: 'string',
        default: '',
        required: true,
        description: 'UUID of the inbox message',
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['get', 'convertToJob'],
            },
        },
    },
    {
        displayName: 'Filter',
        name: 'inboxFilter',
        type: 'options',
        default: 'all',
        description: 'Filter messages by status',
        options: [
            { name: 'All', value: 'all' },
            { name: 'Unread', value: 'unread' },
            { name: 'Archived', value: 'archived' },
            { name: 'Snoozed', value: 'snoozed' },
        ],
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['getMany'],
            },
        },
    },
    {
        displayName: 'Search',
        name: 'inboxSearch',
        type: 'string',
        default: '',
        description: 'Search messages by subject, from name, or from email',
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['getMany'],
            },
        },
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Max number of results to return (1-500)',
        typeOptions: {
            minValue: 1,
            maxValue: 500,
        },
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['getMany'],
            },
        },
    },
    {
        displayName: 'Job Template Name or ID',
        name: 'jobTemplateUUID',
        type: 'options',
        description: 'Choose a job template to use when creating the job, or leave empty to create without a template. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        default: '',
        typeOptions: {
            loadOptionsMethod: 'getJobTemplates',
        },
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['convertToJob'],
            },
        },
    },
    {
        displayName: 'Options',
        name: 'fields',
        type: 'collection',
        default: {},
        placeholder: 'Add Option',
        options: InboxConvertToJobFields,
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['convertToJob'],
            },
        },
    },
    {
        displayName: 'Fields',
        name: 'fields',
        type: 'collection',
        default: {},
        options: InboxMessageFields,
        displayOptions: {
            show: {
                resource: ['inbox'],
                operation: ['createInboxMessage'],
            },
        },
    },
];
