import * as vscode from 'vscode';
import { Tool, ToolCategory } from '../types/tool';
import { TOOLS } from '../constants/tools';

export class ToolsViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public static readonly viewType = 'devtool-plus.toolsExplorer';
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    private searchTerm: string = '';

    constructor(readonly context: vscode.ExtensionContext) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    searchTools(term: string): void {
        this.searchTerm = term.toLowerCase();
        this.refresh();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            let filteredTools = TOOLS;
            if (this.searchTerm) {
                filteredTools = TOOLS.filter(tool => 
                    tool.label.toLowerCase().includes(this.searchTerm) || 
                    tool.category.toLowerCase().includes(this.searchTerm) ||
                    (tool.tags && tool.tags.some(tag => tag.toLowerCase().startsWith(this.searchTerm)))
                );
            }

            if (this.searchTerm) {
                return Promise.resolve(
                    filteredTools.map(tool =>
                        new ToolTreeItem(tool, vscode.TreeItemCollapsibleState.None, this.context)
                    )
                );
            } else {
                const categories = [...new Set(TOOLS.map(tool => tool.category))];
                return Promise.resolve(
                    categories.map(category =>
                        new CategoryTreeItem(category, vscode.TreeItemCollapsibleState.Expanded)
                    )
                );
            }
        } else if (element instanceof CategoryTreeItem) {
            const toolsInCategory = TOOLS.filter(tool => tool.category === element.category);
            return Promise.resolve(
                toolsInCategory.map(tool =>
                    new ToolTreeItem(tool, vscode.TreeItemCollapsibleState.None, this.context)
                )
            );
        }
        return Promise.resolve([]);
    }
}

export class ToolTreeItem extends vscode.TreeItem {
    constructor(
        public readonly tool: Tool,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly context: vscode.ExtensionContext
    ) {
        super(tool.label, collapsibleState);
        this.tooltip = tool.label;
        this.description = tool.version;
        this.contextValue = 'tool';
        this.command = {
            command: 'devtool-plus.selectTool',
            title: 'Select Tool',
            arguments: [tool]
        };
        const iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'tools', `${tool.icon}.svg`);
        this.iconPath = iconPath.path;
        this.resourceUri = vscode.Uri.parse(`devtool-plus:/${tool.id}`);
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