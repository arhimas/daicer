# Architecture Decision Log

## [2026-01-28] Centralized "Brain" Structure

**Decision**: Consolidated all loose documentation (`DEPS_DOCS`, `documentation/`) into a single `.agent/knowledge` hierarchy.
**Rationale**:

- Provides a single source of truth for the agent.
- Enables standard indexing via `llms.txt`.
- Separates "Working Memory" (task/context) from "Long-term Knowledge" (docs/refs).
- Aligns with SOTA "Documentation as Code" practices for semantic density.

## [2026-01-28] Domain Knowledge Integration

**Decision**: Ingested D&D 5e SRD as core Domain Knowledge.
**Rationale**: "Daicer" is a VTT/RPG tool; the agent must strictly adhere to 5e rules when generating game content.

## [2026-01-28] Agentic Architecture Mandate

**Decision**: Enforced "Thinking in LangGraph" patterns via Rule 08.
**Rationale**: Agents should build discrete, separated nodes (Functions) and manage raw state, avoiding monolithic procedural code.
