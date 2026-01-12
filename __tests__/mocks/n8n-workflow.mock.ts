/**
 * Mock implementation of n8n-workflow package
 * This provides the types and classes needed for testing without requiring the actual n8n-workflow package
 */

// Re-export types (these are just type definitions, no runtime needed)
export type IDataObject = Record<string, unknown>;

export interface INodeExecutionData {
	json: IDataObject;
	pairedItem?: { item: number };
}

export interface IExecuteFunctions {
	getInputData(): INodeExecutionData[];
	getNodeParameter(
		parameterName: string,
		itemIndex: number,
		fallbackValue?: unknown,
	): unknown;
	getNode(): { name: string };
	continueOnFail(): boolean;
	helpers: {
		httpRequestWithAuthentication(
			credentialType: string,
			options: IHttpRequestOptions,
		): Promise<unknown>;
	};
}

export interface ILoadOptionsFunctions {
	getNodeParameter(
		parameterName: string,
		itemIndex: number,
		fallbackValue?: unknown,
	): unknown;
	helpers: {
		httpRequestWithAuthentication(
			credentialType: string,
			options: IHttpRequestOptions,
		): Promise<unknown>;
	};
}

export interface IWebhookFunctions {
	helpers: {
		httpRequestWithAuthentication(
			credentialType: string,
			options: IHttpRequestOptions,
		): Promise<unknown>;
	};
}

export interface IHookFunctions {
	helpers: {
		httpRequestWithAuthentication(
			credentialType: string,
			options: IHttpRequestOptions,
		): Promise<unknown>;
	};
}

export interface INodeType {
	description: INodeTypeDescription;
	execute?(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
	methods?: {
		loadOptions?: Record<
			string,
			(this: ILoadOptionsFunctions) => Promise<Array<{ name: string; value: string }>>
		>;
	};
}

export interface INodeTypeDescription {
	displayName: string;
	name: string;
	group: string[];
	version: number;
	subtitle?: string;
	description: string;
	icon?: string;
	defaults: { name: string };
	inputs: string[];
	outputs: string[];
	usableAsTool?: boolean;
	credentials?: Array<{ name: string; required: boolean }>;
	properties: INodeProperties[];
}

export interface INodeProperties {
	displayName: string;
	name: string;
	type: string;
	default: unknown;
	description?: string;
	required?: boolean;
	options?: Array<{
		name: string;
		value: string;
		action?: string;
		description?: string;
	}>;
	displayOptions?: {
		show?: Record<string, string[]>;
	};
	noDataExpression?: boolean;
	placeholder?: string;
	typeOptions?: Record<string, unknown>;
}

export interface IHttpRequestOptions {
	method: string;
	url: string;
	body?: unknown;
	qs?: Record<string, unknown>;
	headers?: Record<string, string>;
	json?: boolean;
	returnFullResponse?: boolean;
}

export type IHttpRequestMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// NodeConnectionType enum
export const NodeConnectionType = {
	Main: 'main',
} as const;

// Error classes
export class NodeOperationError extends Error {
	context?: { itemIndex?: number };

	constructor(
		node: { name: string },
		message: string,
		options?: { itemIndex?: number },
	) {
		super(message);
		this.name = 'NodeOperationError';
		if (options?.itemIndex !== undefined) {
			this.context = { itemIndex: options.itemIndex };
		}
	}
}

export class NodeApiError extends Error {
	context?: { itemIndex?: number };

	constructor(
		node: { name: string },
		error: Error | Record<string, unknown>,
		options?: { itemIndex?: number },
	) {
		super(error instanceof Error ? error.message : String(error));
		this.name = 'NodeApiError';
		if (options?.itemIndex !== undefined) {
			this.context = { itemIndex: options.itemIndex };
		}
	}
}
