# GitHub Copilot Instructions

## WebDAV Path Handling

1. The external WebDAV endpoint is configurable (e.g. `/webdav`). A request path such as `/webdav/aaa/bbb/ccc` means:
   - `/webdav` is the public WebDAV base path (can be changed).
   - `/aaa/bbb/ccc` is the file or folder path.

2. A WebDAV middleware must extract the subpath portion (`/aaa/bbb/ccc`) from the full request path (after removing the configurable base path) to make it available for adapters.

3. Adapters must combine the extracted subpath with their own `prefix` to produce the final storage path.
