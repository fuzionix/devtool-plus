import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class EditorViewProvider {
    public static readonly viewType = 'devtool-plus.editorView';
    private _panel?: vscode.WebviewPanel;
    private _currentTool?: Tool;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public showTool(tool: Tool) {
        if (!tool.editor) {
            if (this._panel) {
                this._panel.dispose();
                this._panel = undefined;
            }
            return;
        }

        this._currentTool = tool;

        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            this._updateWebview();
            return;
        }

        this._panel = vscode.window.createWebviewPanel(
            EditorViewProvider.viewType,
            `DevTool+: ${tool.label}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri],
                retainContextWhenHidden: true
            }
        );

        this._panel.onDidDispose(() => {
            this._panel = undefined;
        }, null);

        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'ready':
                    this._updateWebview();
                    break;
                case 'error':
                    vscode.window.showErrorMessage(message.value);
                    break;
            }
        });

        const toolComponentsUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'tools', 'toolComponents.js')
        );

        const styleUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'styles', 'tailwind.css')
        );

        this._panel.webview.html = this._getHtmlForWebview(toolComponentsUri, styleUri);
    }

    private _getHtmlForWebview(toolComponentsUri: vscode.Uri, styleUri: vscode.Uri): string {
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

                    vscode.postMessage({ type: 'ready' });
                </script>
                <script src="${toolComponentsUri}"></script>
            </body>
            </html>
        `;
    }

    private _updateWebview() {
        if (!this._panel || !this._currentTool) {
            return;
        }

        this._panel.title = `DevTool+ - ${this._currentTool.label}`;
        this._panel.webview.postMessage({
            type: 'updateTool',
            tool: this._currentTool
        });
    }
}