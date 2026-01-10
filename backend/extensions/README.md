# SQLite Vector Extension

This project uses the `sqlite-vector` extension for high-performance vector search in SQLite.
Since the extension requires a native binary that is not distributed via NPM for standard Node.js usage (without WASM), we manually manage the binary here.

## Instructions

1. Download the release for your platform from [https://github.com/sqliteai/sqlite-vector/releases](https://github.com/sqliteai/sqlite-vector/releases).
   - For macOS (ARM64/Apple Silicon), download `vector-macos-arm64.tar.gz` (or extract `vector.dylib` from the macOS package).
   - For Linux, download the corresponding `.so` file.
2. Place the `vector.dylib` (macOS) or `vector.so` (Linux) file in this directory (`backend/extensions/`).
3. Ensure it is named `vector.dylib` (macOS) or `vector.so` (Linux). The scripts are currently configured to look for `vector.dylib` on macOS.

## Testing

The `src/scripts/snapshot-to-sqlite.ts` script will verify the extension is loaded and initialize vector columns in the backup database.
