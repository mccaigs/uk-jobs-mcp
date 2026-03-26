// ─────────────────────────────────────────────────────────────
// UK Jobs MCP — Server Entry Point
//
// The standard MCP interface for UK recruitment data.
// Built on @modelcontextprotocol/sdk v1.x + Zod v3.
// Transport: Streamable HTTP (stateless, remote-hosted).
//
// Public tools   — no auth required
// Candidate tools — requires candidate:read scope
// Recruiter tools — requires recruiter:read / recruiter:write scope
// ─────────────────────────────────────────────────────────────

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "node:http";

import { buildProtectedResourceMetadata } from "./auth.js";
import { registerPublicTools }    from "./tools/public.js";
import { registerCandidateTools } from "./tools/candidate.js";
import { registerRecruiterTools } from "./tools/recruiter.js";

const BASE_URL = process.env.BASE_URL ?? "https://mcp.careersai.co.uk";
const PORT     = parseInt(process.env.PORT ?? "3000", 10);

// ── MCP Server ────────────────────────────────────────────────
const server = new McpServer({
  name:    "uk-jobs-mcp",
  version: "1.0.0",
});

registerPublicTools(server);
registerCandidateTools(server);
registerRecruiterTools(server);

// ── Transport ─────────────────────────────────────────────────
// Stateless — no session state kept on the server.
// Each request is self-contained. Simpler to scale horizontally.
// Switch sessionIdGenerator to a real UUID function when you
// need resumable sessions or SSE streaming.
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,  // stateless mode
  enableJsonResponse:  true,      // JSON-only responses, no SSE for now
});

await server.connect(transport);

// ── HTTP Server ───────────────────────────────────────────────
const httpServer = http.createServer(async (req, res) => {
  const url = req.url ?? "/";

  // ── MCP endpoint ─────────────────────────────────────────
  if (req.method === "POST" && url === "/mcp") {
    await transport.handleRequest(req, res);
    return;
  }

  // ── GET /mcp — explain the endpoint ──────────────────────
  if (req.method === "GET" && url === "/mcp") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "UK Jobs MCP endpoint. Send POST requests with JSON-RPC 2.0 payloads.",
      docs:    `${BASE_URL}/.well-known/mcp.json`,
    }));
    return;
  }

  // ── OAuth 2.1 Protected Resource Metadata ────────────────
  // MCP clients fetch this after receiving a 401 to discover
  // where your auth server lives and what scopes are supported.
  if (url === "/.well-known/oauth-protected-resource") {
    res.writeHead(200, {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(buildProtectedResourceMetadata(BASE_URL)));
    return;
  }

  // ── Human-readable discovery ──────────────────────────────
  // Aggregators and developers use this to understand the server
  // without making a live MCP connection.
  if (url === "/.well-known/mcp.json") {
    res.writeHead(200, {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({
      name:        "uk-jobs-mcp",
      version:     "1.0.0",
      description: "The standard MCP interface for UK recruitment data — jobs, market intelligence, and candidate availability.",
      vendor:      "CareersAI",
      homepage:    "https://github.com/careersai/uk-jobs-mcp",
      endpoint:    `${BASE_URL}/mcp`,
      regions:     ["GB"],
      categories:  ["recruitment", "jobs", "careers", "hr"],
      tools: {
        public: [
          "search_jobs",
          "get_job_detail",
          "get_market_rates",
          "get_skills_demand",
        ],
        candidate: [
          "get_candidate_availability",
          "update_availability",
        ],
        recruiter: [
          "post_job",
          "search_available_candidates",
        ],
      },
      auth: {
        type:   "oauth2",
        flows:  ["authorization_code"],
        pkce:   true,
        scopes: {
          "public":           "Read-only access to job listings and market data. No login required.",
          "candidate:read":   "Read a candidate's availability and work preferences.",
          "recruiter:read":   "Search available candidates.",
          "recruiter:write":  "Post and manage job listings.",
        },
        protected_resource_metadata: `${BASE_URL}/.well-known/oauth-protected-resource`,
      },
    }));
    return;
  }

  // ── Health check ──────────────────────────────────────────
  if (url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", version: "1.0.0" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

httpServer.listen(PORT, () => {
  console.error(`uk-jobs-mcp listening on port ${PORT}`);
  console.error(`MCP endpoint:   ${BASE_URL}/mcp`);
  console.error(`Discovery:      ${BASE_URL}/.well-known/mcp.json`);
  console.error(`Auth metadata:  ${BASE_URL}/.well-known/oauth-protected-resource`);
  console.error(`Health:         ${BASE_URL}/health`);
});
