import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class SidePanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devtool-plus.toolsView';
    private _view?: vscode.WebviewView;
    private _currentTool?: Tool;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {}

    public updateTool(tool: Tool) {
        this._currentTool = tool;
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'toolAction':
                    this.handleToolAction(message.action, message.data);
                    return;
            }
        });
    }

    private handleToolAction(action: string, data: any) {
        // TODO: Handle tool-specific actions here
        console.log('Tool action:', action, data);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevTool+</title>
                <style>
                    h4 {
                        margin-top: 0.5rem;
                        font-weight: 400;
                    }
                    p {
                        opacity: 0.75;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    ${this._currentTool ? 
                        `<h4>${this._currentTool.label}</h4>
                         ${this._currentTool.template}` : 
                        '<p>Select a tool from the Tools Explorer below</p>'}
                </div>
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        document.addEventListener('click', (e) => {
                            if (e.target.tagName === 'BUTTON') {
                                vscode.postMessage({
                                    command: 'toolAction',
                                    action: e.target.className,
                                    data: {
                                        input: document.querySelector('.input-field')?.value
                                    }
                                });
                            }
                        });
                    }())
                </script>
            </body>
            </html>
        `;
    }
}