import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class ServiceM8Trigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ServiceM8 Trigger',
		name: 'serviceM8Trigger',
		group: ['trigger'],
		version: 1,
		description: 'ServiceM8 Trigger Node',
		defaults: {
			name: 'ServiceM8 Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'serviceM8CredentialsApi',
				required: true
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
			{
				name: 'setup',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'My String',
				name: 'myString',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The description text',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				default: 'document.accepted',
				options: [
					{
						name: 'Document Accepted',
						value: 'document.accepted',
						description:
							"To get notified if a document is accepted",
					},
					{
						name: 'Document Created',
						value: 'document.created',
						description:
							"To get notified if a document is created",
					},
					{
						name: 'Document Denied',
						value: 'document.denied',
						description:
							"To get notified if a document is denied",
					},
					{
						name: 'Document Sent',
						value: 'document.sent',
						description:
							"To get notified if a document is sent",
					},
					{
						name: 'Document Viewed',
						value: 'document.viewed',
						description:
							"To get notified if a document is viewed",
					},
				],
			},

		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let myString: string;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				myString = this.getNodeParameter('myString', itemIndex, '') as string;
				item = items[itemIndex];

				item.json.myString = myString;
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

		return [items];
	}
}
