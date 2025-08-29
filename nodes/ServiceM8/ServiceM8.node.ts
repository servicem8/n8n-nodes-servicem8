import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { clientDescription } from './Client/ClientDescription';
import { jobDescription } from './Job/JobDescription';
import { emailDescription } from './Email/EmailDescription';
import { smsDescription } from './Sms/SmsDescription';
import { getAllData, getEndpoint,getUrlParams } from './GenericFunctions';

export class ServiceM8 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ServiceM8',
		name: 'serviceM8',
		group: ['transform'],
		version: 1,
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
		],
	};

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
				
				if(operation === 'getAll'){
					responseData = await getAllData.call(this, endpoint);
					returnData = returnData.concat(responseData);
				}
				if(operation === 'get'){

					responseData = await getAllData.call(this, endpoint);
					returnData = returnData.concat(responseData);
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
