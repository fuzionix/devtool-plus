import * as fs from 'fs';
import * as vscode from 'vscode';
import { Tool } from '../types/tool';

export class SidePanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devtool-plus.toolsView';
    private view?: vscode.WebviewView;
    private currentTool?: Tool;

    constructor(
        private readonly extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        const toolComponentsUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'dist', 'tools', 'toolComponents.js')
        );

        const styleUri = this.view!.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'dist', 'styles', 'tailwind.css')
        );

        const toolIconUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'tools')
        );

        webviewView.webview.html = this.getHtmlForWebview(toolComponentsUri, styleUri, toolIconUri);
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
                case 'update': {
                    vscode.commands.executeCommand('devtool-plus.updateEditor', message.toolId, message.value);
                    break;
                }
                case 'search': {
                    vscode.commands.executeCommand('devtool-plus.searchTools', message.value);
                    break;
                }
            }
        });
    }

    private getHtmlForWebview(toolComponentsUri: vscode.Uri, styleUri: vscode.Uri, toolIconUri: vscode.Uri): string {
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
                <div id="empty-state" class="pt-2 px-4">
                    <div class="search-container mb-2">
                        <div class="relative">
                            <input type="text" id="tool-search" placeholder="E.g. UUID Generator" class="w-full py-1 px-2" autofocus />
                            <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-2 top-1/2 transform -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                    <p class="mt-2 text-center opacity-70">Select a tool from the Tools Explorer below</p>
                    <!-- Arrow Divider -->
                    <div class="fixed flex justify-center bottom-2 left-[50%] translate-x-[-50%] mt-2 opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                    </div>
                </div>
                
                <div id="tool-container" class="pt-2 px-4" style="display: none;">
                    <div class="tool-header flex align-middle">
                        <img class="tool-icon mr-2" src="//:0" width="16" alt="" />
                        <h4 class="tool-title"></h4>
                    </div>
                    <div id="tool-content" class="pt-1 pb-4"></div>
                </div>
                <div id="about-container" class="pt-2 px-4" style="display: none;">
                    <div class="tool-header flex align-middle items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        <h4>About DevTool+</h4>
                    </div>
                    <hr />
                    <div id="about-content" class="pt-2 pb-2 border border-[var(--vscode-panel-border)] rounded-sm">
                        <h5 class="text-center">Version: <span>0.0.1 beta</span></h5>  
                        <div class="flex justify-center gap-1 mb-2 mt-4">
                            <tool-tooltip text="GitHub Repository">
                                <a href="https://github.com/fuzionix/devtool-plus" style="color: var(--vscode-foreground)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></a>
                            </tool-tooltip>
                            <tool-tooltip text="Star Project">
                                <a href="#" style="color: var(--vscode-foreground)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star-icon lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg></a>
                            </tool-tooltip>
                            <tool-tooltip text="Discussion">
                                <a href="#" style="color: var(--vscode-foreground)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-plus-icon lucide-message-square-plus"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg></a>
                            </tool-tooltip>
                            <tool-tooltip text="Report Bug">
                                <a href="#" style="color: var(--vscode-foreground)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug-icon lucide-bug"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg></a>
                            </tool-tooltip>
                            <tool-tooltip text="Support Project">
                                <a href="#" style="color: var(--vscode-foreground)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins-icon lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg></a>
                            </tool-tooltip>
                        </div>
                        <hr class="my-2" />                      
                        <div class="mb-2 text-center text-xs opacity-70">
                            <p class="my-0">© 2025 Fuzionix. All rights reserved.</p>
                        </div>
                    </div>
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
                            case 'reset':
                                resetView();
                                break;
                            case 'refresh':
                                if (currentTool) {
                                    updateTool(currentTool);
                                }
                                break;
                            case 'about':
                                showAbout();
                                break;
                        }
                    });

                    let currentTool = null;

                    function setViewState(state) {
                        const views = {
                            'empty': document.getElementById('empty-state'),
                            'tool': document.getElementById('tool-container'),
                            'about': document.getElementById('about-container')
                        };
                        
                        Object.values(views).forEach(view => {
                            if (view) view.style.display = 'none';
                        });
                        
                        if (views[state]) {
                            views[state].style.display = 'block';
                        }
                    }

                    function updateTool(tool) {
                        currentTool = tool;
                        setViewState('tool');
                        
                        document.querySelector('.tool-title').textContent = tool.label;
                        document.querySelector('.tool-icon').src = '${toolIconUri}/' + tool.icon + '.svg';
                        
                        const toolContent = document.getElementById('tool-content');
                        toolContent.innerHTML = '';
                        toolContent.innerHTML = tool.template;
                    }

                    function showAbout() {
                        setViewState('about');
                    }

                    function resetView() {
                        currentTool = null;
                        const searchInput = document.getElementById('tool-search');
                        if (searchInput) searchInput.value = '';
                        
                        setViewState('empty');
                        
                        vscode.postMessage({
                            type: 'search',
                            value: ''
                        });
                    }

                    document.addEventListener('DOMContentLoaded', () => {
                        const searchInput = document.getElementById('tool-search');
                        if (searchInput) {
                            searchInput.addEventListener('input', (e) => {
                                const searchTerm = e.target.value.trim().toLowerCase();
                                vscode.postMessage({
                                    type: 'search',
                                    value: searchTerm
                                });
                            });
                        }
                    });

                    vscode.postMessage({ type: 'ready' });
                </script>
                <script src="${toolComponentsUri}"></script>
            </body>
            </html>
        `;
    }

    public updateTool(tool: Tool) {
        this.currentTool = tool;
        if (this.view) {
            this.view.webview.postMessage({
                type: 'updateTool',
                tool: tool
            });
        }
    }

    public reset() {
        this.currentTool = undefined;
        if (this.view) {
            this.view.webview.postMessage({
                type: 'reset'
            });
        }
    }

    public refresh() {
        if (this.view && this.currentTool) {
            this.view.webview.postMessage({
                type: 'updateTool',
                tool: this.currentTool
            });
        } else {
            this.reset();
        }
    }

    public about() {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'about'
            });
        }
    }
}