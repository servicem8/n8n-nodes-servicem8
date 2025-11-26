import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceM8 } from '../../nodes/ServiceM8/ServiceM8.node';
import {
	createMockExecuteFunctions,
	getMockHttpRequest,
} from '../mocks/executeFunctions.mock';

// Mock GenericFunctions to track which functions are called
vi.mock('../../nodes/ServiceM8/GenericFunctions', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		serviceM8ApiRequest: vi.fn().mockResolvedValue({
			body: {},
			headers: { 'x-record-uuid': 'mock-uuid' },
		}),
		getAllData: vi.fn().mockResolvedValue([]),
		getEndpoint: vi.fn().mockResolvedValue(''),
		getUrlParams: vi.fn().mockResolvedValue([]),
		processFilters: vi.fn().mockResolvedValue(''),
		processBody: vi.fn().mockResolvedValue({}),
	};
});

describe('ServiceM8.execute routing', () => {
	let node: ServiceM8;

	beforeEach(() => {
		vi.clearAllMocks();
		node = new ServiceM8();
	});

	describe('jobBooking operations should NOT trigger generic handlers', () => {
		it('jobBooking.get should NOT call generic getAllData handler', async () => {
			const { getAllData, serviceM8ApiRequest } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'get',
				nodeParams: {
					bookingType: 'fixed',
					uuid: 'test-booking-uuid',
				},
			});

			await node.execute.call(mockContext);

			// Generic get handler uses getAllData - should NOT be called for jobBooking
			expect(getAllData).not.toHaveBeenCalled();
			// jobBooking.get should use serviceM8ApiRequest directly
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'GET',
				expect.stringContaining('jobactivity/test-booking-uuid'),
			);
		});

		it('jobBooking.get (flexible) should call joballocation endpoint', async () => {
			const { serviceM8ApiRequest } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'get',
				nodeParams: {
					bookingType: 'flexible',
					uuid: 'test-allocation-uuid',
				},
			});

			await node.execute.call(mockContext);

			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'GET',
				expect.stringContaining('joballocation/test-allocation-uuid'),
			);
		});

		it('jobBooking.getMany should use getAllData with correct endpoint', async () => {
			const { getAllData } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'getMany',
				nodeParams: {
					bookingType: 'flexible',
					filterJobUUID: '',
					includeInactive: false,
				},
			});

			await node.execute.call(mockContext);

			// jobBooking.getMany DOES use getAllData, but with joballocation endpoint
			expect(getAllData).toHaveBeenCalledWith(
				expect.stringContaining('joballocation'),
				expect.any(Object),
			);
		});

		it('jobBooking.create should NOT call generic create handler', async () => {
			const { serviceM8ApiRequest, processBody } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'fixed',
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					startDate: '2025-01-01T09:00:00',
					endDate: '2025-01-01T10:00:00',
				},
			});

			await node.execute.call(mockContext);

			// Generic create handler uses processBody - should NOT be called
			expect(processBody).not.toHaveBeenCalled();
			// Should call jobactivity endpoint with correct body
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				expect.stringContaining('jobactivity.json'),
				expect.any(Object),
				expect.objectContaining({
					job_uuid: 'job-uuid-123',
					staff_uuid: 'staff-uuid-456',
					activity_was_scheduled: 1,
				}),
			);
		});

		it('jobBooking.update should NOT call generic update handler', async () => {
			const { serviceM8ApiRequest, processBody } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'update',
				nodeParams: {
					bookingType: 'fixed',
					uuid: 'booking-uuid-123',
					updateFields: { start_date: '2025-01-02T09:00:00' },
				},
			});

			await node.execute.call(mockContext);

			// Generic update handler uses processBody - should NOT be called
			expect(processBody).not.toHaveBeenCalled();
			// Should use jobBooking-specific update path
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				expect.stringContaining('jobactivity/booking-uuid-123'),
				expect.any(Object),
				expect.any(Object),
			);
		});

		it('jobBooking.delete should NOT call generic delete handler', async () => {
			const { serviceM8ApiRequest } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'delete',
				nodeParams: {
					bookingType: 'flexible',
					uuid: 'booking-uuid-123',
				},
			});

			await node.execute.call(mockContext);

			// Should call DELETE on joballocation (flexible)
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'DELETE',
				expect.stringContaining('joballocation/booking-uuid-123'),
			);
			// Should only be called once (not twice due to generic handler)
			expect(serviceM8ApiRequest).toHaveBeenCalledTimes(1);
		});
	});

	describe('inbox operations should NOT trigger generic handlers', () => {
		it('inbox.get should NOT call generic getAllData handler', async () => {
			const { getAllData, serviceM8ApiRequest } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'get',
				nodeParams: {
					uuid: 'inbox-uuid-123',
				},
			});

			await node.execute.call(mockContext);

			expect(getAllData).not.toHaveBeenCalled();
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'GET',
				expect.stringContaining('inboxmessage/inbox-uuid-123'),
			);
		});

		it('inbox.getMany should NOT call generic getMany handler', async () => {
			const { serviceM8ApiRequest, getAllData } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);

			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'getMany',
				nodeParams: {
					inboxFilter: 'all',
					inboxSearch: '',
					limit: 50,
				},
				httpResponse: {
					body: { messages: [] },
					headers: {},
				},
			});

			await node.execute.call(mockContext);

			// inbox.getMany uses serviceM8ApiRequest directly, not getAllData
			expect(getAllData).not.toHaveBeenCalled();
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'GET',
				expect.stringContaining('inboxmessage.json'),
				expect.objectContaining({ limit: 50 }),
			);
		});
	});

	describe('generic handlers should work for standard resources', () => {
		it('client.get should use generic getAllData handler', async () => {
			const { getAllData, getEndpoint, getUrlParams } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);
			// Set up getEndpoint to return a valid URL for client
			vi.mocked(getEndpoint).mockResolvedValue(
				'https://api.servicem8.com/api_1.0/companycontact/{uuid}.json',
			);
			vi.mocked(getUrlParams).mockResolvedValue(['uuid']);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'get',
				nodeParams: {
					uuid: 'client-uuid-123',
				},
			});

			await node.execute.call(mockContext);

			expect(getAllData).toHaveBeenCalled();
		});

		it('job.getMany should use generic getMany handler', async () => {
			const { getAllData, getEndpoint, getUrlParams } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);
			vi.mocked(getEndpoint).mockResolvedValue(
				'https://api.servicem8.com/api_1.0/job.json',
			);
			vi.mocked(getUrlParams).mockResolvedValue([]);

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'getMany',
				nodeParams: {
					filters: {},
					includeInactive: false,
				},
			});

			await node.execute.call(mockContext);

			expect(getAllData).toHaveBeenCalled();
		});

		it('job.update should use generic update handler with processBody', async () => {
			const { processBody, getEndpoint, getUrlParams, serviceM8ApiRequest } =
				await import('../../nodes/ServiceM8/GenericFunctions');
			vi.mocked(getEndpoint).mockResolvedValue(
				'https://api.servicem8.com/api_1.0/job/{uuid}.json',
			);
			vi.mocked(getUrlParams).mockResolvedValue(['uuid']);
			vi.mocked(processBody).mockResolvedValue({ status: 'Quote' });

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'update',
				nodeParams: {
					uuid: 'job-uuid-123',
					fields: {
						field: [{ field: 'status', value: 'Quote' }],
					},
				},
			});

			await node.execute.call(mockContext);

			expect(processBody).toHaveBeenCalled();
			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				expect.any(String),
				expect.any(Object),
				expect.objectContaining({ status: 'Quote' }),
			);
		});

		it('client.delete should use generic delete handler', async () => {
			const { serviceM8ApiRequest, getEndpoint, getUrlParams } = await import(
				'../../nodes/ServiceM8/GenericFunctions'
			);
			vi.mocked(getEndpoint).mockResolvedValue(
				'https://api.servicem8.com/api_1.0/companycontact/{uuid}.json',
			);
			vi.mocked(getUrlParams).mockResolvedValue(['uuid']);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'delete',
				nodeParams: {
					uuid: 'client-uuid-123',
				},
			});

			await node.execute.call(mockContext);

			expect(serviceM8ApiRequest).toHaveBeenCalledWith(
				'DELETE',
				expect.stringContaining('client-uuid-123'),
			);
		});
	});
});
