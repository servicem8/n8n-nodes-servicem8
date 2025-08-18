import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

export async function serviceM8ApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	

	let credentialType = 'serviceM8CredentialsApi';
	
	const options: IRequestOptions = {
		method,
		body,
		qs: query,
		uri: endpoint,
		json: true,
	};

	if (!Object.keys(body as IDataObject).length) {
		delete options.body;
	}

	if (!Object.keys(query).length) {
		delete options.qs;
	}

	return await this.helpers.requestWithAuthentication.call(this, credentialType, options);
}