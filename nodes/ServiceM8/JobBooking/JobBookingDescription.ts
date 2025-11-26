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
                action: 'Create job booking',
            },
        ],
        displayOptions: {
            show: {
                resource: ['jobBooking'],
            },
        },
    },
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
    {
        displayName: 'Booking Type',
        name: 'bookingType',
        type: 'options',
        default: 'fixed',
        description: 'Type of booking to create',
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
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Staff Member',
        name: 'staffUUID',
        type: 'options',
        default: '',
        required: true,
        description: 'Choose from the list, or specify Staff UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
    // Flexible time (Job Allocation) fields
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
        displayName: 'Allocation Window',
        name: 'allocationWindowUUID',
        type: 'options',
        default: '',
        description: 'Choose from the list, or specify Allocation Window UUID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
    // Fixed time (Job Activity) fields
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
        displayName: 'End Time',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'The scheduled end date and time of the activity',
        displayOptions: {
            show: {
                resource: ['jobBooking'],
                operation: ['create'],
                bookingType: ['fixed'],
            },
        },
    },
];
