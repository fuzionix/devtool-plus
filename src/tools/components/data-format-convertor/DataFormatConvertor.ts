import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('data-format-convertor')
export class DataFormatConvertor extends BaseTool {
    @state() private formatFrom: string = 'json';
    @state() private formatTo: string = 'yaml';

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Convert between different data formats including JSON, YAML, and XML.</p>
                <hr />
                <tool-file-dropzone 
                    accept="*/*" 
                    placeholder="Drop your File here"
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
                <div class="mx-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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

            <button class="btn btn-primary w-full gap-2" @click=${this.handleAction}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                <h4>Convert</h4>
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

    private handleAction() {
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'data-format-convertor',
            value: {
                action: {
                    type: 'convert',
                    formatFrom: this.formatFrom,
                    formatTo: this.formatTo
                },
            }
        });
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

        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'data-format-convertor',
            value: {
                action: 'convert',
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
                        toolId: 'data-format-convertor',
                        value: {
                            inputText: reader.result as string
                        }
                    });
                } catch (error) {
                    console.error('Invalid file');
                }
            };
            reader.readAsText(files[0]);
        }
    }
}