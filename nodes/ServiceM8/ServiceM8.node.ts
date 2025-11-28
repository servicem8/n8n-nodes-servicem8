import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError, NodeApiError } from 'n8n-workflow';

import { attachmentDescription } from './Attachment/AttachmentDescription';
import { clientDescription } from './Client/ClientDescription';
import { jobDescription } from './Job/JobDescription';
import { jobBookingDescription } from './JobBooking/JobBookingDescription';
import { jobCheckinDescription } from './JobCheckin/JobCheckinDescription';
import { emailDescription } from './Email/EmailDescription';
import { smsDescription } from './Sms/SmsDescription';
import { inboxDescription } from './Inbox/InboxDescription';
import { getFields, serviceM8ApiRequest, toOptionsFromFieldConfig } from './GenericFunctions';
import { fieldConfig, jobQueue, jobTemplate, staffMember, allocationWindow } from './types';
import { genericDescription } from './GenericDescription';
import { searchDescription } from './Search/SearchDescription';
import { executeOperation, pushToReturnItems } from './handlers';
import type { HandlerContext } from './handlers';

export class ServiceM8 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ServiceM8',
		name: 'serviceM8',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Automate job, staff & client workflows in your trade service business.',
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
						name: 'Attachment',
						value: 'attachment',
					},
					{
						name: 'Client',
						value: 'client',
					},
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Inbox',
						value: 'inbox',
					},
					{
						name: 'Job',
						value: 'job',
					},
					{
						name: 'Job Booking',
						value: 'jobBooking',
					},
					{
						name: 'Job Checkin',
						value: 'jobCheckin',
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
			...attachmentDescription,
			...clientDescription,
			...jobDescription,
			...jobBookingDescription,
			...jobCheckinDescription,
			...emailDescription,
			...smsDescription,
			...inboxDescription,
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
			},
			async getStaffMembers(this:ILoadOptionsFunctions){
				const endpoint = 'https://api.servicem8.com/api_1.0/staff.json';
				const responseData = await serviceM8ApiRequest.call(this,'GET',endpoint);
				const staffMembers = responseData.body as staffMember[] ?? [];
				return staffMembers
					.filter((x) => x.active === 1)
					.map((x) => ({ name: `${x.first} ${x.last}`.trim(), value: x.uuid }));
			},
			async getAllocationWindows(this:ILoadOptionsFunctions){
				const endpoint = 'https://api.servicem8.com/api_1.0/allocationwindow.json';
				const responseData = await serviceM8ApiRequest.call(this,'GET',endpoint);
				const allocationWindows = responseData.body as allocationWindow[] ?? [];
				return allocationWindows
					.filter((x) => x.active === 1)
					.map((x) => ({ name: x.name, value: x.uuid }));
			}
		}
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0, '') as string;
		const operation = this.getNodeParameter('operation', 0, '') as string;
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const ctx: HandlerContext = {
					executeFunctions: this,
					itemIndex,
				};

				const result = await executeOperation(resource, operation, ctx);
				pushToReturnItems(returnItems, result, itemIndex);

			} catch (error) {
				if (this.continueOnFail()) {
					returnItems.push({
						json: { error: error instanceof Error ? error.message : error },
						pairedItem: { item: itemIndex },
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					if (error.response) {
						throw new NodeApiError(this.getNode(), error, {
							itemIndex,
						});
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnItems];
	}
}
