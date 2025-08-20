import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Props } from "./types";
import { GitHubHandler } from "./auth/github-handler";
import { registerAllTools } from "./tools/register-tools";

export class DevAssistantMCP extends McpAgent<Env, Record<string, never>, Props> {
	server = new McpServer({
		name: "Development Assistant MCP Server",
		version: "1.0.0",
	});

	/**
	 * Cleanup resources when Durable Object is shutting down
	 */
	async cleanup(): Promise<void> {
		try {
			console.log('Dev Assistant MCP server cleanup completed');
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}

	/**
	 * Durable Objects alarm handler - used for cleanup
	 */
	async alarm(): Promise<void> {
		await this.cleanup();
	}

	async init() {
		// Register all tools based on user permissions
		registerAllTools(this.server, this.env, this.props);
	}
}

export default new OAuthProvider({
	apiHandlers: {
		'/sse': DevAssistantMCP.serveSSE('/sse') as any,
		'/mcp': DevAssistantMCP.serve('/mcp') as any,
	},
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	defaultHandler: GitHubHandler as any,
	tokenEndpoint: "/token",
});