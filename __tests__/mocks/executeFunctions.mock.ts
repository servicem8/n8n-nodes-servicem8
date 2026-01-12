import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { vi } from 'vitest';

export interface MockExecuteFunctionsOptions {
	resource: string;
	operation: string;
	nodeParams?: Record<string, unknown>;
	inputData?: INodeExecutionData[];
	httpResponse?: {
		body?: unknown;
		headers?: Record<string, string>;
	};
}

export function createMockExecuteFunctions(
	options: MockExecuteFunctionsOptions,
): IExecuteFunctions {
	const {
		resource,
		operation,
		nodeParams = {},
		inputData = [{ json: {} }],
		httpResponse = { body: {}, headers: {} },
	} = options;

	const mockHttpRequest = vi.fn().mockResolvedValue(httpResponse);

	return {
		getInputData: vi.fn().mockReturnValue(inputData),
		getNodeParameter: vi.fn(
			(param: string, _itemIndex: number, fallback?: unknown) => {
				if (param === 'resource') return resource;
				if (param === 'operation') return operation;
				return nodeParams[param] ?? fallback;
			},
		),
		getNode: vi.fn().mockReturnValue({ name: 'ServiceM8' }),
		continueOnFail: vi.fn().mockReturnValue(false),
		helpers: {
			httpRequestWithAuthentication: mockHttpRequest,
		},
	} as unknown as IExecuteFunctions;
}

/**
 * Get the mock httpRequestWithAuthentication function from a mock context
 * Useful for asserting what API calls were made
 */
export function getMockHttpRequest(
	mockContext: IExecuteFunctions,
): ReturnType<typeof vi.fn> {
	return (mockContext.helpers as { httpRequestWithAuthentication: ReturnType<typeof vi.fn> })
		.httpRequestWithAuthentication;
}
