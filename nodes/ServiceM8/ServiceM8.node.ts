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
import { emailDescription } from './Email/EmailDescription';
import { smsDescription } from './Sms/SmsDescription';
import { inboxDescription } from './Inbox/InboxDescription';
import { getAllData, getEndpoint,getFields,getUrlParams, processBody, processFilters, serviceM8ApiRequest, toOptionsFromFieldConfig } from './GenericFunctions';
import { fieldConfig, jobQueue, jobTemplate, InboxMessageFields } from './types';
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
				
				if(operation === 'getMany'){
					let filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
					let filtersString = await processFilters.call(this,resource,filters?.filter as IDataObject[]);
					if(filtersString){
						qs['$filter'] = filtersString;
					}
					responseData = await getAllData.call(this, endpoint,qs);
					pushToReturnItems(responseData, itemIndex);
				}
				if(operation === 'get'){
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
				if(operation === 'create'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				if(operation === 'createFromTemplate'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					if(body.company_name && body.company_uuid){
						delete body.company_name;
					}
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
				}
				if(operation === 'addNoteToJob'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					body.related_object = 'job';
					body.active = 1;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					pushToReturnItems(responseData.body, itemIndex);
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
				 * Create Inbox Message
				 * Creates a new inbox message in ServiceM8
				 * @see https://developer.servicem8.com/reference/inboxmessage
				 */
				if(operation === 'createInboxMessage'){
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
