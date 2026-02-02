---
name: strapi-engineering
description: Deep knowledge of Strapi CMS, including official docs and internal engineering patterns.
---

# Strapi Engineering Skill

This skill is the **Source of Truth** for all Backend/CMS development.

## Resources

- **Official Docs Audit**: `references/STRAPI_DOC/` (Contains local copies of key Strapi documentation)
- **Engineering Guides**: `references/strapi-engineering/`
- **Project Specifics**: `references/strapi/`

## Usage

**MANDATORY**: Before writing any Strapi code (Controllers, Services, Policies), you MUST consult `STRAPI_DOC` to avoid hallucinating APIs.

1.  Use `find_by_name` or `grep_search` within `references/STRAPI_DOC` to find the relevant API.
2.  Follow patterns in `references/strapi-engineering` for project-specific conventions.
