#!/usr/bin/env node

/**
 * Astro Docs MCP Server
 * This MCP server provides access to Astro documentation for AI agents.
 * It allows:
 * - Listing available documentation sections as resources
 * - Reading individual documentation sections
 * - Searching documentation via a tool
 * - Getting curated documentation prompts for common Astro tasks
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Type alias for a documentation section.
 */
type DocSection = { 
  id: string;
  title: string;
  content: string;
  path: string;
  category: string;
};

/**
 * This function would fetch the latest documentation from the Astro docs GitHub repository.
 * Currently implemented as a placeholder for future enhancement.
 * 
 * In a full implementation, this would:
 * 1. Clone or pull the latest docs from https://github.com/withastro/docs
 * 2. Parse the Markdown files into our DocSection format
 * 3. Organize by categories based on directory structure
 * 4. Cache the results to avoid excessive GitHub API usage
 */
async function fetchLatestAstroDocs(): Promise<{ [id: string]: DocSection }> {
  console.log("In a future implementation, this function would fetch the latest docs from GitHub");
  
  // For now, we'll just return our static documentation
  return astroDocsSections;
}

/**
 * In-memory storage for documentation sections.
 * In a real implementation, this would fetch from Astro's documentation API or pre-processed files.
 */
const astroDocsSections: { [id: string]: DocSection } = {
  // Getting Started Section
  "getting-started": { 
    id: "getting-started", 
    title: "Getting Started", 
    content: "Astro is an all-in-one web framework for building fast, content-focused websites. Astro is designed to be used for content-rich websites like blogs, marketing, and e-commerce.",
    path: "/en/getting-started/",
    category: "core"
  },
  "why-astro": { 
    id: "why-astro", 
    title: "Why Astro?", 
    content: "Astro is designed to build content-rich websites. This includes most marketing sites, publishing sites, documentation sites, blogs, portfolios, and some ecommerce sites. Astro's first-class features for content include: component islands architecture for seamless frontend optimization, fast initial load times with minimal JS, and flexibility with your favorite UI components and frameworks.",
    path: "/en/getting-started/why-astro/",
    category: "core"
  },
  "islands-architecture": {
    id: "islands-architecture",
    title: "Islands Architecture",
    content: "Islands Architecture refers to a pattern of web development where your page is built with primarily static, server-rendered HTML that is punctuated with dynamic, client-hydrated islands.",
    path: "/en/concepts/islands/",
    category: "concepts"
  },
  "tutorial": {
    id: "tutorial",
    title: "Build a Blog",
    content: "Learn the fundamentals of Astro by building a fully-functioning blog website. This tutorial will guide you through building a blog that includes: A home page, About page, Blog post archive page, RSS feed, and Markdown styling.",
    path: "/en/tutorial/0-introduction/",
    category: "tutorial"
  },
  
  // Installation and Setup
  "installation": { 
    id: "installation", 
    title: "Installation", 
    content: "There are several ways to install Astro. You can install it using the automatic CLI, create it locally with npm, or use a starter template. Run `npm create astro@latest` to get started with the CLI wizard.",
    path: "/en/installation/",
    category: "core"
  },
  "project-structure": {
    id: "project-structure",
    title: "Project Structure",
    content: "Astro has a recommended project structure with specific directories like `src/`, `public/`, and `astro.config.mjs`. The `src/` directory contains most of your project source code, including pages, layouts, and components.",
    path: "/en/core-concepts/project-structure/",
    category: "core"
  },
  "develop-and-build": {
    id: "develop-and-build",
    title: "Develop and Build",
    content: "Astro provides development and build commands: `astro dev` starts the development server with hot module replacement, and `astro build` builds your site for production.",
    path: "/en/basics/develop-and-build/",
    category: "core"
  },
  
  // Configuration
  "configuration": {
    id: "configuration",
    title: "Configuration",
    content: "Astro is configured using `astro.config.mjs` in the project root. This file lets you customize build options, server options, and add integrations.",
    path: "/en/guides/configuring-astro/",
    category: "configuration"
  },
  "typescript": {
    id: "typescript",
    title: "TypeScript",
    content: "Astro includes built-in support for TypeScript. You can import .ts and .tsx files in your project, define TypeScript interfaces for your data, and even write TypeScript in your Astro components.",
    path: "/en/guides/typescript/",
    category: "configuration"
  },
  "environment-variables": {
    id: "environment-variables",
    title: "Environment Variables",
    content: "Environment variables are values available to your project based on the environment they run in. Use .env files to store configuration like API keys and passwords that should not be committed to git.",
    path: "/en/guides/environment-variables/",
    category: "configuration"
  },
  "dev-toolbar": {
    id: "dev-toolbar",
    title: "Dev Toolbar",
    content: "Astro's Dev Toolbar is a customizable toolbar that appears in the browser window during development, providing quick access to debugging tools and controls for your Astro site.",
    path: "/en/guides/dev-toolbar/",
    category: "configuration"
  },
  "editor-setup": {
    id: "editor-setup",
    title: "Editor Setup",
    content: "Configure your code editor for the best Astro development experience. Astro has official extensions for VS Code and other popular editors.",
    path: "/en/editor-setup/",
    category: "configuration"
  },
  
  // Core Concepts
  "components": { 
    id: "components", 
    title: "Components", 
    content: "Astro components are the basic building blocks of any Astro project. They use a templating language similar to HTML with support for importing and using components from other UI frameworks.",
    path: "/en/core-concepts/components/",
    category: "core"
  },
  "layouts": {
    id: "layouts",
    title: "Layouts",
    content: "Layouts are special Astro components that are used to provide a reusable UI structure, such as a page template. They are commonly used to define the overall page structure with elements like <html>, <head>, and <body> tags.",
    path: "/en/core-concepts/layouts/",
    category: "core"
  },
  "routing": { 
    id: "routing", 
    title: "Routing", 
    content: "Astro uses file-based routing to generate your build URLs based on the files in your `src/pages/` directory. When a file is added to the `src/pages` directory, it is automatically available as a route based on its filename.",
    path: "/en/core-concepts/routing/",
    category: "core"
  },
  "pages": {
    id: "pages",
    title: "Pages",
    content: "Pages in Astro are files that live in the `src/pages/` directory. They are responsible for handling routing, data loading, and overall page layout for every page in your website.",
    path: "/en/core-concepts/astro-pages/",
    category: "core"
  },
  "endpoints": {
    id: "endpoints",
    title: "Endpoints",
    content: "Endpoints in Astro are files that end with `.js` or `.ts` in the `src/pages/` directory. They allow you to create API routes or custom endpoints that can return data in various formats.",
    path: "/en/core-concepts/endpoints/",
    category: "core"
  },
  "middleware": {
    id: "middleware",
    title: "Middleware",
    content: "Middleware allows you to intercept requests and responses and dynamically modify them. You can use middleware for authentication, logging, or redirects.",
    path: "/en/guides/middleware/",
    category: "advanced"
  },
  "internationalization": {
    id: "internationalization",
    title: "Internationalization (i18n)",
    content: "Astro supports building internationalized websites with routing based on language codes. You can organize content by language and create language-specific URLs.",
    path: "/en/guides/internationalization/",
    category: "advanced"
  },
  "prefetch": {
    id: "prefetch",
    title: "Prefetch",
    content: "Astro supports link prefetching to improve navigation speed. When enabled, Astro will prefetch page resources when the user hovers over a link, making navigation feel almost instantaneous.",
    path: "/en/guides/prefetch/",
    category: "advanced"
  },
  "view-transitions": {
    id: "view-transitions",
    title: "View Transitions",
    content: "Astro supports the View Transitions API to create smooth transitions between pages, preserving state and avoiding full page refreshes. This helps create app-like experiences for multi-page websites.",
    path: "/en/guides/view-transitions/",
    category: "advanced"
  },
  
  // UI Building
  "astro-syntax": {
    id: "astro-syntax",
    title: "Astro Syntax",
    content: "Astro component syntax is a superset of HTML that supports components, JS expressions, variables, and JSX-like special directives.",
    path: "/en/basics/astro-syntax/",
    category: "core"
  },
  "styles": {
    id: "styles",
    title: "Styles and CSS",
    content: "Astro offers many ways to style your components, including scoped CSS, CSS Modules, Sass, and integrations with Tailwind CSS, etc.",
    path: "/en/guides/styling/",
    category: "styling"
  },
  "fonts": {
    id: "fonts",
    title: "Fonts",
    content: "Astro allows both local font files and web fonts to be used in your project. There are multiple ways to add custom fonts to your Astro project.",
    path: "/en/guides/fonts/",
    category: "styling"
  },
  "scripts": {
    id: "scripts",
    title: "Scripts and Event Handling",
    content: "Astro supports adding JavaScript to your pages via the <script> tag in .astro files. Scripts can be inline, imported from local files, or from external sources.",
    path: "/en/guides/client-side-scripts/",
    category: "advanced"
  },
  "ui-frameworks": {
    id: "ui-frameworks",
    title: "UI Frameworks",
    content: "You can use your favorite UI component frameworks with Astro, including React, Preact, Svelte, Vue, SolidJS, AlpineJS, and Lit. Add framework components directly into your Astro components.",
    path: "/en/guides/framework-components/",
    category: "ecosystem"
  },
  "syntax-highlighting": {
    id: "syntax-highlighting",
    title: "Syntax Highlighting",
    content: "Astro comes with built-in support for syntax highlighting in code blocks using Shiki and Prism. You can customize themes, add line numbers, and more.",
    path: "/en/guides/markdown-content/#syntax-highlighting",
    category: "content"
  },
  
  // Content Features
  "markdown": {
    id: "markdown",
    title: "Markdown",
    content: "Astro treats Markdown files as first-class citizens and includes built-in support for using Markdown for content. You can also use MDX with the MDX integration.",
    path: "/en/guides/markdown-content/",
    category: "content"
  },
  "content-collections": {
    id: "content-collections",
    title: "Content Collections",
    content: "Content collections help you organize your Markdown and MDX content and provide automatic type-safety for your content frontmatter. Store content in `src/content/` to take advantage of content collections.",
    path: "/en/guides/content-collections/",
    category: "content"
  },
  "images": {
    id: "images",
    title: "Images",
    content: "Astro provides built-in image optimization with the `<Image />` component and the `getImage()` function. Optimize and transform images to improve web performance.",
    path: "/en/guides/images/",
    category: "features"
  },
  "data-fetching": {
    id: "data-fetching",
    title: "Data Fetching",
    content: "Astro allows you to fetch data from anywhere, including remote APIs, a local database, or the filesystem. You can use the `fetch()` function for remote APIs or access local files with standard Node.js APIs.",
    path: "/en/guides/data-fetching/",
    category: "advanced"
  },
  "astro-db": {
    id: "astro-db",
    title: "Astro DB",
    content: "Astro DB is a fully-managed SQL database that's designed specifically for Astro. It provides type-safe ORM, schema migrations, local development, and production-ready database hosting.",
    path: "/en/guides/astro-db/",
    category: "features"
  },
  
  // Server Rendering
  "server-side-rendering": {
    id: "server-side-rendering",
    title: "Server-side Rendering (SSR)",
    content: "Astro supports Server-side Rendering (SSR). With SSR, pages are rendered on-demand on the server when requested, rather than at build time. This enables features like API access and dynamic data.",
    path: "/en/guides/server-side-rendering/",
    category: "advanced"
  },
  "on-demand-rendering": {
    id: "on-demand-rendering",
    title: "On-demand Rendering",
    content: "On-demand rendering (ODR) is a hybrid rendering strategy that allows you to generate static pages at runtime, combining benefits of both static site generation and server-side rendering.",
    path: "/en/guides/on-demand-rendering/",
    category: "advanced"
  },
  "server-islands": {
    id: "server-islands",
    title: "Server Islands",
    content: "Server islands extend Astro's island component model to server-side renders. They enable you to use API responses and dynamic data in your Astro components and UI framework components.",
    path: "/en/guides/server-islands/",
    category: "advanced"
  },
  "actions": {
    id: "actions",
    title: "Actions",
    content: "Astro actions allow you to handle form submissions and process user input with server functions that can run data mutations and database operations securely on the server.",
    path: "/en/guides/actions/",
    category: "advanced"
  },
  
  // Performance and Optimization
  "performance": {
    id: "performance",
    title: "Performance",
    content: "Astro is designed to be fast by default. It offers features like automatic image optimization, asset bundling, CSS minification, and JavaScript splitting.",
    path: "/en/guides/performance/",
    category: "advanced"
  },
  "assets": {
    id: "assets",
    title: "Assets",
    content: "Astro provides built-in support for optimizing and managing assets like images, fonts, and other static files. Assets in the public/ directory are served directly, while assets in src/ are processed.",
    path: "/en/guides/assets/",
    category: "features"
  },
  
  // Ecosystem and Integrations
  "integrations": {
    id: "integrations",
    title: "Integrations",
    content: "Extend Astro's capabilities with integrations. Astro supports UI frameworks like React, Vue, Svelte, as well as tools like Tailwind CSS, MDX, and more.",
    path: "/en/guides/integrations-guide/",
    category: "ecosystem"
  },
  "cms": {
    id: "cms",
    title: "Content Management Systems",
    content: "Astro works with most headless CMS providers. Connect your CMS to Astro using their API to fetch content for your site.",
    path: "/en/guides/cms/",
    category: "ecosystem"
  },
  "backend-services": {
    id: "backend-services",
    title: "Backend Services",
    content: "Astro can integrate with various backend services like Firebase, Supabase, and others to provide authentication, database access, and more.",
    path: "/en/guides/backend/",
    category: "ecosystem"
  },
  
  // Deployment
  "deploy": {
    id: "deploy",
    title: "Deployment",
    content: "Deploy your Astro site to a variety of hosting platforms like Netlify, Vercel, GitHub Pages, and more. Supports both static site generation (SSG) and server-side rendering (SSR).",
    path: "/en/guides/deploy/",
    category: "production"
  },
  "netlify": {
    id: "netlify",
    title: "Deploy to Netlify",
    content: "Deploy your Astro site to Netlify, which supports both static site generation and server-side rendering through Netlify Functions.",
    path: "/en/guides/deploy/netlify/",
    category: "production"
  },
  "vercel": {
    id: "vercel",
    title: "Deploy to Vercel",
    content: "Deploy your Astro site to Vercel, which supports both static site generation and server-side rendering through Vercel Serverless Functions and Edge Functions.",
    path: "/en/guides/deploy/vercel/",
    category: "production"
  },
  "deno": {
    id: "deno",
    title: "Deploy to Deno Deploy",
    content: "Deploy your Astro site to Deno Deploy, a modern serverless platform built on the Deno runtime.",
    path: "/en/guides/deploy/deno/",
    category: "production"
  },
  "cloudflare": {
    id: "cloudflare",
    title: "Deploy to Cloudflare Pages",
    content: "Deploy your Astro site to Cloudflare Pages, which supports both static site generation and server-side rendering through Cloudflare Functions.",
    path: "/en/guides/deploy/cloudflare/",
    category: "production"
  },
  
  // Recipes and Guides
  "authentication": {
    id: "authentication",
    title: "Authentication",
    content: "Add authentication to your Astro site using various authentication providers like Auth.js, Firebase Auth, or custom solutions.",
    path: "/en/guides/authentication/",
    category: "guides"
  },
  "forms": {
    id: "forms",
    title: "Forms",
    content: "Handle form submissions in Astro using server endpoints, API routes, or external form services.",
    path: "/en/guides/forms/",
    category: "guides"
  },
  "testing": {
    id: "testing",
    title: "Testing",
    content: "Test your Astro components and pages using testing libraries like Playwright, Cypress, or Vitest.",
    path: "/en/guides/testing/",
    category: "guides"
  },
  "migration": {
    id: "migration",
    title: "Migration Guides",
    content: "Guides for migrating from other frameworks like React, Vue, Svelte, or static site generators to Astro.",
    path: "/en/guides/migrate-to-astro/",
    category: "guides"
  },
  "recipes": {
    id: "recipes",
    title: "Recipes",
    content: "A collection of recipes and examples for common use cases in Astro, including RSS feeds, sitemap generation, and more.",
    path: "/en/recipes/",
    category: "guides"
  },
  "advanced-patterns": {
    id: "advanced-patterns",
    title: "Advanced Patterns",
    content: "Advanced patterns for building with Astro, including dynamic routes, API endpoints, and more.",
    path: "/en/guides/advanced-patterns/",
    category: "advanced"
  },

  // Upgrade Guides
  "upgrade": {
    id: "upgrade",
    title: "Upgrade Astro",
    content: "Learn how to upgrade your Astro project to the latest version and use new features.",
    path: "/en/guides/upgrade-astro/",
    category: "guides"
  },
  "v5-upgrade": {
    id: "v5-upgrade",
    title: "Upgrade to v5.0",
    content: "Guide for upgrading your Astro project from v4.x to v5.0, including breaking changes and new features.",
    path: "/en/guides/upgrade-to/v5/",
    category: "guides"
  },
  "v4-upgrade": {
    id: "v4-upgrade",
    title: "Upgrade to v4.0",
    content: "Guide for upgrading your Astro project from v3.x to v4.0, including breaking changes and new features.",
    path: "/en/guides/upgrade-to/v4/",
    category: "guides"
  },
  "v3-upgrade": {
    id: "v3-upgrade",
    title: "Upgrade to v3.0",
    content: "Guide for upgrading your Astro project from v2.x to v3.0, including breaking changes and new features.",
    path: "/en/guides/upgrade-to/v3/",
    category: "guides"
  },
  
  // Reference
  "reference": {
    id: "reference",
    title: "API Reference",
    content: "Complete reference documentation for Astro's APIs, configuration options, and component syntax.",
    path: "/en/reference/api-reference/",
    category: "reference"
  },
  "directives": {
    id: "directives",
    title: "Template Directives",
    content: "Reference for Astro's template directives, such as client:load, define:vars, and more, which control component behavior.",
    path: "/en/reference/directives-reference/",
    category: "reference"
  },
  "configuration-reference": {
    id: "configuration-reference",
    title: "Configuration Reference",
    content: "Complete reference for Astro's configuration options in astro.config.mjs, including integration settings.",
    path: "/en/reference/configuration-reference/",
    category: "reference"
  },
  "cli-reference": {
    id: "cli-reference",
    title: "CLI Reference",
    content: "Reference for Astro's command-line interface (CLI) commands, flags, and options.",
    path: "/en/reference/cli-reference/",
    category: "reference"
  },
  "adapter-reference": {
    id: "adapter-reference",
    title: "Adapter API",
    content: "Reference for creating and using server adapters for deploying Astro sites with SSR.",
    path: "/en/reference/adapter-reference/",
    category: "reference"
  },
  "integrations-reference": {
    id: "integrations-reference",
    title: "Integration API",
    content: "Reference for creating and using Astro integrations that extend Astro's functionality.",
    path: "/en/reference/integrations-reference/",
    category: "reference"
  },
  "error-reference": {
    id: "error-reference",
    title: "Error Reference",
    content: "Find help and solutions for error messages you might encounter while using Astro.",
    path: "/en/reference/error-reference/",
    category: "reference"
  },
  "dev-toolbar-app-reference": {
    id: "dev-toolbar-app-reference",
    title: "Dev Toolbar App Reference",
    content: "Reference for creating custom apps for Astro's developer toolbar to extend its functionality.",
    path: "/en/reference/dev-toolbar-app-reference/",
    category: "reference"
  },
  
  // Astro Islands and Architecture
  "astro-islands": { 
    id: "astro-islands", 
    title: "Astro Islands", 
    content: "Astro Islands (aka Component Islands) are a pattern of web architecture pioneered by Astro. 'Islands architecture' refers to server-rendered HTML with islands of interactive components.",
    path: "/en/concepts/islands/",
    category: "concepts"
  },
  "client-directives": {
    id: "client-directives",
    title: "Client Directives",
    content: "Astro's client directives (like client:load) control how UI framework components are hydrated on the client, allowing for fine-grained control over interactivity.",
    path: "/en/reference/directives-reference/#client-directives",
    category: "reference"
  },
  "hydration": {
    id: "hydration",
    title: "Hydration",
    content: "Hydration is the process of turning static HTML into interactive components in the browser. Astro offers partial hydration strategies for optimal performance.",
    path: "/en/concepts/hydration/",
    category: "concepts"
  },
  
  // Troubleshooting
  "troubleshooting": {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: "Find solutions to common issues and errors when working with Astro.",
    path: "/en/guides/troubleshooting/",
    category: "guides"
  }
};

