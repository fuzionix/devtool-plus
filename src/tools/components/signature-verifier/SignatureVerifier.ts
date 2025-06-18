import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight, renderCopyButton } from '../../../utils/util';
import '../../common/alert/Alert';
import '../../common/dropdown-menu/DropdownMenu';
import '../../common/inline-menu/InlineMenu';
import '../../common/switch/Switch';
import '../../common/tooltip/Tooltip';

type SignatureAlgorithm = 'RSA-PSS' | 'RSA-PKCS1-v1_5' | 'ECDSA';
type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
type KeyFormat = 'PEM' | 'DER' | 'JWK';
type Operation = 'sign' | 'verify';
type InputEncoding = 'utf-8' | 'hex' | 'base64';

@customElement('signature-verifier')
export class SignatureVerifier extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private keyText = '';
    @state() private signatureText = '';
    @state() private privateKeyText = '';
    @state() private publicKeyText = '';
    @state() private selectedAlgorithm: SignatureAlgorithm = 'RSA-PSS';
    @state() private selectedHash: HashAlgorithm = 'SHA-256';
    @state() private selectedKeyFormat: KeyFormat = 'PEM';
    @state() private selectedOperation: Operation = 'sign';
    @state() private inputEncoding: InputEncoding = 'utf-8';
    @state() private outputEncoding = true; // true = Base64, false = Hex
    @state() private fileName = '';
    @state() private file: File | null = null;
    @state() private keyFile: File | null = null;
    @state() private keyFileName = '';
    @state() private alert: { type: 'error' | 'warning' | 'success'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private isPrivateKey = true;
    @state() private keySizeBits = 2048;
    @state() private curve = 'P-256';
    @state() private isGeneratingKey = false;
    @state() private saltLength = 32;

    @query('#input') private input!: HTMLTextAreaElement;
    @query('#output') private output!: HTMLTextAreaElement;
    @query('#file-input') private fileInput!: HTMLInputElement;
    @query('#key-file-input') private keyFileInput!: HTMLInputElement;

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Digital signatures verify the authenticity and integrity of messages. This tool supports RSA and ECDSA signatures with various key formats.</p>
                <hr />

                <!-- Hidden File Inputs -->
                <input id="file-input" class="hidden" type="file" @change=${this.handleFileSelect}>
                <input id="key-file-input" class="hidden" type="file" @change=${this.handleKeyFileSelect}>

                <!-- Operation Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="Signature Operation Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedOperation === 'sign' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleOperationChange('sign')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg>
                            </span>
                            <h4>Sign</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedOperation === 'verify' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleOperationChange('verify')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-check-icon lucide-file-check"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>
                            </span>
                            <h4>Verify</h4>
                        </button>
                    </div>
                </div>

                <!-- Signature Settings -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Algorithm
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'RSA-PSS', value: 'RSA-PSS' },
                                { label: 'RSA-PKCS1', value: 'RSA-PKCS1-v1_5' },
                                { label: 'ECDSA', value: 'ECDSA' }
                            ]}
                            .value=${this.selectedAlgorithm}
                            placeholder="Select Algorithm"
                            @change=${this.handleAlgorithmChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Hash Function
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'SHA-256', value: 'SHA-256' },
                                { label: 'SHA-384', value: 'SHA-384' },
                                { label: 'SHA-512', value: 'SHA-512' }
                            ]}
                            .value=${this.selectedHash}
                            placeholder="Select Hash"
                            @change=${this.handleHashChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <!-- Key Format Selection -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 mb-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Key Format
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'PEM', value: 'PEM' },
                                { label: 'DER (Base64)', value: 'DER' },
                                { label: 'JWK (JSON)', value: 'JWK' }
                            ]}
                            .value=${this.selectedKeyFormat}
                            placeholder="Select Key Format"
                            @change=${this.handleKeyFormatChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Key Type
                        </div>
                        <div class="radio-group" role="radiogroup" aria-label="Key Type">
                            <button 
                                role="radio"
                                aria-checked=${this.isPrivateKey ? 'true' : 'false'}
                                class="radio-group-button flex justify-center items-center"
                                @click=${() => this.handleKeyTypeChange(true)}
                                ?disabled=${this.selectedOperation === 'verify'}
                            >
                                <h4>Private</h4>
                            </button>
                            <button 
                                role="radio"
                                aria-checked=${!this.isPrivateKey ? 'true' : 'false'}
                                class="radio-group-button flex justify-center items-center"
                                @click=${() => this.handleKeyTypeChange(false)}
                                ?disabled=${this.selectedOperation === 'sign'}
                            >
                                <h4>Public</h4>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Key Input -->
                <div class="mb-2 text-xs flex justify-between items-center">
                    <span>${this.isPrivateKey ? 'Private' : 'Public'} Key</span>
                    <div class="flex">
                        <button 
                            class="btn-text text-xs ${this.selectedOperation === 'sign' && !this.isGeneratingKey ? '' : 'hidden'}" 
                            @click=${this.generateKeyPair}
                            ?disabled=${this.isGeneratingKey}
                        >
                            ${this.isGeneratingKey ? 'Generating...' : 'Generate Key Pair'}
                        </button>
                    </div>
                </div>
                <div class="relative flex items-center mb-4">
                    <textarea
                        id="key-input"
                        class="input-expandable resize-y font-mono"
                        placeholder="${this.getKeyPlaceholder()}"
                        rows="3"
                        .value=${this.keyFileName || this.keyText}
                        @input=${this.handleKeyInput}
                        ?readonly=${Boolean(this.keyFileName)}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Upload key file">
                            <button class="btn-icon" @click=${this.triggerKeyFileInput}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/><circle cx="18.5" cy="15.5" r="2.5"/><path d="M20.27 17.27 22 19"/></svg>
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" @click=${this.clearKey}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>

                ${this.selectedOperation === 'verify' ? this.renderSignatureInput() : ''}

                <!-- Message Input -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">
                        Message
                    </p>
                    <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'UTF-8', value: 'utf-8' },
                                { label: 'Hex', value: 'hex' },
                                { label: 'Base64', value: 'base64' }
                            ]}
                            .value=${this.inputEncoding}
                            placeholder="Input Encoding"
                            @change=${this.handleInputEncodingChange}
                        ></tool-inline-menu>
                    </div>
                </div>
                <div class="relative flex items-center my-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter message to ${this.selectedOperation}"
                        rows="3"
                        .value=${this.fileName || this.inputText}
                        @input=${this.handleInput}
                        ?readonly=${Boolean(this.fileName)}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Upload file">
                            <button class="btn-icon" id="file" @click=${this.triggerFileInput}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
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

                <!-- Advanced Options for Algorithms -->
                <tool-expandable label="Advanced Options">
                    <div class="content-to-expand z-10">
                        ${this.selectedAlgorithm === 'RSA-PSS' ? html`
                            <!-- RSA-PSS Options -->
                            <p class="mb-2 text-xs">Salt Length: ${this.saltLength} bytes</p>
                            <p class="mb-2 text-xs opacity-75">
                                Salt length for PSS padding. Recommended to match hash output size.
                            </p>
                            <tool-slider
                                min="16"
                                max="64"
                                step="8"
                                .value=${this.saltLength.toString()}
                                @change=${this.handleSaltLengthChange}
                            ></tool-slider>
                        ` : ''}

                        ${this.selectedAlgorithm === 'ECDSA' ? html`
                            <div class="mb-4">
                                <p class="mb-2 text-xs">Elliptic Curve</p>
                                <tool-dropdown-menu
                                    .options=${[
                                        { label: 'P-256', value: 'P-256' },
                                        { label: 'P-384', value: 'P-384' },
                                        { label: 'P-521', value: 'P-521' }
                                    ]}
                                    .value=${this.curve}
                                    placeholder="Select Curve"
                                    @change=${this.handleCurveChange}
                                ></tool-dropdown-menu>
                            </div>
                        ` : ''}

                        ${this.selectedAlgorithm.startsWith('RSA') ? html`
                            <div class="mb-4">
                                <p class="mb-2 text-xs">RSA Key Size: ${this.keySizeBits} bits</p>
                                <tool-dropdown-menu
                                    .options=${[
                                        { label: '1024 bits (weak)', value: '1024' },
                                        { label: '2048 bits', value: '2048' },
                                        { label: '4096 bits', value: '4096' }
                                    ]}
                                    .value=${this.keySizeBits.toString()}
                                    placeholder="Select Key Size"
                                    @change=${this.handleKeySizeChange}
                                ></tool-dropdown-menu>
                            </div>
                        ` : ''}
                    </div>
                </tool-expandable>

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6"
                        placeholder="${this.selectedOperation === 'sign' ? 'Signature will appear here' : 'Verification result will appear here'}"
                        rows="3"
                        readonly
                        .value=${this.outputText}
                    ></textarea>
                    <div class="absolute right-0 top-2.5 pr-0.5 flex justify-items-center">
                        <button 
                            id="copy" 
                            class="btn-icon"
                            @click=${this.copyToClipboard}
                            ?disabled=${!this.outputText}
                        >
                            ${renderCopyButton(this.isCopied)}
                        </button>
                    </div>
                </div>
                
                ${this.selectedOperation === 'sign' ? html`
                    <div class="flex justify-between items-center mt-2">
                        <tool-switch
                            .checked=${this.outputEncoding}
                            leftLabel="Hex"
                            rightLabel="Base64"
                            ariaLabel="Signature Output Encoding"
                            @change=${this.handleOutputEncodingChange}
                        ></tool-switch>
                    </div>
                ` : ''}
                
                ${this.selectedOperation === 'verify' && this.outputText ? html`
                    <div class="flex mt-2">
                        ${this.outputText === 'Signature verified successfully!' ? html`
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a754" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
                            <p class="mb-0 ml-1 text-xs text-[#58a754]">Verified</p>
                        ` : html`
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9.09 9.09 5.82 5.82"/><path d="m14.91 9.09-5.82 5.82"/></svg>
                            <p class="mb-0 ml-1 text-xs text-[#e74c3c]">Invalid</p>
                        `}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private renderSignatureInput() {
        return html`
            <div class="mb-2 text-xs flex justify-between items-center">
                <span>Signature</span>
                <div>
                    <tool-inline-menu
                        .options=${[
                            { label: 'Base64', value: 'base64' },
                            { label: 'Hex', value: 'hex' }
                        ]}
                        .value=${this.outputEncoding ? 'base64' : 'hex'}
                        placeholder="Signature Format"
                        @change=${(e: CustomEvent) => this.handleSignatureFormatChange(e)}
                    ></tool-inline-menu>
                </div>
            </div>
            <div class="relative flex items-center mb-4">
                <textarea
                    id="signature-input"
                    class="input-expandable"
                    placeholder="Enter signature to verify"
                    rows="2"
                    .value=${this.signatureText}
                    @input=${this.handleSignatureInput}
                ></textarea>
            </div>
        `;
    }

    private getKeyPlaceholder(): string {
        if (this.selectedKeyFormat === 'PEM') {
            return this.isPrivateKey 
                ? '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----' 
                : '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----';
        } else if (this.selectedKeyFormat === 'DER') {
            return 'Base64-encoded DER key';
        } else {
            return '{"kty":"RSA","n":"...","e":"...","d":"..."}';
        }
    }

    private handleOperationChange(operation: Operation) {
        if (this.selectedOperation === operation) return;
        
        this.selectedOperation = operation;
        this.outputText = '';
        this.alert = null;
        
        // Automatically switch to appropriate key type
        if (operation === 'sign') {
            this.isPrivateKey = true;
            if (this.privateKeyText) {
                this.keyText = this.privateKeyText;
            }
        } else if (operation === 'verify') {
            this.isPrivateKey = false;
            if (this.publicKeyText) {
                this.keyText = this.publicKeyText;
            }
        }
        
        this.processInput();
    }

    private handleAlgorithmChange(e: CustomEvent) {
        const newAlgorithm = e.detail.value as SignatureAlgorithm;
        if (this.selectedAlgorithm === newAlgorithm) return;
        
        this.selectedAlgorithm = newAlgorithm;
        this.outputText = '';
        this.resetKey();
        this.processInput();
    }

    private handleHashChange(e: CustomEvent) {
        this.selectedHash = e.detail.value as HashAlgorithm;
        
        // Update salt length to match hash output size
        if (this.selectedAlgorithm === 'RSA-PSS') {
            switch (this.selectedHash) {
                case 'SHA-256':
                    this.saltLength = 32;
                    break;
                case 'SHA-384':
                    this.saltLength = 48;
                    break;
                case 'SHA-512':
                    this.saltLength = 64;
                    break;
            }
        }
        
        this.processInput();
    }

    private handleKeyFormatChange(e: CustomEvent) {
        const newFormat = e.detail.value as KeyFormat;
        if (this.selectedKeyFormat === newFormat) return;
        
        this.selectedKeyFormat = newFormat;
        this.resetKey();
        this.processInput();
    }

    private handleKeyTypeChange(isPrivate: boolean) {
        if (this.isPrivateKey === isPrivate) return;
        
        this.isPrivateKey = isPrivate;
        if (isPrivate && this.privateKeyText) {
            this.keyText = this.privateKeyText;
        } else if (!isPrivate && this.publicKeyText) {
            this.keyText = this.publicKeyText;
        } else {
            this.keyText = '';
        }
        this.processInput();
    }

    private handleInputEncodingChange(e: CustomEvent) {
        if (!this.inputText) {
            this.inputEncoding = e.detail.value;
            return;
        }
        
        if (this.fileName) {
            this.alert = {
                type: 'warning',
                message: 'Please clear the current file before changing encoding.'
            };
            return;
        }
        
        const oldEncoding = this.inputEncoding;
        const newEncoding = e.detail.value as InputEncoding;
        
        if (oldEncoding === newEncoding) return;
        
        try {
            let binaryData: ArrayBuffer;
            
            switch (oldEncoding) {
                case 'utf-8':
                    binaryData = new TextEncoder().encode(this.inputText).buffer;
                    break;
                case 'hex':
                    try {
                        binaryData = this.hexToArrayBuffer(this.inputText);
                    } catch (error) {
                        this.inputEncoding = newEncoding;
                        this.inputText = '';
                        this.alert = null;
                        return;
                    }
                    break;
                case 'base64':
                    try {
                        binaryData = this.base64ToArrayBuffer(this.inputText);
                    } catch (error) {
                        this.inputEncoding = newEncoding;
                        this.inputText = '';
                        this.alert = null;
                        return;
                    }
                    break;
                default:
                    throw new Error(`Unsupported input encoding: ${oldEncoding}`);
            }
            
            switch (newEncoding) {
                case 'utf-8':
                    this.inputText = new TextDecoder().decode(binaryData);
                    break;
                case 'hex':
                    this.inputText = this.arrayBufferToHex(binaryData);
                    break;
                case 'base64':
                    this.inputText = this.arrayBufferToBase64(binaryData);
                    break;
                default:
                    throw new Error(`Unsupported target encoding: ${newEncoding}`);
            }
            
            this.inputEncoding = newEncoding;
            this.processInput();
        } catch (error) {
            this.alert = {
                type: 'error',
                message: 'Failed to convert input format. The input may contain invalid characters.'
            };
        }
    }

    private handleOutputEncodingChange(e: CustomEvent) {
        this.outputEncoding = e.detail.checked;
        this.processInput();
    }

    private handleSignatureFormatChange(e: CustomEvent) {
        const format = e.detail.value;
        this.outputEncoding = format === 'base64';
        
        // Try to convert existing signature between formats
        if (this.signatureText) {
            try {
                let signatureData: ArrayBuffer;
                
                if (format === 'base64' && !this.outputEncoding) {
                    signatureData = this.hexToArrayBuffer(this.signatureText);
                    this.signatureText = this.arrayBufferToBase64(signatureData);
                } else if (format === 'hex' && this.outputEncoding) {
                    signatureData = this.base64ToArrayBuffer(this.signatureText);
                    this.signatureText = this.arrayBufferToHex(signatureData);
                }
            } catch (error) {
                this.signatureText = '';
            }
        }
        
        this.processInput();
    }

    private handleSaltLengthChange(e: Event) {
        const target = e.target as HTMLInputElement;
        this.saltLength = parseInt(target.value);
        this.processInput();
    }

    private handleCurveChange(e: CustomEvent) {
        this.curve = e.detail.value;
        this.resetKey();
        this.processInput();
    }

    private handleKeySizeChange(e: CustomEvent) {
        this.keySizeBits = parseInt(e.detail.value);
        this.resetKey();
        this.processInput();
    }

    private handleInput(e: Event) {
        if (!this.fileName) {
            const target = e.target as HTMLTextAreaElement;
            this.inputText = target.value;
            this.processInput();
        }
        adjustTextareaHeight(this.input);
    }

    private handleKeyInput(e: Event) {
        if (!this.keyFileName) {
            const target = e.target as HTMLTextAreaElement;
            this.keyText = target.value;
            this.processInput();
        }
    }

    private handleSignatureInput(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.signatureText = target.value;
        this.processInput();
    }

    private async generateKeyPair() {
        this.isGeneratingKey = true;
        this.alert = null;
        
        try {
            let algorithm: RsaHashedKeyGenParams | EcKeyGenParams;
            let usages: KeyUsage[];
            
            if (this.selectedAlgorithm.startsWith('RSA')) {
                algorithm = {
                    name: this.selectedAlgorithm === 'RSA-PSS' ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
                    modulusLength: this.keySizeBits,
                    publicExponent: new Uint8Array([1, 0, 1]), // 65537
                    hash: this.selectedHash
                };
                usages = ['sign', 'verify'];
            } else {
                algorithm = {
                    name: 'ECDSA',
                    namedCurve: this.curve
                };
                usages = ['sign', 'verify'];
            }
            
            const keyPair = await window.crypto.subtle.generateKey(
                algorithm,
                true,
                usages
            );
            
            // Export the private key in the selected format
            let privateKeyOutput = '';
            if (this.selectedKeyFormat === 'JWK') {
                const jwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
                privateKeyOutput = JSON.stringify(jwk, null, 2);
            } else if (this.selectedKeyFormat === 'PEM' || this.selectedKeyFormat === 'DER') {
                const exported = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
                
                if (this.selectedKeyFormat === 'PEM') {
                    privateKeyOutput = this.arrayBufferToPem(exported, true);
                } else {
                    privateKeyOutput = this.arrayBufferToBase64(exported);
                }
            }
            
            // Export the public key and store it
            let publicKeyOutput = '';
            if (this.selectedKeyFormat === 'JWK') {
                const jwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
                publicKeyOutput = JSON.stringify(jwk, null, 2);
            } else if (this.selectedKeyFormat === 'PEM' || this.selectedKeyFormat === 'DER') {
                const exported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
                
                if (this.selectedKeyFormat === 'PEM') {
                    publicKeyOutput = this.arrayBufferToPem(exported, false);
                } else {
                    publicKeyOutput = this.arrayBufferToBase64(exported);
                }
            }
            
            this.privateKeyText = privateKeyOutput;
            this.publicKeyText = publicKeyOutput;

            // Set the key text based on the current operation mode
            this.keyText = this.isPrivateKey ? this.privateKeyText : this.publicKeyText;

            this.processInput();
        } catch (error) {
            this.alert = {
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to generate key pair'
            };
        } finally {
            this.isGeneratingKey = false;
        }
    }

    private async processInput(): Promise<void> {
        this.alert = null;
        
        if (!this.inputText && !this.file) {
            this.outputText = '';
            return;
        }
        
        if (!this.keyText && !this.keyFile) {
            this.outputText = '';
            return;
        }
        
        if (this.selectedOperation === 'verify' && !this.signatureText) {
            this.outputText = '';
            return;
        }
        
        try {
            if (this.selectedOperation === 'sign') {
                if (!this.isPrivateKey) {
                    this.alert = {
                        type: 'error',
                        message: 'Private key is required for signing'
                    };
                    this.outputText = '';
                    return;
                }
                
                this.outputText = await this.sign();
            } else {
                const isValid = await this.verify();
                this.outputText = isValid ? 
                    'Signature verified successfully!' : 
                    'Invalid signature or key';
            }
        } catch (error) {
            this.alert = {
                type: 'error',
                message: error instanceof Error ? error.message : 'An error occurred during processing'
            };
            this.outputText = '';
        }
        
        setTimeout(() => adjustTextareaHeight(this.output), 0);
    }

    private async sign(): Promise<string> {
        try {
            const privateKey = await this.importKey(this.keyText, true);
            const messageData = await this.getMessageData();
            const signature = await window.crypto.subtle.sign(
                this.getAlgorithmParams(),
                privateKey,
                messageData
            );
            
            return this.outputEncoding ? 
                this.arrayBufferToBase64(signature) : 
                this.arrayBufferToHex(signature);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Signing operation failed');
            }
        }
    }

    private async verify(): Promise<boolean> {
        try {
            const publicKey = await this.importKey(this.keyText, false);
            const messageData = await this.getMessageData();
            
            let signatureData: ArrayBuffer;
            try {
                if (this.outputEncoding) {
                    signatureData = this.base64ToArrayBuffer(this.signatureText);
                } else {
                    signatureData = this.hexToArrayBuffer(this.signatureText);
                }
            } catch (error) {
                throw new Error('Invalid signature format');
            }
            
            return await window.crypto.subtle.verify(
                this.getAlgorithmParams(),
                publicKey,
                signatureData,
                messageData
            );
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Verification operation failed');
            }
        }
    }

    private async importKey(keyData: string, isPrivate: boolean): Promise<CryptoKey> {
        try {
            let key: ArrayBuffer | JsonWebKey;
            
            if (this.selectedKeyFormat === 'PEM') {
                const pemContent = keyData.replace(/-----[^-]+-----/g, '')
                    .replace(/\s+/g, '');
                key = this.base64ToArrayBuffer(pemContent);
            } else if (this.selectedKeyFormat === 'DER') {
                key = this.base64ToArrayBuffer(keyData);
            } else if (this.selectedKeyFormat === 'JWK') {
                try {
                    key = JSON.parse(keyData);
                } catch (e) {
                    throw new Error('Invalid JWK format');
                }
            } else {
                throw new Error('Unsupported key format');
            }
            
            const algorithm = this.getAlgorithmName();
            const keyUsages: KeyUsage[] = isPrivate ? ['sign'] : ['verify'];

            let params: any;
            if (algorithm === 'ECDSA') {
                params = {
                    name: algorithm,
                    namedCurve: this.curve
                };
            } else {
                params = {
                    name: algorithm,
                    hash: this.selectedHash
                };
            }
            
            if (this.selectedKeyFormat === 'JWK') {
                return await window.crypto.subtle.importKey(
                    'jwk',
                    key as JsonWebKey,
                    params,
                    false,
                    keyUsages
                );
            } else {
                const format = isPrivate ? 'pkcs8' : 'spki';
                
                return await window.crypto.subtle.importKey(
                    format,
                    key as ArrayBuffer,
                    params,
                    false,
                    keyUsages
                );
            }
        } catch (error) {
            console.error('Key import error:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to import key: ${error.message}`);
            } else {
                throw new Error('Failed to import key');
            }
        }
    }

    private getAlgorithmName(): string {
        switch (this.selectedAlgorithm) {
            case 'RSA-PSS': return 'RSA-PSS';
            case 'RSA-PKCS1-v1_5': return 'RSASSA-PKCS1-v1_5';
            case 'ECDSA': return 'ECDSA';
            default: return 'RSASSA-PKCS1-v1_5';
        }
    }

    private getAlgorithmParams(): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
        switch (this.selectedAlgorithm) {
            case 'RSA-PSS':
                return {
                    name: 'RSA-PSS',
                    saltLength: this.saltLength
                };
            case 'RSA-PKCS1-v1_5':
                return {
                    name: 'RSASSA-PKCS1-v1_5'
                };
            case 'ECDSA':
                return {
                    name: 'ECDSA',
                    hash: this.selectedHash
                };
            default:
                return {
                    name: 'RSASSA-PKCS1-v1_5'
                };
        }
    }

    private async getMessageData(): Promise<ArrayBuffer> {
        if (this.file && this.fileName) {
            return await this.readFileAsArrayBuffer(this.file);
        } else if (this.inputEncoding === 'hex') {
            return this.hexToArrayBuffer(this.inputText);
        } else if (this.inputEncoding === 'base64') {
            return this.base64ToArrayBuffer(this.inputText);
        } else {
            const encoder = new TextEncoder();
            return encoder.encode(this.inputText).buffer;
        }
    }

    private hexToArrayBuffer(hexString: string): ArrayBuffer {
        if (!/^[0-9a-fA-F\s]*$/.test(hexString)) {
            throw new Error('Invalid hex input: contains non-hex characters');
        }

        // Remove any spaces or non-hex characters
        const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');

        if (cleanHex.length % 2 !== 0) {
            throw new Error('Invalid hex input: hex string must have an even number of digits');
        }

        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
        }
        
        return bytes.buffer;
    }

    private arrayBufferToHex(buffer: ArrayBuffer | Uint8Array): string {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        try {
            const binaryString = atob(base64.trim().replace(/\s+/g, ''));
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        } catch (error) {
            throw new Error('Invalid Base64 input');
        }
    }

    private arrayBufferToPem(buffer: ArrayBuffer, isPrivate: boolean): string {
        const base64 = this.arrayBufferToBase64(buffer);
        const pemType = isPrivate ? 'PRIVATE KEY' : 'PUBLIC KEY';
        
        // Wrap the base64 string to 64 characters per line
        let formattedBase64 = '';
        for (let i = 0; i < base64.length; i += 64) {
            formattedBase64 += base64.slice(i, i + 64) + '\n';
        }
        
        return `-----BEGIN ${pemType}-----\n${formattedBase64}-----END ${pemType}-----`;
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
        this.fileName = '';
        this.file = null;
        this.fileInput.value = '';

        if (this.input) {
            this.input.value = '';
            this.input.style.height = `auto`;
        }
        
        if (this.output) {
            this.output.value = '';
            this.output.style.height = `auto`;
        }
        
        this.requestUpdate();
    }

    private clearKey(): void {
        this.resetKey();
        if (this.keyFileInput) {
            this.keyFileInput.value = '';
        }
        this.requestUpdate();
    }

    private resetKey(): void {
        this.keyText = '';
        this.keyFileName = '';
        this.keyFile = null;
        this.privateKeyText = '';
        this.publicKeyText = '';
    }
    
    private triggerFileInput(): void {
        this.fileInput.click();
    }

    private triggerKeyFileInput(): void {
        this.keyFileInput.click();
    }

    private async handleFileSelect(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];
        
        if (file) {
            try {
                this.file = file;
                this.fileName = file.name;
                
                if (file.type.startsWith('text/')) {
                    this.inputEncoding = 'utf-8';
                } else {
                    this.inputEncoding = 'base64';
                }
                
                const MAX_AUTO_PROCESS_SIZE = 10 * 1024 * 1024;
                
                if (file.size > MAX_AUTO_PROCESS_SIZE) {
                    this.alert = {
                        type: 'warning',
                        message: `File exceeds 10MB which may cause performance issues.`,
                    };
                } else {
                    this.processInput();
                }
            } catch (error) {
                this.alert = {
                    type: 'error',
                    message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
                this.clearAll();
            }
        }
    }

    private async handleKeyFileSelect(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];
        
        if (file) {
            try {
                this.keyFile = file;
                this.keyFileName = file.name;
                
                const reader = new FileReader();
                
                const keyData = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result);
                        } else {
                            reject(new Error('Failed to read key file as text'));
                        }
                    };
                    reader.onerror = () => reject(new Error('Error reading key file'));
                    
                    if (this.selectedKeyFormat === 'DER') {
                        // For DER, read as base64
                        reader.readAsArrayBuffer(file);
                    } else {
                        // For PEM and JWK, read as text
                        reader.readAsText(file);
                    }
                });
                
                if (this.selectedKeyFormat === 'DER' && reader.result instanceof ArrayBuffer) {
                    this.keyText = this.arrayBufferToBase64(reader.result);
                } else {
                    this.keyText = keyData;
                }
                
                if (this.selectedKeyFormat === 'PEM' && !this.keyText.includes('-----BEGIN')) {
                    this.alert = {
                        type: 'warning',
                        message: 'The key file does not appear to be in PEM format. Consider changing the key format.',
                    };
                }
                
                this.processInput();
            } catch (error) {
                this.alert = {
                    type: 'error',
                    message: `Failed to read key file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
                this.clearKey();
            }
        }
    }

    private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result instanceof ArrayBuffer) {
                    resolve(e.target.result);
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
}