# Environment Variables

## Development Tools

### `NEXT_PUBLIC_SHOW_DEVTOOLS`

Controls the visibility of development tools in the application.

**Default:** `false` (hidden)

**Options:**

- `true` - Shows both TanStack Query Devtools (bottom-right) and Next.js build indicator (bottom-left)
- `false` - Hides all development tools for a cleaner UI

**Usage:**

```bash
# In .env.local file
NEXT_PUBLIC_SHOW_DEVTOOLS=false
```

**When to enable:**

- During active development and debugging
- When you need to inspect React Query cache
- When troubleshooting build issues

**When to disable:**

- Taking screenshots or screen recordings
- Demos and presentations
- UI/UX review sessions
- When the indicators are distracting

**Affected Components:**

- TanStack Query Devtools button (bottom-right corner)
- Next.js build activity indicator (bottom-left corner)

---

## API Configuration

### `NEXT_PUBLIC_API_URL`

The base URL for the Mentara API backend.

**Development:** `http://localhost:10000`
**Production:** Set to your production API URL

---

## Future Environment Variables

Document additional environment variables here as they are added to the project.
