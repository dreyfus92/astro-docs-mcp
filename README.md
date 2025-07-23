# Astro Docs MCP Server

An MCP server for providing Astro documentation access to AI agents. This server allows AI assistants to look up and reference Astro documentation when helping users with Astro-related tasks.

<a href="https://glama.ai/mcp/servers/@dreyfus92/astro-docs-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@dreyfus92/astro-docs-mcp/badge" alt="Astro Docs Server MCP server" />
</a>

This TypeScript-based MCP server implements a documentation retrieval system for Astro. It demonstrates core MCP concepts by providing:

- Resources representing Astro documentation sections with URIs and metadata
- Tools for searching Astro documentation
- Prompts for common Astro questions and tasks

## Features

### Resources
- List and access Astro documentation via `astro-docs://` URIs
- Each doc section has a title, content, and category
- Plain text mime type for simple content access

### Tools
- `search_docs` - Search Astro documentation
  - Takes a search query as required parameter
  - Returns matching documentation sections

### Prompts
- `explain_astro_islands` - Get detailed explanations of Astro Islands architecture
- `astro_project_setup` - Guide for setting up a new Astro project
- `astro_vs_other_frameworks` - Compare Astro with other web frameworks

## Project Structure

- `src/` - Source code for the MCP server
  - `index.ts` - Main MCP server implementation
  - `scripts/` - Helper scripts for building and testing
    - `build.js` - Build script that transpiles TypeScript and creates launcher scripts
    - `test-client.js` - Test client for verifying server functionality
- `bin/` - Generated executable scripts
  - `astro-docs-mcp` - Main launcher script for the MCP server
- `build/` - Compiled JavaScript files (generated)

## Requirements

- Node.js v16 or later is required
- Node.js v20+ is recommended for best compatibility
- The server uses ES modules syntax
- pnpm package manager (preferred over npm)

## Installation

### Installing Dependencies

Install dependencies:
```bash
pnpm install
```

Build the server:
```bash
pnpm run build
```

For development with auto-rebuild:
```bash
pnpm run watch
```

### Running the Server

```bash
pnpm start
# OR directly
./bin/astro-docs-mcp
```

## Configuration with Claude Desktop

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

**Important:** The configuration must use the **absolute path** to the script:

```json
{
  "mcp_servers": [
    {
      "id": "astro-docs-mcp",
      "name": "Astro Docs",
      "command": "/full/absolute/path/to/astro-mcp/bin/astro-docs-mcp",
      "type": "built-in"
    }
  ]
}
```

Replace `/full/absolute/path/to/astro-mcp/` with the actual absolute path to your installation directory.

For example, if the repository is at `/Users/username/projects/astro-mcp`, the command would be:
```
"/Users/username/projects/astro-mcp/bin/astro-docs-mcp"
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
pnpm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Testing

A test client is provided to verify the server is working correctly:

```bash
pnpm test
# OR directly
node src/scripts/test-client.js
```

This will send several commands to the server and display the responses.

## Troubleshooting

If you encounter issues with the server:

1. **Path Issues**: The most common problem is incorrect paths in the configuration. Make sure:
   - You're using an absolute path to the script in claude_desktop_config.json
   - The path points to `bin/astro-docs-mcp` (not the root script)
   - The build directory exists and contains index.js (`ls -la build/`)
   - All scripts have executable permissions

2. **"Module not found" errors**: If you see errors like `Cannot find module '/build/index.js'`, check:
   - That you've run the build step (`pnpm run build`)
   - That the script is being run from the correct directory
   - That absolute paths are being used for the script execution

3. **Node.js Version**: Make sure you're using Node.js v16 or later. For best results, use v20+.
   ```bash
   node --version
   ```

4. **Script Permissions**: Ensure the scripts have executable permissions:
   ```bash
   chmod +x bin/astro-docs-mcp src/scripts/build.js src/scripts/test-client.js
   ```

5. **JSON Output Issues**: Debug messages being sent to stdout will confuse Claude Desktop because it expects only valid JSON. Our scripts properly redirect all debug output to stderr.

## Usage with Claude Desktop

1. Install the server by following the installation steps above.

2. Configure Claude Desktop by editing the configuration file to include the **absolute path** to the script:
   ```json
   {
     "mcp_servers": [
       {
         "id": "astro-docs-mcp",
         "name": "Astro Docs",
         "command": "/full/absolute/path/to/astro-mcp/bin/astro-docs-mcp",
         "type": "built-in"
       }
     ]
   }
   ```

3. Restart Claude Desktop.

4. You can now interact with the Astro documentation using the following commands:
   - `list` - List available Astro documentation sections
   - `search <query>` - Search the Astro documentation
   - `read astro-docs:///<id>` - Read a specific documentation section

## Future Enhancements

- Fetch real-time documentation from Astro's website
- Add more comprehensive documentation sections
- Implement documentation versioning support
- Add code examples and snippets for common Astro patterns