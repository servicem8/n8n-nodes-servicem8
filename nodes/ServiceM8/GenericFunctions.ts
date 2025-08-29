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

export async function serviceM8ApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	query: IDataObject = {},
	body: any = {},
): Promise<any> {
	

	let credentialType = 'serviceM8CredentialsApi';
	
	const options: IRequestOptions = {
		method,
		body,
		qs: query,
		uri: endpoint,
		json: true,
		resolveWithFullResponse: true,
	};

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
		//this.logger.info(JSON.stringify(returnData));
		return returnData;
}

export async function getEndpoint(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	resource: string,
	operation: string){
		let operationConfig;
		switch(resource){
			case 'job':
				operationConfig = jobConfig[operation as keyof typeof jobConfig];
				return operationConfig['url' as keyof typeof operationConfig];
			case 'client':
				operationConfig = clientConfig[operation as keyof typeof clientConfig];
				return operationConfig['url' as keyof typeof operationConfig];
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
			default:
				return [];
		}

}

