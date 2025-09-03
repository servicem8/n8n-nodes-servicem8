import { INodeProperties } from "n8n-workflow";

export const SearchFieldsObject: INodeProperties[] = [
    {
        displayName: 'Search Query',
        name: 'q',
        type: 'string',
        default: '',
    },
    {
        displayName: 'Limit',
        description: 'Max number of results to return',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions:{

            minValue:1,
        }
    },
    
];