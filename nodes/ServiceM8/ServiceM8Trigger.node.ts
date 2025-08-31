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
				default: 'company.created',
				options: [
					{
						name: 'Badge Added to Job',
						value: "job.badge_added",
						description: 'To get notified if a Badge added to job'
					},
					{
						name: 'Badge Removed From Job',
						value: "job.badge_removed",
						description: 'To get notified if a Badge removed from job'
					},
					{
						name: 'Customer Accepted the Quote',
						value: "job.quote_accepted",
						description: 'To get notified if a Customer accepted the quote'
					},
					{
						name: 'Customer Details Updated',
						value: "company.updated",
						description: 'To get notified if a Customer details updated'
					},
					{
						name: 'Customer Review Submitted',
						value: "job.review_received",
						description: 'To get notified if a Customer review submitted'
					},
					{
						name: 'Form Response Submitted',
						value: "form.response_created",
						description: 'To get notified if a Form response submitted'
					},
					{
						name: 'Full Payment Received for Invoice',
						value: "job.invoice_paid",
						description: 'To get notified if a Full payment received for invoice'
					},
					{
						name: 'Invoice Sent to Customer',
						value: "job.invoice_sent",
						description: 'To get notified if a Invoice sent to customer'
					},
					{
						name: 'Job Added to Queue',
						value: "job.queued",
						description: 'To get notified if a Job added to queue'
					},
					{
						name: 'Job Details Modified',
						value: "job.updated",
						description: 'To get notified if a Job details modified'
					},
					{
						name: 'Job Marked as Completed',
						value: "job.completed",
						description: 'To get notified if a Job marked as completed'
					},
					{
						name: 'Job Status Changed',
						value: "job.status_changed",
						description: 'To get notified if a Job status changed'
					},
					{
						name: 'New Customer Added',
						value: "company.created",
						description: 'To get notified if a New customer added'
					},
					{
						name: 'New Job Created in the System',
						value: "job.created",
						description: 'To get notified if a New job created in the system'
					},
					{
						name: 'New Message Received in Inbox',
						value: "inbox.message_received",
						description: 'To get notified if a New message received in inbox'
					},
					{
						name: 'Note Added to Job',
						value: "job.note_added",
						description: 'To get notified if a Note added to job'
					},
					{
						name: 'Photo Attached to Job',
						value: "job.photo_added",
						description: 'To get notified if a Photo attached to job'
					},
					{
						name: 'Proposal Sent to Customer',
						value: "proposal.sent",
						description: 'To get notified if a Proposal sent to customer'
					},
					{
						name: 'Proposal Viewed by Customer',
						value: "proposal.viewed",
						description: 'To get notified if a Proposal viewed by customer'
					},
					{
						name: 'Quote Sent to Customer',
						value: "job.quote_sent",
						description: 'To get notified if a Quote sent to customer'
					},
					{
						name: 'Staff Member Arrived at Job Site',
						value: "job.checked_in",
						description: 'To get notified if a Staff member arrived at job site'
					},
					{
						name: 'Staff Member Ended Shift',
						value: "staff.clocked_off",
						description: 'To get notified if a Staff member ended shift'
					},
					{
						name: 'Staff Member Left Job Site',
						value: "job.checked_out",
						description: 'To get notified if a Staff member left job site'
					},
					{
						name: 'Staff Member Started Shift',
						value: "staff.clocked_on",
						description: 'To get notified if a Staff member started shift'
					},
					{
						name: 'Video Attached to Job',
						value: "job.video_added",
						description: 'To get notified if a Video attached to job'
					},
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
