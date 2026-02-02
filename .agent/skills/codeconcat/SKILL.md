---
name: codeconcat
description: Uses the codeconcat tool to generate context files from the codebase.
---

# CodeConcat Skill

Use this skill when the user asks to "get context", "bundle code", "concatenate files", or "prepare a prompt" from a directory.

## Instructions

The `codeconcat` tool is available in the environment. It turns directory structures into a single Markdown file optimized for LLMs.

### Usage

**Basic:**

```bash
codeconcat [source_path] [output_file.md]
```

**With Options:**

- `--no-gitignore`: Include ignored files (use carefully).
- `--force-include ".env"`: Force specific files.
- `--stdout`: Output to console (good for small reads, bad for huge repos).

### Examples

- **"Get me context for the src folder"**
  - `codeconcat src/ context_src.md`
- **"Bundle the plugin architecture"**
  - `codeconcat src/plugins/my-plugin context_plugin.md`

### Output Handling

- After running, specific the full path of the created artifact to the user so they can reference it.
- If the output is small enough, you can read it immediately with `view_file`.
