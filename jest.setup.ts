// Set up global fetch and web streams
Object.assign(global, {
	fetch: globalThis.fetch,
	Headers: globalThis.Headers,
	Request: globalThis.Request,
	Response: globalThis.Response,
	ReadableStream: globalThis.ReadableStream
}); 