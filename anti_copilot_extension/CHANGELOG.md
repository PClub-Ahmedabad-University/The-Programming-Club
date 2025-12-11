# Change Log

All notable changes to the "anti-copilot" extension.

## [0.0.1] - 2025-12-11

### Added
- **User Registration System**
  - First-launch registration flow (Name, Roll Number, Clan, Leader)
  - Machine ID-based unique identification
  - Server-synced registration data

- **Ultra-Aggressive Copilot Enforcement**
  - 50ms monitoring interval for instant enforcement
  - Event-driven enforcement on text changes, editor changes, cursor moves
  - Multi-scope enforcement (Global, Workspace, WorkspaceFolder)
  - Disables all Copilot features: chat, inline, autocomplete, next-edit

- **Real-Time Server Tracking**
  - POST /api/anti-copilot/register endpoint integration
  - POST /api/anti-copilot/track for event logging
  - Tracks: enable, disable, bypass_attempt events
  - Automatic sync with backend API

- **Admin Dashboard Integration**
  - GET /api/anti-copilot/stats endpoint
  - DELETE endpoints for users and clans
  - Real-time monitoring at https://pclub.vercel.app/admin/dashboard
  - Clan/Leader hierarchical organization
  - User status tracking (Copilot ON/OFF)

- **Visual Indicators**
  - Red status bar = Anti-Copilot ACTIVE (compliant)
  - Green status bar = Anti-Copilot OFF (violation)
  - Always visible status bar icon

- **Command Palette Commands**
  - `Anti Copilot: Toggle ON/OFF`
  - `Anti Copilot: Enable`
  - `Anti Copilot: Disable`

### Technical Details
- Settings enforced:
  - `github.copilot.enable`
  - `github.copilot.inlineSuggest.enable`
  - `editor.inlineSuggest.enabled`
  - `github.copilot.editor.enableAutoCompletions`
  - `github.copilot.nextEditSuggestions.enabled`

- Monitoring events:
  - `onDidChangeTextDocument`
  - `onDidChangeActiveTextEditor`
  - `onDidChangeTextEditorSelection`
  - `onDidChangeConfiguration`

- Data persistence:
  - GlobalState for local storage
  - MongoDB for server storage
  - JWT authentication for admin endpoints

### Fixed
- Status bar visibility during registration flow
- Inline suggestions appearing briefly (reduced to <50ms)
- Configuration enforcement across all scopes
- TypeScript compilation warnings

### Security
- Machine ID-based unique identification
- Server-side authentication for admin operations
- Bypass attempt detection and logging
- Local + server data redundancy

---

## Future Enhancements (Planned)

- [ ] Re-registration command for updating user details
- [ ] Offline mode with queue sync
- [ ] Custom enforcement intervals per clan
- [ ] Weekly compliance reports
- [ ] Leaderboard for most compliant clans
- [ ] Browser-based config panel