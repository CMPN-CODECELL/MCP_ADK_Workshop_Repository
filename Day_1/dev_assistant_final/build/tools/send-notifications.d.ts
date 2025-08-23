import type { DevAssistantServer } from "../index.js";
interface SendNotificationArgs {
    message: string;
    color?: number;
}
export declare function sendNotificationTool(server: DevAssistantServer, args: SendNotificationArgs): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=send-notifications.d.ts.map