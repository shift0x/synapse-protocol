import { OpenAI } from "openai";
import { Completion, PromptResponse } from "../types";

export const DefaultOpenAIModelArgs = {
    temperature: 1,
    top_p: 1,
}

export const OpenAIReasoningArgs = (effort: string) => {
    return   {
        response_format: { "type": "text" },
        reasoning_effort: effort
    }
} 

export const OpenAIJsonFormatArgs = () => {
    return {
        text: {
            format: {
                type: "json_object"
            }
        }
    }
}

export class OpenAIModel {
    private _id : string
    private client : OpenAI
    private _supportsMaxTokens : boolean
    private _defaultModelArgs : any
    private _pricingTable : any

    constructor(id: string, supportsMaxTokens: boolean, apiKey: string, pricingTable: any, defaultModelArgs: any = {}, url: string | undefined = undefined){
        this._id = id;
        this._supportsMaxTokens = supportsMaxTokens;
        this._defaultModelArgs = defaultModelArgs;
        this._pricingTable = pricingTable;

        const args : any = {
            apiKey
        }

        if(url)
            args.baseURL = url

        this.client = new OpenAI(args);
    }

    id() : string {
        return this._id
    }

    async execute(context: string, prompt: string, history: Completion[], args: any = {}) : Promise<PromptResponse> {
        const messages : any[] = []
        
        if(context.trim().length > 0){
            let role = "system"

            messages.push({ role: role, content: context})
        }

        history.forEach(completion => {
            if(!completion.response.error) {
                messages.push({ role: "user", content: completion.prompt })
                messages.push({ role: "assistant", content: completion.response.output })
            }
        })
        
        try {
            const msg : any = {
                model: this._id,
                messages: [
                    ...messages,
                    { role: "user", content: prompt}
                ],
                ...this._defaultModelArgs,
                ...args
            }

            if(this._supportsMaxTokens) {
                msg.max_tokens = 10000
            } else {
                msg.max_completion_tokens = 10000
            }

            const chatCompletion = await this.client.chat.completions.create(msg)

            if(!chatCompletion.usage){
                throw "incomplete response"
            }

            const message = chatCompletion.choices[0]
            const oneMillion = 1000000
            const pricingTable = this._pricingTable[this._id]

            if(!pricingTable){
                throw "undefined model pricing"
            }

            const inputTokenCost = (chatCompletion.usage.prompt_tokens / oneMillion) * pricingTable.input
            const outputTokenCost = (chatCompletion.usage.completion_tokens / oneMillion) * pricingTable.output
            const cost = inputTokenCost + outputTokenCost;
    
            return {
                error: undefined,
                output: message.message.content as string,
                tokens: chatCompletion.usage?.total_tokens as number,
                cost: cost
            }
        } catch( err: any) {

            return {
                error: err.message,
            }

        }
    }

    async embed(content: string) : Promise<number[] | null> {
        try {
            const response = await this.client.embeddings.create({
              model: "text-embedding-ada-002", 
              input: content
            });
        
            return response.data
                .map(item => item.embedding)
                .flat();

          } catch (error) {
            console.error('Error generating embeddings:', error);

            return null;
          }
    }
}