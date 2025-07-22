import { createMcpHandler } from "mcp-handler";

import getExpertKnowledge from '../tools/get-expert-knowledge'

const handler = createMcpHandler((server) => {
  server.tool(
    getExpertKnowledge.name,
    getExpertKnowledge.description,
    getExpertKnowledge.schema,
    async ({ query }) => getExpertKnowledge.callback(query));
});

export { handler as GET, handler as POST, handler as DELETE };
