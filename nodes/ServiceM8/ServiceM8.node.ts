import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { clientDescription } from './Client/ClientDescription';
import { jobDescription } from './Job/JobDescription';
import { emailDescription } from './Email/EmailDescription';
import { smsDescription } from './Sms/SmsDescription';
import { getAllData, getEndpoint,getFields,getUrlParams, processBody, processFilters, serviceM8ApiRequest, toOptionsFromFieldConfig } from './GenericFunctions';
import { fieldConfig, jobQueue, jobTemplate } from './types';
import { genericDescription } from './GenericDescription';
import { searchDescription } from './Search/SearchDescription';

export class ServiceM8 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ServiceM8',
		name: 'serviceM8',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'ServiceM8 Node',
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
						name: 'Job',
						value: 'job',
					},
					{
						name: 'Email',
						value: 'email',
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
		let returnData: IDataObject[] = [];
		let qs:IDataObject = {}

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				item.json.resource = resource;
				item.json.operation = operation;

				let endpoint = await getEndpoint.call(this,resource,operation);
				const urlParams:string[] = await getUrlParams.call(this,resource,operation);
				
				for (const param of urlParams) {
					const tempParam = this.getNodeParameter(param, itemIndex, '') as string;
					endpoint = endpoint.replace('{'+param+'}',tempParam.trim());
				}
				
				if(operation === 'getMany'){
					let filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
					let filtersString = await processFilters.call(this,resource,filters?.filter as IDataObject[]);
					if(filtersString){
						qs['$filter'] = filtersString;
					}
					responseData = await getAllData.call(this, endpoint,qs);
					returnData = returnData.concat(responseData);
				}
				if(operation === 'get'){
					responseData = await getAllData.call(this, endpoint);
					returnData = returnData.concat(responseData);
				}
				if(operation === 'update'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = await processBody.call(this,resource,fields.field as IDataObject[]);
					if (!Object.keys(body as IDataObject).length) {
						throw new NodeOperationError(this.getNode(), 'No fields to update were added');
					}
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'create'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'createFromTemplate'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					if(body.company_name && body.company_uuid){
						delete body.company_name;
					}
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'addNoteToJob'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					body.related_object = 'job';
					body.active = 1;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'sendJobToQueue'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					returnData = returnData.concat(responseData.body);
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
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'sendSms'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					let body = fields;
					endpoint = 'https://api.servicem8.com/platform_service_sms';
					responseData = await serviceM8ApiRequest.call(this,'POST',endpoint,qs,body);
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'delete'){
					responseData = await serviceM8ApiRequest.call(this,'DELETE',endpoint);
					returnData = returnData.concat(responseData.body);
				}
				if(operation === 'objectSearch' || operation === 'globalSearch'){
					let fields = this.getNodeParameter('fields', itemIndex, {}) as IDataObject;
					if(!fields?.q){
						throw new NodeOperationError(this.getNode(), 'No search query was provided.');
					}
					qs = fields;
					if(operation === 'objectSearch'){
						delete qs.objectType;
					}
					responseData = await serviceM8ApiRequest.call(this,'GET',endpoint,qs);

					returnData = returnData.concat(responseData.body);
				}
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
