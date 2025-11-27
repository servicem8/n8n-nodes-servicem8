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
	mockGetEndpoint: vi.fn().mockResolvedValue('https://api.servicem8.com/api_1.0/company/{uuid}.json'),
	mockGetUrlParams: vi.fn().mockResolvedValue(['uuid']),
	mockProcessBody: vi.fn().mockResolvedValue({ name: 'Test Client' }),
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

describe('ServiceM8 Client Contacts', () => {
	let node: ServiceM8;

	beforeEach(() => {
		vi.clearAllMocks();
		node = new ServiceM8();
		// Reset default mock returns
		mockGetAllData.mockResolvedValue([]);
		mockGetEndpoint.mockResolvedValue('https://api.servicem8.com/api_1.0/company/{uuid}.json');
		mockGetUrlParams.mockResolvedValue(['uuid']);
	});

	describe('client.get with contacts', () => {
		it('fetches contacts when includeContacts is true (default)', async () => {
			// Mock client data
			mockGetAllData
				.mockResolvedValueOnce([{ uuid: 'client-uuid-123', name: 'Test Client' }]) // First call: client
				.mockResolvedValueOnce([
					{ uuid: 'contact-1', type: 'Main', first: 'John', last: 'Doe' },
					{ uuid: 'contact-2', type: 'Billing', first: 'Jane', last: 'Smith' },
				]); // Second call: contacts

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'get',
				nodeParams: {
					uuid: 'client-uuid-123',
					includeContacts: true,
				},
			});

			const result = await node.execute.call(mockContext);

			// Should make two getAllData calls
			expect(mockGetAllData).toHaveBeenCalledTimes(2);

			// Second call should be for contacts with correct filter
			expect(mockGetAllData).toHaveBeenNthCalledWith(
				2,
				'https://api.servicem8.com/api_1.0/companycontact.json',
				{ $filter: "company_uuid eq 'client-uuid-123' and active eq '1'" },
			);

			// Result should include contacts
			expect(result[0][0].json).toHaveProperty('contacts');
			expect(result[0][0].json.contacts).toHaveLength(2);
		});

		it('does not fetch contacts when includeContacts is false', async () => {
			mockGetAllData.mockResolvedValueOnce([{ uuid: 'client-uuid-123', name: 'Test Client' }]);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'get',
				nodeParams: {
					uuid: 'client-uuid-123',
					includeContacts: false,
				},
			});

			await node.execute.call(mockContext);

			// Should only make one getAllData call (for client)
			expect(mockGetAllData).toHaveBeenCalledTimes(1);
		});
	});

	describe('client.update', () => {
		it('updates client fields', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'update',
				nodeParams: {
					uuid: 'client-uuid-123',
					fields: {
						field: [{ field: 'name', value: 'New Name' }],
					},
				},
			});

			await node.execute.call(mockContext);

			// Should call API to update client
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/company/client-uuid-123.json',
				{},
				{ name: 'Test Client' }, // From mockProcessBody
			);
		});
	});

	describe('client.delete', () => {
		it('deletes a client', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'delete',
				nodeParams: {
					uuid: 'client-uuid-123',
				},
			});

			await node.execute.call(mockContext);

			// Should call DELETE on the client endpoint
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'DELETE',
				'https://api.servicem8.com/api_1.0/company/client-uuid-123.json',
			);
		});
	});

	describe('client.updateContacts', () => {
		it('creates a new contact when none exists', async () => {
			mockGetAllData.mockResolvedValue([]);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'client-uuid-123',
					clientContact: {
						first: 'John',
						last: 'Doe',
						email: 'john@example.com',
					},
					billingContact: {},
					propertyManagerContact: {},
					propertyOwnerContact: {},
					tenantContact: {},
				},
			});

			await node.execute.call(mockContext);

			// Should create a new contact
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/companycontact.json',
				{},
				expect.objectContaining({
					first: 'John',
					last: 'Doe',
					email: 'john@example.com',
					company_uuid: 'client-uuid-123',
					type: 'JOB',
				}),
			);
		});

		it('updates an existing contact when one exists', async () => {
			// Return existing contact
			mockGetAllData.mockResolvedValue([
				{ uuid: 'contact-uuid-456', type: 'JOB', first: 'Old', last: 'Name' },
			]);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'client-uuid-123',
					clientContact: {
						first: 'New',
						last: 'Name',
					},
					billingContact: {},
					propertyManagerContact: {},
					propertyOwnerContact: {},
					tenantContact: {},
				},
			});

			await node.execute.call(mockContext);

			// Should update existing contact
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/api_1.0/companycontact/contact-uuid-456.json',
				{},
				expect.objectContaining({
					first: 'New',
					last: 'Name',
				}),
			);

			// Should NOT include company_uuid and type in update (sparse update)
			const updateCall = mockServiceM8ApiRequest.mock.calls.find(
				(call) => call[1].includes('contact-uuid-456'),
			);
			expect(updateCall?.[3]).not.toHaveProperty('company_uuid');
			expect(updateCall?.[3]).not.toHaveProperty('type');
		});

		it('supports sparse updates - only sends provided fields', async () => {
			// Return existing contact with all fields
			mockGetAllData.mockResolvedValue([
				{
					uuid: 'contact-uuid-456',
					type: 'JOB',
					first: 'John',
					last: 'Doe',
					email: 'john@example.com',
					phone: '555-1234',
				},
			]);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'client-uuid-123',
					clientContact: {
						phone: '555-9999', // Only updating phone
						first: '', // Empty - should be filtered out
						last: '', // Empty - should be filtered out
					},
					billingContact: {},
					propertyManagerContact: {},
					propertyOwnerContact: {},
					tenantContact: {},
				},
			});

			await node.execute.call(mockContext);

			// Should only send the phone field
			const updateCall = mockServiceM8ApiRequest.mock.calls.find(
				(call) => call[1].includes('contact-uuid-456'),
			);
			expect(updateCall?.[3]).toEqual({ phone: '555-9999' });
		});

		it('handles multiple contact types in one update', async () => {
			// Return no existing contacts
			mockGetAllData.mockResolvedValue([]);

			const mockContext = createMockExecuteFunctions({
				resource: 'client',
				operation: 'updateContacts',
				nodeParams: {
					uuid: 'client-uuid-123',
					clientContact: {
						first: 'Job',
						last: 'Contact',
					},
					billingContact: {
						first: 'Billing',
						last: 'Contact',
					},
					propertyManagerContact: {},
					propertyOwnerContact: {},
					tenantContact: {},
				},
			});

			await node.execute.call(mockContext);

			// Should create both contacts
			const createCalls = mockServiceM8ApiRequest.mock.calls.filter(
				(call) => call[1] === 'https://api.servicem8.com/api_1.0/companycontact.json',
			);
			expect(createCalls).toHaveLength(2);

			// Verify each type
			const types = createCalls.map((call) => call[3].type);
			expect(types).toContain('JOB');
			expect(types).toContain('BILLING');
		});
	});
});
