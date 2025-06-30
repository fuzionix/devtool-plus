import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

@customElement('url-encoder')
export class UrlEncoder extends BaseTool {
    @state() private selectedMode: 'encode' | 'decode' = 'encode';
    @state() private input = '';
    @state() private output = '';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private preserveUrl = false;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">URL encoding converts special characters into a transmitted format over the Internet, replacing unsafe characters with a '%' followed by two hexadecimal digits.</p>
                <hr />

                <!-- Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="URL Encoding Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'encode' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('encode')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-left-right-square"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m10 15-3-3 3-3"/><path d="m14 9 3 3-3 3"/></svg>
                            </span>
                            <h4>Encode</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'decode' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('decode')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            </span>
                            <h4>Decode</h4>
                        </button>
                    </div>
                </div>
                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter URL"
                        rows="1"
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

                <div class="mt-2">
                    <tool-switch
                        .checked=${this.preserveUrl}
                        rightLabel="Preserve URL structure"
                        ariaLabel="Encoding Method"
                        @change=${this.handleEncodingMethodChange}
                    ></tool-switch>
                </div>
            </div>
        `;
    }

    private handleModeChange(mode: 'encode' | 'decode') {
        this.selectedMode = mode;
        this.processInput();
    }

    private handleEncodingMethodChange(event: CustomEvent) {
        this.preserveUrl = event.detail.checked;
        this.processInput();
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        this.processInput();
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

    private processInput(): void {
        this.alert = null;
        if (!this.input) {
            this.output = '';
            return;
        }

        try {
            if (this.selectedMode === 'encode') {
                this.output = this.encodeURL(this.input);
            } else {
                this.output = this.decodeURL(this.input);
            }
        } catch (error) {
            this.alert = {
                type: 'error',
                message: `Failed to ${this.selectedMode} URL: ${(error as Error).message}`
            };
            this.output = '';
        }

        const outputTextarea = this.querySelector('#output') as HTMLTextAreaElement;
        if (outputTextarea) {
            adjustTextareaHeight(outputTextarea);
        }
    }

    private encodeURL(input: string): string {
        try {
            if (this.preserveUrl) {
                return encodeURI(input);
            } else {
                return encodeURIComponent(input);
            }
        } catch (error) {
            this.alert = {
                type: 'error',
                message: `Failed to encode URL: ${(error as Error).message}`
            };
            return '';
        }
    }

    private decodeURL(input: string): string {
        try {
            if (this.preserveUrl) {
                return decodeURI(input);
            } else {
                return decodeURIComponent(input);
            }
        } catch (error) {
            this.alert = {
                type: 'error',
                message: `Failed to decode URL: ${(error as Error).message}`
            };
            return '';
        }
    }

    private clearAll(): void {
        this.input = '';
        this.output = '';
        this.alert = null;

        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        const outputTextarea = this.querySelector('#output') as HTMLTextAreaElement;

        inputTextarea.style.height = `28px`;
        outputTextarea.style.height = `auto`;
        this.requestUpdate();
    }
}