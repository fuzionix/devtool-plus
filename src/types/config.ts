import * as vscode from 'vscode';

export type EditorConfigPayload = {
    themeKind: vscode.ColorThemeKind;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontLigatures?: boolean | string;
    lineHeight?: number;
    letterSpacing?: number;
    wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
    tabSize?: number;
    insertSpaces?: boolean;
    cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
    cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
    lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
    renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
    renderControlCharacters?: boolean;
    smoothScrolling?: boolean;
    scrollBeyondLastLine?: boolean;
    minimapEnabled?: boolean;
};