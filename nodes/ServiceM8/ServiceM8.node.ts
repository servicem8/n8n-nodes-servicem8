import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError, NodeApiError } from 'n8n-workflow';

import { clientDescription } from './Client/ClientDescription';
import { jobDescription } from './Job/JobDescription';
import { jobBookingDescription } from './JobBooking/JobBookingDescription';
import { emailDescription } from './Email/EmailDescription';
import { smsDescription } from './Sms/SmsDescription';
import { inboxDescription } from './Inbox/InboxDescription';
import { getAllData, getEndpoint,getFields,getUrlParams, processBody, processFilters, serviceM8ApiRequest, toOptionsFromFieldConfig, toServiceM8DateTime } from './GenericFunctions';
import { fieldConfig, jobQueue, jobTemplate, InboxMessageFields, staffMember, allocationWindow } from './types';
import { genericDescription } from './GenericDescription';
import { searchDescription } from './Search/SearchDescription';

export class ServiceM8 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ServiceM8',
		name: 'serviceM8',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Automate job, staff & client workflows in your trade service business.',
		icon: 'file:ServiceM8Icon.svg',
		defaults: {
			name: 'ServiceM8',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'serviceM8CredentialsApi',
				required: true
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Client',
						value: 'client',
					},
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Inbox',
						value: 'inbox',
					},
					{
						name: 'Job',
						value: 'job',
					},
					{
						name: 'Job Booking',
						value: 'jobBooking',
					},
					{
						name: 'Search',
						value: 'search',
					},
					{
						name: 'SMS',
						value: 'sms',
					},
				],
				default: 'client',
			},
			...clientDescription,
			...jobDescription,
			...jobBookingDescription,
			...emailDescription,
			...smsDescription,
			...inboxDescription,
			...genericDescription,
			...searchDescription,
		],
	};
	methods = {
		loadOptions: {
			async getFilterFields(this: ILoadOptionsFunctions) {
				const resource = this.getNodeParameter('resource', 0) as string;
				const fields = await getFields.call(this, resource) as fieldConfig[];
				const filterFields = fields.filter(x=>x.filter === true) as fieldConfig[];
				const filterFieldOptions = toOptionsFromFieldConfig.call(this,filterFields);
				return filterFieldOptions;
			},
			async getFields(this: ILoadOptionsFunctions) {
				const resource = this.getNodeParameter('resource', 0) as string;
				const fields = await getFields.call(this, resource)as fieldConfig[];
				const fieldOptions = toOptionsFromFieldConfig.call(this,fields);
				return fieldOptions;
			},
			async getJobTemplates(this:ILoadOptionsFunctions){
				const endpoint = 'https://api.servicem8.com/api_1.0/jobtemplate.json';
				const responseData = await serviceM8ApiRequest.call(this,'GET',endpoint);
				const jobTemplates = responseData.body as jobTemplate[] ?? [];
				return jobTemplates.map((x)=>({name: x.name, value:x.uuid}));
			},
			async getJobQueues(this:ILoadOptionsFunctions){
				const endpoint = 'https://api.servicem8.com/api_1.0/queue.json';
				const responseData = await serviceM8ApiRequest.call(this,'GET',endpoint);
				const jobQueues = responseData.body as jobQueue[] ?? [];
				return jobQueues.map((x)=>({name: x.name, value:x.uuid}));
			},
			async getStaffMembers(this:ILoadOptionsFunctions){
				const endpoint = 'https://api.servicem8.com/api_1.0/staff.json';
				const responseData = await serviceM8ApiRequest.call(this,'GET',endpoint);
				const staffMembers = responseData.body as staffMember[] ?? [];
				return staffMembers
					.filter((x) => x.active === 1)
					.map((x) => ({ name: `${x.first} ${x.last}`.trim(), value: x.uuid }));
			},
			async getAllocationWindows(this:ILoadOptionsFunctions){
				const endpoint = 'https://api.servicem8.com/api_1.0/allocationwindow.json';
				const responseData = await serviceM8ApiRequest.call(this,'GET',endpoint);
				const allocationWindows = responseData.body as allocationWindow[] ?? [];
				return allocationWindows
					.filter((x) => x.active === 1)
					.map((x) => ({ name: x.name, value: x.uuid }));
			}
		}
	}

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let resource = this.getNodeParameter('resource', 0, '') as string;
		let operation = this.getNodeParameter('operation', 0, '') as string;
		let responseData;
		const returnItems: INodeExecutionData[] = [];
		const pushToReturnItems = (data: unknown, index: number) => {
			if (data === null || data === undefined) {
				return;
			}
			const pushSingle = (value: unknown) => {
				const json =
					typeof value === 'object' && value !== null && !Array.isArray(value)
						? (value as IDataObject)
						: ({ value } as IDataObject);
				returnItems.push({
					json,
					pairedItem: { item: index },
				});
			};

			if (Array.isArray(data)) {
				for (const entry of data) {
					pushSingle(entry);
				}
				return;
			}

			pushSingle(data);
		};

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				item.json.resource = resource;
				item.json.operation = operation;

				let qs: IDataObject = {};

				let endpoint = await getEndpoint.call(this,resource,operation);
				const urlParams:string[] = await getUrlParams.call(this,resource,operation);
				
				for (const param of urlParams) {
					let tempParam = this.getNodeParameter(param, itemIndex, '') as string;
					if(!tempParam){
						let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
						tempParam = fields[param] as string;
					}
					endpoint = endpoint.replace('{'+param+'}',tempParam.trim());
				}
				
				if(operation === 'getMany' && resource !== 'inbox'){
					let filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
					let filtersString = await processFilters.call(this,resource,filters?.filter as IDataObject[]);
					if(filtersString){
						qs['$filter'] = filtersString;
					}
					responseData = await getAllData.call(this, endpoint,qs);
					pushToReturnItems(responseData, itemIndex);
				}
				if(operation === 'get' && resource !== 'inbox'){
					responseData = await getAllData.call(this, endpoint);
					pushToReturnItems(responseData, itemIndex);
				}
				if(operation === 'update'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = await processBody.call(this,resource,fields.field as IDataObject[]);
					if (!Object.keys(body as IDataObject).length) {
						throw new NodeOperationError(this.getNode(), 'No fields to update were added');
					}
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				if(operation === 'create' && resource !== 'jobBooking'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					const result = {
						...responseData.body,
						uuid: responseData.headers?.['x-record-uuid'],
					};
					pushToReturnItems(result, itemIndex);
				}
				if(operation === 'createFromTemplate'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					if(body.company_name && body.company_uuid){
						delete body.company_name;
					}
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					const result = {
						...responseData.body,
						uuid: responseData.headers?.['x-record-uuid'],
					};
					pushToReturnItems(result, itemIndex);
				}
				if(operation === 'addNoteToJob'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					body.related_object = 'job';
					body.active = 1;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					const result = {
						...responseData.body,
						uuid: responseData.headers?.['x-record-uuid'],
					};
					pushToReturnItems(result, itemIndex);
				}
				if(operation === 'sendJobToQueue'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				if(operation === 'sendEmail'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					let headers = {};
					endpoint = 'https://api.servicem8.com/platform_service_email';
					if(body['x-impersonate-uuid']){
						headers = {'x-impersonate-uuid':body['x-impersonate-uuid'] };
						delete body['x-impersonate-uuid'];
					}
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body,headers);
					pushToReturnItems(responseData.body, itemIndex);
				}
				if(operation === 'sendSMS'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					endpoint = 'https://api.servicem8.com/platform_service_sms';
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				/**
				 * Get Many Inbox Messages
				 * Lists inbox messages with optional filtering
				 * @see https://developer.servicem8.com/reference/listinboxmessages
				 */
				if(resource === 'inbox' && operation === 'getMany'){
					endpoint = 'https://api.servicem8.com/api_1.0/inboxmessage.json';
					const inboxFilter = this.getNodeParameter('inboxFilter', itemIndex, 'all') as string;
					const inboxSearch = this.getNodeParameter('inboxSearch', itemIndex, '') as string;
					const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

					qs['limit'] = limit;
					if(inboxFilter && inboxFilter !== 'all'){
						qs['filter'] = inboxFilter;
					}
					if(inboxSearch){
						qs['search'] = inboxSearch;
					}

					responseData = await serviceM8ApiRequest.call(this, 'GET', endpoint, qs);
					// The API returns { messages: [...], pagination: {...} }
					const messages = responseData.body?.messages ?? responseData.body ?? [];
					pushToReturnItems(messages, itemIndex);
				}
				/**
				 * Get Single Inbox Message
				 * Retrieves detailed information about a specific inbox message
				 * @see https://developer.servicem8.com/reference/getinboxmessage
				 */
				if(resource === 'inbox' && operation === 'get'){
					const uuid = this.getNodeParameter('uuid', itemIndex, '') as string;
					if(!uuid){
						throw new NodeOperationError(this.getNode(), 'UUID is required to get an inbox message', { itemIndex });
					}
					endpoint = `https://api.servicem8.com/api_1.0/inboxmessage/${uuid.trim()}.json`;
					responseData = await serviceM8ApiRequest.call(this, 'GET', endpoint);
					pushToReturnItems(responseData.body, itemIndex);
				}
				/**
				 * Convert Inbox Message to Job
				 * Converts an inbox message into a new job, optionally using a job template
				 * @see https://developer.servicem8.com/reference/convertinboxmessagetojob
				 */
				if(resource === 'inbox' && operation === 'convertToJob'){
					const uuid = this.getNodeParameter('uuid', itemIndex, '') as string;
					if(!uuid){
						throw new NodeOperationError(this.getNode(), 'UUID is required to convert an inbox message to job', { itemIndex });
					}
					const jobTemplateUUID = this.getNodeParameter('jobTemplateUUID', itemIndex, '') as string;
					const fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;

					endpoint = `https://api.servicem8.com/api_1.0/inboxmessage/${uuid.trim()}/convert-to-job.json`;

					const body: IDataObject = {};
					if(jobTemplateUUID){
						body.template_uuid = jobTemplateUUID;
					}
					if(fields.note){
						body.note = fields.note;
					}

					responseData = await serviceM8ApiRequest.call(this, 'POST', endpoint, qs, body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				/**
				 * Create Inbox Message
				 * Creates a new inbox message in ServiceM8
				 * @see https://developer.servicem8.com/reference/inboxmessage
				 */
				if(resource === 'inbox' && operation === 'createInboxMessage'){
					const fields = this.getNodeParameter('fields', itemIndex, {}) as Partial<InboxMessageFields>;
					const body: IDataObject = {};
					endpoint = 'https://api.servicem8.com/api_1.0/inboxmessage.json';
					const requiredFields = ['subject', 'message_text'] as const;
					for (const key of requiredFields) {
						const rawValue = fields[key];
						const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
						if (!value) {
							throw new NodeOperationError(this.getNode(), `"${key}" is required to create an inbox message`, { itemIndex });
						}
						body[key] = value;
					}

					const optionalKeys = ['from_name', 'from_email', 'regarding_company_uuid'] as const;
					for (const key of optionalKeys) {
						const rawValue = fields[key];
						if (typeof rawValue === 'string') {
							const trimmed = rawValue.trim();
							if (trimmed !== '') {
								body[key] = trimmed;
							}
						}
					}

					const jsonDataValue = typeof fields.json_data === 'string' ? fields.json_data.trim() : fields.json_data;
					if (jsonDataValue) {
						let parsedJson: IDataObject;
						if (typeof jsonDataValue === 'string') {
							try {
								parsedJson = JSON.parse(jsonDataValue as string) as IDataObject;
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'json_data must be a valid JSON string', { itemIndex });
							}
						} else {
							parsedJson = jsonDataValue as IDataObject;
						}
						if (Object.keys(parsedJson ?? {}).length) {
							body.json_data = parsedJson;
						}
					}

					if (fields.jobData && typeof fields.jobData === 'object') {
						const jobData = { ...(fields.jobData as IDataObject) };
						for (const key of Object.keys(jobData)) {
							if (typeof jobData[key] === 'string' && (jobData[key] as string).trim() === '') {
								delete jobData[key];
							}
						}
						if (Object.keys(jobData).length) {
							body.jobData = jobData;
						}
					}

					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				/**
				 * Create Job Booking
				 * Creates a job allocation (flexible time) or job activity (fixed time)
				 * @see https://developer.servicem8.com/reference/createjoballocations
				 * @see https://developer.servicem8.com/reference/createjobactivities
				 */
				if(resource === 'jobBooking' && operation === 'create'){
					const jobUUID = this.getNodeParameter('jobUUID', itemIndex, '') as string;
					const bookingType = this.getNodeParameter('bookingType', itemIndex, 'flexible') as string;
					const staffUUID = this.getNodeParameter('staffUUID', itemIndex, '') as string;

					if(!jobUUID){
						throw new NodeOperationError(this.getNode(), 'Job UUID is required to create a booking', { itemIndex });
					}
					if(!staffUUID){
						throw new NodeOperationError(this.getNode(), 'Staff Member is required to create a booking', { itemIndex });
					}

					const body: IDataObject = {
						job_uuid: jobUUID.trim(),
						staff_uuid: staffUUID,
					};

					if(bookingType === 'flexible'){
						// Job Allocation (flexible time)
						endpoint = 'https://api.servicem8.com/api_1.0/joballocation.json';
						const allocationDate = this.getNodeParameter('allocationDate', itemIndex, '') as string;
						const allocationWindowUUID = this.getNodeParameter('allocationWindowUUID', itemIndex, '') as string;
						const expiryTimestamp = this.getNodeParameter('expiryTimestamp', itemIndex, '') as string;

						if(!allocationDate){
							throw new NodeOperationError(this.getNode(), 'Allocation Date is required for flexible time bookings', { itemIndex });
						}

						body.allocation_date = toServiceM8DateTime(allocationDate);
						if(allocationWindowUUID){
							body.allocation_window_uuid = allocationWindowUUID;
						}
						if(expiryTimestamp){
							body.expiry_timestamp = toServiceM8DateTime(expiryTimestamp);
						}
					} else {
						// Job Activity (fixed time)
						endpoint = 'https://api.servicem8.com/api_1.0/jobactivity.json';
						const startDate = this.getNodeParameter('startDate', itemIndex, '') as string;
						const endDate = this.getNodeParameter('endDate', itemIndex, '') as string;

						if(!startDate){
							throw new NodeOperationError(this.getNode(), 'Start Time is required for fixed time bookings', { itemIndex });
						}
						if(!endDate){
							throw new NodeOperationError(this.getNode(), 'End Time is required for fixed time bookings', { itemIndex });
						}

						body.start_date = toServiceM8DateTime(startDate);
						body.end_date = toServiceM8DateTime(endDate);
						body.activity_was_scheduled = 1;
					}

					responseData = await serviceM8ApiRequest.call(this, 'POST', endpoint, qs, body);
					const result = {
						...responseData.body,
						uuid: responseData.headers?.['x-record-uuid'],
					};
					pushToReturnItems(result, itemIndex);
				}
				if(operation === 'delete'){
					responseData = await serviceM8ApiRequest.call(this,'DELETE',endpoint);
					pushToReturnItems(responseData.body, itemIndex);
				}
				if(operation === 'objectSearch' || operation === 'globalSearch'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					if(!fields?.q){
						throw new NodeOperationError(this.getNode(), 'No search query was provided.');
					}
					qs = { ...fields };
					if(operation === 'objectSearch'){
						delete qs.objectType;
					}
					responseData = await serviceM8ApiRequest.call(this,'GET',endpoint,qs);

					pushToReturnItems(responseData.body, itemIndex);
				}
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					returnItems.push({
						json: { error: error instanceof Error ? error.message : error },
						pairedItem: { item: itemIndex },
					});
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					// Use NodeApiError for API-related errors, NodeOperationError for others
					if (error.response) {
						throw new NodeApiError(this.getNode(), error, {
							itemIndex,
						});
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnItems];
	}
}
