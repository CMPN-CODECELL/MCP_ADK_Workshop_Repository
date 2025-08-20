import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props } from "../types";
import { registerGitTools } from "./git-tools";
import { registerDiscordTools } from "./discord-tools";

/**
 * Register all MCP tools based on user permissions
 */
export function registerAllTools(server: McpServer, env: Env, props: Props) {
	// Register git tools
	registerGitTools(server, env, props);
	
	// Register Discord tools
	registerDiscordTools(server, env, props);
	
	// Future tools can be registered here
	// registerDeploymentTools(server, env, props);
}