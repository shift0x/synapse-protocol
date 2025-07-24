import { DefaultOpenAIModelArgs, OpenAIModel, OpenAIReasoningArgs } from "./openai";

const openAIKey = process.env.OPEN_AI_KEY || "";

const gpt_4_1 = new OpenAIModel("gpt-4.1", true, openAIKey, DefaultOpenAIModelArgs)
const gpt_4_1_nano = new OpenAIModel("gpt-4.1-nano", true, openAIKey, DefaultOpenAIModelArgs)
const gpt_4_1_mini = new OpenAIModel("gpt-4.1-mini", true, openAIKey, DefaultOpenAIModelArgs)

const gpt_o4_mini_high = new OpenAIModel("o4-mini", false, openAIKey, {
    ...DefaultOpenAIModelArgs,
    ...OpenAIReasoningArgs("high")
})


export const MODEL_LIBRARY = {
    high: gpt_4_1,
    mini: gpt_4_1_mini,
    nano: gpt_4_1_nano,
    reasoning: gpt_o4_mini_high,
    embeddings: gpt_4_1
}