import * as vscode from 'vscode';
import { TOOLS } from '../constants/tools';

export class ToolDecorationProvider implements vscode.FileDecorationProvider {
    private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[]> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> = this._onDidChangeFileDecorations.event;

    dispose() {
        this._onDidChangeFileDecorations.dispose();
    }

    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        if (uri.scheme !== 'devtool-plus') {
            return null;
        }
        
        const toolId = uri.path.split('/').pop();
        const tool = TOOLS.find(t => t.id === toolId);

        if (tool?.isNew) {
            return {
                badge: '✨',
                tooltip: 'New Tool'
            };
        }

        return null;
    }
}