/**
 * Search function to find relevant documentation sections.
 */
function searchDocs(query: string): DocSection[] {
  query = query.toLowerCase();
  return Object.values(astroDocsSections).filter(section => {
    return section.title.toLowerCase().includes(query) || 
           section.content.toLowerCase().includes(query) ||
           section.category.toLowerCase().includes(query);
  });
}

/**
 * Create an MCP server with capabilities for resources (to list/read docs),
 * tools (to search docs), and prompts (for common Astro tasks).
 */
const server = new Server(
  {
    name: "astro-docs-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available documentation sections as resources.
 * Each section is exposed as a resource with:
 * - An astro-docs:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.values(astroDocsSections).map(section => ({
      uri: `astro-docs:///${section.id}`,
      mimeType: "text/plain",
      name: section.title,
      description: `Astro documentation: ${section.title} (${section.category})`
    }))
  };
});

/**
 * Handler for reading the contents of a specific documentation section.
 * Takes an astro-docs:// URI and returns the content as plain text.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const id = url.pathname.replace(/^\//, '');
  const section = astroDocsSections[id];

  if (!section) {
    throw new Error(`Documentation section ${id} not found`);
  }

  return {
    contents: [{
      uri: request.params.uri,
      mimeType: "text/plain",
      text: `# ${section.title}\n\n${section.content}\n\nFor more details, see: https://docs.astro.build${section.path}`
    }]
  };
});

/**
 * Handler that lists available tools.
 * Exposes a "search_docs" tool that lets clients search the Astro documentation.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_docs",
        description: "Search Astro documentation",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term to find in Astro documentation"
            }
          },
          required: ["query"]
        }
      }
    ]
  };
});

/**
 * Handler for the search_docs tool.
 * Searches documentation based on the provided query and returns matching sections.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "search_docs": {
      const args = request.params.arguments || {};
      const query = args.query ? String(args.query) : "";
      if (!query) {
        throw new Error("Search query is required");
      }

      const results = searchDocs(query);
      
      if (results.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No documentation found for query: "${query}"`
          }]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} documentation sections for "${query}":\n\n` +
              results.map(section => 
                `- ${section.title}: ${section.content.substring(0, 100)}... (URI: astro-docs:///${section.id})`
              ).join('\n\n')
          }
        ]
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

/**
 * Handler that lists available prompts.
 * Exposes prompts for common Astro tasks and concepts.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      // Architecture and Core Concepts
      {
        name: "explain_astro_islands",
        description: "Explanation of Astro Islands architecture",
      },
      {
        name: "astro_project_setup",
        description: "Guide to setting up a new Astro project",
      },
      {
        name: "astro_vs_other_frameworks",
        description: "Compare Astro with other web frameworks",
      },
      
      // Content Management
      {
        name: "content_collections_guide",
        description: "How to use Astro Content Collections",
      },
      {
        name: "markdown_in_astro",
        description: "Working with Markdown and MDX in Astro",
      },
      {
        name: "cms_integration",
        description: "Connecting Astro to headless CMS platforms",
      },
      
      // UI and Components
      {
        name: "integrate_react_components",
        description: "Guide for integrating React components in Astro",
      },
      {
        name: "styling_in_astro",
        description: "Approaches for styling Astro components",
      },
      {
        name: "client_side_scripting",
        description: "Adding interactivity with client-side JavaScript in Astro",
      },
      
      // Rendering and Performance
      {
        name: "ssr_deployment",
        description: "How to deploy an Astro site with SSR",
      },
      {
        name: "view_transitions_guide",
        description: "Implementing view transitions in Astro",
      },
      {
        name: "performance_optimization",
        description: "Optimizing Astro sites for performance",
      },
      
      // Data and API
      {
        name: "astro_db_setup",
        description: "Setting up and using Astro DB",
      },
      {
        name: "data_fetching_patterns",
        description: "Patterns for fetching data in Astro",
      },
      {
        name: "api_endpoints",
        description: "Creating API endpoints in Astro",
      },
      
      // Assets and Resources
      {
        name: "image_optimization",
        description: "Using Astro's image optimization features",
      },
      {
        name: "asset_handling",
        description: "Managing static assets in Astro projects",
      },
      {
        name: "font_optimization",
        description: "Working with custom fonts in Astro",
      },
      
      // Deployment and Production
      {
        name: "deployment_options",
        description: "Options for deploying Astro websites",
      },
      {
        name: "authentication_guide",
        description: "Implementing authentication in Astro",
      },
      {
        name: "internationalization",
        description: "Building multi-language Astro websites",
      },
      
      // Advanced Topics
      {
        name: "middleware_guide",
        description: "Using middleware in Astro applications",
      },
      {
        name: "testing_astro",
        description: "Testing strategies for Astro projects",
      },
      {
        name: "migration_guide",
        description: "Migrating from other frameworks to Astro",
      }
    ]
  };
});

/**
 * Handler for various Astro documentation prompts.
 * Returns relevant documentation and prompts for common Astro questions.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  switch (request.params.name) {
    case "explain_astro_islands": {
      const islandsDoc = astroDocsSections["astro-islands"];
      const hydrationDoc = astroDocsSections["hydration"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Can you explain Astro Islands architecture to me?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${islandsDoc.id}`,
                mimeType: "text/plain",
                text: `# ${islandsDoc.title}\n\n${islandsDoc.content}\n\nFor more details, see: https://docs.astro.build${islandsDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${hydrationDoc?.id || "astro-islands"}`,
                mimeType: "text/plain",
                text: hydrationDoc ? 
                  `# ${hydrationDoc.title}\n\n${hydrationDoc.content}\n\nFor more details, see: https://docs.astro.build${hydrationDoc.path}` : 
                  "Information on hydration strategies in Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Please explain Astro Islands in simple terms, with examples of when and why I would use them."
            }
          }
        ]
      };
    }
    
    case "astro_project_setup": {
      const gettingStartedDoc = astroDocsSections["getting-started"];
      const installationDoc = astroDocsSections["installation"];
      const projectStructureDoc = astroDocsSections["project-structure"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I set up a new Astro project?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${gettingStartedDoc.id}`,
                mimeType: "text/plain",
                text: `# ${gettingStartedDoc.title}\n\n${gettingStartedDoc.content}\n\nFor more details, see: https://docs.astro.build${gettingStartedDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${installationDoc.id}`,
                mimeType: "text/plain",
                text: `# ${installationDoc.title}\n\n${installationDoc.content}\n\nFor more details, see: https://docs.astro.build${installationDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${projectStructureDoc.id}`,
                mimeType: "text/plain",
                text: `# ${projectStructureDoc.title}\n\n${projectStructureDoc.content}\n\nFor more details, see: https://docs.astro.build${projectStructureDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide step-by-step instructions for setting up a new Astro project, including explanation of the project structure and initial configuration options."
            }
          }
        ]
      };
    }
    
    case "astro_vs_other_frameworks": {
      const whyAstroDoc = astroDocsSections["why-astro"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How does Astro compare to other frameworks like Next.js, Gatsby, or SvelteKit?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${whyAstroDoc?.id || "getting-started"}`,
                mimeType: "text/plain",
                text: whyAstroDoc ? 
                  `# ${whyAstroDoc.title}\n\n${whyAstroDoc.content}\n\nFor more details, see: https://docs.astro.build${whyAstroDoc.path}` :
                  "Information on why to choose Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a balanced comparison of Astro with other popular web frameworks, focusing on their strengths, weaknesses, and ideal use cases."
            }
          }
        ]
      };
    }
    
    case "content_collections_guide": {
      const collectionsDoc = astroDocsSections["content-collections"];
      const markdownDoc = astroDocsSections["markdown"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I use Content Collections in Astro?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${collectionsDoc.id}`,
                mimeType: "text/plain",
                text: `# ${collectionsDoc.title}\n\n${collectionsDoc.content}\n\nFor more details, see: https://docs.astro.build${collectionsDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${markdownDoc.id}`,
                mimeType: "text/plain",
                text: `# ${markdownDoc.title}\n\n${markdownDoc.content}\n\nFor more details, see: https://docs.astro.build${markdownDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Explain how to set up and use Content Collections in Astro. Include information on schema definition, type safety, and querying content."
            }
          }
        ]
      };
    }
    
    case "markdown_in_astro": {
      const markdownDoc = astroDocsSections["markdown"];
      const syntaxHighlightingDoc = astroDocsSections["syntax-highlighting"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I use Markdown and MDX in my Astro project?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${markdownDoc.id}`,
                mimeType: "text/plain",
                text: `# ${markdownDoc.title}\n\n${markdownDoc.content}\n\nFor more details, see: https://docs.astro.build${markdownDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${syntaxHighlightingDoc?.id || "markdown"}`,
                mimeType: "text/plain",
                text: syntaxHighlightingDoc ? 
                  `# ${syntaxHighlightingDoc.title}\n\n${syntaxHighlightingDoc.content}\n\nFor more details, see: https://docs.astro.build${syntaxHighlightingDoc.path}` :
                  "Information on syntax highlighting in Markdown"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a comprehensive guide on working with Markdown and MDX in Astro, including frontmatter, components in MDX, and syntax highlighting."
            }
          }
        ]
      };
    }
    
    case "cms_integration": {
      const cmsDoc = astroDocsSections["cms"];
      const dataFetchingDoc = astroDocsSections["data-fetching"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I integrate a headless CMS with my Astro project?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${cmsDoc?.id || "data-fetching"}`,
                mimeType: "text/plain",
                text: cmsDoc ? 
                  `# ${cmsDoc.title}\n\n${cmsDoc.content}\n\nFor more details, see: https://docs.astro.build${cmsDoc.path}` :
                  "Information on CMS integrations with Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${dataFetchingDoc.id}`,
                mimeType: "text/plain",
                text: `# ${dataFetchingDoc.title}\n\n${dataFetchingDoc.content}\n\nFor more details, see: https://docs.astro.build${dataFetchingDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a guide on integrating popular headless CMS platforms with Astro, including fetching data, creating content models, and rendering content."
            }
          }
        ]
      };
    }
    
    case "integrate_react_components": {
      const uiFrameworksDoc = astroDocsSections["ui-frameworks"];
      const integrationsDoc = astroDocsSections["integrations"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I use React components in my Astro project?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${uiFrameworksDoc.id}`,
                mimeType: "text/plain",
                text: `# ${uiFrameworksDoc.title}\n\n${uiFrameworksDoc.content}\n\nFor more details, see: https://docs.astro.build${uiFrameworksDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${integrationsDoc.id}`,
                mimeType: "text/plain",
                text: `# ${integrationsDoc.title}\n\n${integrationsDoc.content}\n\nFor more details, see: https://docs.astro.build${integrationsDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a guide on how to integrate React components into an Astro project, including setting up the integration, creating components, and using client directives."
            }
          }
        ]
      };
    }
    
    case "styling_in_astro": {
      const stylesDoc = astroDocsSections["styles"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "What are the different ways to style components in Astro?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${stylesDoc?.id || "components"}`,
                mimeType: "text/plain",
                text: stylesDoc ? 
                  `# ${stylesDoc.title}\n\n${stylesDoc.content}\n\nFor more details, see: https://docs.astro.build${stylesDoc.path}` :
                  "Information on styling in Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Explain the different approaches for styling in Astro, including scoped styles, CSS modules, Sass/SCSS, and integrations with CSS frameworks like Tailwind."
            }
          }
        ]
      };
    }
    
    case "view_transitions_guide": {
      const viewTransitionsDoc = astroDocsSections["view-transitions"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I implement view transitions in my Astro site?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${viewTransitionsDoc.id}`,
                mimeType: "text/plain",
                text: `# ${viewTransitionsDoc.title}\n\n${viewTransitionsDoc.content}\n\nFor more details, see: https://docs.astro.build${viewTransitionsDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a step-by-step guide on implementing view transitions in Astro, including the ViewTransitions component, animations, and preserving state between page navigations."
            }
          }
        ]
      };
    }
    
    case "ssr_deployment": {
      const ssrDoc = astroDocsSections["server-side-rendering"];
      const deployDoc = astroDocsSections["deploy"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I deploy an Astro site with SSR?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${ssrDoc.id}`,
                mimeType: "text/plain",
                text: `# ${ssrDoc.title}\n\n${ssrDoc.content}\n\nFor more details, see: https://docs.astro.build${ssrDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${deployDoc.id}`,
                mimeType: "text/plain",
                text: `# ${deployDoc.title}\n\n${deployDoc.content}\n\nFor more details, see: https://docs.astro.build${deployDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Explain how to configure and deploy an Astro site with server-side rendering (SSR) to different hosting platforms."
            }
          }
        ]
      };
    }
    
    case "performance_optimization": {
      const performanceDoc = astroDocsSections["performance"];
      const assetsDoc = astroDocsSections["assets"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How can I optimize my Astro site for performance?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${performanceDoc?.id || "images"}`,
                mimeType: "text/plain",
                text: performanceDoc ? 
                  `# ${performanceDoc.title}\n\n${performanceDoc.content}\n\nFor more details, see: https://docs.astro.build${performanceDoc.path}` :
                  "Information on performance optimization in Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${assetsDoc?.id || "images"}`,
                mimeType: "text/plain",
                text: assetsDoc ? 
                  `# ${assetsDoc.title}\n\n${assetsDoc.content}\n\nFor more details, see: https://docs.astro.build${assetsDoc.path}` :
                  "Information on asset optimization in Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide optimization strategies for Astro sites, including image optimization, asset bundling, code splitting, and performance measurement."
            }
          }
        ]
      };
    }
    
    case "astro_db_setup": {
      const astroDbDoc = astroDocsSections["astro-db"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I set up and use Astro DB?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${astroDbDoc.id}`,
                mimeType: "text/plain",
                text: `# ${astroDbDoc.title}\n\n${astroDbDoc.content}\n\nFor more details, see: https://docs.astro.build${astroDbDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a comprehensive guide on setting up and using Astro DB, including schema definition, querying data, and deployment considerations."
            }
          }
        ]
      };
    }
    
    case "data_fetching_patterns": {
      const dataFetchingDoc = astroDocsSections["data-fetching"];
      const endpointsDoc = astroDocsSections["endpoints"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "What are the best practices for fetching data in Astro?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${dataFetchingDoc.id}`,
                mimeType: "text/plain",
                text: `# ${dataFetchingDoc.title}\n\n${dataFetchingDoc.content}\n\nFor more details, see: https://docs.astro.build${dataFetchingDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${endpointsDoc?.id || "data-fetching"}`,
                mimeType: "text/plain",
                text: endpointsDoc ? 
                  `# ${endpointsDoc.title}\n\n${endpointsDoc.content}\n\nFor more details, see: https://docs.astro.build${endpointsDoc.path}` :
                  "Information on API endpoints in Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Explain the different approaches for fetching data in Astro, including top-level await, fetch API, local files, and working with data from external APIs."
            }
          }
        ]
      };
    }
    
    case "image_optimization": {
      const imagesDoc = astroDocsSections["images"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I optimize images in my Astro project?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${imagesDoc.id}`,
                mimeType: "text/plain",
                text: `# ${imagesDoc.title}\n\n${imagesDoc.content}\n\nFor more details, see: https://docs.astro.build${imagesDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Explain how to use Astro's image optimization features, including the Image component and getImage function, with examples of different optimization techniques."
            }
          }
        ]
      };
    }
    
    case "middleware_guide": {
      const middlewareDoc = astroDocsSections["middleware"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I use middleware in my Astro project?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${middlewareDoc.id}`,
                mimeType: "text/plain",
                text: `# ${middlewareDoc.title}\n\n${middlewareDoc.content}\n\nFor more details, see: https://docs.astro.build${middlewareDoc.path}`
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a guide on implementing and using middleware in Astro, including common use cases like authentication, logging, and request/response modification."
            }
          }
        ]
      };
    }
    
    case "internationalization": {
      const i18nDoc = astroDocsSections["internationalization"];
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I build a multi-language website with Astro?"
            }
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: `astro-docs:///${i18nDoc?.id || "routing"}`,
                mimeType: "text/plain",
                text: i18nDoc ? 
                  `# ${i18nDoc.title}\n\n${i18nDoc.content}\n\nFor more details, see: https://docs.astro.build${i18nDoc.path}` :
                  "Information on internationalization in Astro"
              }
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: "Explain the approaches for implementing internationalization in Astro, including routing strategies, content translation, and language switching."
            }
          }
        ]
      };
    }
    
    default:
      throw new Error("Unknown prompt");
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
