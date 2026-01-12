import { NodeOperationError } from 'n8n-workflow';
import type { HandlerContext, ResourceHandler } from './types';
import { AttachmentHandler } from './AttachmentHandler';
import { ClientHandler } from './ClientHandler';
import { JobHandler } from './JobHandler';
import { JobBookingHandler } from './JobBookingHandler';
import { JobCheckinHandler } from './JobCheckinHandler';
import { InboxHandler } from './InboxHandler';
import { EmailHandler } from './EmailHandler';
import { SmsHandler } from './SmsHandler';
import { SearchHandler } from './SearchHandler';

// Register all handlers
const handlers: Map<string, ResourceHandler> = new Map();

const handlerInstances: ResourceHandler[] = [
	new AttachmentHandler(),
	new ClientHandler(),
	new JobHandler(),
	new JobBookingHandler(),
	new JobCheckinHandler(),
	new InboxHandler(),
	new EmailHandler(),
	new SmsHandler(),
	new SearchHandler(),
];

for (const handler of handlerInstances) {
	handlers.set(handler.resource, handler);
}

/**
 * Get the handler for a specific resource
 */
export function getHandler(resource: string): ResourceHandler | undefined {
	return handlers.get(resource);
}

/**
 * Execute an operation for a resource
 */
export async function executeOperation(
	resource: string,
	operation: string,
	ctx: HandlerContext,
): Promise<unknown> {
	const handler = handlers.get(resource);
	if (!handler) {
		throw new NodeOperationError(
			ctx.executeFunctions.getNode(),
			`Unknown resource: ${resource}`,
			{ itemIndex: ctx.itemIndex },
		);
	}
	return handler.execute(ctx, operation);
}

// Re-export types for convenience
export type { HandlerContext, ResourceHandler } from './types';
export { pushToReturnItems } from './types';
