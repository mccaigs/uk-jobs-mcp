// ─────────────────────────────────────────────────────────────
// UK Jobs MCP — Auth Middleware
//
// OAuth 2.1 aligned. The flow:
//   1. Unauthenticated request arrives
//   2. Server returns 401 + WWW-Authenticate pointing to PRM doc
//   3. Client fetches /.well-known/oauth-protected-resource
//   4. Client discovers auth server, completes PKCE flow
//   5. Client sends Bearer token on subsequent requests
//
// For STDIO transport (local), auth is handled by the host
// environment — env vars or the spawning process.
// ─────────────────────────────────────────────────────────────

import type { IncomingMessage, ServerResponse } from "node:http";

export const SCOPES = {
  PUBLIC:           "public",
  CANDIDATE_READ:   "candidate:read",
  RECRUITER_READ:   "recruiter:read",
  RECRUITER_WRITE:  "recruiter:write",
} as const;

export type Scope = typeof SCOPES[keyof typeof SCOPES];

export interface AuthContext {
  userId:   string;
  role:     "candidate" | "recruiter" | "admin";
  scopes:   Scope[];
}

// Protected Resource Metadata document.
// Served at /.well-known/oauth-protected-resource.
// MCP clients discover this after receiving a 401.
export function buildProtectedResourceMetadata(baseUrl: string) {
  return {
    resource:                     `${baseUrl}/mcp`,
    authorization_servers:        [`${baseUrl.replace("mcp.", "auth.")}`],
    scopes_supported:             Object.values(SCOPES),
    bearer_methods_supported:     ["header"],
    resource_documentation:       `${baseUrl}/.well-known/mcp.json`,
  };
}

// Extract and validate a bearer token from an incoming request.
// Returns null and writes the appropriate error response if invalid.
export async function extractAuth(
  req:            IncomingMessage,
  res:            ServerResponse,
  requiredScope:  Scope,
  baseUrl:        string,
): Promise<AuthContext | null> {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    res.writeHead(401, {
      "WWW-Authenticate": [
        'Bearer realm="uk-jobs-mcp"',
        `resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
      ].join(", "),
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({
      error:   "unauthorized",
      message: "Bearer token required",
    }));
    return null;
  }

  const token = authHeader.slice(7);
  const ctx   = await verifyToken(token);

  if (!ctx) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_token", message: "Token is invalid or expired" }));
    return null;
  }

  if (!ctx.scopes.includes(requiredScope) && !ctx.scopes.includes(SCOPES.PUBLIC)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error:   "insufficient_scope",
      message: `Scope '${requiredScope}' required`,
    }));
    return null;
  }

  return ctx;
}

// ─────────────────────────────────────────────────────────────
// Replace this stub with real JWT verification.
//
// In production:
//   1. Decode the JWT header to get the key ID (kid)
//   2. Fetch the JWKS from your auth server
//   3. Verify the signature and expiry
//   4. Extract userId, role, and scopes from claims
// ─────────────────────────────────────────────────────────────
async function verifyToken(token: string): Promise<AuthContext | null> {
  void token;
  // TODO: implement JWT verification
  return null;
}
