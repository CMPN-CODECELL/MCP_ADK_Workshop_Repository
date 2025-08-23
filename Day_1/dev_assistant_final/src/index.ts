import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { commitAndPushTool } from "./tools/commit-and-push.js";
import { sendNotificationTool } from "./tools/send-notifications.js";
import { fullWorkflowTool } from "./tools/full-workflow.js";
import dotenv from "dotenv";

dotenv.config();

export class DevAssistantServer {
  private server: Server;
  public readonly projectPath: string;
  public readonly discordWebhookUrl: string | undefined;

  constructor() {
    this.projectPath = 'C:\\Users\\hanna\\OneDrive\\Desktop\\test_dir';
    this.discordWebhookUrl = 'https://discordapp.com/api/webhooks/1393859166225039410/0F2TV_Ws8nFId2QqWL0PtUqpOOEEBncqU9AL5KR96avUcSXzs-HkA-avLW5l-duVbMvv';

    if (!this.discordWebhookUrl) {
      throw new Error("DISCORD_WEBHOOK_URL environment variable is required");
    }

    this.server = new Server(
      {
        name: "dev-assistant",
        version: "1.0.0",
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "commit_and_push",
          description: "Add, commit, and push changes with an AI-generated commit message",
          inputSchema: {
            type: "object",
            properties: {
              customMessage: {
                type: "string",
                description: "Optional custom commit message. If not provided, AI will generate one based on changes.",
              },
              branch: {
                type: "string",
                description: "Branch to push to (defaults to current branch)",
                default: "main",
              },
            },
            required: [],
          },
        },
        {
          name: "send_discord_notification",
          description: "Send a notification to Discord channel",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Message to send to Discord",
              },
              color: {
                type: "number",
                description: "Embed color (optional, defaults to green for success)",
                default: 5763719,
              },
            },
            required: ["message"],
          },
        },
        {
          name: "full_workflow",
          description: "Complete workflow: commit & push, and notify Discord",
          inputSchema: {
            type: "object",
            properties: {
              customMessage: {
                type: "string",
                description: "Optional custom commit message",
              },
              branch: {
                type: "string",
                description: "Branch to push to (if not mentioned default to main)",
                default: "main",
              },
            },
            required: [],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "commit_and_push":
            return await commitAndPushTool(this, args as any || {});
          case "send_discord_notification":
            return await sendNotificationTool(this, args as any || {});
          case "full_workflow":
            return await fullWorkflowTool(this, args as any || {});
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Dev Assistant MCP server running on stdio");
    console.log(`Project Path: ${this.projectPath}`);
    console.log(`Discord Webhook: ${this.discordWebhookUrl ? 'Configured' : 'Not configured'}`);
  }
}

const server = new DevAssistantServer();
server.run().catch(console.error);