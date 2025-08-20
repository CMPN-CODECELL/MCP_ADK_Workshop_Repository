import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
	Props, 
	CommitAndPushSchema, 
	FullWorkflowSchema,
	AnalyzeChangesSchema,
	SetupProjectSchema,
	createErrorResponse,
	createSuccessResponse
} from "../types";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

// Configuration store
let projectConfig: {
	projectPath?: string;
	discordWebhookUrl?: string;
	gitRemoteUrl?: string;
} = {};

export function registerGitTools(server: McpServer, env: Env, props: Props) {
	// Initialize default config
	projectConfig = {
		projectPath: env.PROJECT_PATH || process.cwd(),
		discordWebhookUrl: env.DISCORD_WEBHOOK_URL,
	};

	// Tool 1: Setup Project - Configure project settings
	server.tool(
		"setupProject",
		"Configure project settings including path, Discord webhook, and git remote. This should be run first to set up the development environment.",
		SetupProjectSchema,
		async ({ projectPath, discordWebhookUrl, gitRemoteUrl }) => {
			try {
				// Update project config
				projectConfig.projectPath = projectPath;
				if (discordWebhookUrl) projectConfig.discordWebhookUrl = discordWebhookUrl;
				if (gitRemoteUrl) projectConfig.gitRemoteUrl = gitRemoteUrl;

				// Verify project path exists
				try {
					await fs.access(projectPath);
				} catch (error) {
					return createErrorResponse(`Project path does not exist: ${projectPath}`);
				}

				// Verify it's a git repository
				try {
					await execAsync("git status", { 
						cwd: projectPath,
						shell: process.platform === 'win32' ? 'cmd.exe' : undefined
					});
				} catch (error) {
					return createErrorResponse(`Not a git repository: ${projectPath}`);
				}

				return createSuccessResponse(
					`✅ **Project configured successfully!**\n\n**Project Path:** ${projectConfig.projectPath}\n**Discord Webhook:** ${projectConfig.discordWebhookUrl ? 'Configured' : 'Not configured'}\n**Git Remote:** ${projectConfig.gitRemoteUrl || 'Using existing remote'}`
				);
			} catch (error: any) {
				console.error('setupProject error:', error);
				return createErrorResponse(`Failed to setup project: ${error.message}`);
			}
		}
	);

	// Tool 2: Analyze Changes - Analyze current git changes
	server.tool(
		"analyzeChanges",
		"Analyze current git changes in the project. Shows status, diff preview, and summary of modifications. Use this to understand what changes will be committed.",
		AnalyzeChangesSchema,
		async ({ projectPath }) => {
			try {
				const workingPath = projectPath || projectConfig.projectPath;
				if (!workingPath) {
					return createErrorResponse("Project path not configured. Run setupProject first.");
				}

				// Get git status
				const { stdout: status } = await execAsync("git status --porcelain", {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				if (!status.trim()) {
					return createSuccessResponse("📊 **No changes detected in the project.**");
				}
				
				// Get detailed diff
				const { stdout: diff } = await execAsync("git diff HEAD", {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				// Get staged diff
				const { stdout: stagedDiff } = await execAsync("git diff --cached", {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				// Parse status for summary
				const statusLines = status.trim().split('\n');
				const summary = {
					modified: statusLines.filter(line => line.startsWith(' M') || line.startsWith('M')).length,
					added: statusLines.filter(line => line.startsWith('A') || line.startsWith('??')).length,
					deleted: statusLines.filter(line => line.startsWith(' D') || line.startsWith('D')).length,
					renamed: statusLines.filter(line => line.startsWith('R')).length,
				};

				const analysisText = `📊 **Project Changes Analysis**

**Summary:**
- Modified files: ${summary.modified}
- Added files: ${summary.added}
- Deleted files: ${summary.deleted}
- Renamed files: ${summary.renamed}

**Changed Files:**
\`\`\`
${statusLines.map(line => `  ${line}`).join('\n')}
\`\`\`

**Diff Preview:**
\`\`\`diff
${diff ? diff.substring(0, 1000) + (diff.length > 1000 ? '\n... (truncated)' : '') : 'No unstaged changes'}
\`\`\`

${stagedDiff ? `\n**Staged Changes:**\n\`\`\`diff\n${stagedDiff.substring(0, 500)}\n\`\`\`` : ''}`;

				return createSuccessResponse(analysisText);
			} catch (error: any) {
				console.error('analyzeChanges error:', error);
				return createErrorResponse(`Failed to analyze changes: ${error.message}`);
			}
		}
	);

	// Tool 3: Commit and Push - Git operations
	server.tool(
		"commitAndPush",
		"Add, commit, and push changes with an AI-generated or custom commit message. This tool will stage all changes, create a commit, and push to the specified branch.",
		CommitAndPushSchema,
		async ({ customMessage, branch = "main", projectPath }) => {
			try {
				const workingPath = projectPath || projectConfig.projectPath;
				if (!workingPath) {
					return createErrorResponse("Project path not configured. Run setupProject first.");
				}

				// Check if there are changes
				const { stdout: status } = await execAsync("git status --porcelain", {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				if (!status.trim()) {
					return createSuccessResponse("📝 **No changes to commit.**");
				}

				// Add all changes
				await execAsync("git add .", {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				// Generate or use custom commit message
				const commitMessage = customMessage || await generateCommitMessage(status);

				// Commit changes
				await execAsync(`git commit -m "${commitMessage}"`, {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				// Push to remote
				const { stdout: pushOutput } = await execAsync(`git push -u origin ${branch}`, {
					cwd: workingPath,
					shell: process.platform === 'win32' ? 'cmd.exe' : undefined
				});

				return createSuccessResponse(
					`✅ **Successfully committed and pushed!**\n\n**Commit Message:** ${commitMessage}\n**Branch:** ${branch}\n\n**Git Output:**\n\`\`\`\n${pushOutput}\n\`\`\``
				);
			} catch (error: any) {
				console.error('commitAndPush error:', error);
				return createErrorResponse(`Failed to commit and push changes: ${error.message}`);
			}
		}
	);

	// Tool 4: Full Workflow - Complete git workflow with Discord notification
	server.tool(
		"fullWorkflow",
		"Complete development workflow: commit & push changes, then notify Discord. This combines git operations with team notifications for a complete development cycle.",
		FullWorkflowSchema,
		async ({ customMessage, branch = "main", projectPath }) => {
			try {
				const workingPath = projectPath || projectConfig.projectPath;
				if (!workingPath) {
					return createErrorResponse("Project path not configured. Run setupProject first.");
				}

				// Execute commit and push
				const commitResult = await commitAndPushInternal({ customMessage, branch, projectPath: workingPath });
				
				if (commitResult.content[0].text.includes('❌')) {
					// If commit failed, return the error
					return commitResult;
				}

				const commitText = commitResult.content[0].text;
				
				// Send Discord notification if webhook is configured
				if (projectConfig.discordWebhookUrl) {
					try {
						const notificationMessage = `**Project Updated by ${props.name} (@${props.login})**\n\n${commitText}`;
						
						const embed = {
							title: "🚀 Development Update",
							description: notificationMessage,
							color: 3447003,
							timestamp: new Date().toISOString(),
							footer: {
								text: "Dev Assistant MCP",
							},
							author: {
								name: `${props.name} (@${props.login})`,
							},
						};

						const response = await fetch(projectConfig.discordWebhookUrl, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								embeds: [embed],
							}),
						});

						if (!response.ok) {
							throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
						}

						return createSuccessResponse(
							`🎉 **Full workflow completed successfully!**\n\n${commitText}\n\n✅ **Discord notification sent!**`
						);
					} catch (discordError: any) {
						// If Discord fails, still return success for git operation
						return createSuccessResponse(
							`✅ **Git operations completed successfully!**\n\n${commitText}\n\n⚠️ **Discord notification failed:** ${discordError.message}`
						);
					}
				} else {
					return createSuccessResponse(
						`✅ **Git operations completed successfully!**\n\n${commitText}\n\n💡 **Note:** Discord webhook not configured. Use setupProject to add Discord notifications.`
					);
				}
			} catch (error: any) {
				console.error('fullWorkflow error:', error);
				
				// Try to send error notification to Discord
				if (projectConfig.discordWebhookUrl) {
					try {
						const errorEmbed = {
							title: "❌ Workflow Failed",
							description: `**Error for ${props.name} (@${props.login}):** ${error.message}`,
							color: 15158332,
							timestamp: new Date().toISOString(),
							footer: {
								text: "Dev Assistant MCP",
							},
						};

						await fetch(projectConfig.discordWebhookUrl, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								embeds: [errorEmbed],
							}),
						});
					} catch (discordError) {
						console.error("Failed to send error notification to Discord:", discordError);
					}
				}

				return createErrorResponse(`Workflow failed: ${error.message}`);
			}
		}
	);
}

