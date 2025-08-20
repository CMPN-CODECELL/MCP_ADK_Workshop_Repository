import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
	Props, 
	DiscordNotificationSchema,
	createErrorResponse,
	createSuccessResponse
} from "../types";

export function registerDiscordTools(server: McpServer, env: Env, props: Props) {
	// Tool: Send Discord Notification
	server.tool(
		"sendDiscordNotification",
		"Send a notification to Discord channel. Requires Discord webhook URL to be configured in environment or project setup. Creates rich embeds with user information and timestamps.",
		DiscordNotificationSchema,
		async ({ message, color = 5763719 }) => {
			try {
				const discordWebhookUrl = env.DISCORD_WEBHOOK_URL;
				
				if (!discordWebhookUrl) {
					return createErrorResponse(
						"Discord webhook URL not configured. Please set DISCORD_WEBHOOK_URL environment variable or configure it through setupProject."
					);
				}

				const embed = {
					title: "🚀 Development Update",
					description: message,
					color: color,
					timestamp: new Date().toISOString(),
					footer: {
						text: "Dev Assistant MCP",
					},
					author: {
						name: `${props.name} (@${props.login})`,
					},
				};

				const response = await fetch(discordWebhookUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						embeds: [embed],
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Discord API error: ${response.status} ${response.statusText} - ${errorText}`);
				}

				return createSuccessResponse(
					`✅ **Discord notification sent successfully!**\n\n**Message:** ${message}\n**Sent by:** ${props.name} (@${props.login})`
				);
			} catch (error: any) {
				console.error('sendDiscordNotification error:', error);
				return createErrorResponse(`Failed to send Discord notification: ${error.message}`);
			}
		}
	);

	// Tool: Send Custom Discord Embed
	server.tool(
		"sendCustomDiscordEmbed",
		"Send a custom Discord embed with advanced formatting options. Allows for more control over the embed appearance including title, description, fields, and colors.",
		{
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "Embed title",
				},
				description: {
					type: "string",
					description: "Embed description",
				},
				color: {
					type: "number",
					description: "Embed color (decimal color code)",
					default: 5763719,
				},
				fields: {
					type: "array",
					description: "Array of embed fields",
					items: {
						type: "object",
						properties: {
							name: { type: "string" },
							value: { type: "string" },
							inline: { type: "boolean", default: false },
						},
						required: ["name", "value"],
					},
				},
				imageUrl: {
					type: "string",
					description: "URL for embed image",
				},
				thumbnailUrl: {
					type: "string",
					description: "URL for embed thumbnail",
				},
			},
			required: ["title", "description"],
		} as const,
		async ({ title, description, color = 5763719, fields, imageUrl, thumbnailUrl }) => {
			try {
				const discordWebhookUrl = env.DISCORD_WEBHOOK_URL;
				
				if (!discordWebhookUrl) {
					return createErrorResponse(
						"Discord webhook URL not configured. Please set DISCORD_WEBHOOK_URL environment variable or configure it through setupProject."
					);
				}

				const embed: any = {
					title,
					description,
					color,
					timestamp: new Date().toISOString(),
					footer: {
						text: "Dev Assistant MCP",
					},
					author: {
						name: `${props.name} (@${props.login})`,
					},
				};

				// Add optional fields
				if (fields && fields.length > 0) {
					embed.fields = fields;
				}
				if (imageUrl) {
					embed.image = { url: imageUrl };
				}
				if (thumbnailUrl) {
					embed.thumbnail = { url: thumbnailUrl };
				}

				const response = await fetch(discordWebhookUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						embeds: [embed],
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Discord API error: ${response.status} ${response.statusText} - ${errorText}`);
				}

				return createSuccessResponse(
					`✅ **Custom Discord embed sent successfully!**\n\n**Title:** ${title}\n**Sent by:** ${props.name} (@${props.login})`
				);
			} catch (error: any) {
				console.error('sendCustomDiscordEmbed error:', error);
				return createErrorResponse(`Failed to send custom Discord embed: ${error.message}`);
			}
		}
	);

	// Tool: Send Discord Alert
	server.tool(
		"sendDiscordAlert",
		"Send urgent alerts or notifications to Discord with predefined styling for different alert types (success, warning, error, info).",
		{
			type: "object",
			properties: {
				message: {
					type: "string",
					description: "Alert message content",
				},
				alertType: {
					type: "string",
					description: "Type of alert",
					enum: ["success", "warning", "error", "info"],
					default: "info",
				},
				urgent: {
					type: "boolean",
					description: "Whether this is an urgent alert (adds @here mention)",
					default: false,
				},
			},
			required: ["message"],
		} as const,
		async ({ message, alertType = "info", urgent = false }) => {
			try {
				const discordWebhookUrl = env.DISCORD_WEBHOOK_URL;
				
				if (!discordWebhookUrl) {
					return createErrorResponse(
						"Discord webhook URL not configured. Please set DISCORD_WEBHOOK_URL environment variable or configure it through setupProject."
					);
				}

				// Define alert configurations
				const alertConfigs = {
					success: { title: "✅ Success Alert", color: 5763719, emoji: "✅" },
					warning: { title: "⚠️ Warning Alert", color: 16776960, emoji: "⚠️" },
					error: { title: "❌ Error Alert", color: 15158332, emoji: "❌" },
					info: { title: "ℹ️ Information Alert", color: 3447003, emoji: "ℹ️" }
				};

				const config = alertConfigs[alertType];
				
				const embed = {
					title: config.title,
					description: `${config.emoji} ${message}`,
					color: config.color,
					timestamp: new Date().toISOString(),
					footer: {
						text: "Dev Assistant MCP Alert System",
					},
					author: {
						name: `${props.name} (@${props.login})`,
					},
				};

				const payload: any = {
					embeds: [embed],
				};

				// Add @here mention for urgent alerts
				if (urgent) {
					payload.content = "@here";
				}

				const response = await fetch(discordWebhookUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Discord API error: ${response.status} ${response.statusText} - ${errorText}`);
				}

				return createSuccessResponse(
					`✅ **Discord ${alertType} alert sent successfully!**\n\n**Message:** ${message}\n**Urgent:** ${urgent ? 'Yes' : 'No'}\n**Sent by:** ${props.name} (@${props.login})`
				);
			} catch (error: any) {
				console.error('sendDiscordAlert error:', error);
				return createErrorResponse(`Failed to send Discord alert: ${error.message}`);
			}
		}
	);
}