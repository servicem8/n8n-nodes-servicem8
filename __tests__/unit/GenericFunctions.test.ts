import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
	toServiceM8DateTime,
	toOptionsFromFieldConfig,
	processFilters,
	processBody,
	serviceM8ApiRequest,
	getAllData,
} from '../../nodes/ServiceM8/GenericFunctions';
import type { fieldConfig } from '../../nodes/ServiceM8/types';

describe('toServiceM8DateTime', () => {
	describe('ISO string inputs', () => {
		it('converts ISO datetime with timezone to ServiceM8 format', () => {
			expect(toServiceM8DateTime('2025-11-27T09:00:00.000-05:00')).toBe(
				'2025-11-27 09:00:00',
			);
		});

		it('converts ISO datetime without milliseconds', () => {
			expect(toServiceM8DateTime('2025-11-27T14:30:00+10:00')).toBe(
				'2025-11-27 14:30:00',
			);
		});

		it('handles datetime without timezone (assumes local)', () => {
			const result = toServiceM8DateTime('2025-11-27T09:00:00');
			// Should still produce a valid format
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});

		it('converts ISO date-only string', () => {
			const result = toServiceM8DateTime('2025-11-27');
			expect(result).toBe('2025-11-27 00:00:00');
		});
	});

	describe('ServiceM8 format strings (passthrough)', () => {
		it('passes through string already in ServiceM8 format unchanged', () => {
			expect(toServiceM8DateTime('2025-11-27 09:00:00')).toBe(
				'2025-11-27 09:00:00',
			);
		});

		it('passes through midnight time unchanged', () => {
			expect(toServiceM8DateTime('2025-01-01 00:00:00')).toBe(
				'2025-01-01 00:00:00',
			);
		});
	});

	describe('Luxon DateTime inputs', () => {
		it('converts Luxon DateTime to ServiceM8 format', () => {
			const dt = DateTime.fromISO('2025-11-27T09:30:45');
			expect(toServiceM8DateTime(dt)).toBe('2025-11-27 09:30:45');
		});

		it('converts Luxon DateTime with timezone to ServiceM8 format', () => {
			const dt = DateTime.fromISO('2025-11-27T09:30:45', {
				zone: 'America/New_York',
			});
			expect(toServiceM8DateTime(dt)).toBe('2025-11-27 09:30:45');
		});

		it('throws for invalid Luxon DateTime', () => {
			const dt = DateTime.invalid('test invalid');
			expect(() => toServiceM8DateTime(dt)).toThrow('Invalid Luxon DateTime');
		});
	});

	describe('JavaScript Date inputs', () => {
		it('converts JavaScript Date to ServiceM8 format', () => {
			// Create a date with specific local time components
			const date = new Date(2025, 10, 27, 9, 30, 45); // Nov 27, 2025 09:30:45 local
			const result = toServiceM8DateTime(date);
			expect(result).toBe('2025-11-27 09:30:45');
		});

		it('converts JavaScript Date at midnight', () => {
			const date = new Date(2025, 0, 1, 0, 0, 0); // Jan 1, 2025 00:00:00 local
			const result = toServiceM8DateTime(date);
			expect(result).toBe('2025-01-01 00:00:00');
		});

		it('throws for invalid JavaScript Date', () => {
			const invalidDate = new Date('invalid');
			expect(() => toServiceM8DateTime(invalidDate)).toThrow(
				'Invalid JavaScript Date object',
			);
		});
	});

	describe('empty/null/undefined inputs', () => {
		it('returns empty string for empty string', () => {
			expect(toServiceM8DateTime('')).toBe('');
		});

		it('returns empty string for null', () => {
			expect(toServiceM8DateTime(null)).toBe('');
		});

		it('returns empty string for undefined', () => {
			expect(toServiceM8DateTime(undefined)).toBe('');
		});
	});

	describe('invalid inputs', () => {
		it('throws for invalid datetime string', () => {
			expect(() => toServiceM8DateTime('not-a-date')).toThrow(
				'Invalid datetime string format',
			);
		});

		it('throws for partial datetime string', () => {
			expect(() => toServiceM8DateTime('2025-11-27T')).toThrow(
				'Invalid datetime string format',
			);
		});

		it('throws for number input', () => {
			expect(() => toServiceM8DateTime(1234567890 as unknown)).toThrow(
				'Unsupported datetime type: number',
			);
		});

		it('throws for plain object input', () => {
			expect(() =>
				toServiceM8DateTime({ year: 2025 } as unknown),
			).toThrow('Unsupported datetime type: object');
		});

		it('throws for array input', () => {
			expect(() => toServiceM8DateTime([2025, 11, 27] as unknown)).toThrow(
				'Unsupported datetime type: object (Array)',
			);
		});

		it('throws for boolean input', () => {
			expect(() => toServiceM8DateTime(true as unknown)).toThrow(
				'Unsupported datetime type: boolean',
			);
		});
	});
});

