import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

import clientConfig from "./Client/ClientFieldConfig.json";
import jobConfig from "./Job/JobFieldConfig.json";
import searchConfig from "./Search/SearchFieldConfig.json";
import { fieldConfig } from './types';

export async function serviceM8ApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	query: IDataObject = {},
	body: any = {},
	headers: any = {},
): Promise<any> {
	

	let credentialType = 'serviceM8CredentialsApi';
	
	const options: IRequestOptions = {
		method,
		body,
		qs: query,
		uri: endpoint,
		headers,
		json: true,
		resolveWithFullResponse: true,
	};

	if (!Object.keys(headers as IDataObject).length) {
		delete options.headers;
	}
	if (!Object.keys(body as IDataObject).length) {
		delete options.body;
	}
	if (!Object.keys(query).length) {
		delete options.qs;
	}
	this.logger.info(JSON.stringify(options));
	return await this.helpers.requestWithAuthentication.call(this, credentialType, options);
}

export async function getAllData(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	endpoint:string,
	query:IDataObject = {}, 
	limit = 0): Promise<IDataObject[]> {

		query.cursor = '-1';
		let returnData:IDataObject[] = [];
		let responseData;

		do {
			responseData = await serviceM8ApiRequest.call(this,'GET', endpoint,query);
			//this.logger.info(JSON.stringify(responseData));
			returnData = returnData.concat(responseData.body);
			if(responseData?.headers?.['x-next-cursor']){
				query.cursor = responseData?.headers['x-next-cursor'];
			}
			else{
				query.cursor = '0';
			}
			

		} while ((limit === 0 || returnData.length < limit) && query.cursor !== '0');

		return returnData;
}

export async function getEndpoint(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	resource: string,
	operation: string):Promise<string>{
		let operationConfig;
		switch(resource){
			case 'job':
				operationConfig = jobConfig[operation as keyof typeof jobConfig];
				return operationConfig['url' as keyof typeof operationConfig];
			case 'client':
				operationConfig = clientConfig[operation as keyof typeof clientConfig];
				return operationConfig['url' as keyof typeof operationConfig];
			case 'search':
				operationConfig = searchConfig[operation as keyof typeof searchConfig];
				return operationConfig['url' as keyof typeof operationConfig] as string;
			default:
				return '';
		}

}

export async function getUrlParams(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	resource: string,
	operation: string):Promise<string[]>{
		let operationConfig;
		switch(resource){
			case 'job':
				operationConfig = jobConfig[operation as keyof typeof jobConfig];
				return operationConfig['urlParams' as keyof typeof operationConfig];
			case 'client':
				operationConfig = clientConfig[operation as keyof typeof clientConfig];
				return operationConfig['urlParams' as keyof typeof operationConfig];
			case 'search':
				operationConfig = searchConfig[operation as keyof typeof searchConfig];
				return operationConfig['urlParams' as keyof typeof operationConfig] as string[];
			default:
				return [];
		}

}

export async function getFields(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	resource: string,
	):Promise<IDataObject[]>{
		switch(resource){
			case 'job':
				return jobConfig['fields' as keyof typeof jobConfig] as IDataObject[];
			case 'client':
				return clientConfig['fields' as keyof typeof clientConfig] as IDataObject[];
			default:
				return [];
		}

}

export async function processFilters(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	resource: string,
	filters: IDataObject[],
):Promise<string>{
	let filterString:string = '';
	let filterArray:string[] = [];

	if(filters?.length>0){
		const fieldsConfig = await getFields.call(this,resource);
		for (const filter of filters) {
			const fieldType = fieldsConfig.find(x=>x.field === filter.field)?.type ?? 'string';
			if(fieldType === 'integer' || fieldType === 'float'){
				filterArray.push(filter.field + ' ' + filter.operator + ' ' + filter.value);
			}
			else{
				filterArray.push(filter.field + ' ' + filter.operator + " '" + filter.value + "'");
			}
		}
		filterString = filterArray.join(' and ');
	}
	
	return filterString;
}

export async function processBody(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	resource: string,
	fields: IDataObject[],
):Promise<IDataObject>{
	let body:IDataObject = {};

	if(fields?.length>0){
		const fieldsConfig = await getFields.call(this,resource);
		for (const field of fields) {
			const fieldType = fieldsConfig.find(x=>x.field === field.field)?.type ?? 'string';
			const fieldName = field.field as string;
			let fieldValue;
			if(fieldType === 'integer' || fieldType === 'float'){
				fieldValue = field.value as number;
			}
			else{
				fieldValue = field.value as string;
			}
			body[fieldName] = fieldValue;
		}

	}
	
	return body;
}

export const toOptionsFromFieldConfig = (items:fieldConfig[]) =>
	items.map((x) => ({name:x.displayName, value:x.field}));