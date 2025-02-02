import * as fs from 'fs';
import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class SidePanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devtool-plus.toolsView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        const toolComponentsUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'tools', 'toolComponents.js')
        );

        const styleUri = this._view!.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'styles', 'tailwind.css')
        );

        const toolIconUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'tools')
        );

        webviewView.webview.html = this._getHtmlForWebview(toolComponentsUri, styleUri, toolIconUri);
        webviewView.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'ready':
                    break;
                case 'error':
                    vscode.window.showErrorMessage(message.value);
                    break;
                case 'download': {
                    const payload = message.payload;
                    const fileBuffer = Buffer.from(payload.base64, 'base64');
                    const uri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.file(payload.fileName),
                        filters: {
                            'Files': [payload.extension || 'bin'],
                        },
                    });

                    if (uri) {
                        fs.writeFile(uri.fsPath, fileBuffer, err => {
                            if (err) {
                                vscode.window.showErrorMessage('Error saving file: ' + err.message);
                            } else {
                                vscode.window.showInformationMessage('File saved successfully!');
                            }
                        });
                    }
                    break;
                }
            }
        });
    }

    private _getHtmlForWebview(toolComponentsUri: vscode.Uri, styleUri: vscode.Uri, toolIconUri: vscode.Uri): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevTool+</title>
                <link href="${styleUri}" rel="stylesheet">
            </head>
            <body>
                <div id="empty-state" class="pt-2">
                    <p class="opacity-70">Select a tool from the Tools Explorer below</p>
                </div>
                <div id="tool-container" class="pt-2">
                    <div class="tool-header flex align-middle">
                        <img class="tool-icon mr-2" src="//:0" width="16" alt="" />
                        <h4 class="tool-title"></h4>
                    </div>
                    <div id="tool-content" class="pt-1"></div>
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
                        const emptyState = document.getElementById('empty-state');
                        const toolContainer = document.getElementById('tool-container');

                        if (!tool) {
                            emptyState.style.display = 'block';
                            toolContainer.style.display = 'none';
                            return;
                        } else {
                            emptyState.style.display = 'none';
                            toolContainer.style.display = 'block';
                        }

                        document.querySelector('.tool-title').textContent = tool.label;
                        document.querySelector('.tool-icon').src = '${toolIconUri}/' + tool.icon + '.svg';

                        const toolContent = document.getElementById('tool-content');
                        toolContent.innerHTML = '';
                        toolContent.innerHTML = tool.template;
                    }

                    vscode.postMessage({ type: 'ready' });
                </script>
                <script src="${toolComponentsUri}"></script>
            </body>
            </html>
        `;
    }

    public updateTool(tool: Tool) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateTool',
                tool: tool
            });
        }
    }
}