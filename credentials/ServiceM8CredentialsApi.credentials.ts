import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ServiceM8CredentialsApi implements ICredentialType {
	name = 'serviceM8CredentialsApi';
	displayName = 'ServiceM8 Credentials API';
	documentationUrl = 'https://developer.servicem8.com/docs/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'Api Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	// This credential is currently not used by any node directly
	// but the HTTP Request node can use it to make requests.
	// The credential is also testable due to the `test` property below
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				"X-API-Key": '={{ $credentials.apiKey }}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.servicem8.com/api_1.0/taxrate.json',
			url: '',
		},
	};
}
