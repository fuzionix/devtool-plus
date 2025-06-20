import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';
import '../../common/slider/Slider';
import '../../common/switch/Switch';
import '../../common/expandable/Expandable';

@customElement('password-generator')
export class PasswordGenerator extends BaseTool {
    @state() private passwordLength = 16;
    @state() private output = '';
    @state() private isCopied = false;
    @state() private includeNumbers = true;
    @state() private includeSpecial = true;
    @state() private includeLowercase = true;
    @state() private includeUppercase = true;
    @state() private excludeSimilarChars = false;
    @state() private excludeAmbiguous = false;
    @state() private passwordStrength = 0;
    @state() private passwordStrengthText = '';
    @state() private crackingTime = '';

    private readonly MAX_LENGTH = 64;

    // Character sets for password generation
    private readonly numbers = '0123456789';
    private readonly special = '!@#$%^&*()-_=+[]{}|;:,.<>?/';
    private readonly lowercase = 'abcdefghijklmnopqrstuvwxyz';
    private readonly uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private readonly similarChars = 'il1Lo0O';
    private readonly ambiguousChars = '{}[]()/\\\'"`~,;:.<>';

    @query('#output') outputArea!: HTMLTextAreaElement;

    static styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        this.generatePassword();
    }

    protected renderTool() {
        return html`
            <style>
                .strength-meter {
                    height: 6px;
                    border-radius: 2px;
                    margin: 10px 0;
                    background-color: var(--vscode-editor-background);
                }

                .strength-fill {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.3s ease-in-out;
                }

                .strength-weak { background-color: #ff4545; }
                .strength-fair { background-color: #ffa534; }
                .strength-good { background-color: #ffde33; }
                .strength-strong { background-color: #84c440; }
                .strength-very-strong { background-color: #33c248; }
            </style>

            <div class="tool-inner-container">
                <p class="opacity-75">Generate strong, secure passwords with customizable options for length and character types.</p>
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
                    Password Length
                </div>
                <tool-slider
                    min="8"
                    max="${this.MAX_LENGTH}"
                    step="1"
                    .value=${this.passwordLength}
                    @change=${this.handleSliderChange}
                ></tool-slider>

                <tool-expandable label="Advanced Settings">
                    <div class="content-to-expand">
                        <div class="grid grid-cols-1 gap-2 mt-2">
                            <tool-switch
                                .checked=${this.excludeSimilarChars}
                                rightLabel="Exclude similar characters (i, l, 1, L, o, 0, O)"
                                ariaLabel="Exclude Similar Characters"
                                data-option="excludeSimilar"
                                @change=${this.handleOptionChange}
                            ></tool-switch>
                            <tool-switch
                                .checked=${this.excludeAmbiguous}
                                rightLabel="Exclude ambiguous characters ({}, [], (), etc.)"
                                ariaLabel="Exclude Ambiguous Characters"
                                data-option="excludeAmbiguous"
                                @change=${this.handleOptionChange}
                            ></tool-switch>
                        </div>
                    </div>
                </tool-expandable>

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6 font-mono break-all"
                        placeholder="Your generated password will appear here"
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
                            @click=${this.generatePassword}
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
                                class="lucide lucide-refresh-ccw"
                            >
                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                                <path d="M16 16h5v5"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Password Strength Meter -->
                <div class="mt-4">
                    <div class="flex justify-between items-center text-xs">
                        <span>Password Strength</span>
                        <span>${this.passwordStrengthText}</span>
                    </div>
                    <div class="strength-meter">
                        <div 
                            class="strength-fill ${this.getStrengthClass()}" 
                            style="width: ${this.passwordStrength}%">
                        </div>
                    </div>
                    <div class="text-xs mt-1 opacity-75">
                        Time to crack: ${this.crackingTime}
                    </div>
                </div>
            </div>
        `;
    }

    private handleSliderChange(e: CustomEvent) {
        this.passwordLength = e.detail.value;
        this.generatePassword();
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
        
        this.generatePassword();
    }

    private handleOptionChange(e: CustomEvent) {
        const target = e.currentTarget as HTMLElement;
        const option = target.getAttribute('data-option');
        const checked = e.detail.checked;
        
        switch (option) {
            case 'excludeSimilar':
                this.excludeSimilarChars = checked;
                break;
            case 'excludeAmbiguous':
                this.excludeAmbiguous = checked;
                break;
        }
        
        this.generatePassword();
    }

    private generatePassword() {
        // Ensure at least one character set is selected
        if (!this.includeNumbers && !this.includeSpecial && 
            !this.includeLowercase && !this.includeUppercase) {
            // Default to lowercase if nothing is selected
            this.includeLowercase = true;
        }

        // Build character set based on selected options
        let charset = '';
        if (this.includeNumbers) charset += this.numbers;
        if (this.includeSpecial) charset += this.special;
        if (this.includeLowercase) charset += this.lowercase;
        if (this.includeUppercase) charset += this.uppercase;

        if (this.excludeSimilarChars) {
            for (const char of this.similarChars) {
                charset = charset.replace(new RegExp(char, 'g'), '');
            }
        }
        
        if (this.excludeAmbiguous) {
            for (const char of this.ambiguousChars) {
                // Escape special characters in regex
                const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                charset = charset.replace(new RegExp(escapedChar, 'g'), '');
            }
        }

        let password = '';
        
        // First, ensure at least one character from each selected character set
        if (this.includeLowercase) {
            const filteredLower = this.excludeSimilarChars ? 
                this.lowercase.replace(/[il]/g, '') : this.lowercase;
            password += filteredLower.charAt(Math.floor(Math.random() * filteredLower.length));
        }
        
        if (this.includeUppercase) {
            const filteredUpper = this.excludeSimilarChars ? 
                this.uppercase.replace(/[LO]/g, '') : this.uppercase;
            password += filteredUpper.charAt(Math.floor(Math.random() * filteredUpper.length));
        }
        
        if (this.includeNumbers) {
            const filteredNumbers = this.excludeSimilarChars ? 
                this.numbers.replace(/[10]/g, '') : this.numbers;
            password += filteredNumbers.charAt(Math.floor(Math.random() * filteredNumbers.length));
        }
        
        if (this.includeSpecial) {
            let filteredSpecial = this.special;
            if (this.excludeAmbiguous) {
                for (const char of this.ambiguousChars) {
                    const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    filteredSpecial = filteredSpecial.replace(new RegExp(escapedChar, 'g'), '');
                }
            }
            password += filteredSpecial.charAt(Math.floor(Math.random() * filteredSpecial.length));
        }

        // Fill the rest of the password
        while (password.length < this.passwordLength) {
            const randomChar = charset.charAt(Math.floor(Math.random() * charset.length));
            password += randomChar;
        }

        password = this.shuffleString(password);
        
        this.output = password;
        this.calculatePasswordStrength(password);

        setTimeout(() => {
            if (this.outputArea) {
                adjustTextareaHeight(this.outputArea);
            }
        }, 0);
    }

    private shuffleString(str: string): string {
        const array = str.split('');
        
        // Fisher-Yates shuffle algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        
        return array.join('');
    }

    private calculatePasswordStrength(password: string) {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        let charsetSize = 0;
        if (hasLower) charsetSize += 26;
        if (hasUpper) charsetSize += 26;
        if (hasNumber) charsetSize += 10;
        if (hasSpecial) charsetSize += 33;
        
        // Calculate entropy bits: log2(charsetSize^length)
        const entropyBits = password.length * (Math.log(charsetSize) / Math.log(2));
        
        // Calculate cracking time in seconds (assuming 100 billion attempts per second)
        const attemptsPerSecond = 100_000_000_000;
        let secondsToCrack = Math.pow(2, entropyBits) / attemptsPerSecond;

        let strength;
        if (secondsToCrack <= 0) {
            strength = 0;
        } else {
            const logSeconds = Math.log10(secondsToCrack) / Math.log10(60);
            
            if (logSeconds < 0) {
                strength = 10 * (1 + logSeconds);
            } else if (logSeconds <= 10) {
                strength = 10 + (80 * logSeconds / 10);
            } else {
                strength = 90 + Math.min(10, (logSeconds - 10) * 2);
            }
        }
        
        this.passwordStrength = Math.min(100, Math.max(0, Math.round(strength)));
        this.crackingTime = this.formatTimespan(secondsToCrack);
        
        if (this.passwordStrength < 20) {
            this.passwordStrengthText = 'Very Weak';
        } else if (this.passwordStrength < 40) {
            this.passwordStrengthText = 'Weak';
        } else if (this.passwordStrength < 60) {
            this.passwordStrengthText = 'Fair';
        } else if (this.passwordStrength < 80) {
            this.passwordStrengthText = 'Strong';
        } else {
            this.passwordStrengthText = 'Very Strong';
        }
    }

    private formatTimespan(seconds: number): string {
        if (seconds < 0.001) {
            return "instantly";
        }
        if (seconds < 1) {
            return "less than a second";
        }
        if (seconds < 60) {
            return `${Math.round(seconds)} seconds`;
        }
        
        const minutes = seconds / 60;
        if (minutes < 60) {
            return `${Math.round(minutes)} minutes`;
        }
        
        const hours = minutes / 60;
        if (hours < 24) {
            return `${Math.round(hours)} hours`;
        }
        
        const days = hours / 24;
        if (days < 30) {
            return `${Math.round(days)} days`;
        }
        
        const months = days / 30;
        if (months < 12) {
            return `${Math.round(months)} months`;
        }
        
        const years = days / 365.25;
        if (years < 100) {
            return `${Math.round(years)} years`;
        }
        if (years < 1_000) {
            return `${Math.floor(years / 100) * 100} years`;
        }
        if (years < 1_000_000) {
            return `${Math.round(years / 1_000)} thousand years`;
        }
        if (years < 1_000_000_000) {
            return `${Math.round(years / 1_000_000)} million years`;
        }
        if (years < 1_000_000_000_000) {
            return `${Math.round(years / 1_000_000_000)} billion years`;
        }
        
        return "trillions of years";
    }

    private getStrengthClass() {
        if (this.passwordStrength < 20) {
            return 'strength-weak';
        } else if (this.passwordStrength < 40) {
            return 'strength-weak';
        } else if (this.passwordStrength < 60) {
            return 'strength-fair';
        } else if (this.passwordStrength < 80) {
            return 'strength-good';
        } else {
            return 'strength-very-strong';
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
}