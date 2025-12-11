// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';

let statusBarItem: vscode.StatusBarItem;
let isAntiCopilotActive = false;
let extensionContext: vscode.ExtensionContext;
let monitoringInterval: NodeJS.Timeout | undefined;
let configChangeListener: vscode.Disposable | undefined;

// Copilot extension IDs to disable
const COPILOT_EXTENSIONS = [
	'github.copilot',
	'github.copilot-chat'
];

// API Configuration
const API_BASE_URL = 'https://pclub-au.vercel.app'; // Update with your production URL or use 'http://localhost:3000' for dev

// User Data Interface
interface UserData {
	name: string;
	rollNumber: string;
	clan: string;
	leaderName: string;
	machineId: string;
}

// Helper function to make API calls
function sendToServer(endpoint: string, data: any): Promise<any> {
	return new Promise((resolve, reject) => {
		const url = new URL(endpoint, API_BASE_URL);
		const isHttps = url.protocol === 'https:';
		const client = isHttps ? https : http;

		const postData = JSON.stringify(data);
		
		const options = {
			hostname: url.hostname,
			port: url.port || (isHttps ? 443 : 80),
			path: url.pathname,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(postData)
			}
		};

		const req = client.request(options, (res) => {
			let responseData = '';
			
			res.on('data', (chunk) => {
				responseData += chunk;
			});

			res.on('end', () => {
				if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
					try {
						resolve(JSON.parse(responseData));
					} catch (e) {
						resolve(responseData);
					}
				} else {
					reject(new Error(`Server responded with status ${res.statusCode}: ${responseData}`));
				}
			});
		});

		req.on('error', (error) => {
			console.error('API request error:', error);
			reject(error);
		});

		req.write(postData);
		req.end();
	});
}

// Check if user is registered
async function checkUserRegistration(context: vscode.ExtensionContext): Promise<boolean> {
	const userData = await getUserData(context);
	return userData !== null;
}

// Get user data from global state
async function getUserData(context: vscode.ExtensionContext): Promise<UserData | null> {
	const name = context.globalState.get<string>('userName');
	const rollNumber = context.globalState.get<string>('rollNumber');
	const clan = context.globalState.get<string>('clan');
	const leaderName = context.globalState.get<string>('leaderName');
	const machineId = vscode.env.machineId;

	if (name && rollNumber && clan && leaderName) {
		return { name, rollNumber, clan, leaderName, machineId };
	}
	return null;
}

