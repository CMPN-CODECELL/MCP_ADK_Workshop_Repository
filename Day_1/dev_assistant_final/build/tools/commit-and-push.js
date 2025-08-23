import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
async function generateCommitMessage(changes) {
    const lines = changes.split('\n');
    const hasNewFiles = lines.some(line => line.startsWith('A') || line.startsWith('??'));
    const hasModifiedFiles = lines.some(line => line.startsWith(' M') || line.startsWith('M'));
    const hasDeletedFiles = lines.some(line => line.startsWith(' D') || line.startsWith('D'));
    const fileCount = lines.filter(line => line.trim()).length;
    let message = "";
    if (hasNewFiles && hasModifiedFiles) {
        message = `feat: add new features and update existing functionality`;
    }
    else if (hasNewFiles) {
        message = `feat: add new files and functionality`;
    }
    else if (hasModifiedFiles) {
        message = `update: modify existing functionality`;
    }
    else if (hasDeletedFiles) {
        message = `chore: update project files`;
    }
    else {
        message = `chore: update project files`;
    }
    if (fileCount > 1) {
        message += ` (${fileCount} files)`;
    }
    return message;
}
export async function commitAndPushTool(server, args) {
    try {
        const { customMessage, branch = "main" } = args;
        // Check if there are changes
        const { stdout: status } = await execAsync("git status --porcelain", {
            cwd: server.projectPath,
            shell: process.platform === "win32" ? "cmd.exe" : undefined
        });
        if (!status.trim()) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No changes to commit."
                    },
                ],
            };
        }
        // Add all changes
        await execAsync("git add .", {
            cwd: server.projectPath,
            shell: process.platform === "win32" ? "cmd.exe" : undefined
        });
        // Generate or use custom commit message
        const commitMessage = customMessage || await generateCommitMessage(status);
        // Commit changes
        await execAsync(`git commit -m "${commitMessage}"`, {
            cwd: server.projectPath,
            shell: process.platform === "win32" ? "cmd.exe" : undefined
        });
        // Push to remote
        const { stdout: pushOutput } = await execAsync(`git push -u origin ${branch}`, {
            cwd: server.projectPath,
            shell: process.platform === "win32" ? "cmd.exe" : undefined
        });
        return {
            content: [
                {
                    type: "text",
                    text: `✅ **Successfully committed and pushed!**\n\n**Commit Message:** ${commitMessage}\n**Branch:** ${branch}\n\n**Git Output:**\n${pushOutput}`,
                },
            ],
        };
    }
    catch (error) {
        throw new Error(`Failed to commit and push changes: ${error.message}`);
    }
}
//# sourceMappingURL=commit-and-push.js.map