import type { DevAssistantServer } from "../index.js";
interface FullWorkflowArgs {
    customMessage?: string;
    branch?: string;
}
export declare function fullWorkflowTool(server: DevAssistantServer, args: FullWorkflowArgs): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=full-workflow.d.ts.map