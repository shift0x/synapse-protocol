import { Completion, PromptResponse } from "../../types";

export interface IModel {
    id() : string;
    execute(context: string, prompt: string, history: Completion[], args: any) : Promise<PromptResponse>;
}

