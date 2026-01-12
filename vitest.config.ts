import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['__tests__/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['nodes/**/*.ts'],
			exclude: ['nodes/**/*.d.ts', 'nodes/**/types.ts'],
		},
		deps: {
			// Handle peer dependency that may not be installed
			inline: [],
		},
	},
	resolve: {
		alias: {
			// Mock n8n-workflow since it's a peer dependency
			'n8n-workflow': new URL('./__tests__/mocks/n8n-workflow.mock.ts', import.meta.url).pathname,
		},
	},
});
