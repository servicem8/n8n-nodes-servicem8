import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceM8 } from '../../nodes/ServiceM8/ServiceM8.node';
import { createMockExecuteFunctions } from '../mocks/executeFunctions.mock';
import { NodeOperationError } from '../mocks/n8n-workflow.mock';

// Mock GenericFunctions
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

describe('ServiceM8.execute validation errors', () => {
	let node: ServiceM8;

	beforeEach(() => {
		vi.clearAllMocks();
		node = new ServiceM8();
	});

	describe('jobBooking.create validation', () => {
		it('throws when jobUUID is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'fixed',
					jobUUID: '', // empty
					staffUUID: 'staff-uuid',
					startDate: '2025-01-01T09:00:00',
					endDate: '2025-01-01T10:00:00',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Job UUID is required',
			);
		});

		it('throws when staffUUID is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'fixed',
					jobUUID: 'job-uuid-123',
					staffUUID: '', // empty
					startDate: '2025-01-01T09:00:00',
					endDate: '2025-01-01T10:00:00',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Staff Member is required',
			);
		});

		it('throws when allocationDate is missing for flexible booking', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'flexible',
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					allocationDate: '', // empty
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Allocation Date is required',
			);
		});

		it('throws when startDate is missing for fixed booking', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'fixed',
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					startDate: '', // empty
					endDate: '2025-01-01T10:00:00',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Start Time is required',
			);
		});

		it('throws when endDate is missing for fixed booking', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'create',
				nodeParams: {
					bookingType: 'fixed',
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					startDate: '2025-01-01T09:00:00',
					endDate: '', // empty
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'End Time is required',
			);
		});
	});

	describe('jobBooking.get validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'get',
				nodeParams: {
					bookingType: 'fixed',
					uuid: '', // empty
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Booking UUID is required',
			);
		});
	});

	describe('jobBooking.update validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'update',
				nodeParams: {
					bookingType: 'fixed',
					uuid: '', // empty
					updateFields: { start_date: '2025-01-02T09:00:00' },
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Booking UUID is required',
			);
		});

		it('throws when no fields to update are provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'update',
				nodeParams: {
					bookingType: 'fixed',
					uuid: 'booking-uuid-123',
					updateFields: {}, // empty
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'No fields to update',
			);
		});
	});

	describe('jobBooking.delete validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobBooking',
				operation: 'delete',
				nodeParams: {
					bookingType: 'fixed',
					uuid: '', // empty
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Booking UUID is required',
			);
		});
	});

	describe('jobCheckin.create validation', () => {
		it('throws when jobUUID is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'create',
				nodeParams: {
					jobUUID: '',
					staffUUID: 'staff-uuid',
					startDate: '2025-01-01T09:00:00',
					endDate: '2025-01-01T10:00:00',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Job UUID is required',
			);
		});

		it('throws when staffUUID is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'create',
				nodeParams: {
					jobUUID: 'job-uuid-123',
					staffUUID: '',
					startDate: '2025-01-01T09:00:00',
					endDate: '2025-01-01T10:00:00',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Staff Member is required',
			);
		});

		it('throws when startDate is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'create',
				nodeParams: {
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					startDate: '',
					endDate: '2025-01-01T10:00:00',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Start Time is required',
			);
		});

		it('throws when endDate is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'create',
				nodeParams: {
					jobUUID: 'job-uuid-123',
					staffUUID: 'staff-uuid-456',
					startDate: '2025-01-01T09:00:00',
					endDate: '',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'End Time is required',
			);
		});
	});

	describe('jobCheckin.get validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'get',
				nodeParams: {
					uuid: '',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Checkin UUID is required',
			);
		});
	});

	describe('jobCheckin.update validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'update',
				nodeParams: {
					uuid: '',
					updateFields: { start_date: '2025-01-02T09:00:00' },
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Checkin UUID is required',
			);
		});

		it('throws when no fields to update are provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'update',
				nodeParams: {
					uuid: 'checkin-uuid-123',
					updateFields: {},
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'No fields to update',
			);
		});
	});

	describe('jobCheckin.delete validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'jobCheckin',
				operation: 'delete',
				nodeParams: {
					uuid: '',
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'Checkin UUID is required',
			);
		});
	});

	describe('inbox.get validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'get',
				nodeParams: {
					uuid: '', // empty
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'UUID is required',
			);
		});
	});

	describe('inbox.convertToJob validation', () => {
		it('throws when uuid is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'convertToJob',
				nodeParams: {
					uuid: '', // empty
					jobTemplateUUID: '',
					fields: {},
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'UUID is required',
			);
		});
	});

	describe('inbox.createInboxMessage validation', () => {
		it('throws when subject is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'createInboxMessage',
				nodeParams: {
					fields: {
						subject: '', // empty
						message_text: 'Some message',
					},
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'"subject" is required',
			);
		});

		it('throws when message_text is missing', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'inbox',
				operation: 'createInboxMessage',
				nodeParams: {
					fields: {
						subject: 'Test Subject',
						message_text: '', // empty
					},
				},
			});

			await expect(node.execute.call(mockContext)).rejects.toThrow(
				'"message_text" is required',
			);
		});
	});
});
