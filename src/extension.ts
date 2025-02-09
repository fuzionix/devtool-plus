import * as vscode from 'vscode';
import { SidePanelProvider } from './providers/SidePanelProvider';
import { ToolsViewProvider } from './providers/ToolsViewProvider';
import { ToolDecorationProvider } from './providers/ToolDecorationProvider';
import { EditorViewProvider } from './providers/EditorViewProvider';
import { Tool } from './types/tool';

export function activate(context: vscode.ExtensionContext) {
	const sidePanelProvider = new SidePanelProvider(context.extensionUri);
	const toolsViewProvider = new ToolsViewProvider(context);
	const toolDecorationProvider = new ToolDecorationProvider();
	const editorViewProvider = new EditorViewProvider(context.extensionUri);

	// Enable communication between providers. It allows the side panel to update the editor view
	sidePanelProvider.setEditorViewProvider(editorViewProvider);

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
		),
	);

	context.subscriptions.push(
		// Triggered on tool selection in Explorer
		vscode.commands.registerCommand('devtool-plus.selectTool', (tool: Tool) => {
			sidePanelProvider.updateTool(tool);
			if (tool.editor) {
				editorViewProvider.showTool(tool);
			}
		})
	);

	console.log('DevTool+ is now active!');
}

export function deactivate() { }
