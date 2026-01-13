---
description: Purpose: To automate the identification and removal of redundant, large, or stale log files across the workspace. This improves DevX by freeing up disk space, reducing "noise" in search results, and preventing the IDE from indexing irrelevant text da
---

# Workflow: Clean Workspace Logs

**Description:** Scans the project for unnecessary log files, clears them, and suggests logging configuration improvements to prevent future clutter.

## Steps

### 1. Identify Log Sources

Ask the agent to:

- Scan the root and common directories (e.g., `/logs`, `/tmp`, `/build`, `/node_modules`, `/storage/logs`) for files ending in `.log`, `.out`, or `.err`.
- Identify any hidden or system-generated logs that are not ignored by `.gitignore`.

### 2. Analyze and Filter

Instruct the agent to:

- List files larger than 10MB or older than 7 days.
- Differentiate between "Active" logs (currently being written to) and "Stale" logs (historical).
- _Safety Check:_ Present a list of files to the user for approval before deletion.

### 3. Execution (The Cleanup)

For approved files, the agent should:

- Truncate active logs (to keep the file descriptor open but clear the content) using `truncate -s 0 [filename]`.
- Delete stale or rotated logs (e.g., `app.log.1`, `laravel-2023.log`).
- Clear common package manager caches or build logs if they are excessive.

### 4. DevX Optimization (Noise Reduction)

The agent should check the project configuration and suggest:

- Adding log directories to `.gitignore` if they are missing.
- Adding log paths to `.vscode/settings.json` under `files.exclude` and `search.exclude` so they don't pollute the UI.
- Suggesting a "Log Level" downgrade in `.env` or config files (e.g., changing `DEBUG` to `INFO`) if the logs are high-frequency and low-value.

### 5. Verification

- Report the total disk space recovered.
- Confirm that no critical application files were touched.
