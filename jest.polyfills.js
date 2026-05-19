// Polyfills for MSW v2 in Node.js test environment
// This file must be loaded before jest.setup.ts

// Import all necessary globals from Node.js v20+
const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream, TransformStream } = require('stream/web');
const { MessageChannel, MessagePort, BroadcastChannel } = require('worker_threads');

// Set all globals that undici/MSW needs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;
global.BroadcastChannel = BroadcastChannel;

// Now we can safely require undici for fetch polyfill
const { fetch, Headers, Request, Response } = require('undici');
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
