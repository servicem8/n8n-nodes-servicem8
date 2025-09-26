export type Option = {
	name:string;
	value:string;
}

export type fieldConfig = {
    field:string;
	required:boolean;
    filter:boolean;
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