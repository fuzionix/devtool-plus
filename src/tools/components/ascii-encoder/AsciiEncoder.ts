import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

@customElement('ascii-encoder')
export class AsciiEncoder extends BaseTool {
    @state() private selectedMode: 'hex' | 'binary' = 'hex';
    @state() private input = '';
    @state() private output = '';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    private styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">ASCII is a character encoding standard for electronic communication. It represents text in computers and other devices that use text.</p>
                <hr />

                <!-- Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="ASCII Conversion Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'hex' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('hex')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                            </span>
                            <h4>Hex</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'binary' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('binary')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
                            </span>
                            <h4>Binary</h4>
                        </button>
                    </div>
                </div>
                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter text"
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

    private handleModeChange(mode: 'hex' | 'binary') {
        this.selectedMode = mode;
        this.processInput();
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        this.processInput();
    }

    private async processInput(): Promise<void> {
        this.alert = null;
        if (!this.input) {
            this.output = '';
            return;
        }

        try {
            if (this.selectedMode === 'hex') {
                this.output = this.textToHex(this.input);
            } else {
                this.output = this.textToBinary(this.input);
            }
        } catch (error) {
            this.alert = {
                type: 'error',
                message: `Failed to convert to ${this.selectedMode}: ${(error as Error).message}`
            };
            this.output = '';
        }

        const outputTextarea = this.querySelector('#output') as HTMLTextAreaElement;
        if (outputTextarea) {
            await this.updateComplete;
            adjustTextareaHeight(outputTextarea);
        }
    }

    private textToHex(text: string): string {
        return Array.from(text)
            .map(char => char.charCodeAt(0).toString(16).toUpperCase())
            .join(' ');
    }

    private textToBinary(text: string): string {
        return Array.from(text)
            .map(char => {
                const binary = char.charCodeAt(0).toString(2);
                // Ensure each binary representation is 8 bits (pad with leading zeros if needed)
                return binary.padStart(8, '0');
            })
            .join(' ');
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

        inputTextarea.style.height = `28px`;
        outputTextarea.style.height = `auto`;
        this.requestUpdate();
    }
}