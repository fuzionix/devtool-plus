import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight, renderCopyButton } from '../../../utils/util';

type KeyFormat = 'PEM' | 'DER' | 'JWK';
type Operation = 'encrypt' | 'decrypt';
type PaddingScheme = 'OAEP' | 'PKCS1';
type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
type InputEncoding = 'utf-8' | 'hex' | 'base64';

@customElement('rsa-encryption')
export class RsaEncryption extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private keyText = '';
    @state() private selectedOperation: Operation = 'encrypt';
    @state() private selectedKeyFormat: KeyFormat = 'PEM';
    @state() private selectedPadding: PaddingScheme = 'OAEP';
    @state() private selectedHash: HashAlgorithm = 'SHA-256';
    @state() private inputEncoding: InputEncoding = 'utf-8';
    @state() private outputEncoding = true; // true = Base64, false = Hex
    @state() private fileName = '';
    @state() private file: File | null = null;
    @state() private keyFileName = '';
    @state() private keyFile: File | null = null;
    @state() private alert: { type: 'error' | 'warning' | 'success'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private isPrivateKey = false;

    @query('#input') private input!: HTMLTextAreaElement;
    @query('#output') private output!: HTMLTextAreaElement;
    @query('#file-input') private fileInput!: HTMLInputElement;
    @query('#key-file-input') private keyFileInput!: HTMLInputElement;

    private styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">RSA cryptography for secure data exchange. Encrypt messages with public keys, and decrypt with private keys.</p>
                <hr />

                <!-- Hidden File Inputs -->
                <input id="file-input" class="hidden" type="file" @change=${this.handleFileSelect}>
                <input id="key-file-input" class="hidden" type="file" @change=${this.handleKeyFileSelect}>

                <!-- Operation Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="RSA Operation Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedOperation === 'encrypt' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleOperationChange('encrypt')}
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
                            @click=${() => this.handleOperationChange('decrypt')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-open-icon lucide-lock-open"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                            </span>
                            <h4>Decrypt</h4>
                        </button>
                    </div>
                </div>

                <!-- Key Format and Type Selection -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
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
                                aria-checked=${!this.isPrivateKey ? 'true' : 'false'}
                                class="radio-group-button flex justify-center items-center"
                                @click=${() => this.handleKeyTypeChange(false)}
                                ?disabled=${this.selectedOperation === 'decrypt'}
                            >
                                <h4>Public</h4>
                            </button>
                            <button 
                                role="radio"
                                aria-checked=${this.isPrivateKey ? 'true' : 'false'}
                                class="radio-group-button flex justify-center items-center"
                                @click=${() => this.handleKeyTypeChange(true)}
                                ?disabled=${this.selectedOperation === 'encrypt'}
                            >
                                <h4>Private</h4>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Padding Scheme and Hash Algorithm -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 mb-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Padding Scheme
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'OAEP', value: 'OAEP' },
                                { label: 'PKCS1-v1_5', value: 'PKCS1' }
                            ]}
                            .value=${this.selectedPadding}
                            placeholder="Select Padding"
                            @change=${this.handlePaddingChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Hash Algorithm
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'SHA-256', value: 'SHA-256' },
                                { label: 'SHA-384', value: 'SHA-384' },
                                { label: 'SHA-512', value: 'SHA-512' }
                            ]}
                            .value=${this.selectedHash}
                            placeholder="Select Hash"
                            ?disabled=${this.selectedPadding === 'PKCS1'}
                            @change=${this.handleHashChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>
                
                <!-- Key Input -->
                <div class="mb-2 text-xs flex justify-between items-center">
                    <span>${this.isPrivateKey ? 'Private' : 'Public'} Key</span>
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

                <!-- Message Input -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">
                        ${this.selectedOperation === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
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
                        placeholder="${this.selectedOperation === 'encrypt' ? 'Enter text to encrypt' : 'Enter ciphertext to decrypt'}"
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

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6"
                        placeholder="${this.selectedOperation === 'encrypt' ? 'Encrypted data will appear here' : 'Decrypted data will appear here'}"
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
                
                <div class="flex justify-between items-center mt-2">
                    <tool-switch
                        .checked=${this.outputEncoding}
                        leftLabel="Hex"
                        rightLabel="Base64"
                        ariaLabel="Output Encoding"
                        @change=${this.handleOutputEncodingChange}
                    ></tool-switch>
                </div>
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
            return this.isPrivateKey
                ? '{"kty":"RSA","n":"...","e":"...","d":"..."}'
                : '{"kty":"RSA","n":"...","e":"..."}';
        }
    }

    private handleOperationChange(operation: Operation) {
        if (this.selectedOperation === operation) return;
        
        this.selectedOperation = operation;
        this.outputText = '';
        this.keyText = '';
        this.alert = null;
        
        // Automatically switch to appropriate key type
        if (operation === 'encrypt') {
            this.isPrivateKey = false;
        } else if (operation === 'decrypt') {
            this.isPrivateKey = true;
            this.inputEncoding = this.outputEncoding ? 'base64' : 'hex';
            this.inputText = '';
            this.fileName = '';
        }
        
        this.processInput();
    }

    private handleKeyFormatChange(e: CustomEvent) {
        const newFormat = e.detail.value as KeyFormat;
        if (this.selectedKeyFormat === newFormat) return;
        
        this.selectedKeyFormat = newFormat;
        this.keyText = '';
        this.keyFileName = '';
        this.keyFile = null;
        this.outputText = '';
        this.alert = null;
    }

    private handleKeyTypeChange(isPrivate: boolean) {
        if (this.isPrivateKey === isPrivate) return;
        
        this.isPrivateKey = isPrivate;
        this.keyText = '';
        this.keyFileName = '';
        this.keyFile = null;
        this.outputText = '';
        this.alert = null;
    }

    private handlePaddingChange(e: CustomEvent) {
        this.selectedPadding = e.detail.value as PaddingScheme;
        
        // PKCS1 doesn't use hash algorithm for encryption / decryption
        if (this.selectedPadding === 'PKCS1') {
            this.selectedHash = 'SHA-256'; // Default, though not used
        }
        
        this.processInput();
    }

    private handleHashChange(e: CustomEvent) {
        this.selectedHash = e.detail.value as HashAlgorithm;
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
        
        try {
            if (this.selectedOperation === 'encrypt') {
                if (this.isPrivateKey) {
                    this.alert = {
                        type: 'error',
                        message: 'Public key is required for encryption'
                    };
                    this.outputText = '';
                    return;
                }
                
                this.outputText = await this.encrypt();
            } else {
                if (!this.isPrivateKey) {
                    this.alert = {
                        type: 'error',
                        message: 'Private key is required for decryption'
                    };
                    this.outputText = '';
                    return;
                }
                
                this.outputText = await this.decrypt();
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

    private async encrypt(): Promise<string> {
        try {
            const publicKey = await this.importKey(this.keyText, false);
            const messageData = await this.getMessageData();
            
            if (messageData.byteLength > 190 && this.selectedPadding === 'OAEP') {
                throw new Error('Message too long for RSA-OAEP encryption (max ~190 bytes)');
            } else if (messageData.byteLength > 245 && this.selectedPadding === 'PKCS1') {
                throw new Error('Message too long for RSA-PKCS1 encryption (max ~245 bytes)');
            }
            
            const encrypted = await window.crypto.subtle.encrypt(
                this.getAlgorithmParams(),
                publicKey,
                messageData
            );
            
            return this.outputEncoding ? 
                this.arrayBufferToBase64(encrypted) : 
                this.arrayBufferToHex(encrypted);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Encryption operation failed');
            }
        }
    }

    private async decrypt(): Promise<string> {
        try {
            const privateKey = await this.importKey(this.keyText, true);
            let ciphertextData: ArrayBuffer;
            
            if (this.file && this.fileName) {
                ciphertextData = await this.readFileAsArrayBuffer(this.file);
            } else if (this.inputEncoding === 'hex') {
                ciphertextData = this.hexToArrayBuffer(this.inputText);
            } else if (this.inputEncoding === 'base64') {
                ciphertextData = this.base64ToArrayBuffer(this.inputText);
            } else {
                throw new Error('Invalid input encoding for ciphertext. Use Base64 or Hex.');
            }
            
            const decrypted = await window.crypto.subtle.decrypt(
                this.getAlgorithmParams(),
                privateKey,
                ciphertextData
            );
            
            // Try to interpret as UTF-8 text
            try {
                const text = new TextDecoder().decode(decrypted);
                return text;
            } catch (e) {
                // If it's not valid UTF-8, return as binary data
                return this.outputEncoding ? 
                    this.arrayBufferToBase64(decrypted) : 
                    this.arrayBufferToHex(decrypted);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Decryption operation failed. Check your key and ciphertext.');
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
            const keyUsages: KeyUsage[] = isPrivate ? ['decrypt'] : ['encrypt'];

            const params = {
                name: algorithm,
                hash: this.selectedHash
            };
            
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
        return this.selectedPadding === 'OAEP' ? 'RSA-OAEP' : 'RSA-PKCS1-v1_5';
    }

    private getAlgorithmParams(): AlgorithmIdentifier | RsaOaepParams {
        if (this.selectedPadding === 'OAEP') {
            return {
                name: 'RSA-OAEP',
                hash: this.selectedHash
            } as RsaOaepParams;
        } else {
            return {
                name: 'RSA-PKCS1-v1_5'
            } as AlgorithmIdentifier;
        }
    }

    private async getMessageData(): Promise<ArrayBuffer> {
        if (this.file && this.fileName) {
            return await this.readFileAsArrayBuffer(this.file);
        } else if (this.selectedOperation === 'encrypt') {
            if (this.inputEncoding === 'hex') {
                return this.hexToArrayBuffer(this.inputText);
            } else if (this.inputEncoding === 'base64') {
                return this.base64ToArrayBuffer(this.inputText);
            } else {
                const encoder = new TextEncoder();
                return encoder.encode(this.inputText).buffer;
            }
        } else {
            // For decryption, input should be binary
            if (this.inputEncoding === 'hex') {
                return this.hexToArrayBuffer(this.inputText);
            } else if (this.inputEncoding === 'base64') {
                return this.base64ToArrayBuffer(this.inputText);
            } else {
                throw new Error('Ciphertext must be in binary format (Base64 or Hex)');
            }
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
        this.keyText = '';
        this.keyFileName = '';
        this.keyFile = null;
        if (this.keyFileInput) {
            this.keyFileInput.value = '';
        }
        this.requestUpdate();
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
                
                if (this.selectedOperation === 'encrypt') {
                    if (file.type.startsWith('text/')) {
                        this.inputEncoding = 'utf-8';
                    } else {
                        this.inputEncoding = 'base64';
                    }
                } else {
                    // For decryption, we assume binary input
                    this.inputEncoding = 'base64';
                }
                
                const MAX_AUTO_PROCESS_SIZE = 10 * 1024 * 1024;
                
                if (file.size > MAX_AUTO_PROCESS_SIZE) {
                    this.alert = {
                        type: 'warning',
                        message: `File exceeds 10MB which may cause performance issues.`,
                    };
                } else if (this.selectedOperation === 'encrypt' && file.size > 190) {
                    this.alert = {
                        type: 'warning',
                        message: `File size (${file.size} bytes) exceeds RSA encryption limits. RSA can only encrypt small amounts of data.`,
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