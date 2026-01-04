import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

@customElement('number-base-convertor')
export class NumberBaseConvertor extends BaseTool {
    @state() private input = '100';
    @state() private inputBase: 'binary' | 'octal' | 'decimal' | 'hexadecimal' = 'decimal';
    @state() private outputs = {
        binary: '',
        octal: '',
        decimal: '',
        hexadecimal: ''
    };
    @state() private copiedBase: string | null = null;
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    @query('#input') inputTextarea!: HTMLTextAreaElement;

    private styles = css`
        ${BaseTool.styles}
        .output-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .output-item {
            display: flex;
            flex-direction: column;
        }

        .output-label {
            font-size: 0.75rem;
            opacity: 0.75;
            margin-bottom: 0.25rem;
        }

        .output-field {
            position: relative;
            display: flex;
            align-items: center;
        }

        .output-textarea {
            resize: none;
        }

        .copy-button {
            position: absolute;
            right: 0;
            top: 0.125rem;
            padding-right: 0.125rem;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        this.processInput();
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Convert numbers between different bases: binary, octal, decimal, and hexadecimal.</p>
                <hr />

                <!-- Input Section -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">Input Number</p>
                    <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'Binary (Base 2)', value: 'binary' },
                                { label: 'Octal (Base 8)', value: 'octal' },
                                { label: 'Decimal (Base 10)', value: 'decimal' },
                                { label: 'Hexadecimal (Base 16)', value: 'hexadecimal' }
                            ]}
                            .value=${this.inputBase}
                            placeholder="Select Input Base"
                            @change=${this.handleInputBaseChange}
                        ></tool-inline-menu>
                    </div>
                </div>

                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter number to convert"
                        rows="1"
                        .value=${this.input}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Section -->
                <div class="output-grid">
                    ${this.renderOutputItem('binary', 'Binary (Base 2)', this.outputs.binary)}
                    ${this.renderOutputItem('octal', 'Octal (Base 8)', this.outputs.octal)}
                    ${this.renderOutputItem('decimal', 'Decimal (Base 10)', this.outputs.decimal)}
                    ${this.renderOutputItem('hexadecimal', 'Hexadecimal (Base 16)', this.outputs.hexadecimal)}
                </div>
            </div>
        `;
    }

    private renderOutputItem(base: string, label: string, value: string) {
        const isCopied = this.copiedBase === base;
        return html`
            <div class="output-item">
                <span class="output-label">${label}</span>
                <div class="output-field">
                    <textarea
                        class="output-textarea"
                        placeholder="—"
                        rows="1"
                        readonly
                        .value=${value}
                    ></textarea>
                    <div class="copy-button">
                        <tool-tooltip text="Copy">
                            <button 
                                class="btn-icon"
                                @click=${() => this.copyToClipboard(base, value)}
                            >
                                ${renderCopyButton(isCopied)}
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
            </div>
        `;
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value.trim();
        adjustTextareaHeight(target);
        this.processInput();
    }

    private handleInputBaseChange(event: CustomEvent): void {
        this.inputBase = event.detail.value;
        this.processInput();
    }

    private parseInput(): number | null {
        const input = this.input.trim();
        if (!input) return null;

        try {
            const baseMap = {
                binary: 2,
                octal: 8,
                decimal: 10,
                hexadecimal: 16
            };

            const base = baseMap[this.inputBase];

            // For non-decimal inputs, verify the conversion is valid
            if (this.inputBase === 'binary' && !/^-?[01]+$/.test(input)) {
                throw new Error('Binary numbers can only contain 0 and 1');
            }
            if (this.inputBase === 'octal' && !/^-?[0-7]+$/.test(input)) {
                throw new Error('Octal numbers can only contain 0-7');
            }
            if (this.inputBase === 'decimal' && !/^-?\d+$/.test(input)) {
                throw new Error('Decimal numbers can only contain digits 0-9');
            }
            if (this.inputBase === 'hexadecimal' && !/^-?[0-9a-fA-F]+$/.test(input)) {
                throw new Error('Hexadecimal numbers can only contain 0-9, a-f, A-F');
            }

            const decimalValue = parseInt(input, base);

            if (isNaN(decimalValue)) {
                throw new Error(`Invalid ${this.inputBase} number`);
            }

            return decimalValue;
        } catch (error) {
            throw error;
        }
    }

    private convertDecimalToBase(decimal: number, base: number): string {
        if (decimal === 0) return '0';

        const digits = '0123456789abcdef';
        let result = '';
        let num = Math.abs(decimal);

        while (num > 0) {
            result = digits[num % base] + result;
            num = Math.floor(num / base);
        }

        return decimal < 0 ? '-' + result : result;
    }

    private async processInput(): Promise<void> {
        this.alert = null;

        if (!this.input) {
            this.outputs = {
                binary: '',
                octal: '',
                decimal: '',
                hexadecimal: ''
            };
            return;
        }

        try {
            const decimalValue = this.parseInput();

            if (decimalValue === null) {
                this.outputs = {
                    binary: '',
                    octal: '',
                    decimal: '',
                    hexadecimal: ''
                };
                return;
            }

            this.outputs = {
                binary: this.convertDecimalToBase(decimalValue, 2),
                octal: this.convertDecimalToBase(decimalValue, 8),
                decimal: decimalValue.toString(),
                hexadecimal: this.convertDecimalToBase(decimalValue, 16)
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid input';
            this.alert = {
                type: 'error',
                message: errorMessage
            };
            this.outputs = {
                binary: '',
                octal: '',
                decimal: '',
                hexadecimal: ''
            };
        }

        await this.updateComplete;
    }

    private async copyToClipboard(base: string, value: string): Promise<void> {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            this.copiedBase = base;
            setTimeout(() => {
                this.copiedBase = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            this.alert = {
                type: 'error',
                message: 'Failed to copy to clipboard'
            };
        }
    }

    private clearAll(): void {
        this.input = '';
        this.outputs = {
            binary: '',
            octal: '',
            decimal: '',
            hexadecimal: ''
        };
        this.alert = null;
        this.copiedBase = null;

        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = '28px';
        }

        this.requestUpdate();
    }
}