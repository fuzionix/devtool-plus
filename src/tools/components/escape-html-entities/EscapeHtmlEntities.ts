import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';
import { encode, decode } from 'html-entities';

@customElement('escape-html-entities')
export class EscapeHtmlEntities extends BaseTool {
    @state() private selectedMode: 'escape' | 'unescape' = 'escape';
    @state() private input = '<h1>Text</h1>';
    @state() private output = '';
    @state() private isExtensive = false;
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    firstUpdated() {
        this.processInput();
    }

    private styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">HTML entities are used to represent special characters in HTML. Escaping HTML entities helps prevent code injection and ensures proper rendering of special characters in web pages.</p>
                <hr />

                <!-- Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="URL Encoding Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'escape' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('escape')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-slash-icon lucide-square-slash"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="9" x2="15" y1="15" y2="9"/></svg>
                            </span>
                            <h4>Escape</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'unescape' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('unescape')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            </span>
                            <h4>Unescape</h4>
                        </button>
                    </div>
                </div>

                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter HTML text"
                        rows="3"
                        .value=${this.input}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6"
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

                <!-- Settings Switches -->
                <div class="flex justify-between items-center mt-2">
                    <tool-switch
                        .checked=${this.isExtensive}
                        rightLabel="Extensive Mode"
                        ariaLabel="Toggle between default and extensive encoding"
                        @change=${(e: any) => this.handleSwitchChange('extensive', e.detail.checked)}
                    ></tool-switch>
                </div>
                <p class="mt-2 text-[11px] opacity-75">
                    * Extensive mode encodes all non-ASCII characters, including letters, numbers, and symbols.
                </p>
            </div>
        `;
    }

    private handleModeChange(mode: 'escape' | 'unescape') {
        this.selectedMode = mode;
        this.processInput();
    }

    private handleSwitchChange(type: 'extensive', checked: boolean) {
        if (type === 'extensive') {
            this.isExtensive = checked;
        }
        this.processInput();
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        this.processInput();
    }

    private processInput(): void {
        this.alert = null;
        if (!this.input) {
            this.output = '';
            return;
        }

        try {
            if (this.selectedMode === 'escape') {
                // Encodes special characters into HTML entities
                this.output = encode(this.input, { level: 'html5', mode: this.isExtensive ? 'extensive' : 'specialChars' });
            } else {
                // Decodes HTML entities back to characters
                this.output = decode(this.input, { level: 'html5' });
            }
            
            // Update output height after processing
            this.updateComplete.then(() => {
                const outputEl = this.shadowRoot?.getElementById('output') as HTMLTextAreaElement;
                if (outputEl) adjustTextareaHeight(outputEl);
            });
        } catch (err) {
            this.alert = { 
                type: 'error', 
                message: `Failed to ${this.selectedMode}: ${err instanceof Error ? err.message : String(err)}` 
            };
        }
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

    private clearAll(): void {
        this.input = '';
        this.output = '';
        this.alert = null;

        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        const outputTextarea = this.querySelector('#output') as HTMLTextAreaElement;

        inputTextarea.style.height = `auto`;
        outputTextarea.style.height = `auto`;
        this.requestUpdate();
    }
}