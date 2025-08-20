import { DefaultOpenAIModelArgs, OpenAIModel, OpenAIReasoningArgs } from "./openai";

const openAIKey = process.env.OPEN_AI_KEY || "";
const openAIPricingTable = {
    'gpt-4.1': { input: 2.0, output: 8.0 },
    'gpt-4.1-mini': { input: .4, output: 1.6 },
    'gpt-4.1-nano': { input: .1, output: .4},
    'o4-mini': { input: 1.1, output: 4.4 }
}

const gpt_4_1 = new OpenAIModel("gpt-4.1", true, openAIKey, openAIPricingTable, DefaultOpenAIModelArgs)
const gpt_4_1_nano = new OpenAIModel("gpt-4.1-nano", true, openAIKey, openAIPricingTable, DefaultOpenAIModelArgs)
const gpt_4_1_mini = new OpenAIModel("gpt-4.1-mini", true, openAIKey, openAIPricingTable, DefaultOpenAIModelArgs)

const gpt_o4_mini_high = new OpenAIModel("o4-mini", false, openAIKey, openAIPricingTable, {
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