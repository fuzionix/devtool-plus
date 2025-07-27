import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
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
            this.panel.webview.html = this.getHtmlForWebview();
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

    private getToolLogicScript(): string {
        if (!this.currentTool?.editor?.editorLogicPath) {
            return "No tool logic script provided.";
        }

        const relativePath = this.currentTool.editor.editorLogicPath.replace(/^src/, 'dist');
        const scriptPath = path.join(this.extensionUri.fsPath, relativePath);

        try {
            return fs.readFileSync(scriptPath, 'utf-8');
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`Failed to load tool logic script: ${scriptPath}`);
            return "Failed to load tool logic script.";
        }
    }

    private getHtmlForWebview(): string {
        const monacoUri = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs';
        const toolLogicScript = this.getToolLogicScript();
        const toolLanguage = this.currentTool?.editor?.language || 'plaintext';
        const toolInitialValue = this.currentTool?.editor?.initialValue || '';
        const safeToolInitialValue = JSON.stringify(toolInitialValue);

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
                </style>
                <!-- Additional libraries -->
                <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/fast-xml-parser@5.2.5/lib/fxp.min.js"></script>
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
                    let initialFontSettings;
                    const toolLanguage = '${toolLanguage}';
                    const initialContent = ${safeToolInitialValue};

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
                            language: toolLanguage,
                            value: initialContent,
                        });

                        outputEditor = monaco.editor.create(document.getElementById('output-editor'), {
                            ...editorOptions,
                            language: toolLanguage,
                            readOnly: true,
                            value: '',
                        });

                        if (initialFontSettings) {
                            applyFontStyles(initialFontSettings);
                        }

                        inputEditor.onDidChangeModelContent(() => {
                            vscode.postMessage({
                                type: 'update',
                                value: {
                                    inputText: inputEditor.getValue()
                                }
                            });
                        });

                        let isSyncingLeft = false;
                        let isSyncingRight = false;

                        inputEditor.onDidScrollChange((e) => {
                            if (!e.scrollTopChanged) {
                                return;
                            }
                            // If the right pane is not already being synced, proceed.
                            if (!isSyncingLeft) {
                                isSyncingRight = true;
                                outputEditor.setScrollTop(e.scrollTop);
                            }
                            // Reset the flag for the left pane.
                            isSyncingLeft = false;
                        });

                        outputEditor.onDidScrollChange((e) => {
                            if (!e.scrollTopChanged) {
                                return;
                            }
                            // If the left pane is not already being synced, proceed.
                            if (!isSyncingRight) {
                                isSyncingLeft = true;
                                inputEditor.setScrollTop(e.scrollTop);
                            }
                            // Reset the flag for the right pane.
                            isSyncingRight = false;
                        });

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
                                if (message.value && typeof message.value.inputText === 'string') {
                                    if (inputEditor.getValue() !== message.value.inputText) {
                                        inputEditor.setValue(message.value.inputText);
                                    }
                                }
                                break;
                            case 'updateConfiguration':
                                applyFontStyles(message.payload);
                                break;
                            case 'updateEditor':
                                monaco.editor.setModelLanguage(inputEditor.getModel(), message.value.formatFrom || toolLanguage);
                                monaco.editor.setModelLanguage(outputEditor.getModel(), message.value.formatTo || toolLanguage);
                                break;
                            case 'action':
                                if (window.toolLogic && typeof window.toolLogic[message.action] === 'function') {
                                    const { action, ...args } = message;
                                    window.toolLogic[action](args);
                                } else {
                                    console.warn('No handler for action:', message.action);
                                }
                                break;
                        }
                    });

                    function applyFontStyles(settings) {
                        if (!settings) return;

                        // If editors aren't created yet, store the settings
                        if (!inputEditor || !outputEditor) {
                            initialFontSettings = settings;
                            return;
                        }

                        const monacoSettings = {
                            fontFamily: settings.fontFamily,
                            fontSize: settings.fontSize,
                            fontWeight: settings.fontWeight,
                            fontLigatures: settings.fontLigatures,
                        };

                        inputEditor.updateOptions(monacoSettings);
                        outputEditor.updateOptions(monacoSettings);
                    }
                </script>
                <script>
                    ${toolLogicScript}
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
        if (value && !value.action) {
            this.lastState = value;
        }

        if (this.panel && this.currentTool && this.currentTool.id === toolId) {
            if (value && value.action) {
                this.panel.webview.postMessage({
                    type: 'action',
                    ...value
                });
            } else if (value && value.modify) {
                this.panel.webview.postMessage({
                    type: 'updateEditor',
                    value: value.modify
                });
            } else {
                this.panel.webview.postMessage({
                    type: 'update',
                    toolId: toolId,
                    value: value
                });
            }
        }
    }
}