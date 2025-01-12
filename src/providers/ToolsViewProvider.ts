import * as vscode from 'vscode';
import { Tool, ToolCategory } from '../types/tool';
import { TOOLS } from '../constants/tools';

export class ToolsViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public static readonly viewType = 'devtool-plus.toolsExplorer';
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            const categories = [...new Set(TOOLS.map(tool => tool.category))];
            return Promise.resolve(
                categories.map(category => 
                    new CategoryTreeItem(category, vscode.TreeItemCollapsibleState.Expanded)
                )
            );
        } else if (element instanceof CategoryTreeItem) {
            const toolsInCategory = TOOLS.filter(tool => tool.category === element.category);
            return Promise.resolve(
                toolsInCategory.map(tool => 
                    new ToolTreeItem(tool, vscode.TreeItemCollapsibleState.None)
                )
            );
        }
        return Promise.resolve([]);
    }
}

export class ToolTreeItem extends vscode.TreeItem {
    constructor(
        public readonly tool: Tool,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(tool.label, collapsibleState);
        this.tooltip = tool.description;
        this.description = tool.description;
        this.contextValue = 'tool';
        this.command = {
            command: 'devtool-plus.selectTool',
            title: 'Select Tool',
            arguments: [tool]
        };
    }
}

export class CategoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly category: ToolCategory,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(category, collapsibleState);
        this.contextValue = 'category';
    }
}