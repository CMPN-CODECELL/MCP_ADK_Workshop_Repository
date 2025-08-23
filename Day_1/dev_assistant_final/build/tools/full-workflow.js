import { commitAndPushTool } from "./commit-and-push.js";
import { sendNotificationTool } from "./send-notifications.js";
export async function fullWorkflowTool(server, args) {
    try {
        const { customMessage, branch = "main" } = args;
        // Execute commit and push
        const commitResult = await commitAndPushTool(server, { customMessage, branch });
        const commitText = commitResult.content[0].text;
        // Send Discord notification
        const notificationMessage = `**Project Updated!**\n\n${commitText}`;
        await sendNotificationTool(server, {
            message: notificationMessage,
            color: 3447003 // Blue color for workflow completion
        });
        return {
            content: [
                {
                    type: "text",
                    text: `🎉 **Full workflow completed successfully!**\n\n${commitText}\n\n✅ Discord notification sent!`,
                },
            ],
        };
    }
    catch (error) {
        try {
            // Send error notification to Discord
            await sendNotificationTool(server, {
                message: `❌ **Workflow Failed**: ${error.message}`,
                color: 15158332 // Red color for errors
            });
        }
        catch (discordError) {
            console.error("Failed to send error notification to Discord:", discordError);
        }
        throw error;
    }
}
//# sourceMappingURL=full-workflow.js.map