// Prompt user for registration
async function promptUserRegistration(context: vscode.ExtensionContext): Promise<UserData | null> {
	const name = await vscode.window.showInputBox({
		prompt: 'Enter your full name',
		placeHolder: 'John Doe',
		validateInput: (value) => value.trim() ? null : 'Name is required'
	});

	if (!name) {
		return null;
	}

	const rollNumber = await vscode.window.showInputBox({
		prompt: 'Enter your roll number',
		placeHolder: 'AU2140001',
		validateInput: (value) => value.trim() ? null : 'Roll number is required'
	});

	if (!rollNumber) {
		return null;
	}

	const clan = await vscode.window.showInputBox({
		prompt: 'Enter your clan name',
		placeHolder: 'Phoenix',
		validateInput: (value) => value.trim() ? null : 'Clan is required'
	});

	if (!clan) {
		return null;
	}

	const leaderName = await vscode.window.showInputBox({
		prompt: 'Enter your leader name',
		placeHolder: 'Jane Smith',
		validateInput: (value) => value.trim() ? null : 'Leader name is required'
	});

	if (!leaderName) {
		return null;
	}

	const machineId = vscode.env.machineId;
	const userData: UserData = { 
		name: name.trim(), 
		rollNumber: rollNumber.trim(), 
		clan: clan.trim().toLowerCase(), 
		leaderName: leaderName.trim(), 
		machineId 
	};

	// Save to global state
	await context.globalState.update('userName', userData.name);
	await context.globalState.update('rollNumber', userData.rollNumber);
	await context.globalState.update('clan', userData.clan);
	await context.globalState.update('leaderName', userData.leaderName);

	// Register with server
	try {
		await sendToServer('/api/anti-copilot/register', userData);
		vscode.window.showInformationMessage('✅ Registration successful!');
	} catch (error) {
		console.error('Registration error:', error);
		vscode.window.showWarningMessage('⚠️ Registered locally. Will sync with server when available.');
	}

	return userData;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('Anti Copilot extension is now active!');
	extensionContext = context;

	// Create status bar item FIRST - always visible
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		1000
	);
	statusBarItem.command = 'anti-copilot.toggle';
	statusBarItem.text = '$(loading~spin) Anti-Copilot';
	statusBarItem.tooltip = 'Loading...';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Check if user is registered
	const isRegistered = await checkUserRegistration(context);
	if (!isRegistered) {
		statusBarItem.text = '$(error) Anti-Copilot';
		statusBarItem.tooltip = 'Not registered - Click to register';
		
		const proceed = await vscode.window.showInformationMessage(
			'Welcome to Anti-Copilot! You need to register before using this extension.',
			'Register Now',
			'Cancel'
		);
		
		if (proceed === 'Register Now') {
			const userData = await promptUserRegistration(context);
			if (!userData) {
				vscode.window.showErrorMessage('Registration cancelled. Click the status bar to register later.');
				return;
			}
		} else {
			vscode.window.showErrorMessage('Registration is required. Click the status bar to register later.');
			return;
		}
	}

	// Restore previous state
	isAntiCopilotActive = context.globalState.get('isAntiCopilotActive', false);
	if (isAntiCopilotActive) {
		await activateAntiCopilot();
	} else {
		updateStatusBarInactive();
	}

	// Register toggle command
	const toggleCommand = vscode.commands.registerCommand('anti-copilot.toggle', async () => {
		if (isAntiCopilotActive) {
			await deactivateAntiCopilot();
			vscode.window.showInformationMessage('Anti Copilot: OFF - Copilot chat restored');
		} else {
			await activateAntiCopilot();
			vscode.window.showInformationMessage('Anti Copilot: ON - Copilot chat disabled');
		}
		// Save state
		await context.globalState.update('isAntiCopilotActive', isAntiCopilotActive);
	});

	// Register explicit enable/disable commands
	const enableCommand = vscode.commands.registerCommand('anti-copilot.enable', async () => {
		if (!isAntiCopilotActive) {
			await activateAntiCopilot();
			await context.globalState.update('isAntiCopilotActive', isAntiCopilotActive);
			vscode.window.showInformationMessage('Anti Copilot: ON - Copilot chat disabled');
		}
	});

	const disableCommand = vscode.commands.registerCommand('anti-copilot.disable', async () => {
		if (isAntiCopilotActive) {
			await deactivateAntiCopilot();
			await context.globalState.update('isAntiCopilotActive', isAntiCopilotActive);
			vscode.window.showInformationMessage('Anti Copilot: OFF - Copilot chat restored');
		}
	});

	// Register command to update user settings
	const updateSettingsCommand = vscode.commands.registerCommand('anti-copilot.updateSettings', async () => {
		const userData = await promptUserRegistration(context);
		if (userData) {
			vscode.window.showInformationMessage('✅ Settings updated successfully!');
		}
	});

	context.subscriptions.push(toggleCommand, enableCommand, disableCommand, updateSettingsCommand);
}

async function activateAntiCopilot() {
    if (isAntiCopilotActive) {
        return;
    }

	isAntiCopilotActive = true;
	updateStatusBarActive();

    // AGGRESSIVE DISABLE - NO MATTER WHAT
    await forceDisableCopilot();
    
    // Start AGGRESSIVE continuous monitoring
    startCopilotMonitoring();
    
    // Add config change listener for IMMEDIATE reaction
    if (!configChangeListener) {
        configChangeListener = vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (!isAntiCopilotActive) return;
            
            // ANY config change that touches these settings = immediately force disable
            if (
                e.affectsConfiguration('github.copilot') ||
                e.affectsConfiguration('editor.inlineSuggest')
            ) {
                await forceDisableCopilot();
                vscode.window.showWarningMessage('⚠️ Copilot re-enabled detected! Disabling again.');
            }
        });
        extensionContext.subscriptions.push(configChangeListener);
    }

    // Track the toggle event
    await trackToggleEvent('enabled');

    vscode.window.showInformationMessage('✅ Anti-Copilot ACTIVE! Copilot LOCKED to disabled.');
}

