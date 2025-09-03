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
        description: 'Maximum number of results to return (max 100)',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions:{
            maxValue:100,
            minValue:1,
        }
    },
    
];