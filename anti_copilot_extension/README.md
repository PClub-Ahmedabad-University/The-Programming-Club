# Anti Copilot - Code of Conduct Enforcement Extension

A comprehensive VS Code extension that enforces GitHub Copilot compliance policies with user registration, real-time monitoring, and centralized dashboard tracking.

## Features

### 🔐 **User Registration System**
- First-time launch prompts users to register with:
  - Full Name
  - Roll Number
  - Clan/Team Name
  - Leader Name
- Unique machine identification for accurate tracking
- Registration data synced to central server

### 🛡️ **Ultra-Aggressive Copilot Enforcement**
- **Complete disabling** of all Copilot features when Anti-Copilot is enabled
- Blocks inline suggestions, chat, autocomplete, and next-edit suggestions
- Real-time enforcement with 50ms monitoring interval
- Event-driven enforcement on:
  - Text document changes
  - Editor changes
  - Cursor movement
  - Configuration changes

### 📊 **Real-Time Server Tracking**
- All toggle events (enable/disable) sent to central server
- Tracks user status changes with timestamps
- Bypass attempt detection and logging
- Persistent monitoring across sessions

### 🎯 **Admin Dashboard Integration**
- View all registered users organized by clan and leader
- Real-time status monitoring (Copilot ON/OFF)
- Delete individual users or entire clans
- Statistics: Total users, active compliance, violations, total clans
- Search and filter by name, roll number, status, clan, or leader

### 📱 **Visual Status Indicators**

- **🛡️ Red Background** = Anti Copilot is **ACTIVE** (Copilot disabled - compliant)
- **✅ Green Background** = Anti Copilot is **OFF** (Copilot enabled - violation)

## Installation & First Use

### Step 1: Install Extension
```bash
code --install-extension anti-copilot-0.0.1.vsix
```

### Step 2: First Launch Registration
Upon first activation, you'll be prompted to enter:
1. **Your Full Name**
2. **Roll Number**
3. **Clan/Team Name**
4. **Leader Name**

> **Note:** All fields are required. Registration is tied to your machine ID for uniqueness.

### Step 3: Activation
After registration, the extension automatically:
- Enables Anti-Copilot mode
- Displays red status bar indicator
- Sends registration to server (if connected)

## Usage

### Via Status Bar
Click the "Anti-Copilot" status bar item (bottom-right) to toggle on/off.

### Via Command Palette
Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux):
- `Anti Copilot: Toggle ON/OFF` - Toggle the extension
- `Anti Copilot: Enable` - Force enable (disable Copilot)
- `Anti Copilot: Disable` - Force disable (enable Copilot)

## Requirements

- Visual Studio Code v1.107.0 or higher
- GitHub Copilot extension (required for enforcement)
- Internet connection for server sync

## Backend Integration

The extension communicates with a Next.js backend API:

### API Endpoints
- `POST /api/anti-copilot/register` - User registration
- `POST /api/anti-copilot/track` - Event tracking
- `GET /api/anti-copilot/stats` - Dashboard statistics

### Environment Configuration
Backend API URL: `https://pclub.vercel.app`

## How It Works

### When Anti-Copilot is ENABLED (Compliant):
1. Forcibly disables ALL Copilot settings:
   - `github.copilot.enable` → `false`
   - `github.copilot.inlineSuggest.enable` → `false`
   - `editor.inlineSuggest.enabled` → `false`
   - `github.copilot.editor.enableAutoCompletions` → `false`
   - `github.copilot.nextEditSuggestions.enabled` → `false`
2. Enforces settings across Global, Workspace, and WorkspaceFolder scopes
3. Monitors continuously (50ms interval + event listeners)
4. Sends "enabled" event to server
5. Displays red status bar indicator

### When Anti-Copilot is DISABLED (Violation):
1. Stops enforcement monitoring
2. Sends "disabled" event to server (flags as violation)
3. Displays green status bar indicator
4. Copilot settings can be user-controlled

### Bypass Detection
Any attempt to manually re-enable Copilot while Anti-Copilot is active triggers:
- Immediate re-enforcement
- "bypass_attempt" event logged to server

## Admin Dashboard

Access the monitoring dashboard at: `https://pclub.vercel.app/admin/dashboard`

### Dashboard Features
- **Statistics Cards:**
  - Total registered users
  - Copilot OFF count (compliant users)
  - Copilot ON count (violations)
  - Total clans

- **Filters & Search:**
  - Search by name or roll number
  - Filter by status (Copilot ON/OFF)
  - Filter by clan
  - Filter by leader

- **User Management:**
  - View users organized by clan → leader → members
  - Delete individual users
  - Delete entire clans (bulk removal)
  - Real-time status updates (5-second refresh)

- **Status Colors:**
  - 🟢 Green badge = "Copilot OFF" (following CoC)
  - 🔴 Red badge = "Copilot ON" (violation)

## Technical Details

### Settings Enforced
All settings are enforced across Global, Workspace, and WorkspaceFolder levels:
```json
{
  "github.copilot.enable": false,
  "github.copilot.inlineSuggest.enable": false,
  "editor.inlineSuggest.enabled": false,
  "github.copilot.editor.enableAutoCompletions": false,
  "github.copilot.nextEditSuggestions.enabled": false
}
```

### Monitoring Strategy
- **Interval-based:** 50ms polling loop
- **Event-driven:** 
  - `onDidChangeTextDocument`
  - `onDidChangeActiveTextEditor`
  - `onDidChangeTextEditorSelection`
  - `onDidChangeConfiguration`

### Data Persistence
- User registration: GlobalState + MongoDB
- Current status: GlobalState + server sync
- Machine ID: `vscode.env.machineId`

## Troubleshooting

### Registration Issues
**Q: Registration prompt keeps appearing?**  
A: Check internet connection. Registration data is stored locally but needs server confirmation.

**Q: Can I change my registration details?**  
A: Contact your admin to update details via the dashboard.

### Enforcement Issues
**Q: Copilot still shows suggestions briefly?**  
A: Normal - enforcement runs every 50ms. Suggestions are removed within milliseconds.

**Q: Status bar disappeared?**  
A: Restart VS Code. Status bar is always visible, even during registration.

### Server Connection
**Q: "Will sync with server when available" message?**  
A: Backend API is unreachable. Extension continues working locally, will sync when connection is restored.

## Privacy & Data

### Data Collected
- Machine ID (unique identifier)
- Name, Roll Number, Clan, Leader Name
- Extension status (enabled/disabled)
- Toggle timestamps
- Bypass attempts

### Data Usage
- Compliance monitoring
- Code of Conduct enforcement
- Administrative oversight
- No personal files or code are collected

## Release Notes

### 0.0.1

Complete enforcement system:
- ✅ User registration on first launch
- ✅ Ultra-aggressive Copilot disabling (50ms + event listeners)
- ✅ Real-time server tracking
- ✅ Admin dashboard with clan/leader grouping
- ✅ User and clan deletion
- ✅ Bypass detection and logging
- ✅ Multi-scope enforcement (Global/Workspace/WorkspaceFolder)
- ✅ Status persistence across sessions

---

**Maintained by:** The Programming Club, Ahmedabad University  
**Support:** Contact your clan leader for assistance

**Enjoy!**
