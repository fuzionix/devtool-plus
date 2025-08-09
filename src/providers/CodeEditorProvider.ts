import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Tool } from '../types/tool';
import { EditorConfigPayload } from '../types/config';

export class CodeEditorProvider {
    public static readonly viewType = 'devtool-plus.codeEditorView';
    private panel?: vscode.WebviewPanel;
    private currentTool?: Tool;

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

        const configKeys: Array<[keyof EditorConfigPayload, string]> = [
            ['fontFamily', 'fontFamily'],
            ['fontSize', 'fontSize'],
            ['fontWeight', 'fontWeight'],
            ['fontLigatures', 'fontLigatures'],
            ['lineHeight', 'lineHeight'],
            ['letterSpacing', 'letterSpacing'],
            ['wordWrap', 'wordWrap'],
            ['tabSize', 'tabSize'],
            ['insertSpaces', 'insertSpaces'],
            ['cursorStyle', 'cursorStyle'],
            ['cursorBlinking', 'cursorBlinking'],
            ['lineNumbers', 'lineNumbers'],
            ['renderWhitespace', 'renderWhitespace'],
            ['renderControlCharacters', 'renderControlCharacters'],
            ['smoothScrolling', 'smoothScrolling'],
            ['scrollBeyondLastLine', 'scrollBeyondLastLine'],
        ];

        const payload: any = {
            themeKind: vscode.window.activeColorTheme.kind,
        };

        for (const [prop, configKey] of configKeys) {
            payload[prop] = editorConfig.get(configKey as any);
        }

        webview.postMessage({
            type: 'updateConfiguration',
            payload
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
        const monacoPath = vscode.Uri.joinPath(this.extensionUri, 'dist', 'monaco-editor', 'vs');
        const monacoUri = this.panel!.webview.asWebviewUri(monacoPath);
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
                <!-- Optional additional libs -->
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
                    let pendingConfig;
                    const toolLanguage = '${toolLanguage}';
                    const initialContent = ${safeToolInitialValue};

                    // Observe theme class changes
                    const bodyClassObserver = new MutationObserver(() => {
                        if (window.monaco) {
                            createOrUpdateMonacoTheme();
                        }
                    });

                    bodyClassObserver.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class']
                    });

