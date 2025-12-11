# Anti Copilot

A VS Code extension that allows you to toggle GitHub Copilot chat on/off with a distinctive visual indicator visible from a distance.

## Features

- **Toggle Copilot Chat**: Easily enable/disable GitHub Copilot chat functionality
- **Distinctive Visual Indicator**: When active, displays a red status bar item with a shield icon that's visible from across the room
- **State Persistence**: Remembers your preference across VS Code sessions
- **Quick Access**: Click the status bar item or use commands to toggle

### Status Bar Indicator

- **🛡️ Red Background** = Anti Copilot is **ACTIVE** (Copilot chat disabled)
- **✅ Normal** = Anti Copilot is **OFF** (Copilot chat enabled)

## Usage

### Via Status Bar
Simply click the "Anti-Copilot" item in the status bar (right side) to toggle on/off.

### Via Command Palette
Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and search for:
- `Anti Copilot: Toggle ON/OFF` - Toggle the extension
- `Anti Copilot: Enable` - Turn on Anti Copilot
- `Anti Copilot: Disable` - Turn off Anti Copilot

## Requirements

- Visual Studio Code v1.107.0 or higher
- GitHub Copilot extension (optional - the extension works whether Copilot is installed or not)

## How It Works

When enabled, Anti Copilot:
1. Saves the current GitHub Copilot chat state
2. Disables GitHub Copilot chat by updating the `github.copilot.enable` setting
3. Displays a distinctive red status bar indicator

When disabled, Anti Copilot:
1. Restores the previous Copilot chat state
2. Returns the status bar to normal appearance

## Release Notes

### 0.0.1

Initial release:
- Toggle GitHub Copilot chat on/off
- Visual status bar indicator with color coding
- State persistence across sessions

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
