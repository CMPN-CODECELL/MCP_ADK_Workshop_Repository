import type { DevAssistantServer } from "../index.js";
interface CommitAndPushArgs {
    customMessage?: string;
    branch?: string;
}
export declare function commitAndPushTool(server: DevAssistantServer, args: CommitAndPushArgs): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=commit-and-push.d.ts.map