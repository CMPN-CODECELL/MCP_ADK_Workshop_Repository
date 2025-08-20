export interface Props {
	login: string;
	name: string;
	projectPath?: string;
	discordWebhookUrl?: string;
}

export interface Env {
	DISCORD_WEBHOOK_URL: string;
	PROJECT_PATH?: string;
}

// Tool Schemas
export const CommitAndPushSchema = {
	type: "object",
	properties: {
		customMessage: {
			type: "string",
			description: "Optional custom commit message. If not provided, AI will generate one based on changes.",
		},
		branch: {
			type: "string",
			description: "Branch to push to (defaults to main)",
			default: "main",
		},
		projectPath: {
			type: "string",
			description: "Project path to work with (optional, uses configured path if not provided)",
		},
	},
	required: [],
} as const;

export const DiscordNotificationSchema = {
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
} as const;

export const FullWorkflowSchema = {
	type: "object",
	properties: {
		customMessage: {
			type: "string",
			description: "Optional custom commit message",
		},
		branch: {
			type: "string",
			description: "Branch to push to (defaults to main)",
			default: "main",
		},
		projectPath: {
			type: "string",
			description: "Project path to work with (optional, uses configured path if not provided)",
		},
	},
	required: [],
} as const;

export const AnalyzeChangesSchema = {
	type: "object",
	properties: {
		projectPath: {
			type: "string",
			description: "Project path to analyze (optional, uses configured path if not provided)",
		},
	},
	required: [],
} as const;

export const SetupProjectSchema = {
	type: "object",
	properties: {
		projectPath: {
			type: "string",
			description: "Path to the project directory",
		},
		discordWebhookUrl: {
			type: "string",
			description: "Discord webhook URL for notifications (optional)",
		},
		gitRemoteUrl: {
			type: "string",
			description: "Git remote URL (optional, uses existing remote if not provided)",
		},
	},
	required: ["projectPath"],
} as const;

// Utility functions
export function createErrorResponse(message: string) {
	return {
		content: [
			{
				type: "text" as const,
				text: `❌ **Error:** ${message}`,
			},
		],
	};
}

export function createSuccessResponse(message: string) {
	return {
		content: [
			{
				type: "text" as const,
				text: message,
			},
		],
	};
}