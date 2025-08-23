import fetch from "node-fetch";
export async function sendNotificationTool(server, args) {
    try {
        const { message, color = 5763719 } = args;
        if (!server.discordWebhookUrl) {
            throw new Error("Discord webhook URL is not configured");
        }
        const embed = {
            title: "🚀 Development Update",
            description: message,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: "Dev Assistant MCP",
            },
        };
        const response = await fetch(server.discordWebhookUrl, {
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
        return {
            content: [
                {
                    type: "text",
                    text: `✅ **Discord notification sent successfully!**`,
                },
            ],
        };
    }
    catch (error) {
        throw new Error(`Failed to send Discord notification: ${error.message}`);
    }
}
//# sourceMappingURL=send-notifications.js.map