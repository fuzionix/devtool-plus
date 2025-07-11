import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class EditorViewProvider {
    public static readonly viewType = 'devtool-plus.editorView';
    private panel?: vscode.WebviewPanel;
    private currentTool?: Tool;

    constructor(
        private readonly extensionUri: vscode.Uri,
    ) { }

    public showTool(tool: Tool) {
        if (!tool.editor) {
            if (this.panel) {
                this.panel.dispose();
                this.panel = undefined;
            }
            return;
        }

        this.currentTool = tool;

        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            this.updateWebview();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            EditorViewProvider.viewType,
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

        const toolComponentsUri = this.panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'dist', 'tools', 'toolComponents.js')
        );

        const styleUri = this.panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'dist', 'styles', 'tailwind.css')
        );

        this.panel.webview.html = this.getHtmlForWebview(toolComponentsUri, styleUri);
    }

    private getHtmlForWebview(toolComponentsUri: vscode.Uri, styleUri: vscode.Uri): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevTool+ Editor</title>
                <link href="${styleUri}" rel="stylesheet">
            </head>
            <body>
                <div class="tool-container">
                    <div id="tool-content"></div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    window.vscode = vscode;
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'updateTool':
                                updateTool(message.tool);
                                break;
                            case 'update':
                                update(message.toolId, message.value);
                                break;
                        }
                    });

                    function updateTool(tool) {
                        const container = document.getElementById('tool-content');
                        if (!tool) {
                            container.innerHTML = '';
                            return;
                        }
                        // Use the editor-specific template
                        container.innerHTML = tool.template.replace(tool.id, tool.id + '-editor');
                    }

                    function update(toolId, value) {
                        const editorComponent = document.querySelector(\`\${toolId}-editor\`);
                        if (!editorComponent) {
                            console.warn(\`Editor component not found for tool: \${toolId}\`);
                            return;
                        }

                        // Handle different types of editor components
                        switch (toolId) {
                            case 'text-editor':
                                editorComponent.dispatchEvent(new CustomEvent('updated', {
                                    detail: { value: value },
                                    bubbles: true,
                                    composed: true
                                }));
                                break;
                            default:
                                if (typeof value === 'object') {
                                    editorComponent.dispatchEvent(new CustomEvent('updated', {
                                        detail: { value: value },
                                        bubbles: true,
                                        composed: true
                                    }));
                                } else {
                                    editorComponent.value = value;
                                }
                        }
                    }

                    vscode.postMessage({ type: 'ready' });
                </script>
                <script src="${toolComponentsUri}"></script>
            </body>
            </html>
        `;
    }

    private updateWebview() {
        if (!this.panel || !this.currentTool) {
            return;
        }

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

        this.panel.webview.postMessage({
            type: 'update',
            toolId: '',
            value: ''
        });
    }

    public updateFromSidePanel(toolId: string, value: any) {
        if (this.panel) {
            this.panel.webview.postMessage({
                type: 'update',
                toolId: toolId,
                value: value
            });
        }
    }
}