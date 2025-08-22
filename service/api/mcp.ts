import { createMcpHandler, withMcpAuth } from "mcp-handler";

import getExpertInterviews from '../tools/get-expert-interviews'
import { authenticate } from "../lib/auth/authenticate";

const handler = createMcpHandler((server) => {
  server.tool(
    getExpertInterviews.name,
    getExpertInterviews.description,
    getExpertInterviews.schema,
    async ({ query }, extra) => getExpertInterviews.callback(query, extra.authInfo));
});

const verifyToken = async (
  req: Request,
  bearerToken?: string
): Promise<any | undefined> => {
  if (!bearerToken) return undefined;

  const { error: authError, account } = await authenticate(bearerToken) 

  if (authError) return undefined;

  return {
    token: bearerToken,
    extra: {
      account,
    },
  };
};

// Make authorization required
const authHandler = withMcpAuth(handler, verifyToken, {
  required: true, // Make auth required for all requests
});

export { authHandler as GET, authHandler as POST };