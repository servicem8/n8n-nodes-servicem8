import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { DateTime } from 'luxon';

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
	
	const options: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: endpoint,
		headers,
		json: true,
		returnFullResponse: true,
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

	return await this.helpers.httpRequestWithAuthentication.call(this, credentialType, options);
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

/** ServiceM8 datetime format: "YYYY-MM-DD HH:mm:ss" */
const SERVICEM8_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
/** Regex to match ServiceM8 datetime format */
const SERVICEM8_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Converts various datetime formats to ServiceM8 API format.
 * ServiceM8 expects datetimes in "YYYY-MM-DD HH:mm:ss" format without timezone.
 * The datetime is interpreted as the account's local timezone.
 *
 * This function preserves the local time components from the input without
 * converting to any other timezone - it simply strips the timezone info.
 * For example, "2025-11-27T09:00:00-05:00" becomes "2025-11-27 09:00:00".
 *
 * Supported input types:
 * - Luxon DateTime objects
 * - JavaScript Date objects
 * - ISO 8601 strings (e.g., "2025-11-27T09:00:00.000-05:00")
 * - ServiceM8 format strings (passed through unchanged)
 * - Empty/null/undefined values (returns empty string)
 *
 * @param dateTimeValue - The datetime value to convert
 * @returns ServiceM8 formatted datetime string (e.g., "2025-11-27 09:00:00")
 * @throws Error if the input is an unsupported type or invalid format
 */
export function toServiceM8DateTime(dateTimeValue: unknown): string {
	// Handle empty values
	if (dateTimeValue === null || dateTimeValue === undefined || dateTimeValue === '') {
		return '';
	}

	// Handle Luxon DateTime objects
	if (DateTime.isDateTime(dateTimeValue)) {
		if (!dateTimeValue.isValid) {
			throw new Error(`Invalid Luxon DateTime: ${dateTimeValue.invalidReason}`);
		}
		return dateTimeValue.toFormat(SERVICEM8_DATETIME_FORMAT);
	}

	// Handle JavaScript Date objects
	if (dateTimeValue instanceof Date) {
		if (isNaN(dateTimeValue.getTime())) {
			throw new Error('Invalid JavaScript Date object');
		}
		const dt = DateTime.fromJSDate(dateTimeValue);
		return dt.toFormat(SERVICEM8_DATETIME_FORMAT);
	}

	// Handle strings
	if (typeof dateTimeValue === 'string') {
		// Already in ServiceM8 format - pass through unchanged
		if (SERVICEM8_DATETIME_REGEX.test(dateTimeValue)) {
			return dateTimeValue;
		}

		// Try to parse as ISO 8601
		const dt = DateTime.fromISO(dateTimeValue, { setZone: true });
		if (dt.isValid) {
			return dt.toFormat(SERVICEM8_DATETIME_FORMAT);
		}

		// Invalid string format
		throw new Error(`Invalid datetime string format: "${dateTimeValue}". Expected ISO 8601 format (e.g., "2025-11-27T09:00:00") or ServiceM8 format (e.g., "2025-11-27 09:00:00").`);
	}

	// Unsupported type
	const typeDescription = typeof dateTimeValue === 'object'
		? `object (${dateTimeValue?.constructor?.name || 'unknown'})`
		: typeof dateTimeValue;
	throw new Error(`Unsupported datetime type: ${typeDescription}. Expected string, Date, or Luxon DateTime.`);
}
