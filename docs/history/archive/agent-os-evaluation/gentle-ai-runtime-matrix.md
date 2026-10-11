# Gentle-AI runtime matrix

FACT from this machine unless marked otherwise. "Supported" means the official installer or `engram setup` names the agent. It does not mean this repo was verified on that runtime.

| Runtime | Config mechanism observed | Native skills | MCP | Review | Engram | Status here |
| --- | --- | --- | --- | --- | --- | --- |
| Cursor | `~/.cursor/mcp.json`, `.cursor/` adapter | Skills copied under `~/.cursor/skills` and project `.cursor/skills` | VERIFIED Engram handshake previously; Context7 lookup VERIFIED | Guidance only. No `review assess`. `review start` not run | Read VERIFIED. Write UNAVAILABLE (sqlite 14) | Current adapter |
| OpenCode | `opencode.json` plus `state.json` `installed_agents` includes opencode | Gentle-AI skills on disk | Local `engram mcp --tools=agent --project miayudatics` | Same CLI | Same DB | Installed, not exercised this pass. Duplicate binaries: `~/.gentle-ai/bin/opencode.cmd` and npm `opencode.cmd` |
| Claude Code | `engram setup` lists `claude-code` | Skill files if the installer linked them | setup command exists | CLI is runtime-agnostic | setup command exists | Not installed in this verification |
| Codex | `engram setup` lists `codex` | UNKNOWN | setup exists | CLI | setup exists | Not verified |
| Antigravity | `engram setup` lists `antigravity-cli` | UNKNOWN | setup exists | CLI | setup exists | Not installed here |
| Gemini CLI | `engram setup` lists `gemini-cli` | UNKNOWN | setup exists | CLI | setup exists | Not verified |
| Kilo, Kimi, Qwen, Kiro, Windsurf | Qwen and Kiro appear in `engram setup`. Others named by Gentle-AI docs, not proven on this host | UNKNOWN | UNKNOWN | CLI if Gentle-AI is installed | UNKNOWN | SUPPORTED-BUT-NOT-AVAILABLE on this host |
| OpenClaw, Trae, Pi, Hermes, Conductor | Pi is in `engram setup`. Others not observed on this host | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN / not installed |

Portable pieces that must stay identical across adapters:

- `docs/` product and architecture
- domain rules in the repo, not inside one IDE
- `@miayuda/contracts` and application code
- Engram project name `miayudatics` (do not silently merge `miayudatics_v1.0`)
- skill source of truth: project skill files plus the Gentle-AI registry, not a Cursor-only copy

Adapter-only pieces:

- `.cursor/rules`, `.cursor/agents`, `.cursor/hooks.json`
- `opencode.json`
- persona and model picks in the IDE
