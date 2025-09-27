import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('json-editor')
export class JsonEditor extends BaseTool {
    private styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    @state() private orderBy: string = 'default';
    @state() private sortOrder: string = 'asc';
    @state() private lastAction: 'minify' | 'format' = 'format';
    @state() private indentation: number = 2;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">JSON editing tool for modifying JSON data.</p>
                <hr />
                <tool-file-dropzone 
                    accept=".json,application/json" 
                    placeholder="Drop your JSON file here"
                    @files-changed=${this.handleFilesChanged}
                ></tool-file-dropzone>
                <div class="flex justify-between mt-2 gap-2">
                    <button id="minify" class="btn-primary gap-2" @click=${() => this.handleAction('minify')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-minus-icon lucide-square-minus"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/></svg>
                        <h4>Minify</h4>
                    </button>
                    <button id="format" class="btn-outline gap-2" @click=${() => this.handleAction('format')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-braces-icon lucide-braces"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>
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

            <div class="flex justify-between items-center mt-4 text-xs">
                Indentation
            </div>
            <tool-slider
                min="0"
                max="10"
                step="2"
                .value=${this.indentation}
                @change=${this.handleSliderChange}
            ></tool-slider>
        `;
    }

    private handleOrderByChange(e: CustomEvent) {
        this.orderBy = e.detail.value;
        this.updateJsonOutput();
    }

    private handleSortOrderChange(e: CustomEvent) {
        this.sortOrder = e.detail.value;
        this.updateJsonOutput();
    }

    private handleSliderChange(e: CustomEvent) {
        this.indentation = e.detail.value;
        
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'json-editor',
            value: {
                action: 'updateIndentation',
                indentation: this.indentation,
                orderBy: this.orderBy,
                sortOrder: this.sortOrder
            }
        });
    }

    private updateJsonOutput() {
        this.handleAction(this.lastAction);
    }

    private handleAction(action: 'minify' | 'format') {
        this.lastAction = action;
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'json-editor',
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
                        toolId: 'json-editor',
                        value: {
                            inputText: reader.result as string
                        }
                    });

                    setTimeout(() => this.handleAction(this.lastAction), 100);
                } catch (error) {
                    console.error('Invalid JSON file');
                }
            };
            reader.readAsText(files[0]);
        }
    }
}