describe('toOptionsFromFieldConfig', () => {
	it('converts field config array to options format', () => {
		const input: fieldConfig[] = [
			{
				displayName: 'Status',
				field: 'status',
				required: true,
				filter: true,
				type: 'string',
			},
			{
				displayName: 'UUID',
				field: 'uuid',
				required: false,
				filter: true,
				type: 'uuid',
			},
		];

		expect(toOptionsFromFieldConfig(input)).toEqual([
			{ name: 'Status', value: 'status' },
			{ name: 'UUID', value: 'uuid' },
		]);
	});

	it('returns empty array for empty input', () => {
		expect(toOptionsFromFieldConfig([])).toEqual([]);
	});

	it('handles single item array', () => {
		const input: fieldConfig[] = [
			{
				displayName: 'Name',
				field: 'name',
				required: true,
				filter: false,
				type: 'string',
			},
		];

		expect(toOptionsFromFieldConfig(input)).toEqual([
			{ name: 'Name', value: 'name' },
		]);
	});
});

describe('processFilters', () => {
	// Create a minimal mock context for processFilters
	const createMockContext = () =>
		({
			getNodeParameter: vi.fn(),
		}) as unknown as Parameters<typeof processFilters>[0];

	it('builds filter string for string fields with quotes', async () => {
		const mockContext = createMockContext();
		const filters = [{ field: 'status', operator: 'eq', value: 'Quote' }];

		const result = await processFilters.call(mockContext, 'job', filters);
		expect(result).toBe("status eq 'Quote'");
	});

	it('builds filter string for numeric fields without quotes', async () => {
		const mockContext = createMockContext();
		const filters = [{ field: 'invoice_sent', operator: 'eq', value: '1' }];

		const result = await processFilters.call(mockContext, 'job', filters);
		expect(result).toBe('invoice_sent eq 1');
	});

	it('joins multiple filters with AND', async () => {
		const mockContext = createMockContext();
		const filters = [
			{ field: 'status', operator: 'eq', value: 'Quote' },
			{ field: 'active', operator: 'eq', value: '1' },
		];

		const result = await processFilters.call(mockContext, 'job', filters);
		expect(result).toBe("status eq 'Quote' and active eq 1");
	});

	it('returns empty string for empty filters', async () => {
		const mockContext = createMockContext();
		const result = await processFilters.call(mockContext, 'job', []);
		expect(result).toBe('');
	});

	it('returns empty string for undefined filters', async () => {
		const mockContext = createMockContext();
		const result = await processFilters.call(
			mockContext,
			'job',
			undefined as unknown as Array<{ field: string; operator: string; value: string }>,
		);
		expect(result).toBe('');
	});
});

describe('processBody', () => {
	const createMockContext = () =>
		({
			getNodeParameter: vi.fn(),
		}) as unknown as Parameters<typeof processBody>[0];

	it('converts field array to body object', async () => {
		const mockContext = createMockContext();
		const fields = [
			{ field: 'status', value: 'Quote' },
			{ field: 'description', value: 'Test job' },
		];

		const result = await processBody.call(mockContext, 'job', fields);
		expect(result).toEqual({
			status: 'Quote',
			description: 'Test job',
		});
	});

	it('handles numeric fields', async () => {
		const mockContext = createMockContext();
		const fields = [{ field: 'invoice_sent', value: 1 }];

		const result = await processBody.call(mockContext, 'job', fields);
		expect(result).toEqual({
			invoice_sent: 1,
		});
	});

	it('returns empty object for empty fields', async () => {
		const mockContext = createMockContext();
		const result = await processBody.call(mockContext, 'job', []);
		expect(result).toEqual({});
	});

	it('returns empty object for undefined fields', async () => {
		const mockContext = createMockContext();
		const result = await processBody.call(
			mockContext,
			'job',
			undefined as unknown as Array<{ field: string; value: unknown }>,
		);
		expect(result).toEqual({});
	});
});

