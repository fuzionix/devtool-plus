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

    getPinnedTools(): string[] {
        return this.context.globalState.get<string[]>('devtool-plus.pinnedTools', []);
    }

    pinTool(toolId: string): void {
        const pinnedTools = this.getPinnedTools();
        if (!pinnedTools.includes(toolId)) {
            pinnedTools.push(toolId);
            this.context.globalState.update('devtool-plus.pinnedTools', pinnedTools);
            this.refresh();
        }
    }

    unpinTool(toolId: string): void {
        const pinnedTools = this.getPinnedTools();
        const index = pinnedTools.indexOf(toolId);
        if (index !== -1) {
            pinnedTools.splice(index, 1);
            this.context.globalState.update('devtool-plus.pinnedTools', pinnedTools);
            this.refresh();
        }
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            let filteredTools = TOOLS;
            const pinnedToolIds = this.getPinnedTools();
            
            if (this.searchTerm) {
                filteredTools = TOOLS.filter(tool =>
                    tool.label.toLowerCase().includes(this.searchTerm) ||
                    tool.category.toLowerCase().includes(this.searchTerm) ||
                    (tool.tags && tool.tags.some(tag => tag.toLowerCase().startsWith(this.searchTerm)))
                );
                
                return Promise.resolve(
                    filteredTools.map(tool =>
                        new ToolTreeItem(
                            tool, 
                            vscode.TreeItemCollapsibleState.None, 
                            this.context, 
                            pinnedToolIds.includes(tool.id)
                        )
                    )
                );
            } else {
                const items: vscode.TreeItem[] = [];
                
                if (pinnedToolIds.length > 0) {
                    items.push(new PinnedSectionTreeItem(vscode.TreeItemCollapsibleState.Expanded));
                }
                
                const categories = [...new Set(TOOLS.map(tool => tool.category))];
                items.push(...categories.map(category =>
                    new CategoryTreeItem(category, vscode.TreeItemCollapsibleState.Expanded)
                ));
                
                return Promise.resolve(items);
            }
        } else if (element instanceof PinnedSectionTreeItem) {
            const pinnedToolIds = this.getPinnedTools();
            const pinnedTools = TOOLS.filter(tool => pinnedToolIds.includes(tool.id));
            
            return Promise.resolve(
                pinnedTools.map(tool =>
                    new ToolTreeItem(
                        tool, 
                        vscode.TreeItemCollapsibleState.None, 
                        this.context, 
                        true
                    )
                )
            );
        } else if (element instanceof CategoryTreeItem) {
            const toolsInCategory = TOOLS.filter(tool => tool.category === element.category);
            const pinnedToolIds = this.getPinnedTools();
            
            return Promise.resolve(
                toolsInCategory.map(tool =>
                    new ToolTreeItem(
                        tool, 
                        vscode.TreeItemCollapsibleState.None, 
                        this.context,
                        pinnedToolIds.includes(tool.id)
                    )
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
        public readonly context: vscode.ExtensionContext,
        public readonly isPinned: boolean = false
    ) {
        super(tool.label, collapsibleState);
        this.tooltip = tool.label;
        this.description = tool.version;
        this.contextValue = isPinned ? 'pinnedTool' : 'tool';
        this.command = {
            command: 'devtool-plus.selectTool',
            title: 'Select Tool',
            arguments: [tool]
        };
        const themeKind = vscode.window.activeColorTheme.kind;
        const iconTheme = themeKind === vscode.ColorThemeKind.Light ? 'light' : 'dark';
        const iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'tools', iconTheme, `${tool.icon}.svg`);
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

export class PinnedSectionTreeItem extends vscode.TreeItem {
    constructor(
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super('📌 Pinned', collapsibleState);
        this.contextValue = 'pinnedSection';
    }
}