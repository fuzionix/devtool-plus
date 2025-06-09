import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { renderCopyButton } from '../../../utils/util';
import '../../common/alert/Alert';
import '../../common/dropdown-menu/DropdownMenu';
import '../../common/switch/Switch';
import '../../common/tooltip/Tooltip';

type EncryptionMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM';
type KeySize = '128' | '192' | '256';
type Operation = 'encrypt' | 'decrypt';

@customElement('aes-encryption')
export class AesEncryption extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private keyText = '';
    @state() private ivText = '';
    @state() private isEncrypt = true;
    @state() private selectedMode: EncryptionMode = 'CBC';
    @state() private selectedKeySize: KeySize = '256';
    @state() private selectedOperation: Operation = 'encrypt';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private errorMessage = '';

    @query('#input') private input!: HTMLTextAreaElement;
    @query('#output') private output!: HTMLTextAreaElement;

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">AES (Advanced Encryption Standard) is a symmetric encryption algorithm that securely transforms data using various block cipher modes and key sizes.</p>
                <hr />

                <!-- Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="AES Operation Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedOperation === 'encrypt' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('encrypt')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </span>
                            <h4>Encrypt</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedOperation === 'decrypt' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('decrypt')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-open-icon lucide-lock-open"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                            </span>
                            <h4>Decrypt</h4>
                        </button>
                    </div>
                </div>

                <!-- Key and Encryption Input -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Encryption Mode
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'CBC', value: 'CBC' },
                                { label: 'ECB', value: 'ECB' },
                                { label: 'CFB', value: 'CFB' },
                                { label: 'OFB', value: 'OFB' },
                                { label: 'CTR', value: 'CTR' },
                                { label: 'GCM', value: 'GCM' }
                            ]}
                            .value=${this.selectedMode}
                            placeholder="Select Mode"
                            @change=${this.handleEncryptionModeChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Key Size
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: '128 bits', value: '128' },
                                { label: '192 bits', value: '192' },
                                { label: '256 bits', value: '256' }
                            ]}
                            .value=${this.selectedKeySize}
                            placeholder="Select Key Size"
                            @change=${this.handleKeySizeChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <!-- Key Input -->
                <div class="mb-2 text-xs">
                    Key
                </div>
                <div class="relative flex items-center mb-4">
                    <input
                        id="key"
                        type="text"
                        class="input-expandable"
                        placeholder="Enter Key"
                        .value=${this.keyText}
                        @input=${this.handleKeyChange}
                    ></input>
                </div>

                <!-- Input Field -->
                <div class="mb-2 text-xs">
                    ${this.selectedOperation === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
                </div>
                <div class="relative flex items-center my-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter text to ${this.selectedOperation === 'encrypt' ? 'encrypt' : 'decrypt'}"
                        rows="3"
                        .value=${this.inputText}
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

                <tool-expandable label="Advanced Settings">
                    <div class="content-to-expand">
                        <p class="mb-2 text-xs">IV</p>
                        <p class="mb-2 text-xs opacity-75">
                            Initialization Vector (IV) is used to ensure that identical plaintexts encrypt to different ciphertexts.
                        </p>
                        <input 
                            id="iv"
                            type="text" 
                            placeholder="Enter IV (optional)"
                            .value=${this.ivText}
                            @input=${this.handleIvChange}
                        ></input>
                        ${this.alert ? html`
                            <tool-alert
                                .type=${this.alert.type}
                                .message=${this.alert.message}
                            ></tool-alert>
                        ` : ''}
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
                        class="input-expandable mt-2 pr-6"
                        placeholder="Output will appear here"
                        rows="3"
                        readonly
                        .value=${this.outputText}
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

    private handleModeChange(mode: 'encrypt' | 'decrypt') {
        this.selectedOperation = mode;
    }

    private async copyToClipboard() {
        if (!this.output) return;
        try {
            await navigator.clipboard.writeText(this.outputText);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }

    private clearAll(): void {
        this.inputText = '';
        this.outputText = '';
        this.alert = null;

        this.input.value = '';
        this.output.value = '';

        this.input.style.height = `auto`;
        this.output.style.height = `auto`;
        this.requestUpdate();
    }
}