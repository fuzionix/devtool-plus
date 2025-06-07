import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';
import '../../common/slider/Slider';
import '../../common/switch/Switch';

@customElement('token-generator')
export class TokenGenerator extends BaseTool {
    @state() private sliderValue = 64;
    @state() private output = '';
    @state() private isCopied = false;
    @state() private includeNumbers = true;
    @state() private includeSpecial = true;
    @state() private includeLowercase = true;
    @state() private includeUppercase = true;

    @query('#output') outputArea!: HTMLTextAreaElement;

    // Character sets for token generation
    private readonly numbers = '0123456789';
    private readonly special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    private readonly lowercase = 'abcdefghijklmnopqrstuvwxyz';
    private readonly uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    constructor() {
        super();
        this.generateToken();
    }

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Produces unique strings of customizable length and character sets for authentication, API keys, or session identifiers, ensuring randomness and unpredictability.</p>
                <hr />

                <div class="grid grid-cols-1 min-[320px]:grid-cols-2 gap-2 mt-2 mb-4">
                    <tool-switch
                        .checked=${this.includeNumbers}
                        rightLabel="Numbers (0-9)"
                        ariaLabel="Include Numbers"
                        data-charset="numbers"
                        @change=${this.handleCharsetChange}
                    ></tool-switch>
                    <tool-switch
                        .checked=${this.includeSpecial}
                        rightLabel="Special (e.g. !@#)"
                        ariaLabel="Include Special Characters"
                        data-charset="special"
                        @change=${this.handleCharsetChange}
                    ></tool-switch>
                    <tool-switch
                        .checked=${this.includeLowercase}
                        rightLabel="Lowercase (a-z)"
                        ariaLabel="Include Lowercase Letters"
                        data-charset="lowercase"
                        @change=${this.handleCharsetChange}
                    ></tool-switch>
                    <tool-switch
                        .checked=${this.includeUppercase}
                        rightLabel="Uppercase (A-Z)"
                        ariaLabel="Include Uppercase Letters"
                        data-charset="uppercase"
                        @change=${this.handleCharsetChange}
                    ></tool-switch>
                </div>

                <div class="flex justify-between items-center text-xs">
                    Token Length
                </div>
                <tool-slider
                    min="1"
                    max="256"
                    step="1"
                    .value=${this.sliderValue}
                    @change=${this.handleSliderChange}
                ></tool-slider>

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6 font-mono break-all"
                        placeholder="Output will appear here"
                        rows="3"
                        readonly
                        .value=${this.output}
                    ></textarea>
                    <div class="absolute right-0 top-[0.625rem] pr-0.5 flex justify-items-center">
                        <button 
                            id="copy" 
                            class="btn-icon"
                            @click=${this.copyToClipboard}
                        >
                            ${renderCopyButton(this.isCopied)}
                        </button>
                    </div>
                    <div class="absolute right-0 top-[2.125rem] pr-0.5 flex justify-items-center">
                        <button 
                            id="regenerate" 
                            class="btn-icon"
                            @click=${this.generateToken}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round" 
                                class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"
                            >
                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                    <path d="M3 3v5h5"/>
                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                                    <path d="M16 16h5v5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private handleSliderChange(e: CustomEvent) {
        this.sliderValue = e.detail.value;
        this.generateToken();
    }

    private handleCharsetChange(e: CustomEvent) {
        const target = e.currentTarget as HTMLElement;
        const charset = target.getAttribute('data-charset');
        const checked = e.detail.checked;
        
        switch (charset) {
            case 'numbers':
                this.includeNumbers = checked;
                break;
            case 'special':
                this.includeSpecial = checked;
                break;
            case 'lowercase':
                this.includeLowercase = checked;
                break;
            case 'uppercase':
                this.includeUppercase = checked;
                break;
        }
        
        this.generateToken();
    }

    private generateToken() {
        // Build character set based on selected options
        let charset = '';
        if (this.includeNumbers) charset += this.numbers;
        if (this.includeSpecial) charset += this.special;
        if (this.includeLowercase) charset += this.lowercase;
        if (this.includeUppercase) charset += this.uppercase;

        // If no character set is selected, use all of them
        if (!charset) {
            charset = this.numbers + this.special + this.lowercase + this.uppercase;
        }

        let token = '';
        const length = this.sliderValue;
        const charsetLength = charset.length;

        // Use crypto API for better randomness when available
        if (window.crypto && window.crypto.getRandomValues) {
            const values = new Uint32Array(length);
            window.crypto.getRandomValues(values);
            for (let i = 0; i < length; i++) {
                token += charset[values[i] % charsetLength];
            }
        } else {
            for (let i = 0; i < length; i++) {
                token += charset.charAt(Math.floor(Math.random() * charsetLength));
            }
        }

        adjustTextareaHeight(this.outputArea);
        this.output = token;
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