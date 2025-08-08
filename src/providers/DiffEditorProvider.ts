import * as vscode from 'vscode';
import { Tool } from '../types/tool';
import { EditorConfigPayload } from '../types/config';

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
                    let pendingConfig;
                    const toolLanguage = '${toolLanguage}';
                    const initialContent = ${defaultContent};

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
                                // lastState is resent from extension if needed
                                break;
                            case 'updateConfiguration':
                                if (window.monaco && diffEditor) {
                                    applyEditorConfiguration(message.payload);
                                } else {
                                    pendingConfig = message.payload;
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
                            lineNumbers: (config.lineNumbers === 'interval') ? 'on' : config.lineNumbers,
                            renderWhitespace: (config.renderWhitespace === 'trailing') ? 'all' : config.renderWhitespace,
                            renderControlCharacters: config.renderControlCharacters,
                            smoothScrolling: config.smoothScrolling,
                            scrollBeyondLastLine: config.scrollBeyondLastLine,
                            minimap: { enabled: config.minimapEnabled },
                        };

                        if (typeof config.lineHeight === 'number' && config.lineHeight > 0) {
                            commonOptions.lineHeight = config.lineHeight;
                        }
                        if (typeof config.letterSpacing === 'number') {
                            commonOptions.letterSpacing = config.letterSpacing;
                        }

                        diffEditor?.updateOptions(commonOptions);

                        const models = diffEditor?.getModel();
                        if (models) {
                            const modelOptions = {};
                            if (typeof config.tabSize === 'number') modelOptions.tabSize = config.tabSize;
                            if (typeof config.insertSpaces === 'boolean') modelOptions.insertSpaces = config.insertSpaces;
                            models.original?.updateOptions(modelOptions);
                            models.modified?.updateOptions(modelOptions);
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