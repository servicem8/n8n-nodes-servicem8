export type Option = {
	name:string;
	value:string;
}

export type fieldConfig = {
    field:string;
	required:bool;
    filter:bool;
    type:string;
}

export type jobTemplate = {
    uuid: string;
    active: bool;
    edit_date: string;
    name: string;
}

export type jobQueue = {
    uuid: string;
    active: bool;
    edit_date: string;
    name: string;
}