describe('serviceM8ApiRequest', () => {
	it('calls httpRequestWithAuthentication with correct options for GET', async () => {
		const mockHttpRequest = vi.fn().mockResolvedValue({
			body: { uuid: '123' },
			headers: {},
		});

		const mockContext = {
			helpers: {
				httpRequestWithAuthentication: mockHttpRequest,
			},
		} as unknown as Parameters<typeof serviceM8ApiRequest>[0];

		await serviceM8ApiRequest.call(
			mockContext,
			'GET',
			'https://api.servicem8.com/api_1.0/job.json',
			{ $filter: "status eq 'Quote'" },
		);

		expect(mockHttpRequest).toHaveBeenCalledWith(
			'serviceM8CredentialsApi',
			expect.objectContaining({
				method: 'GET',
				url: 'https://api.servicem8.com/api_1.0/job.json',
				qs: { $filter: "status eq 'Quote'" },
				json: true,
				returnFullResponse: true,
			}),
		);
	});

	it('calls httpRequestWithAuthentication with body for POST', async () => {
		const mockHttpRequest = vi.fn().mockResolvedValue({
			body: {},
			headers: { 'x-record-uuid': 'new-uuid' },
		});

		const mockContext = {
			helpers: {
				httpRequestWithAuthentication: mockHttpRequest,
			},
		} as unknown as Parameters<typeof serviceM8ApiRequest>[0];

		await serviceM8ApiRequest.call(
			mockContext,
			'POST',
			'https://api.servicem8.com/api_1.0/job.json',
			{},
			{ status: 'Quote', description: 'New job' },
		);

		expect(mockHttpRequest).toHaveBeenCalledWith(
			'serviceM8CredentialsApi',
			expect.objectContaining({
				method: 'POST',
				url: 'https://api.servicem8.com/api_1.0/job.json',
				body: { status: 'Quote', description: 'New job' },
				json: true,
				returnFullResponse: true,
			}),
		);
	});

	it('strips empty body from request options', async () => {
		const mockHttpRequest = vi.fn().mockResolvedValue({
			body: {},
			headers: {},
		});

		const mockContext = {
			helpers: {
				httpRequestWithAuthentication: mockHttpRequest,
			},
		} as unknown as Parameters<typeof serviceM8ApiRequest>[0];

		await serviceM8ApiRequest.call(
			mockContext,
			'GET',
			'https://api.servicem8.com/api_1.0/job.json',
		);

		const callArgs = mockHttpRequest.mock.calls[0][1];
		expect(callArgs).not.toHaveProperty('body');
		expect(callArgs).not.toHaveProperty('qs');
		expect(callArgs).not.toHaveProperty('headers');
	});
});

describe('getAllData', () => {
	it('paginates using x-next-cursor header', async () => {
		const mockHttpRequest = vi
			.fn()
			.mockResolvedValueOnce({
				body: [{ uuid: '1' }, { uuid: '2' }],
				headers: { 'x-next-cursor': 'abc123' },
			})
			.mockResolvedValueOnce({
				body: [{ uuid: '3' }],
				headers: {}, // No cursor = last page
			});

		const mockContext = {
			helpers: { httpRequestWithAuthentication: mockHttpRequest },
		} as unknown as Parameters<typeof getAllData>[0];

		const result = await getAllData.call(
			mockContext,
			'https://api.servicem8.com/api_1.0/job.json',
		);

		expect(result).toHaveLength(3);
		expect(result).toEqual([{ uuid: '1' }, { uuid: '2' }, { uuid: '3' }]);
		expect(mockHttpRequest).toHaveBeenCalledTimes(2);
	});

	it('stops when no cursor is returned', async () => {
		const mockHttpRequest = vi.fn().mockResolvedValue({
			body: [{ uuid: '1' }],
			headers: {}, // No cursor
		});

		const mockContext = {
			helpers: { httpRequestWithAuthentication: mockHttpRequest },
		} as unknown as Parameters<typeof getAllData>[0];

		const result = await getAllData.call(
			mockContext,
			'https://api.servicem8.com/api_1.0/job.json',
		);

		expect(result).toHaveLength(1);
		expect(mockHttpRequest).toHaveBeenCalledTimes(1);
	});

	it('passes query parameters through pagination', async () => {
		const mockHttpRequest = vi.fn().mockResolvedValue({
			body: [],
			headers: {},
		});

		const mockContext = {
			helpers: { httpRequestWithAuthentication: mockHttpRequest },
		} as unknown as Parameters<typeof getAllData>[0];

		await getAllData.call(
			mockContext,
			'https://api.servicem8.com/api_1.0/job.json',
			{ $filter: "status eq 'Quote'" },
		);

		// Query params should include the filter
		expect(mockHttpRequest).toHaveBeenCalledWith(
			'serviceM8CredentialsApi',
			expect.objectContaining({
				qs: expect.objectContaining({
					$filter: "status eq 'Quote'",
				}),
			}),
		);
	});
});