                    require.config({ paths: { 'vs': '${monacoUri}' } });
                    require(['vs/editor/editor.main'], function() {
                        const editorOptions = {
                            automaticLayout: true,
                            minimap: { enabled: false },
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

                        let isSyncingLeft = false;
                        let isSyncingRight = false;

                        inputEditor.onDidScrollChange((e) => {
                            if (!e.scrollTopChanged) return;
                            if (!isSyncingLeft) {
                                isSyncingRight = true;
                                outputEditor.setScrollTop(e.scrollTop);
                            }
                            isSyncingLeft = false;
                        });

                        outputEditor.onDidScrollChange((e) => {
                            if (!e.scrollTopChanged) return;
                            if (!isSyncingRight) {
                                isSyncingLeft = true;
                                inputEditor.setScrollTop(e.scrollTop);
                            }
                            isSyncingRight = false;
                        });

                        createOrUpdateMonacoTheme();

                        if (pendingConfig) {
                            applyEditorConfiguration(pendingConfig);
                            pendingConfig = undefined;
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
                                if (message.value && typeof message.value.inputText === 'string') {
                                    if (inputEditor && inputEditor.getValue() !== message.value.inputText) {
                                        inputEditor.setValue(message.value.inputText);
                                    }
                                }
                                break;
                            case 'updateConfiguration':
                                if (window.monaco && inputEditor && outputEditor) {
                                    applyEditorConfiguration(message.payload);
                                } else {
                                    pendingConfig = message.payload;
                                }
                                break;
                            case 'updateEditor':
                                if (window.monaco && inputEditor && outputEditor) {
                                    if (message.value.formatFrom) {
                                        monaco.editor.setModelLanguage(inputEditor.getModel(), message.value.formatFrom);
                                    }
                                    if (message.value.formatTo) {
                                        monaco.editor.setModelLanguage(outputEditor.getModel(), message.value.formatTo);
                                    }
                                }
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

                    function cssVar(name) {
                        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
                    }

                    function createOrUpdateMonacoTheme() {
                        const isDark = document.body.classList.contains('vscode-dark');
                        const isHC = document.body.classList.contains('vscode-high-contrast') || document.body.classList.contains('vscode-high-contrast-light');
                        const base = isHC ? (document.body.classList.contains('vscode-high-contrast-light') ? 'hc-light' : 'hc-black') : (isDark ? 'vs-dark' : 'vs');

                        const colors = {
                            'editor.background': cssVar('--vscode-editor-background') || undefined,
                            'editor.foreground': cssVar('--vscode-editor-foreground') || undefined,
                            'editorLineNumber.foreground': cssVar('--vscode-editorLineNumber-foreground') || undefined,
                            'editorLineNumber.activeForeground': cssVar('--vscode-editorLineNumber-activeForeground') || undefined,
                            'editorCursor.foreground': cssVar('--vscode-editorCursor-foreground') || undefined,
                            'editor.selectionBackground': cssVar('--vscode-editor-selectionBackground') || undefined,
                            'editor.selectionHighlightBackground': cssVar('--vscode-editor-selectionHighlightBackground') || undefined,
                            'editor.findMatchBackground': cssVar('--vscode-editor-findMatchBackground') || undefined,
                            'editor.findMatchHighlightBackground': cssVar('--vscode-editor-findMatchHighlightBackground') || undefined,
                            'editor.findRangeHighlightBackground': cssVar('--vscode-editor-findRangeHighlightBackground') || undefined,
                            'editor.rangeHighlightBackground': cssVar('--vscode-editor-rangeHighlightBackground') || undefined,
                            'editorIndentGuide.background': cssVar('--vscode-editorIndentGuide-background') || undefined,
                            'editorIndentGuide.activeBackground': cssVar('--vscode-editorIndentGuide-activeBackground') || undefined,
                            'editorRuler.foreground': cssVar('--vscode-editorRuler-foreground') || undefined,
                        };

                        // Remove undefined entries to avoid warnings
                        Object.keys(colors).forEach(k => colors[k] === undefined && delete colors[k]);

                        monaco.editor.defineTheme('vs-code', {
                            base,
                            inherit: true,
                            rules: [],
                            colors
                        });
                        monaco.editor.setTheme('vs-code');
                    }

                    function applyEditorConfiguration(config) {
                        createOrUpdateMonacoTheme();

                        const fontOptions = {
                            fontFamily: config.fontFamily,
                            fontSize: config.fontSize,
                            fontWeight: config.fontWeight,
                            fontLigatures: config.fontLigatures
                        };

                        const commonOptions = {
                            ...fontOptions,
                            wordWrap: config.wordWrap,
                            cursorStyle: config.cursorStyle,
                            cursorBlinking: config.cursorBlinking,
                            lineNumbers: (config.lineNumbers === 'interval') ? 'on' : config.lineNumbers, // Monaco doesn't support 'interval'
                            renderWhitespace: (config.renderWhitespace === 'trailing') ? 'all' : config.renderWhitespace, // closest
                            renderControlCharacters: config.renderControlCharacters,
                            smoothScrolling: config.smoothScrolling,
                            scrollBeyondLastLine: config.scrollBeyondLastLine,
                            minimap: { enabled: false },
                        };

                        if (typeof config.lineHeight === 'number' && config.lineHeight > 0) {
                            commonOptions.lineHeight = config.lineHeight;
                        }
                            
                        if (typeof config.letterSpacing === 'number') {
                            commonOptions.letterSpacing = config.letterSpacing;
                        }

                        inputEditor?.updateOptions(commonOptions);
                        outputEditor?.updateOptions(commonOptions);

                        const modelOptions = {};
                        if (typeof config.tabSize === 'number') modelOptions.tabSize = config.tabSize;
                        if (typeof config.insertSpaces === 'boolean') modelOptions.insertSpaces = config.insertSpaces;

                        inputEditor?.getModel()?.updateOptions(modelOptions);
                        outputEditor?.getModel()?.updateOptions(modelOptions);
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
        }
    }

    public updateFromSidePanel(toolId: string, value: any) {
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