Refer to the video guide.
<!-- # Anti Copilot - Installation & Setup Guide

## Prerequisites

- VS Code v1.107.0 or higher
- GitHub Copilot extension installed
- Internet connection for registration and server sync

## Installation Steps

### Step 1: Download Files

Download the extension package:
- `anti-copilot-0.0.1.vsix` (the extension)

Optionally download checksum for verification:
- `anti-copilot-0.0.1.vsix.sha256`

### Step 2: Verify Integrity (Recommended)

**On macOS/Linux:**
```bash
shasum -a 256 -c anti-copilot-0.0.1.vsix.sha256
```

**On Windows PowerShell:**
```powershell
certutil -hashfile anti-copilot-0.0.1.vsix SHA256
```

Compare output with expected checksum in the `.sha256` file.

### Step 3: Install Extension

**Option A: Via VS Code UI**
1. Open VS Code
2. Go to Extensions view (⌘+Shift+X or Ctrl+Shift+X)
3. Click "..." (three dots) menu in top-right
4. Select "Install from VSIX..."
5. Browse and select `anti-copilot-0.0.1.vsix`

**Option B: Via Command Line**
```bash
code --install-extension anti-copilot-0.0.1.vsix
```

### Step 4: First Launch Registration

After installation, open any file or folder in VS Code. You'll be prompted to register:

1. **Enter Your Full Name**
   - Example: "John Doe"
   
2. **Enter Roll Number**
   - Example: "AU2021001"
   
3. **Enter Clan/Team Name**
   - Example: "Web Warriors"
   - Note: Clan names are case-insensitive
   
4. **Enter Leader Name**
   - Example: "Jane Smith"
   - This is your clan/team leader

> **Important:** All fields are required. Registration cannot be skipped.

### Step 5: Verify Installation

After registration:
- ✅ Status bar (bottom-right) shows "Anti-Copilot" with red background
- ✅ Copilot suggestions should be completely disabled
- ✅ Console shows "Registration successful" (check Output → Anti-Copilot)

## Post-Installation

### Test the Extension

1. Try typing code - no Copilot suggestions should appear
2. Click the status bar item to toggle off (turns green)
3. Try typing code - Copilot suggestions should now work
4. Click status bar again to re-enable enforcement (turns red)

### Verify Server Connection

1. Open Command Palette (Cmd/Ctrl+Shift+P)
2. Type "Developer: Toggle Developer Tools"
3. Check Console for "Registration successful" or sync messages

If you see "will sync with server when available":
- Check your internet connection
- Verify backend API is accessible: https://pclub.vercel.app

## Configuration

### Backend API URL

The extension connects to: `https://pclub-au.vercel.app`

This is hardcoded in the extension. To change:
1. Edit `src/extension.ts`
2. Update `API_BASE_URL` constant
3. Rebuild: `npm run compile`
4. Repackage: `npm run package`

### Monitoring Interval

Default: 50ms enforcement interval

To adjust (not recommended):
1. Edit `src/extension.ts`
2. Find `setInterval(forceDisableCopilot, 50)`
3. Change interval value
4. Rebuild and repackage

## Admin Dashboard Access

Admins can monitor compliance at:
**https://pclub.vercel.app/admin/dashboard**

Dashboard features:
- View all registered users by clan and leader
- See real-time status (Copilot ON/OFF)
- Delete users or entire clans
- Filter and search users
- View statistics (total users, violations, clans)

## Troubleshooting

### Extension Not Appearing

**Problem:** No status bar item after installation

**Solution:**
1. Reload VS Code window (Cmd/Ctrl+Shift+P → "Reload Window")
2. Check Extensions view - ensure "Anti Copilot" is enabled
3. Check for conflicting extensions

### Registration Issues

**Problem:** Registration prompt won't appear

**Solution:**
1. Open Command Palette
2. Run "Anti Copilot: Enable"
3. Follow registration prompts

**Problem:** "Registration failed" error

**Solution:**
1. Check internet connection
2. Verify backend API is online
3. Extension will store registration locally and retry sync

### Enforcement Issues

**Problem:** Copilot still showing suggestions

**Solution:**
1. Verify status bar shows red background (active)
2. Suggestions may appear briefly (<50ms) - this is normal
3. If persistent, run "Anti Copilot: Enable" from Command Palette
4. Check if other extensions are re-enabling Copilot

**Problem:** Can't toggle off

**Solution:**
1. Use Command Palette: "Anti Copilot: Disable"
2. Check for error messages in Output → Anti-Copilot
3. Reload VS Code window

### Server Sync Issues

**Problem:** "Will sync with server when available"

**Solution:**
- Extension works offline, data is stored locally
- Server sync will resume when connection is restored
- Check backend API status: https://pclub-au.vercel.app
- Verify firewall/proxy settings aren't blocking requests

## Uninstallation

To remove the extension:

1. Open Extensions view (⌘+Shift+X or Ctrl+Shift+X)
2. Find "Anti Copilot"
3. Click gear icon → "Uninstall"
4. Reload VS Code

**Note:** Uninstalling removes local data but server records persist. Contact admin to remove from dashboard.

## Getting Help

- **Technical Issues:** Contact clan leader
- **Dashboard Access:** Contact admin team
- **Backend Issues:** Check https://pclub.vercel.app/admin/dashboard

## Security Notes

✅ **Data Privacy:**
- Only user-provided registration data is collected
- No code or file contents are transmitted
- Machine ID is used for unique identification

✅ **Integrity:**
- Extension code is signed
- Checksum verification available
- Open-source for audit

✅ **Authentication:**
- Admin operations require JWT authentication
- User operations use machine ID verification

---

**Installation Complete!** Start coding with enforced compliance. -->
