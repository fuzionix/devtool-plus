import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class CodeEditorProvider {
    public static readonly viewType = 'devtool-plus.codeEditorView';
    private panel?: vscode.WebviewPanel;
    private currentTool?: Tool;
    private lastState?: any;

    constructor(
        private readonly extensionUri: vscode.Uri,
    ) { }

    public showTool(tool: Tool) {
        this.currentTool = tool;

        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            this.updateWebview();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            CodeEditorProvider.viewType,
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
                    this.updateWebview();
                    break;
                case 'error':
                    vscode.window.showErrorMessage(message.value);
                    break;
            }
        });

        this.panel.webview.html = this.getHtmlForWebview();
    }

    private getHtmlForWebview(): string {
        const monacoUri = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevTool+ Code Editor</title>
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
                        display: flex;
                        height: 100vh;
                        width: 100%;
                    }
                    .editor-pane {
                        width: 50%;
                        height: 100%;
                    }
                    .editor-divider {
                        width: 1px;
                        background-color: var(--vscode-editorGroup-border);
                    }
                    .view-lines.monaco-mouse-cursor-text, .margin-view-overlays {
                        font-family: var(--vscode-editor-font-family) !important;
                        font-weight: var(--vscode-editor-font-weight) !important;
                        font-size: var(--vscode-editor-font-size) !important;
                    }
                </style>
            </head>
            <body>
                <div class="editor-container">
                    <div id="input-editor" class="editor-pane"></div>
                    <div class="editor-divider"></div>
                    <div id="output-editor" class="editor-pane"></div>
                </div>

                <script src="${monacoUri}/loader.js"></script>
                <script>
                    const vscode = acquireVsCodeApi();
                    window.vscode = vscode;

                    let inputEditor;
                    let outputEditor;
                    let currentToolId;
                    
                    require.config({ paths: { 'vs': '${monacoUri}' } });
                    require(['vs/editor/editor.main'], function() {
                        const editorOptions = {
                            automaticLayout: true,
                            minimap: { enabled: false },
                            theme: document.body.classList.contains('vscode-dark') ? 'vs-dark' : 'vs',
                            wordWrap: 'on',
                        };

                        inputEditor = monaco.editor.create(document.getElementById('input-editor'), {
                            ...editorOptions,
                            language: 'json',
                            value: '{\\n    "message": "Enter your JSON here"\\n}',
                        });

                        outputEditor = monaco.editor.create(document.getElementById('output-editor'), {
                            ...editorOptions,
                            language: 'json',
                            readOnly: true,
                            value: '',
                        });

                        inputEditor.onDidChangeModelContent(() => {
                            processContent();
                        });

                        vscode.postMessage({ type: 'ready' });
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'updateTool':
                                currentToolId = message.tool.id;
                                document.title = \`DevTool+ - \${message.tool.label}\`;
                                processContent(); // Re-process content when tool changes
                                break;
                            case 'update':
                                if (message.value && typeof message.value.inputText === 'string') {
                                    if (inputEditor.getValue() !== message.value.inputText) {
                                        inputEditor.setValue(message.value.inputText);
                                    }
                                }
                                break;
                        }
                    });

                    function processContent() {
                        if (!currentToolId || !inputEditor) {
                            return;
                        }

                        const inputText = inputEditor.getValue();

                        switch (currentToolId) {
                            case 'json-editor':
                                try {
                                    outputEditor.setValue(inputText);
                                } catch (e) {
                                    outputEditor.setValue('Invalid JSON: ' + e.message);
                                }
                                break;
                            // Add other code-based tools here in the future
                        }
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

    public updateFromSidePanel(toolId: string, value: any) {
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