// Helper function to generate commit messages
async function generateCommitMessage(changes: string): Promise<string> {
	const lines = changes.split('\n');
	const hasNewFiles = lines.some(line => line.startsWith('A') || line.startsWith('??'));
	const hasModifiedFiles = lines.some(line => line.startsWith(' M') || line.startsWith('M'));
	const hasDeletedFiles = lines.some(line => line.startsWith(' D') || line.startsWith('D'));

	const fileCount = lines.filter(line => line.trim()).length;

	let message = "";

	if (hasNewFiles && hasModifiedFiles) {
		message = `feat: add new features and update existing functionality`;
	} else if (hasNewFiles) {
		message = `feat: add new files and functionality`;
	} else if (hasModifiedFiles) {
		message = `update: modify existing functionality`;
	} else if (hasDeletedFiles) {
		message = `chore: clean up project files`;
	} else {
		message = `chore: update project files`;
	}

	if (fileCount > 1) {
		message += ` (${fileCount} files)`;
	}

	return message;
}

// Internal helper for commit and push without error handling wrapper
async function commitAndPushInternal({ customMessage, branch = "main", projectPath }: { customMessage?: string, branch?: string, projectPath: string }) {
	// Check if there are changes
	const { stdout: status } = await execAsync("git status --porcelain", {
		cwd: projectPath,
		shell: process.platform === 'win32' ? 'cmd.exe' : undefined
	});

	if (!status.trim()) {
		return createSuccessResponse("📝 **No changes to commit.**");
	}

	// Add all changes
	await execAsync("git add .", {
		cwd: projectPath,
		shell: process.platform === 'win32' ? 'cmd.exe' : undefined
	});

	// Generate or use custom commit message
	const commitMessage = customMessage || await generateCommitMessage(status);

	// Commit changes
	await execAsync(`git commit -m "${commitMessage}"`, {
		cwd: projectPath,
		shell: process.platform === 'win32' ? 'cmd.exe' : undefined
	});

	// Push to remote
	const { stdout: pushOutput } = await execAsync(`git push -u origin ${branch}`, {
		cwd: projectPath,
		shell: process.platform === 'win32' ? 'cmd.exe' : undefined
	});

	return createSuccessResponse(
		`✅ **Successfully committed and pushed!**\n\n**Commit Message:** ${commitMessage}\n**Branch:** ${branch}\n\n**Git Output:**\n\`\`\`\n${pushOutput}\n\`\`\``
	);
}