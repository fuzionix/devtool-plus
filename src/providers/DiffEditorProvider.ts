import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class DiffEditorProvider {
    public static readonly viewType = 'devtool-plus.diffEditorView';
    private panel?: vscode.WebviewPanel;
    private currentTool?: Tool;
    private lastState?: { original: string; modified: string };

    constructor(
        private readonly extensionUri: vscode.Uri,
    ) { }

    public showTool(tool: Tool) {
        this.currentTool = tool;

        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            this.panel.webview.html = this.getHtmlForWebview();
            this.updateWebview();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            DiffEditorProvider.viewType,
            `DevTool+: ${tool.label}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionUri],
                retainContextWhenHidden: true
            }
        );

        const iconPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'tools', `${tool.icon}.svg`);
        this.panel.iconPath = {
            light: iconPath,
            dark: iconPath
        };

        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.currentTool = undefined;
        }, null);

        this.panel.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'ready':
                    this.sendConfiguration(this.panel!.webview);
                    this.updateWebview();
                    break;
                case 'error':
                    vscode.window.showErrorMessage(message.value);
                    break;
            }
        });

        this.panel.webview.html = this.getHtmlForWebview();
    }

    public updateEditorConfiguration() {
        if (this.panel) {
            this.sendConfiguration(this.panel.webview);
        }
    }

    private sendConfiguration(webview: vscode.Webview) {
        const editorConfig = vscode.workspace.getConfiguration('editor');
        webview.postMessage({
            type: 'updateConfiguration',
            payload: {
                fontFamily: editorConfig.get('fontFamily'),
                fontSize: editorConfig.get('fontSize'),
                fontWeight: editorConfig.get('fontWeight'),
                fontLigatures: editorConfig.get('fontLigatures'),
            }
        });
    }

    private getHtmlForWebview(): string {
        const monacoUri = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs';
        const toolLanguage = this.currentTool?.editor?.language || 'plaintext';
        const defaultContent = JSON.stringify({
            original: 'This is the original text. You can edit it here.',
            modified: 'This is the modified text. You can edit it here.'
        });

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevTool+ Diff Editor</title>
                <link rel="stylesheet" href="${monacoUri}/editor/editor.main.css">
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        width: 100%;
                        overflow: hidden;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    .editor-container {
                        height: 100vh;
                        width: 100%;
                    }
                </style>
            </head>
            <body>
                <div id="diff-editor" class="editor-container"></div>

                <script src="${monacoUri}/loader.js"></script>
                <script>
                    const vscode = acquireVsCodeApi();
                    window.vscode = vscode;

                    let diffEditor;
                    let currentToolId;
                    let initialFontSettings;
                    const toolLanguage = '${toolLanguage}';
                    const initialContent = ${defaultContent};

                    require.config({ paths: { 'vs': '${monacoUri}' } });
                    require(['vs/editor/editor.main'], function() {
                        const editorOptions = {
                            automaticLayout: true,
                            theme: document.body.classList.contains('vscode-dark') ? 'vs-dark' : 'vs',
                            readOnly: false,
                            renderSideBySide: true,
                            originalEditable: true
                        };

                        diffEditor = monaco.editor.createDiffEditor(document.getElementById('diff-editor'), editorOptions);

                        const originalModel = monaco.editor.createModel(initialContent.original, toolLanguage);
                        const modifiedModel = monaco.editor.createModel(initialContent.modified, toolLanguage);

                        diffEditor.setModel({
                            original: originalModel,
                            modified: modifiedModel
                        });

                        setTimeout(() => {
                            diffEditor.getOriginalEditor().focus();
                        }, 0);
                        
                        if (initialFontSettings) {
                            applyFontStyles(initialFontSettings);
                        }

                        vscode.postMessage({ type: 'ready' });
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'updateTool':
                                currentToolId = message.tool.id;
                                document.title = \`DevTool+ - \${message.tool.label}\`;
                                break;
                            case 'update':
                                break;
                            case 'updateConfiguration':
                                applyFontStyles(message.payload);
                                break;
                        }
                    });

                    function applyFontStyles(settings) {
                        if (!settings) return;

                        if (!diffEditor) {
                            initialFontSettings = settings;
                            return;
                        }

                        const monacoSettings = {
                            fontFamily: settings.fontFamily,
                            fontSize: settings.fontSize,
                            fontWeight: settings.fontWeight,
                            fontLigatures: settings.fontLigatures,
                        };

                        diffEditor.updateOptions(monacoSettings);
                    }
                </script>
            </body>
            </html>
        `;
    }

    private updateWebview() {
        if (this.panel && this.currentTool) {
            const iconPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'tools', `${this.currentTool.icon}.svg`);
            this.panel.title = `DevTool+ - ${this.currentTool.label}`;
            this.panel.iconPath = {
                light: iconPath,
                dark: iconPath
            };
            this.panel.webview.postMessage({
                type: 'updateTool',
                tool: this.currentTool
            });
            if (this.lastState) {
                this.updateFromSidePanel(this.currentTool.id, this.lastState);
            }
        }
    }

    public updateFromSidePanel(toolId: string, value: { original: string; modified: string }) {
        this.lastState = value;

        if (this.panel && this.currentTool && this.currentTool.id === toolId) {
            this.panel.webview.postMessage({
                type: 'update',
                toolId: toolId,
                value: value
            });
        }
    }
}