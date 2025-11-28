import type { INodeProperties } from 'n8n-workflow';

export const attachmentDescription: INodeProperties[] = [
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
				action: 'Create a new attachment',
				description: 'Create an attachment record and upload a file',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete an attachment',
				description: 'Soft delete an attachment (sets active to 0)',
			},
			{
				name: 'Download',
				value: 'download',
				action: 'Download attachment file',
				description: 'Download the binary file data of an attachment',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get attachment details',
				description: 'Get metadata for a single attachment',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get multiple attachments',
				description: 'Get metadata for multiple attachments',
			},
		],
		displayOptions: {
			show: {
				resource: ['attachment'],
			},
		},
	},
	{
		displayName: 'Attachment UUID',
		name: 'uuid',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the attachment',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['get', 'download', 'delete'],
			},
		},
	},
	// Related Object Type for create and getMany filtering
	{
		displayName: 'Related Object Type',
		name: 'relatedObjectType',
		type: 'options',
		required: true,
		default: 'job',
		options: [
			{
				name: 'Job',
				value: 'job',
			},
			{
				name: 'Client (Company)',
				value: 'company',
			},
		],
		description: 'The type of object this attachment is related to',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Related Object UUID',
		name: 'relatedObjectUuid',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the job or client this attachment belongs to',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
			},
		},
	},
	// Binary data input for create
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'The name of the input binary field containing the file to upload',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
			},
		},
	},
	// Output binary field for download
	{
		displayName: 'Output Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'The name of the output binary field to put the downloaded file in',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['download'],
			},
		},
	},
	// Optional fields for create
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Attachment Name',
				name: 'attachment_name',
				type: 'string',
				default: '',
				description: 'Name for the attachment. If not provided, the filename from the binary data will be used.',
			},
			{
				displayName: 'Attachment Source',
				name: 'attachment_source',
				type: 'string',
				default: '',
				description: 'Source type of the attachment (e.g., INVOICE, QUOTE, PHOTO)',
			},
			{
				displayName: 'File Type',
				name: 'file_type',
				type: 'string',
				default: '',
				description: 'File extension (e.g., .pdf, .jpg). If not provided, will be inferred from filename.',
			},
			{
				displayName: 'Is Favourite',
				name: 'is_favourite',
				type: 'boolean',
				default: false,
				description: 'Whether this attachment is marked as a favourite',
			},
			{
				displayName: 'Latitude',
				name: 'lat',
				type: 'number',
				default: 0,
				description: 'Latitude coordinate where the attachment was created',
			},
			{
				displayName: 'Longitude',
				name: 'lng',
				type: 'number',
				default: 0,
				description: 'Longitude coordinate where the attachment was created',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'string',
				default: '',
				description: 'Additional structured data in JSON format',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
		],
	},
	// Filter options for getMany
	{
		displayName: 'Filter by Related Object',
		name: 'filterByRelatedObject',
		type: 'boolean',
		default: false,
		description: 'Whether to filter attachments by a specific job or client',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['getMany'],
			},
		},
	},
	{
		displayName: 'Related Object Type',
		name: 'relatedObjectType',
		type: 'options',
		default: 'job',
		options: [
			{
				name: 'Job',
				value: 'job',
			},
			{
				name: 'Client (Company)',
				value: 'company',
			},
		],
		description: 'The type of object to filter attachments by',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['getMany'],
				filterByRelatedObject: [true],
			},
		},
	},
	{
		displayName: 'Related Object UUID',
		name: 'relatedObjectUuid',
		type: 'string',
		default: '',
		description: 'The UUID of the job or client to filter attachments by',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['getMany'],
				filterByRelatedObject: [true],
			},
		},
	},
];
