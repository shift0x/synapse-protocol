
import { createMcpHandler } from '@vercel/mcp-adapter';

import getExpertKnowledge from '../tools/get-expert-knowledge';

const handler = createMcpHandler(server => {
  server.tool(
    getExpertKnowledge.name,
    getExpertKnowledge.description,
    getExpertKnowledge.schema,
    async ({ query }) => {
        return getExpertKnowledge.callback(query);
    }
  );
});

export { handler as GET, handler as POST, handler as DELETE };