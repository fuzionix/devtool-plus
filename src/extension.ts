import * as vscode from 'vscode';
import { SidePanelProvider } from './providers/SidePanelProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log(context.extensionUri)
	const sidePanelProvider = new SidePanelProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidePanelProvider.viewType,
			sidePanelProvider
		)
	);

	console.log('DevTool+ is now active!');
}

export function deactivate() { }
