#!/usr/bin/env node

/**
 * DocDD MCP Server Entry Point
 */

import { DocumentMCPServer } from './document-mcp-server.js'

async function main(): Promise<void> {
  const server = new DocumentMCPServer()
  await server.run()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
