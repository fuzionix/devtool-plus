import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('data-format-convertor')
export class DataFormatConvertor extends BaseTool {
    @state() private formatFrom: string = 'json';
    @state() private formatTo: string = 'yaml';
    @state() private isProcessing: boolean = false;

    static styles = css`
        ${BaseTool.styles}
    `;

    connectedCallback() {
        super.connectedCallback();
        this.handleFormatChange();
    }

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Convert between different data formats including JSON, YAML, and XML.</p>
                <hr />
                <tool-file-dropzone 
                    accept=".json,.yaml,.yml,.xml" 
                    placeholder="Drop your file here or paste content in the editor"
                    @files-changed=${this.handleFilesChanged}
                ></tool-file-dropzone>
            </div>

            <div class="flex justify-between items-center my-2">
                <div class="flex-1">
                    <tool-dropdown-menu 
                        .options=${[
                            { value: 'json', label: 'JSON' },
                            { value: 'yaml', label: 'YAML' },
                            { value: 'xml', label: 'XML' }
                        ]}
                        .value=${this.formatFrom}
                        @change=${this.handleFormatFromChange}
                    ></tool-dropdown-menu>
                </div>
                <div class="mx-2 cursor-pointer p-1 rounded-sm hover:bg-[var(--vscode-panel-background)]" @click=${this.swapFormats}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat-icon lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                </div>
                <div class="flex-1">
                    <tool-dropdown-menu 
                        .options=${[
                            { value: 'json', label: 'JSON' },
                            { value: 'yaml', label: 'YAML' },
                            { value: 'xml', label: 'XML' }
                        ]}
                        .value=${this.formatTo}
                        @change=${this.handleFormatToChange}
                    ></tool-dropdown-menu>
                </div>
            </div>

            <button class="btn btn-primary w-full gap-2" 
                    @click=${this.handleAction}
                    ?disabled=${this.isProcessing}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                <h4>${this.isProcessing ? 'Converting ...' : 'Convert'}</h4>
            </button>
        `;
    }

    private handleFormatFromChange(e: CustomEvent) {
        this.formatFrom = e.detail.value;
        this.handleFormatChange();
    }

    private handleFormatToChange(e: CustomEvent) {
        this.formatTo = e.detail.value;
        this.handleFormatChange();
    }

    private swapFormats() {
        const temp = this.formatFrom;
        this.formatFrom = this.formatTo;
        this.formatTo = temp;
        this.handleFormatChange();
    }

    private handleAction() {
        this.isProcessing = true;
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'data-format-convertor',
            value: {
                action: 'convert',
                formatFrom: this.formatFrom,
                formatTo: this.formatTo
            }
        });
        
        setTimeout(() => {
            this.isProcessing = false;
        }, 800);
    }

    private handleFormatChange() {
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'data-format-convertor',
            value: {
                modify: {
                    formatFrom: this.formatFrom,
                    formatTo: this.formatTo
                }
            }
        });

        this.handleAction();
    }

    private handleFilesChanged(e: CustomEvent) {
        const files = e.detail.filesArray;
        
        if (files.length > 0) {
            const file = files[0];
            
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.json')) {
                this.formatFrom = 'json';
            } else if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
                this.formatFrom = 'yaml';
            } else if (fileName.endsWith('.xml')) {
                this.formatFrom = 'xml';
            }
            
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    (window as any).vscode.postMessage({
                        type: 'update',
                        toolId: 'data-format-convertor',
                        value: {
                            inputText: reader.result as string,
                            modify: {
                                formatFrom: this.formatFrom,
                                formatTo: this.formatTo
                            }
                        }
                    });
                    
                    this.handleAction();
                } catch (error) {
                    console.error('Invalid file');
                }
            };
            reader.readAsText(file);
        }
    }
}