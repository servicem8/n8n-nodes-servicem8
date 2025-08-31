import { INodeProperties } from "n8n-workflow";

export const ClientCreateObject: INodeProperties[] = [
    {
        "name": "name",
        "displayName": "Name",
        "type": "string",
        "default": ""
    },
    {
        "name":"abn_number",
        "displayName": "Abn Number",
        "type":"string",
        "default": ""
    },
    {
        "name":"address",
        "displayName": "Address",
        "type":"string",
        "default": ""
    },
    {
        "name":"billing_address",
        "displayName": "Billing Address",
        "type":"string",
        "default": ""
    },
    {
        "name":"parent_company_uuid",
        "displayName": "Parent Company UUID",
        "type":"string",
        "default": ""
    },
    {
        "name":"active",
        "displayName": "Active",
        "type":"number",
        "default": ""
    },
    {
        "name":"website",
        "displayName": "Website",
        "type":"string",
        "default": ""
    },
    {
        "name":"is_individual",
        "displayName": "Is Individual",
        "type":"number",
        "default": ""
    },
    {
        "name":"address_street",
        "displayName": "Address Street",
        "type":"string",
        "default": ""
    },
    {
        "name":"address_city",
        "displayName": "Address City",
        "type":"string",
        "default": ""
    },
    {
        "name":"address_state",
        "displayName": "Address State",
        "type":"string",
        "default": ""
    },
    {
        "name":"address_postcode",
        "displayName": "Address Postcode",
        "type":"string",
        "default": ""
    },
    {
        "name":"address_country",
        "displayName": "Address Country",
        "type":"string",
        "default": ""
    },
    {
        "name":"fax_number",
        "displayName": "Fax Number",
        "type":"string",
        "default": ""
    },
    {
        "name":"badges",
        "displayName": "Badges",
        "type":"string",
        "default": ""
    },
    {
        "name":"tax_rate_uuid",
        "displayName": "Tax Rate UUID",
        "type":"string",
        "default": ""
    },
    {
        "name":"billing_attention",
        "displayName": "Billing Attention",
        "type":"string",
        "default": ""
    },
    {
        "name":"payment_terms",
        "displayName": "Payment Terms",
        "type":"string",
        "default": ""
    }
]