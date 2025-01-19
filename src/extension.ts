import * as vscode from 'vscode';
import { SidePanelProvider } from './providers/SidePanelProvider';
import { ToolsViewProvider } from './providers/ToolsViewProvider';
import { ToolDecorationProvider } from './providers/ToolDecorationProvider';
import { Tool } from './types/tool';

export function activate(context: vscode.ExtensionContext) {
	const sidePanelProvider = new SidePanelProvider(context.extensionUri);
	const toolsViewProvider = new ToolsViewProvider(context);
	const toolDecorationProvider = new ToolDecorationProvider();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidePanelProvider.viewType,
			sidePanelProvider
		),
		vscode.window.registerTreeDataProvider(
            ToolsViewProvider.viewType,
            toolsViewProvider
        ),
		vscode.window.registerFileDecorationProvider(
			toolDecorationProvider
		)
	);

	vscode.commands.registerCommand('devtool-plus.selectTool', (tool: Tool) => {
		sidePanelProvider.updateTool(tool);
	});

	console.log('DevTool+ is now active!');
}

export function deactivate() { }
