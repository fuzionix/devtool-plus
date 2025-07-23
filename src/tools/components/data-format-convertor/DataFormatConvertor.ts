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
        `;
    }

    private handleFormatFromChange(e: CustomEvent) {
        this.formatFrom = e.detail.value;
    }

    private handleFormatToChange(e: CustomEvent) {
        this.formatTo = e.detail.value;
    }

    // private handleAction(action) {
    //     (window as any).vscode.postMessage({
    //         type: 'update',
    //         toolId: 'data-format-convertor',
    //         value: {
    //             action: action,
    //         }
    //     });
    // }

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