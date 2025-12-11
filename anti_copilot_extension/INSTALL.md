# Anti Copilot - Installation Guide

## Quick Install

1. Download both files:
   - `anti-copilot-0.0.1.vsix` (the extension)
   - `anti-copilot-0.0.1.vsix.sha256` (checksum for verification)

2. **Verify integrity** (recommended):
   ```bash
   shasum -a 256 -c anti-copilot-0.0.1.vsix.sha256
   ```
   You should see: `anti-copilot-0.0.1.vsix: OK`

3. **Install in VS Code**:
   - Open VS Code
   - Go to Extensions (⌘+Shift+X or Ctrl+Shift+X)
   - Click "..." menu → "Install from VSIX..."
   - Select `anti-copilot-0.0.1.vsix`

   **OR** via command line:
   ```bash
   code --install-extension anti-copilot-0.0.1.vsix
   ```

4. Reload VS Code when prompted

## Expected Checksum

```
SHA256: 78bf4fc772b4a23d2ad7b972598b6189318ab8062677638e3baf65d6ae072a43
```

## Security Features

✅ **Integrity Check**: The extension verifies its own code hasn't been modified  
✅ **Unique Publisher ID**: Won't conflict with marketplace versions  
✅ **Checksum Verification**: Verify the file before installation  

## Usage

After installation, look for the "Anti-Copilot" item in your status bar (bottom-right).

Click it to toggle Copilot on/off. When active, the status bar turns red.

## Troubleshooting

**Q: How do I verify the checksum on Windows?**  
A: Use PowerShell:
```powershell
certutil -hashfile anti-copilot-0.0.1.vsix SHA256
```
Then compare the output with the checksum above.

**Q: Extension shows integrity warning?**  
A: The extension file may have been modified. Download a fresh copy from a trusted source.

**Q: How to uninstall?**  
A: Extensions → Find "Anti Copilot" → Click gear icon → Uninstall