// FORCE disable - called repeatedly
async function forceDisableCopilot() {
    try {
        // Commands - ignore errors
        try {
            await vscode.commands.executeCommand('github.copilot.disableGlobally');
        } catch (e) {}
        try {
            await vscode.commands.executeCommand('editor.action.inlineSuggest.hide');
        } catch (e) {}
        
        const config = vscode.workspace.getConfiguration();
        
        const settingsToDisable = [
            'github.copilot.enable',
            'github.copilot.inlineSuggest.enable',
            'editor.inlineSuggest.enabled',
            'github.copilot.editor.enableAutoCompletions',
            'github.copilot.nextEditSuggestions.enabled'
        ];
        
        // Force BOTH scopes EVERY time
        for (const setting of settingsToDisable) {
            await config.update(setting, false, vscode.ConfigurationTarget.Global);
            await config.update(setting, false, vscode.ConfigurationTarget.Workspace);
            await config.update(setting, false, vscode.ConfigurationTarget.WorkspaceFolder);
        }
    } catch (error) {
        console.error('Force disable error:', error);
    }
}

// Monitor - checks EVERY 50ms and FORCES disable
function startCopilotMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }

    // ULTRA AGGRESSIVE: Check every 50ms (20 times per second)
    monitoringInterval = setInterval(async () => {
        if (!isAntiCopilotActive) return;
        await forceDisableCopilot();
    }, 50); // Every 50ms - ULTRA aggressive
    
    // ALSO: Listen to text changes and force disable immediately
    vscode.workspace.onDidChangeTextDocument(() => {
        if (isAntiCopilotActive) {
            forceDisableCopilot();
        }
    });
    
    // ALSO: When active editor changes, force disable
    vscode.window.onDidChangeActiveTextEditor(() => {
        if (isAntiCopilotActive) {
            forceDisableCopilot();
        }
    });
    
    // ALSO: When cursor moves, force disable
    vscode.window.onDidChangeTextEditorSelection(() => {
        if (isAntiCopilotActive) {
            forceDisableCopilot();
        }
    });
}

async function deactivateAntiCopilot() {
    if (!isAntiCopilotActive) {
        return;
    }

    isAntiCopilotActive = false;
    updateStatusBarInactive();

    // Stop monitoring
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = undefined;
    }

    // Re-enable all Copilot extensions
    for (const extId of COPILOT_EXTENSIONS) {
        const extension = vscode.extensions.getExtension(extId);
        if (extension) {
            try {
                await vscode.commands.executeCommand('workbench.extensions.enableExtension', extId);
                
                // Re-enable settings
                const config = vscode.workspace.getConfiguration();
                await config.update('github.copilot.enable', true, vscode.ConfigurationTarget.Global);
                await config.update('github.copilot.inlineSuggest.enable', true, vscode.ConfigurationTarget.Global);
                await config.update('editor.inlineSuggest.enabled', true, vscode.ConfigurationTarget.Global);
                
            } catch (error) {
                console.error(`Failed to enable ${extId}:`, error);
            }
        }
    }

    // Track the toggle event
    await trackToggleEvent('disabled');

    vscode.window.showInformationMessage('Anti-Copilot is now INACTIVE. GitHub Copilot has been re-enabled.');
}

function updateStatusBarActive() {
	// Show distinctive red indicator with shield icon when active
	statusBarItem.text = '$(shield) Anti-Copilot';
	statusBarItem.tooltip = 'Anti Copilot is ACTIVE - Copilot chat disabled\nClick to toggle';
	statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
	statusBarItem.show();
}

function updateStatusBarInactive() {
	// Show gray/normal indicator when inactive
	statusBarItem.text = '$(shield-check) Anti-Copilot';
	statusBarItem.tooltip = 'Anti Copilot is OFF\nClick to toggle';
	statusBarItem.backgroundColor = undefined;
	statusBarItem.color = undefined;
	statusBarItem.show();
}

// Track toggle events to server
async function trackToggleEvent(status: 'enabled' | 'disabled') {
	try {
		const userData = await getUserData(extensionContext);
		if (!userData) {
			console.error('User data not found for tracking');
			return;
		}

		const trackingData = {
			...userData,
			status,
			timestamp: new Date().toISOString()
		};

		await sendToServer('/api/anti-copilot/track', trackingData);
		console.log(`Tracked ${status} event`);
	} catch (error) {
		console.error('Error tracking event:', error);
		// Don't show error to user, just log it
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
}
