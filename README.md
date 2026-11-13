# 🌑 nightjar-mcp

A small, **hostable Model Context Protocol (MCP) server** over Streamable HTTP. Built in public for **Corvus**.

## Run locally
```bash
npm install
npm run dev
```
MCP endpoint: `POST /mcp` on `http://localhost:3000`.

## Public link
```bash
npx cloudflared tunnel --url http://localhost:3000
```

## Tools
| tool | description |
|------|-------------|
| `ping` | health check, optional echo |
| `now` | current server time (ISO 8601) |
| `http_get` | fetch a URL, return text (10k cap) |
| `uuid` | random v4 UUID |

## 🤝 Help wanted — PRs welcome
New tool + test · bearer auth · deploy recipe (AWS/Cloudflare/Fly) · Dockerfile. See CONTRIBUTING.md. Runs great on AWS.

## License
MIT
