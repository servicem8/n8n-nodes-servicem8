import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceM8 } from '../../nodes/ServiceM8/ServiceM8.node';
import { createMockExecuteFunctions } from '../mocks/executeFunctions.mock';

// Mock GenericFunctions - use vi.hoisted for mock functions
const { mockServiceM8ApiRequest, mockGetAllData, mockGetEndpoint, mockGetUrlParams, mockProcessBody } = vi.hoisted(() => ({
	mockServiceM8ApiRequest: vi.fn().mockResolvedValue({
		body: {},
		headers: { 'x-record-uuid': 'mock-uuid' },
	}),
	mockGetAllData: vi.fn().mockResolvedValue([]),
	mockGetEndpoint: vi.fn().mockResolvedValue('https://api.servicem8.com/api_1.0/job/{uuid}.json'),
	mockGetUrlParams: vi.fn().mockResolvedValue(['uuid']),
	mockProcessBody: vi.fn().mockResolvedValue({ status: 'Work Order' }),
}));

vi.mock('../../nodes/ServiceM8/GenericFunctions', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		serviceM8ApiRequest: mockServiceM8ApiRequest,
		getAllData: mockGetAllData,
		getEndpoint: mockGetEndpoint,
		getUrlParams: mockGetUrlParams,
		processFilters: vi.fn().mockResolvedValue(''),
		processBody: mockProcessBody,
	};
});

describe('ServiceM8 Job Contacts', () => {
	let node: ServiceM8;

	beforeEach(() => {
		vi.clearAllMocks();
		node = new ServiceM8();
		// Reset default mock returns
		mockGetAllData.mockResolvedValue([]);
		mockGetEndpoint.mockResolvedValue('https://api.servicem8.com/api_1.0/job/{uuid}.json');
		mockGetUrlParams.mockResolvedValue(['uuid']);
	});

	describe('job.get with contacts', () => {
		it('fetches contacts when includeContacts is true (default)', async () => {
			// Mock job data
			mockGetAllData
				.mockResolvedValueOnce([{ uuid: 'job-uuid-123', status: 'Work Order' }]) // First call: job
				.mockResolvedValueOnce([
					{ uuid: 'contact-1', type: 'Job', first: 'John', last: 'Doe' },
					{ uuid: 'contact-2', type: 'Billing', first: 'Jane', last: 'Smith' },
				]); // Second call: contacts

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'get',
				nodeParams: {
					uuid: 'job-uuid-123',
					includeContacts: true,
				},
			});

			const result = await node.execute.call(mockContext);

			// Should make two getAllData calls
			expect(mockGetAllData).toHaveBeenCalledTimes(2);

			// Second call should be for contacts with correct filter
			expect(mockGetAllData).toHaveBeenNthCalledWith(
				2,
				'https://api.servicem8.com/api_1.0/jobcontact.json',
				{ $filter: "job_uuid eq 'job-uuid-123' and active eq '1'" },
			);

			// Result should include contacts
			expect(result[0][0].json).toHaveProperty('contacts');
			expect(result[0][0].json.contacts).toHaveLength(2);
		});

		it('does not fetch contacts when includeContacts is false', async () => {
			mockGetAllData.mockResolvedValueOnce([{ uuid: 'job-uuid-123', status: 'Work Order' }]);

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'get',
				nodeParams: {
					uuid: 'job-uuid-123',
					includeContacts: false,
				},
			});

			await node.execute.call(mockContext);

			// Should only make one getAllData call (for job)
			expect(mockGetAllData).toHaveBeenCalledTimes(1);
		});
	});

	describe('job.updateContacts', () => {
		it('creates a new contact when none exists (upsert by type)', async () => {
			mockGetAllData.mockResolvedValue([]);

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'job-uuid-123',
					contactType: 'Job',
					contactFields: {
						first: 'John',
						last: 'Doe',
						email: 'john@example.com',
					},
				},
			});

			await node.execute.call(mockContext);

			// Should create a new contact
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/jobcontact.json',
				{},
				expect.objectContaining({
					first: 'John',
					last: 'Doe',
					email: 'john@example.com',
					job_uuid: 'job-uuid-123',
					type: 'Job',
				}),
			);
		});

		it('updates an existing contact when one exists (upsert by type)', async () => {
			// Return existing contact
			mockGetAllData.mockResolvedValue([
				{ uuid: 'contact-uuid-456', type: 'Job', first: 'Old', last: 'Name' },
			]);

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'job-uuid-123',
					contactType: 'Job',
					contactFields: {
						first: 'New',
						last: 'Name',
					},
				},
			});

			await node.execute.call(mockContext);

			// Should update existing contact
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/jobcontact/contact-uuid-456.json',
				{},
				expect.objectContaining({
					first: 'New',
					last: 'Name',
				}),
			);
		});

		it('supports sparse updates - only sends provided fields', async () => {
			// Return existing contact with all fields
			mockGetAllData.mockResolvedValue([
				{
					uuid: 'contact-uuid-456',
					type: 'Job',
					first: 'John',
					last: 'Doe',
					email: 'john@example.com',
					phone: '555-1234',
				},
			]);

			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'job-uuid-123',
					contactType: 'Job',
					contactFields: {
						phone: '555-9999', // Only updating phone
						first: '', // Empty - should be filtered out
						last: '', // Empty - should be filtered out
					},
				},
			});

			await node.execute.call(mockContext);

			// Should only send the phone field
			const updateCall = mockServiceM8ApiRequest.mock.calls.find(
				(call) => call[1].includes('contact-uuid-456'),
			);
			expect(updateCall?.[3]).toEqual({ phone: '555-9999' });
		});

		it('updates contact directly by UUID when contactType is uuid', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'job',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'job-uuid-123',
					contactType: 'uuid',
					contactUuid: 'specific-contact-uuid',
					contactFields: {
						first: 'Direct',
						last: 'Update',
					},
				},
			});

			await node.execute.call(mockContext);

			// Should update directly by UUID without querying for existing
			expect(mockGetAllData).not.toHaveBeenCalled();
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/jobcontact/specific-contact-uuid.json',
				{},
				{ first: 'Direct', last: 'Update' },
			);
		});
	});
});
