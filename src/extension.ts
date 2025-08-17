import * as vscode from 'vscode';
import { SidePanelProvider } from './providers/SidePanelProvider';
import { ToolsViewProvider } from './providers/ToolsViewProvider';
import { ToolDecorationProvider } from './providers/ToolDecorationProvider';
import { EditorViewProvider } from './providers/EditorViewProvider';
import { CodeEditorProvider } from './providers/CodeEditorProvider';
import { DiffEditorProvider } from './providers/DiffEditorProvider';
import { Tool } from './types/tool';
import { TOOLS } from './constants/tools';

const activeEditorProviders = new Map<string, EditorViewProvider | CodeEditorProvider | DiffEditorProvider>();

export function activate(context: vscode.ExtensionContext) {
    const sidePanelProvider = new SidePanelProvider(context.extensionUri, context);
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
            if (e.affectsConfiguration('editor')) {
                codeEditorProvider.updateEditorConfiguration();
                diffEditorProvider.updateEditorConfiguration();
            }
        }),
        vscode.window.onDidChangeActiveColorTheme(() => {
            codeEditorProvider.updateEditorConfiguration();
            diffEditorProvider.updateEditorConfiguration();
        })
    );

    context.subscriptions.push(
        // Triggered on tool selection in Explorer
        vscode.commands.registerCommand('devtool-plus.selectTool', (tool: Tool) => {
            updateToolHistory(context, tool);
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

        vscode.commands.registerCommand('devtool-plus.selectToolFromHistory', (toolId: string) => {
            const tool = TOOLS.find(t => t.id === toolId);
            if (tool) {
                vscode.commands.executeCommand('devtool-plus.selectTool', tool);
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

function updateToolHistory(context: vscode.ExtensionContext, tool: Tool) {
    const historyIds = context.workspaceState.get<string[]>('devtool-plus.toolHistory', []);
    const history = historyIds
        .map(id => TOOLS.find(t => t.id === id))
        .filter(Boolean) as Tool[];
    
    // Remove the tool if already in history (to avoid duplication)
    const filteredHistory = history.filter(t => t.id !== tool.id);
    
    filteredHistory.unshift(tool);
    const limitedHistory = filteredHistory.slice(0, 3);
    
    context.workspaceState.update(
        'devtool-plus.toolHistory', 
        limitedHistory.map(t => t.id)
    );
}

export function deactivate() { }