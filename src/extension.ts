import * as vscode from 'vscode';
import { SidePanelProvider } from './providers/SidePanelProvider';
import { ToolsViewProvider } from './providers/ToolsViewProvider';
import { ToolDecorationProvider } from './providers/ToolDecorationProvider';
import { EditorViewProvider } from './providers/EditorViewProvider';
import { CodeEditorProvider } from './providers/CodeEditorProvider';
import { DiffEditorProvider } from './providers/DiffEditorProvider';
import { Tool } from './types/tool';

const activeEditorProviders = new Map<string, EditorViewProvider | CodeEditorProvider | DiffEditorProvider>();

export function activate(context: vscode.ExtensionContext) {
    const sidePanelProvider = new SidePanelProvider(context.extensionUri);
    const toolsViewProvider = new ToolsViewProvider(context);
    const toolDecorationProvider = new ToolDecorationProvider();
    const editorViewProvider = new EditorViewProvider(context.extensionUri);
    const codeEditorProvider = new CodeEditorProvider(context.extensionUri);
    const diffEditorProvider = new DiffEditorProvider(context.extensionUri);

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
                diffEditorProvider.updateEditorConfiguration();
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
                } else if (tool.editor.viewType === 'diff') {
                    diffEditorProvider.showTool(tool);
                    activeEditorProviders.set(tool.id, diffEditorProvider);
                } else {
                    editorViewProvider.showTool(tool);
                    activeEditorProviders.set(tool.id, editorViewProvider);
                }
            }
            toolsViewProvider.searchTools('');
        }),

        vscode.commands.registerCommand('devtool-plus.homeButton', () => {
            sidePanelProvider.reset();
        }),

        vscode.commands.registerCommand('devtool-plus.refreshButton', () => {
            sidePanelProvider.refresh();
        }),

        vscode.commands.registerCommand('devtool-plus.aboutButton', () => {
            sidePanelProvider.about();
        }),

        vscode.commands.registerCommand('devtool-plus.searchTools', (searchTerm: string) => {
            toolsViewProvider.searchTools(searchTerm);
        }),
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