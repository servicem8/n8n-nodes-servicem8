import { INodeProperties } from 'n8n-workflow';

export const jobBookingDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        default: 'create',
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create a job booking',
            },
            {
                name: 'Delete',
                value: 'delete',
                action: 'Delete a job booking',
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a job booking',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                action: 'Get multiple job bookings',
            },
            {
                name: 'Update',
                value: 'update',
                action: 'Update a job booking',
            },
        ],
        displayOptions: {
            show: {
                resource: ['jobBooking'],
            },
        },
    },
    {
        displayName: 'Booking Type',
        name: 'bookingType',
        type: 'options',
        default: 'fixed',
        description: 'Type of booking',
        options: [
            {
                name: 'Flexible Time (Job Allocation)',
                value: 'flexible',
                description: 'Allocate job to staff within a time window',
            },
            {
                name: 'Fixed Time (Job Activity)',
                value: 'fixed',
                description: 'Schedule job at a specific start and end time',
            },
        ],
        displayOptions: {
            show: {
                resource: ['jobBooking'],
            },
        },
    },
    // UUID field for get, update, delete
    {
        displayName: 'Booking UUID',
        name: 'uuid',
        type: 'string',
        default: '',
        required: true,
        description: 'UUID of the job booking',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['get', 'update', 'delete'],
            },
        },
    },
    // Job UUID for create
    {
        displayName: 'Job UUID',
        name: 'jobUUID',
        type: 'string',
        default: '',
        required: true,
        description: 'UUID of the job to create the booking for',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
            },
        },
    },
    // Job UUID filter for getMany (optional)
    {
        displayName: 'Job UUID',
        name: 'filterJobUUID',
        type: 'string',
        default: '',
        description: 'Filter bookings by Job UUID. Leave empty to get all bookings.',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['getMany'],
            },
        },
    },
    // Staff Member for create only
    {
        displayName: 'Staff Member Name or ID',
        name: 'staffUUID',
        type: 'options',
        default: '',
        required: true,
        description: 'Choose from the list, or specify Staff UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        typeOptions: {
            loadOptionsMethod: 'getStaffMembers',
        },
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
            },
        },
    },
    // Flexible time (Job Allocation) fields for CREATE
    {
        displayName: 'Allocation Date',
        name: 'allocationDate',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'The minimum start date for a job allocation to be completed by a staff member',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
                bookingType: ['flexible'],
            },
        },
    },
    {
        displayName: 'Allocation Window Name or ID',
        name: 'allocationWindowUUID',
        type: 'options',
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
        typeOptions: {
            loadOptionsMethod: 'getAllocationWindows',
        },
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
                bookingType: ['flexible'],
            },
        },
    },
    {
        displayName: 'Expiry',
        name: 'expiryTimestamp',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the job allocation expires',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
                bookingType: ['flexible'],
            },
        },
    },
    // Fixed time (Job Activity) fields for CREATE
    {
        displayName: 'Start Time',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'The scheduled start date and time of the activity',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
                bookingType: ['fixed'],
            },
        },
    },
    {
        displayName: 'Duration (Minutes)',
        name: 'durationMinutes',
        type: 'number',
        default: 60,
        required: true,
        description: 'The duration of the activity in minutes',
        typeOptions: {
            minValue: 1,
        },
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
                bookingType: ['fixed'],
            },
        },
    },
    // UPDATE fields - Flexible time (Job Allocation)
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['update'],
                bookingType: ['flexible'],
            },
        },
        options: [
            {
                displayName: 'Allocation Date',
                name: 'allocation_date',
                type: 'dateTime',
                default: '',
                description: 'The minimum start date for a job allocation to be completed by a staff member',
            },
            {
                displayName: 'Allocation Window Name or ID',
                name: 'allocation_window_uuid',
                type: 'options',
                default: '',
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                typeOptions: {
                    loadOptionsMethod: 'getAllocationWindows',
                },
            },
            {
                displayName: 'Expiry',
                name: 'expiry_timestamp',
                type: 'dateTime',
                default: '',
                description: 'The timestamp when the job allocation expires',
            },
            {
                displayName: 'Staff Member Name or ID',
                name: 'staff_uuid',
                type: 'options',
                default: '',
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                typeOptions: {
                    loadOptionsMethod: 'getStaffMembers',
                },
            },
        ],
    },
    // UPDATE fields - Fixed time (Job Activity)
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['update'],
                bookingType: ['fixed'],
            },
        },
        options: [
            {
                displayName: 'Duration (Minutes)',
                name: 'duration_minutes',
                type: 'number',
                default: 60,
                description: 'The duration of the activity in minutes. Updates the end time based on the start time.',
                typeOptions: {
                    minValue: 1,
                },
            },
            {
                displayName: 'Staff Member Name or ID',
                name: 'staff_uuid',
                type: 'options',
                default: '',
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                typeOptions: {
                    loadOptionsMethod: 'getStaffMembers',
                },
            },
            {
                displayName: 'Start Time',
                name: 'start_date',
                type: 'dateTime',
                default: '',
                description: 'The scheduled start date and time of the activity',
            },
        ],
    },
    // Advanced Options for getMany
    {
        displayName: 'Advanced Options',
        name: 'advancedOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['getMany'],
            },
        },
        options: [
            {
                displayName: 'Include Inactive Records',
                name: 'includeInactive',
                type: 'boolean',
                default: false,
                description: 'Whether to include inactive (deleted) records in the results',
            },
        ],
    },
];
