import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';

/**
 * Context passed to each handler operation
 */
export interface HandlerContext {
	executeFunctions: IExecuteFunctions;
	itemIndex: number;
}

/**
 * Interface that all resource handlers must implement
 */
export interface ResourceHandler {
	readonly resource: string;
	execute(ctx: HandlerContext, operation: string): Promise<unknown>;
}

/**
 * Configuration for resources that support standard CRUD operations
 */
export interface CrudConfig {
	/** The API object name (e.g., 'company' for clients, 'job' for jobs) */
	apiObject: string;
	/** Base URL for the API (without .json extension) */
	baseUrl: string;
	/** Whether this resource supports OData $filter queries */
	supportsFiltering: boolean;
	/** Whether records have an 'active' field for soft delete filtering */
	supportsActiveFilter: boolean;
}

/**
 * Check if value is an INodeExecutionData (has json property and optionally binary)
 */
function isNodeExecutionData(value: unknown): value is INodeExecutionData {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	// Must have json property that's an object, and optionally binary
	return (
		'json' in obj &&
		typeof obj.json === 'object' &&
		obj.json !== null &&
		!Array.isArray(obj.json)
	);
}

/**
 * Helper to push results to return items array
 */
export function pushToReturnItems(
	returnItems: INodeExecutionData[],
	data: unknown,
	itemIndex: number,
): void {
	if (data === null || data === undefined) {
		return;
	}

	const pushSingle = (value: unknown) => {
		// If it's already a properly formatted INodeExecutionData (with binary), use it directly
		if (isNodeExecutionData(value) && 'binary' in value) {
			returnItems.push(value);
			return;
		}

		const json =
			typeof value === 'object' && value !== null && !Array.isArray(value)
				? (value as IDataObject)
				: ({ value } as IDataObject);
		returnItems.push({
			json,
			pairedItem: { item: itemIndex },
		});
	};

	if (Array.isArray(data)) {
		for (const entry of data) {
			pushSingle(entry);
		}
		return;
	}

	pushSingle(data);
}

/**
 * Extract UUID from create response headers
 */
export function extractCreatedUuid(
	response: { body: IDataObject; headers?: Record<string, string> },
): IDataObject {
	return {
		...response.body,
		uuid: response.headers?.['x-record-uuid'],
	};
}
