import { INodeProperties } from 'n8n-workflow';
import { InboxMessageFields } from './InboxObjects';

export const inboxDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        default: 'createInboxMessage',
        options: [
            {
                name: 'Create Inbox Message',
                value: 'createInboxMessage',
                action: 'Create inbox message',
            },
        ],
        displayOptions: {
            show: {
                resource: ['inbox'],
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
