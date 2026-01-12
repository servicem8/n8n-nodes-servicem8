import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceM8 } from '../../nodes/ServiceM8/ServiceM8.node';
import { createMockExecuteFunctions } from '../mocks/executeFunctions.mock';

// Mock GenericFunctions - use vi.hoisted for mock functions
const { mockServiceM8ApiRequest } = vi.hoisted(() => ({
	mockServiceM8ApiRequest: vi.fn().mockResolvedValue({
		body: { success: true },
		headers: {},
	}),
}));

vi.mock('../../nodes/ServiceM8/GenericFunctions', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		serviceM8ApiRequest: mockServiceM8ApiRequest,
		getAllData: vi.fn().mockResolvedValue([]),
		getEndpoint: vi.fn().mockResolvedValue(''),
		getUrlParams: vi.fn().mockResolvedValue([]),
		processFilters: vi.fn().mockResolvedValue(''),
		processBody: vi.fn().mockResolvedValue({}),
	};
});

describe('ServiceM8 Messaging API calls', () => {
	let node: ServiceM8;

	beforeEach(() => {
		vi.clearAllMocks();
		node = new ServiceM8();
	});

	describe('SMS operations', () => {
		it('sendSMS calls the correct endpoint with POST', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'sms',
				operation: 'sendSMS',
				nodeParams: {
					fields: {
						to: '+61412345678',
						message: 'Test SMS message',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_sms',
				expect.any(Object),
				expect.objectContaining({
					to: '+61412345678',
					message: 'Test SMS message',
				}),
			);
		});

		it('sendSMS includes regardingJobUUID when provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'sms',
				operation: 'sendSMS',
				nodeParams: {
					fields: {
						to: '+61412345678',
						message: 'Test SMS message',
						regardingJobUUID: 'job-uuid-123',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_sms',
				expect.any(Object),
				expect.objectContaining({
					to: '+61412345678',
					message: 'Test SMS message',
					regardingJobUUID: 'job-uuid-123',
				}),
			);
		});

		it('sendSMS passes fields directly without transformation', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'sms',
				operation: 'sendSMS',
				nodeParams: {
					fields: {
						to: '+1555123456',
						message: 'Hello from n8n!',
					},
				},
			});

			await node.execute.call(mockContext);

			// Verify the exact body structure
			const callArgs = mockServiceM8ApiRequest.mock.calls[0];
			expect(callArgs[3]).toEqual({
				to: '+1555123456',
				message: 'Hello from n8n!',
			});
		});
	});

	describe('Email operations', () => {
		it('sendEmail calls the correct endpoint with POST', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						subject: 'Test Subject',
						htmlBody: '<p>Test email body</p>',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_email',
				expect.any(Object),
				expect.objectContaining({
					to: 'recipient@example.com',
					subject: 'Test Subject',
					htmlBody: '<p>Test email body</p>',
				}),
				expect.any(Object),
			);
		});

		it('sendEmail includes cc and replyTo when provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						cc: 'cc@example.com',
						replyTo: 'replyto@example.com',
						subject: 'Test Subject',
						textBody: 'Plain text body',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_email',
				expect.any(Object),
				expect.objectContaining({
					to: 'recipient@example.com',
					cc: 'cc@example.com',
					replyTo: 'replyto@example.com',
					subject: 'Test Subject',
					textBody: 'Plain text body',
				}),
				expect.any(Object),
			);
		});

		it('sendEmail includes regardingJobUUID when provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						subject: 'Job Update',
						textBody: 'Your job is complete',
						regardingJobUUID: 'job-uuid-456',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_email',
				expect.any(Object),
				expect.objectContaining({
					regardingJobUUID: 'job-uuid-456',
				}),
				expect.any(Object),
			);
		});

		it('sendEmail passes x-impersonate-uuid as header for signature support', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						subject: 'Signed Email',
						htmlBody: '<p>Hello</p><platform-user-signature />',
						'x-impersonate-uuid': 'staff-uuid-789',
					},
				},
			});

			await node.execute.call(mockContext);

			// Verify the header is passed correctly
			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_email',
				expect.any(Object),
				expect.any(Object),
				expect.objectContaining({
					'x-impersonate-uuid': 'staff-uuid-789',
				}),
			);
		});

		it('sendEmail removes x-impersonate-uuid from body when moving to headers', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						subject: 'Signed Email',
						htmlBody: '<p>Hello</p>',
						'x-impersonate-uuid': 'staff-uuid-789',
					},
				},
			});

			await node.execute.call(mockContext);

			// Verify the body does NOT contain x-impersonate-uuid
			const callArgs = mockServiceM8ApiRequest.mock.calls[0];
			const body = callArgs[3];
			expect(body).not.toHaveProperty('x-impersonate-uuid');
		});

		it('sendEmail does not include x-impersonate-uuid header when not provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						subject: 'Regular Email',
						textBody: 'No signature needed',
					},
				},
			});

			await node.execute.call(mockContext);

			// Verify empty headers when no impersonation
			const callArgs = mockServiceM8ApiRequest.mock.calls[0];
			const headers = callArgs[4];
			expect(headers).toEqual({});
		});

		it('sendEmail includes attachments when provided', async () => {
			const mockContext = createMockExecuteFunctions({
				resource: 'email',
				operation: 'sendEmail',
				nodeParams: {
					fields: {
						to: 'recipient@example.com',
						subject: 'Email with attachment',
						textBody: 'See attached',
						attachments: 'attachment-uuid-1,attachment-uuid-2',
					},
				},
			});

			await node.execute.call(mockContext);

			expect(mockServiceM8ApiRequest).toHaveBeenCalledWith(
				'POST',
				'https://api.servicem8.com/platform_service_email',
				expect.any(Object),
				expect.objectContaining({
					attachments: 'attachment-uuid-1,attachment-uuid-2',
				}),
				expect.any(Object),
			);
		});
	});
});
