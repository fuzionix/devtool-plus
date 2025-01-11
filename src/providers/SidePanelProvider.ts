import * as vscode from 'vscode';

export class SidePanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devtool-plus.toolsView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }                                                                                                                                                                                                                                                                                              

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
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        console.log(webview)
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevTool+</title>
                <style>
                </style>
            </head>
            <body>
                <h1>DevTool+</h1>
            </body>
            </html>
        `;
    }
}