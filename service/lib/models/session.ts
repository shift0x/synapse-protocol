import { Completion } from "../types";
import { IModel } from "./model";

export class Session {
    public context: string
    public history: Completion[]
    public cost: number

    constructor(context: string = "") {
        this.context = context;
        this.history = [];
        this.cost = 0;
    }

    async user(key: string, prompts: string | string[], model: IModel, history: Completion[] = this.history, args: any = {}) : Promise<Session> {
        const isArray = Array.isArray(prompts)
        const promptsToExecute : string[] = []

        if(!isArray) {
            promptsToExecute.push(prompts)
        } else {
            prompts.forEach(p => { promptsToExecute.push(p)})
        }

        for(var i = 0; i < promptsToExecute.length; i++){
            const prompt = promptsToExecute[i]
            const response = await model.execute(this.context, prompt, history, args)
            const completion = { key, prompt, model: model.id(), response }

            if(response.error){
                console.log(response.error)
            }

            this.cost += response.cost || 0;

            this.history.push(completion);
        }
        

        return this;
    }

    getResponses() : string[] {
        return this.history.map(h => {
            return h.response.output || ""
        })
    }

    getLastResponse() : string | undefined {
        if(this.history.length == 0) {
            return undefined
        }

        const last = this.history[this.history.length - 1];

        if(last.response.error){
            console.log(`response error: ${last.response.error}`)
        }

        return last.response.error ? undefined : last.response.output
    }

    store(){}
}