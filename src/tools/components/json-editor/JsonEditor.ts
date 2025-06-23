import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import '../../../tools/common/file-dropzone/FileDropzone';

@customElement('json-editor')
export class JsonEditor extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
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
        `;
    }

    private handleAction(action: 'minify' | 'format') {
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'json-editor',
            value: {
                action: action
            }
        });
    }

    private handleFilesChanged(e: CustomEvent) {
        const files = e.detail.filesArray;
        
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const jsonContent = JSON.parse(reader.result as string);
                    console.log('Valid JSON loaded:', jsonContent);
                } catch (error) {
                    console.error('Invalid JSON file');
                }
            };
            reader.readAsText(files[0]);
        }
    }
}