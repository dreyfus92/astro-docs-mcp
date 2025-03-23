#!/usr/bin/env node

/**
 * Test client for the Astro Docs MCP Server
 * 
 * This script sends test commands to the MCP server and displays the responses.
 * It's useful for testing that the server is functioning correctly.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Log Node.js version
console.log(`Using Node.js version: ${process.version}\n`);

// Path to the MCP server executable
const serverPath = path.join(projectRoot, 'bin', 'astro-docs-mcp');

// Start the server
const server = spawn(serverPath, [], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// The MCP commands to send for testing
const commands = [
  // Initialize the MCP connection
  {
    jsonrpc: '2.0',
    method: 'init',
    params: { capabilities: {} },
    id: 1
  },
  // List resources (documentation sections)
  {
    jsonrpc: '2.0',
    method: 'resources/list',
    params: {},
    id: 2
  },
  // Try to call a tool
  {
    jsonrpc: '2.0',
    method: 'tool/call',
    params: {
      name: 'search_docs',
      arguments: { query: 'islands' }
    },
    id: 3
  },
  // Read a specific resource
  {
    jsonrpc: '2.0',
    method: 'resources/read',
    params: {
      uri: 'astro-docs:///getting-started'
    },
    id: 4
  }
];

// Set up functions to handle communication with the server
function sendCommand(command) {
  console.log(`Sending command: ${JSON.stringify(command)}`);
  server.stdin.write(JSON.stringify(command) + '\n');
}

// Buffer for accumulated data from stdout
let buffer = '';

server.stdout.on('data', (data) => {
  // Append new data to buffer
  buffer += data.toString();
  
  // Process complete JSON objects
  try {
    // Try to find a complete JSON object
    const jsonEndIndex = buffer.indexOf('\n');
    
    if (jsonEndIndex !== -1) {
      // Extract just the JSON part
      const jsonStr = buffer.slice(0, jsonEndIndex);
      buffer = buffer.slice(jsonEndIndex + 1);
      
      // Try to parse the JSON
      try {
        const response = JSON.parse(jsonStr);
        console.log('Received JSON response:', JSON.stringify(response, null, 2));
        console.log();
      } catch (parseError) {
        console.log('Raw server output:', jsonStr);
        console.log();
      }
    }
  } catch (e) {
    console.error('Error processing server response:', e);
  }
});

// Set up a timer to send commands one after another
let commandIndex = 0;

const commandInterval = setInterval(() => {
  if (commandIndex < commands.length) {
    sendCommand(commands[commandIndex]);
    commandIndex++;
  } else {
    // When all commands have been sent, wait a moment and then clean up
    clearInterval(commandInterval);
    
    setTimeout(() => {
      console.log('Tests completed, shutting down\n');
      server.stdin.end();
      server.kill();
      process.exit(0);
    }, 1000);
  }
}, 1000);

// Handle clean up on unexpected exit
process.on('SIGINT', () => {
  console.log('Interrupted, shutting down');
  server.stdin.end();
  server.kill();
  process.exit(0);
}); 