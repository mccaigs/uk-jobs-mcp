# uk-jobs-mcp

**The standard MCP interface for UK recruitment data.**

An open MCP server that gives any AI assistant structured access to UK job listings, market intelligence, and candidate availability — using a common, platform-neutral schema.

Built on the [Model Context Protocol](https://modelcontextprotocol.io) by [David Robertson](https://www.linkedin.com/in/daverobertson4/).

---

## Why I built this

I've spent more hours than I care to admit filling in the same information on job platforms over and over again.

Name. Location. Skills. Rate. Availability. Notice period. Preferred work mode. Contract or permanent. PAYE or outside IR35.

And every single platform asks for all of it, every time.

It's 2026. AI assistants can book restaurants, manage calendars, and write code — but somehow job hunting still means manually re-keying your entire professional history into another identical form, on another identical platform, for the fifth time this week.

MCP changes that. A candidate should be able to store their profile once and have any AI assistant — Claude, ChatGPT, Cursor, whatever comes next — read it and fill in any application form automatically. No re-keying. No copy-pasting. No wasted afternoon.

But for that to work, job platforms need to speak a common language. This is my attempt to define that language for the UK market.

If you've ever sworn at a job board's profile page, this is for you.

— [David Robertson](https://www.linkedin.com/in/daverobertson4/)

---

## What this is

`uk-jobs-mcp` defines a standard interface for UK recruitment data exchange. Any AI assistant that supports MCP can connect to it and immediately:

- Search UK job listings with rich filters
- Retrieve structured job records
- Get live market rate and salary data
- Look up in-demand skills by region and role area
- Read a candidate's availability and work preferences (with auth)
- Post jobs and search available candidates (with auth)

This is a **generic standard** — not tied to any one platform's proprietary data or algorithms. Any UK job board, ATS, or recruitment platform can implement the same interface over their own data.

---

## Tools

### Public — no authentication required

| Tool | Description |
|---|---|
| `search_jobs` | Search UK jobs by keyword, location, type, seniority, and pay |
| `get_job_detail` | Get the full structured record for a job by ID |
| `get_market_rates` | Current salary and day rate data by role, seniority, and region |
| `get_skills_demand` | Most in-demand skills with job counts and trend direction |

### Candidate — requires `candidate:read` scope

| Tool | Description |
|---|---|
| `get_candidate_availability` | Read availability status and work preferences |
| `update_availability` | Update availability status and start date |

### Recruiter — requires `recruiter:read` or `recruiter:write` scope

| Tool | Description |
|---|---|
| `post_job` | Create a new job listing |
| `search_available_candidates` | Search for candidates who have made availability public |

---

## Connecting to this server

A hosted public instance is coming soon. In the meantime, clone the repo and run it locally against your own data source.

### Running locally

```bash
npm install
npm run dev
```

The server starts on port 3000 by default.

```
POST http://localhost:3000/mcp
GET  http://localhost:3000/.well-known/mcp.json
GET  http://localhost:3000/.well-known/oauth-protected-resource
GET  http://localhost:3000/health
```

Test with the MCP Inspector:

```bash
npm run inspector
```

### Claude Desktop (local)

Once running locally, add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uk-jobs": {
      "command": "npx",
      "args": ["-y", "uk-jobs-mcp"]
    }
  }
}
```

### Deploying your own hosted instance

Fork this repo, replace the stubs in `src/tools/` with queries to your own data source, and deploy to your platform of choice. Set the `BASE_URL` environment variable to your domain — the discovery endpoints and auth metadata will advertise it automatically.

```bash
BASE_URL=https://your-domain.com npm start
```

---

## Authentication

Public tools require no authentication.

Protected tools use OAuth 2.1 with PKCE. When an unauthenticated request reaches a protected tool, the server returns:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="uk-jobs-mcp",
  resource_metadata="https://your-domain.com/.well-known/oauth-protected-resource"
```

The client fetches the Protected Resource Metadata document to discover the authorisation server and available scopes, then completes a standard PKCE flow.

### Scopes

| Scope | Access |
|---|---|
| `public` | Job search and market data — no login required |
| `candidate:read` | Candidate availability and preferences |
| `recruiter:read` | Search available candidates |
| `recruiter:write` | Post and manage jobs |

---

## Implementing this standard

This MCP defines a schema, not an implementation. If you run a UK job board or recruitment platform and want to expose your data through the same interface, you can:

1. Fork this repo
2. Replace the stub functions in `src/tools/` with queries to your own data store
3. Deploy your own instance
4. Point your MCP discovery endpoint at it

The schema in `src/types.ts` is the canonical field definition. Contributions to improve or extend the standard are welcome via pull request.

---

## Built with uk-jobs-mcp?

If you've implemented this standard on your platform, or built something using it, open a PR to add yourself here.

---

## Stack

- [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) v1.x
- TypeScript
- Zod v3
- Node.js HTTP (Streamable HTTP transport, stateless)

---

## Licence

MIT
