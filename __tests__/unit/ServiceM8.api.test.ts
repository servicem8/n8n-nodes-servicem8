import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceM8 } from '../../nodes/ServiceM8/ServiceM8.node';
import { createMockExecuteFunctions } from '../mocks/executeFunctions.mock';

// Mock GenericFunctions - use vi.hoisted for mock functions
const { mockServiceM8ApiRequest, mockGetAllData } = vi.hoisted(() => ({
	mockServiceM8ApiRequest: vi.fn().mockResolvedValue({
		body: {},
		headers: { 'x-record-uuid': 'mock-uuid' },
	}),
	mockGetAllData: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../nodes/ServiceM8/GenericFunctions', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		serviceM8ApiRequest: mockServiceM8ApiRequest,
		getAllData: mockGetAllData,
		getEndpoint: vi.fn().mockResolvedValue(''),
		getUrlParams: vi.fn().mockResolvedValue([]),
		processFilters: vi.fn().mockResolvedValue(''),
		processBody: vi.fn().mockResolvedValue({}),
	};
});

describe('ServiceM8.execute API calls', () => {
	let node: ServiceM8;

	beforeEach(() => {
		vi.clearAllMocks();
		node = new ServiceM8();
	});

	describe('jobBooking.create API calls', () => {
		it('creates flexible booking with joballocation endpoint', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'flexible',
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					allocationDate: '2025-11-27T09:00:00-05:00',
					allocationWindowUUID: 'window-uuid-789',
					expiryTimestamp: '2025-11-28T17:00:00-05:00',
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/joballocation.json',
				expect.any(Object),
				expect.objectContaining({
					job_uuid: 'job-uuid-123',
					staff_uuid: 'staff-uuid-456',
					allocation_date: '2025-11-27 09:00:00',
					allocation_window_uuid: 'window-uuid-789',
					expiry_timestamp: '2025-11-28 17:00:00',
				}),
			);
		});

		it('creates fixed booking with jobactivity endpoint and activity_was_scheduled=1', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'fixed',
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					startDate: '2025-11-27T09:00:00-05:00',
					endDate: '2025-11-27T11:00:00-05:00',
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/jobactivity.json',
				expect.any(Object),
				expect.objectContaining({
					job_uuid: 'job-uuid-123',
					staff_uuid: 'staff-uuid-456',
					start_date: '2025-11-27 09:00:00',
					end_date: '2025-11-27 11:00:00',
					activity_was_scheduled: 1,
				}),
			);
		});
	});

	describe('jobBooking.getMany API calls', () => {
		it('filters flexible bookings by active status', async () => {
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

			expect(mockGetAllData).toHaveBeenCalledWith(
				'https://api.servicem8.com/api_1.0/joballocation.json',
				expect.objectContaining({
					$filter: "active eq '1'",
				}),
			);
		});

		it('filters fixed bookings by activity_was_scheduled and active', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'getMany',
				nodeParams: {
					bookingType: 'fixed',
					filterJobUUID: '',
					includeInactive: false,
				},
			});

			await node.execute.call(mockContext);

			expect(mockGetAllData).toHaveBeenCalledWith(
				'https://api.servicem8.com/api_1.0/jobactivity.json',
				expect.objectContaining({
					$filter: expect.stringContaining("activity_was_scheduled eq '1'"),
				}),
			);
			expect(mockGetAllData).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					$filter: expect.stringContaining("active eq '1'"),
				}),
			);
		});

		it('includes job_uuid filter when filterJobUUID is provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'getMany',
				nodeParams: {
					bookingType: 'flexible',
					filterJobUUID: 'specific-job-uuid',
					includeInactive: false,
				},
			});

			await node.execute.call(mockContext);

			expect(mockGetAllData).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					$filter: expect.stringContaining("job_uuid eq 'specific-job-uuid'"),
				}),
			);
		});

		it('excludes active filter when includeInactive is true', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'getMany',
				nodeParams: {
					bookingType: 'flexible',
					filterJobUUID: '',
					includeInactive: true,
				},
			});

			await node.execute.call(mockContext);

			// Should be called with empty qs (no filter) for flexible + includeInactive
			expect(mockGetAllData).toHaveBeenCalledWith(
				'https://api.servicem8.com/api_1.0/joballocation.json',
				expect.objectContaining({}),
			);
			// Verify active filter is NOT present
			const callArgs = mockGetAllData.mock.calls[0][1];
			expect(callArgs.$filter || '').not.toContain("active eq '1'");
		});
	});

	describe('jobBooking.update API calls', () => {
		it('updates flexible booking with correct datetime format', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'update',
				nodeParams: {
					bookingType: 'flexible',
					uuid: 'allocation-uuid-123',
					updateFields: {
						allocation_date: '2025-11-28T10:00:00-05:00',
						staff_uuid: 'new-staff-uuid',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/joballocation/allocation-uuid-123.json',
				expect.any(Object),
				expect.objectContaining({
					allocation_date: '2025-11-28 10:00:00',
					staff_uuid: 'new-staff-uuid',
				}),
			);
		});

		it('updates fixed booking with correct datetime format', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'update',
				nodeParams: {
					bookingType: 'fixed',
					uuid: 'activity-uuid-123',
					updateFields: {
						start_date: '2025-11-28T14:00:00-05:00',
						end_date: '2025-11-28T16:00:00-05:00',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/jobactivity/activity-uuid-123.json',
				expect.any(Object),
				expect.objectContaining({
					start_date: '2025-11-28 14:00:00',
					end_date: '2025-11-28 16:00:00',
				}),
			);
		});
	});

	describe('jobCheckin.getMany API calls', () => {
		it('filters by activity_was_recorded=1 to get only checkins', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'getMany',
				nodeParams: {
					filterJobUUID: '',
					filterStaffUUID: '',
					includeInactive: false,
				},
			});

			await node.execute.call(mockContext);

			expect(mockGetAllData).toHaveBeenCalledWith(
				'https://api.servicem8.com/api_1.0/jobactivity.json',
				expect.objectContaining({
					$filter: expect.stringContaining("activity_was_recorded eq '1'"),
				}),
			);
		});
	});

	describe('inbox API calls', () => {
		it('inbox.getMany passes limit and filter parameters', async () => {
			mockServiceM8ApiRequest.mockResolvedValueOnce({
				body: { messages: [] },
				headers: {},
			});

			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'getMany',
				nodeParams: {
					inboxFilter: 'unread',
					inboxSearch: 'test query',
					limit: 25,
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'GET',
				'https://api.servicem8.com/api_1.0/inboxmessage.json',
				expect.objectContaining({
					limit: 25,
					filter: 'unread',
					search: 'test query',
				}),
			);
		});

		it('inbox.convertToJob sends template_uuid when provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'convertToJob',
				nodeParams: {
					uuid: 'inbox-uuid-123',
					jobTemplateUUID: 'template-uuid-456',
					fields: { note: 'Conversion note' },
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/inboxmessage/inbox-uuid-123/convert-to-job.json',
				expect.any(Object),
				expect.objectContaining({
					template_uuid: 'template-uuid-456',
					note: 'Conversion note',
				}),
			);
		});
	});
});
