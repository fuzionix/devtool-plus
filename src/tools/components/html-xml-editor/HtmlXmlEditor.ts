import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('html-xml-editor')
export class HtmlXmlEditor extends BaseTool {
    @state() private lastAction: 'minify' | 'format' = 'format';
    @state() private indentation: number = 2;

    private styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">HTML / XML editing tool for modifying HTML/XML data.</p>
                <hr />
                <tool-file-dropzone 
                    accept=".html,.htm,.xml,.svg,text/html,application/xml,text/xml"
                    placeholder="Drop your HTML/XML file here"
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

    private handleAction(action: 'minify' | 'format') {
        this.lastAction = action;
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'html-xml-editor',
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
                    (window as any).vscode.postMessage({
                        type: 'update',
                        toolId: 'html-xml-editor',
                        value: {
                            inputText: reader.result as string
                        }
                    });

                    setTimeout(() => this.handleAction(this.lastAction), 100);
                } catch (error) {
                    console.error('Invalid HTML/XML file');
                }
            };
            reader.readAsText(files[0]);
        }
    }

    private handleSliderChange(e: CustomEvent) {
        this.indentation = e.detail.value;
        
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'html-xml-editor',
            value: {
                action: 'updateHtmlXmlIndentation',
                indentation: this.indentation
            }
        });
    }
}