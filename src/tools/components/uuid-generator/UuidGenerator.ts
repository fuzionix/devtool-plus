import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { 
    renderCopyButton 
} from '../../../utils/util';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';

@customElement('uuid-generator')
export class UUIDGenerator extends BaseTool {
    @state() private selectedVersion: 'v1' | 'v4' = 'v4';
    @state() private output = '';
    @state() private isCopied = false;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">A UUID (Universally Unique Identifier) is a 128-bit unique identifier that uses timestamp or randomness to ensure global uniqueness across space and time.</p>
                <hr />

                <!-- Version Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="UUID Version">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedVersion === 'v1' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleVersionChange('v1')}
                        >
                            <h4>UUID v1</h4>
                            <span class="text-xs opacity-75 ml-1">(Time-based)</span>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedVersion === 'v4' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleVersionChange('v4')}
                        >
                            <h4>UUID v4</h4>
                            <span class="text-xs opacity-75 ml-1">(Random)</span>
                        </button>
                    </div>
                </div>

                <div class="flex justify-between mt-2 gap-2">
                    <button 
                        id="generate" 
                        class="btn-primary gap-2"
                        @click=${this.generateUUID}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        <h4>Generate</h4>
                    </button>
                </div>
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6 font-mono"
                        placeholder="Output will appear here"
                        rows="3"
                        readonly
                        .value=${this.output}
                    ></textarea>
                    <div class="absolute right-0 top-2.5 pr-0.5 flex justify-items-center">
                        <button 
                            id="copy" 
                            class="btn-icon"
                            @click=${this.copyToClipboard}
                        >
                            ${renderCopyButton(this.isCopied)}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private handleVersionChange(version: 'v1' | 'v4') {
        this.selectedVersion = version;
    }

    private generateUUID() {
        this.output = (this.selectedVersion === 'v4') ? uuidv4() : uuidv1();
    }

    private async copyToClipboard() {
        if (!this.output) return;
        try {
            await navigator.clipboard.writeText(this.output);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }
}