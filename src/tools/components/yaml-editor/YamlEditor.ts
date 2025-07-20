import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('yaml-editor')
export class YamlEditor extends BaseTool {
    @state() private orderBy: string = 'default';
    @state() private sortOrder: string = 'asc';
    @state() private lastAction: 'minify' | 'format' = 'format';

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">YAML editing tool for modifying YAML data.</p>
                <hr />
                <tool-file-dropzone 
                    accept=".yaml,.yml,application/x-yaml" 
                    placeholder="Drop your YAML file here"
                    @files-changed=${this.handleFilesChanged}
                ></tool-file-dropzone>
                <div class="flex justify-between mt-2 gap-2">
                    <button id="minify" class="btn-primary gap-2" @click=${() => this.handleAction('minify')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-minus-icon lucide-square-minus"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/></svg>
                        <h4>Minify</h4>
                    </button>
                    <button id="format" class="btn-outline gap-2" @click=${() => this.handleAction('format')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-tree-icon lucide-list-tree"><path d="M21 12h-8"/><path d="M21 6H8"/><path d="M21 18h-8"/><path d="M3 6v4c0 1.1.9 2 2 2h3"/><path d="M3 10v6c0 1.1.9 2 2 2h3"/></svg>
                        <h4>Format</h4>
                    </button>
                </div>
            </div>

            <div class="flex flex-col min-[320px]:flex-row gap-2 my-4">
                <div class="flex-1">
                    <div class="mb-2 text-xs">
                        Order By
                    </div>
                    <tool-dropdown-menu 
                        .options=${[
                            { value: 'default', label: 'No Change' },
                            { value: 'key', label: 'Key' },
                            { value: 'value', label: 'Value' }
                        ]}
                        .value=${this.orderBy}
                        @change=${this.handleOrderByChange}
                    ></tool-dropdown-menu>
                </div>
                <div class="flex-1">
                    <div class="mb-2 text-xs">
                        Sort Order
                    </div>
                    <tool-dropdown-menu 
                        .options=${[
                            { value: 'asc', label: 'Ascending' },
                            { value: 'desc', label: 'Descending' }
                        ]}
                        .value=${this.sortOrder}
                        .disabled=${this.orderBy === 'default'}
                        @change=${this.handleSortOrderChange}
                    ></tool-dropdown-menu>
                </div>
            </div>
        `;
    }

    private handleOrderByChange(e: CustomEvent) {
        this.orderBy = e.detail.value;
        this.updateYamlOutput();
    }

    private handleSortOrderChange(e: CustomEvent) {
        this.sortOrder = e.detail.value;
        this.updateYamlOutput();
    }

    private updateYamlOutput() {
        this.handleAction(this.lastAction);
    }

    private handleAction(action: 'minify' | 'format') {
        this.lastAction = action;
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'yaml-editor',
            value: {
                action: action,
                orderBy: this.orderBy,
                sortOrder: this.sortOrder
            }
        });
    }

    private handleFilesChanged(e: CustomEvent) {
        const files = e.detail.filesArray;
        
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    (window as any).vscode.postMessage({
                        type: 'update',
                        toolId: 'yaml-editor',
                        value: {
                            inputText: reader.result as string
                        }
                    });

                    setTimeout(() => this.handleAction(this.lastAction), 100);
                } catch (error) {
                    console.error('Invalid YAML file');
                }
            };
            reader.readAsText(files[0]);
        }
    }
}