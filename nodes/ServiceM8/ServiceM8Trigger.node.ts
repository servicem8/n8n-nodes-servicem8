import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { serviceM8ApiRequest } from './GenericFunctions';

export class ServiceM8Trigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ServiceM8 Trigger',
		name: 'serviceM8Trigger',
		group: ['trigger'],
		version: 1,
		icon: 'file:ServiceM8Icon.svg',
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
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				default: undefined,
				options: [
					{
						"name": "New customer added",
						"value": "company.created",
						"description": "to get notified if a New customer added"
					},
					{
						"name": "Customer details updated",
						"value": "company.updated",
						"description": "to get notified if a Customer details updated"
					},
					{
						"name": "Form response submitted",
						"value": "form.response_created",
						"description": "to get notified if a Form response submitted"
					},
					{
						"name": "New message received in inbox",
						"value": "inbox.message_received",
						"description": "to get notified if a New message received in inbox"
					},
					{
						"name": "Badge added to job",
						"value": "job.badge_added",
						"description": "to get notified if a Badge added to job"
					},
					{
						"name": "Badge removed from job",
						"value": "job.badge_removed",
						"description": "to get notified if a Badge removed from job"
					},
					{
						"name": "Staff member arrived at job site",
						"value": "job.checked_in",
						"description": "to get notified if a Staff member arrived at job site"
					},
					{
						"name": "Staff member left job site",
						"value": "job.checked_out",
						"description": "to get notified if a Staff member left job site"
					},
					{
						"name": "Job marked as completed",
						"value": "job.completed",
						"description": "to get notified if a Job marked as completed"
					},
					{
						"name": "New job created in the system",
						"value": "job.created",
						"description": "to get notified if a New job created in the system"
					},
					{
						"name": "Full payment received for invoice",
						"value": "job.invoice_paid",
						"description": "to get notified if a Full payment received for invoice"
					},
					{
						"name": "Invoice sent to customer",
						"value": "job.invoice_sent",
						"description": "to get notified if a Invoice sent to customer"
					},
					{
						"name": "Note added to job",
						"value": "job.note_added",
						"description": "to get notified if a Note added to job"
					},
					{
						"name": "Photo attached to job",
						"value": "job.photo_added",
						"description": "to get notified if a Photo attached to job"
					},
					{
						"name": "Job added to queue",
						"value": "job.queued",
						"description": "to get notified if a Job added to queue"
					},
					{
						"name": "Customer accepted the quote",
						"value": "job.quote_accepted",
						"description": "to get notified if a Customer accepted the quote"
					},
					{
						"name": "Quote sent to customer",
						"value": "job.quote_sent",
						"description": "to get notified if a Quote sent to customer"
					},
					{
						"name": "Customer review submitted",
						"value": "job.review_received",
						"description": "to get notified if a Customer review submitted"
					},
					{
						"name": "Job status changed",
						"value": "job.status_changed",
						"description": "to get notified if a Job status changed"
					},
					{
						"name": "Job details modified",
						"value": "job.updated",
						"description": "to get notified if a Job details modified"
					},
					{
						"name": "Video attached to job",
						"value": "job.video_added",
						"description": "to get notified if a Video attached to job"
					},
					{
						"name": "Proposal sent to customer",
						"value": "proposal.sent",
						"description": "to get notified if a Proposal sent to customer"
					},
					{
						"name": "Proposal viewed by customer",
						"value": "proposal.viewed",
						"description": "to get notified if a Proposal viewed by customer"
					},
					{
						"name": "Staff member ended shift",
						"value": "staff.clocked_off",
						"description": "to get notified if a Staff member ended shift"
					},
					{
						"name": "Staff member started shift",
						"value": "staff.clocked_on",
						"description": "to get notified if a Staff member started shift"
					}
				]
			},

		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const currentWebhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				let exists = false;

				try {
					const data = await serviceM8ApiRequest.call(this,'GET','https://api.servicem8.com/webhook_subscriptions',{}) as IDataObject[];
					if(data){
						const webhookdata = data.find(x => x.url === currentWebhookUrl && x.event === event) ?? null;
						if(webhookdata){
							exists = true;
						}
					}
				} catch (error) {
					if (error.statusCode === 404) {
						return false;
					}
				}

				return exists;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const currentWebhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				if(currentWebhookUrl.toLocaleLowerCase().startsWith('http://') || currentWebhookUrl.toLocaleLowerCase().startsWith('www.')){
					throw new NodeOperationError(this.getNode(), 'not a valid webhook URL, make sure to have an HTTPS url.');
				}

				const body = {
					event: event,
					callback_url: currentWebhookUrl,
					unique_id: currentWebhookUrl,
				};

				try {

					const data = await serviceM8ApiRequest.call(this,'POST','https://api.servicem8.com/webhook_subscriptions/event',body,{}) as IDataObject;
					if (data.success) {
						// Required data is missing so was not successful
						return true;
					}
					return false;

				} catch (error) {
						return false;
				}

			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const currentWebhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				const body = {
					event: event,
					callback_url: currentWebhookUrl,
					unique_id: currentWebhookUrl,
				};

				try {
					const data = await serviceM8ApiRequest.call(this,'DELETE','https://api.servicem8.com/webhook_subscriptions',body,{}) as IDataObject;
					if (data.success) {
						// Required data is missing so was not successful
						return true;
					}
					return false;
				} catch (error) {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		return {
			workflowData: [
				this.helpers.returnJsonArray({
					triggerEvent: req.body.type,
					createdAt: req.body.createdAt,
					...req.body,
				}),
			],
		};
	}
}
