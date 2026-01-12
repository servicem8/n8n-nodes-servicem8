export type Option = {
	name:string;
	value:string;
}

export type fieldConfig = {
    field:string;
	required:boolean;
    filter:boolean;
    readonly?:boolean;
    type:string;
    displayName:string;
}

export type jobTemplate = {
    uuid: string;
    active: boolean;
    edit_date: string;
    name: string;
}

export type jobQueue = {
    uuid: string;
    active: boolean;
    edit_date: string;
    name: string;
}

export type staffMember = {
    uuid: string;
    active: number;
    first: string;
    last: string;
    email: string;
}

export type allocationWindow = {
    uuid: string;
    active: number;
    name: string;
    start_time: number;
    end_time: number;
}

export type InboxMessageFields = {
	subject: string;
	message_text: string;
	from_name?: string;
	from_email?: string;
	regarding_company_uuid?: string;
	json_data?: string | object;
	jobData?: {
		contact_first?: string;
		contact_last?: string;
		company_name?: string;
		email?: string;
		mobile?: string;
		phone_1?: string;
		phone_2?: string;
		billing_contact_first?: string;
		billing_contact_last?: string;
		billing_email?: string;
		billing_mobile?: string;
		billing_attention?: string;
		job_description?: string;
		job_address?: string;
		billing_address?: string;
		work_done_description?: string;
	};
}