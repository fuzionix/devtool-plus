import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { 
    renderCopyButton 
} from '../../../utils/util';

@customElement('cubic-bezier')
export class CubicBezier extends BaseTool {
    @state() private output = '';
    @state() private isCopied = false;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Your description here</p>
                <hr />

                <!-- Preview Panel -->

                <!-- Cubic Bezier Curve Control Panel -->

                <!-- CSS Output Field -->
                <div class="mt-2 mb-2">
                    <div class="relative">
                        <div class="input-expandable code-block">
                            ${this.renderHighlightedCode('This is output sample')}
                        </div>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
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
            </div>
        `;
    }

    private renderHighlightedCode(code: string) {
        console.log('Rendering highlighted code:', code);
    }

    private async copyToClipboard() {
        if (!this.output) { return; }
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