import { createMcpHandler } from "mcp-handler";

import getExpertInterviews from '../tools/get-expert-interviews'

const handler = createMcpHandler((server) => {
  server.tool(
    getExpertInterviews.name,
    getExpertInterviews.description,
    getExpertInterviews.schema,
    async ({ query }) => getExpertInterviews.callback(query));
});

export { handler as GET, handler as POST, handler as DELETE };
