import * as vscode from 'vscode';
import { SidePanelProvider } from './providers/SidePanelProvider';
import { ToolsViewProvider } from './providers/ToolsViewProvider';
import { ToolDecorationProvider } from './providers/ToolDecorationProvider';
import { EditorViewProvider } from './providers/EditorViewProvider';
import { CodeEditorProvider } from './providers/CodeEditorProvider';
import { Tool } from './types/tool';

const activeEditorProviders = new Map<string, EditorViewProvider | CodeEditorProvider>();

export function activate(context: vscode.ExtensionContext) {
	const sidePanelProvider = new SidePanelProvider(context.extensionUri);
	const toolsViewProvider = new ToolsViewProvider(context);
	const toolDecorationProvider = new ToolDecorationProvider();
	const editorViewProvider = new EditorViewProvider(context.extensionUri);
	const codeEditorProvider = new CodeEditorProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidePanelProvider.viewType,
			sidePanelProvider,
			{
				webviewOptions: {
					retainContextWhenHidden: true
				}
			}
		),
		vscode.window.registerTreeDataProvider(
			ToolsViewProvider.viewType,
			toolsViewProvider
		),
		vscode.window.registerFileDecorationProvider(
			toolDecorationProvider
		),
		vscode.workspace.onDidChangeConfiguration(e => {
			if (
				e.affectsConfiguration('editor.fontFamily') ||
				e.affectsConfiguration('editor.fontSize') ||
				e.affectsConfiguration('editor.fontWeight') ||
				e.affectsConfiguration('editor.fontLigatures')
			) {
				codeEditorProvider.updateEditorConfiguration();
			}
		})
	);

	context.subscriptions.push(
		// Triggered on tool selection in Explorer
		vscode.commands.registerCommand('devtool-plus.selectTool', (tool: Tool) => {
			sidePanelProvider.updateTool(tool);
			if (tool.editor) {
				if (tool.editor.viewType === 'code') {
					codeEditorProvider.showTool(tool);
					activeEditorProviders.set(tool.id, codeEditorProvider);
				} else {
					editorViewProvider.showTool(tool);
					activeEditorProviders.set(tool.id, editorViewProvider);
				}
			}
		})
	);

	vscode.commands.registerCommand('devtool-plus.updateEditor', (toolId: string, value: any) => {
		const provider = activeEditorProviders.get(toolId);
		if (provider) {
			provider.updateFromSidePanel(toolId, value);
		}
	});

	console.log('DevTool+ is now active!');
}

export function deactivate() { }
