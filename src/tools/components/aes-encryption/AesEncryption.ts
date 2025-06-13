import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight, renderCopyButton } from '../../../utils/util';
import '../../common/alert/Alert';
import '../../common/dropdown-menu/DropdownMenu';
import '../../common/inline-menu/InlineMenu';
import '../../common/slider/Slider';
import '../../common/switch/Switch';
import '../../common/tooltip/Tooltip';

type EncryptionMode = 'CBC' | 'CTR' | 'GCM';
type KeySize = '128' | '256';
type Operation = 'encrypt' | 'decrypt';
type InputEncoding = 'utf-8' | 'hex' | 'base64';

@customElement('aes-encryption')
export class AesEncryption extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private passwordText = '';
    @state() private saltText = '';
    @state() private ivText = '';
    @state() private fileName = '';
    @state() private file: File | null = null;
    @state() private inputEncoding: InputEncoding = 'utf-8';
    @state() private encryptionOutputEncoding = true;   // true = Base64, false = Hex
    @state() private decryptionOutputEncoding = false;  // true = Base64, false = UTF-8
    @state() private selectedMode: EncryptionMode = 'CBC';
    @state() private selectedKeySize: KeySize = '256';
    @state() private selectedOperation: Operation = 'encrypt';
    @state() private iterations = 100000; // PBKDF2 iterations
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    @query('#input') private input!: HTMLTextAreaElement;
    @query('#output') private output!: HTMLTextAreaElement;
    @query('#file-input') private fileInput!: HTMLInputElement;

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">AES (Advanced Encryption Standard) is a symmetric encryption algorithm that securely transforms data using various block cipher modes and key sizes.</p>
                <hr />

                <!-- Hidden File Input -->
                <input id="file-input" class="hidden" type="file" @change=${this.handleFileSelect}>

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

                <!-- Encryption Settings -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Encryption Mode
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'CBC', value: 'CBC' },
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
                                { label: '256 bits', value: '256' }
                            ]}
                            .value=${this.selectedKeySize}
                            placeholder="Select Key Size"
                            @change=${this.handleKeySizeChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <!-- Password Input -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">Password</p>
                </div>
                <div class="relative flex items-center mb-4">
                    <textarea
                        id="password"
                        class="input-expandable"
                        placeholder="Enter Password"
                        rows="1"
                        .value=${this.passwordText}
                        @input=${this.handlePasswordChange}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <button class="btn-icon" @click=${this.generateRandomPassword}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Input Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">
                        ${this.selectedOperation === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
                    </p>
                    <div>
                        <tool-inline-menu
                            .options=${this.selectedOperation === 'encrypt' 
                                ? [
                                    { label: 'UTF-8', value: 'utf-8' },
                                    { label: 'Hex', value: 'hex' },
                                    { label: 'Base64', value: 'base64' }
                                  ] 
                                : [
                                    { label: 'Base64', value: 'base64' },
                                    { label: 'Hex', value: 'hex' }
                                  ]
                            }
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
                        placeholder="Enter text to ${this.selectedOperation === 'encrypt' ? 'encrypt' : 'decrypt'}"
                        rows="3"
                        .value=${this.fileName || this.inputText}
                        @input=${this.handleInput}
                        ?readonly=${Boolean(this.fileName)}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Upload file">
                            <button class="btn-icon" id="file" @click=${this.triggerFileInput}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-plus"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                            </button>
                        </tool-tooltip>
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
                        <!-- Salt -->
                        <p class="mb-2 text-xs">Salt</p>
                        <p class="mb-2 text-xs opacity-75">
                            Adds randomness to the key derivation process.
                        </p>
                        <div class="relative flex items-center mb-4">
                            <textarea 
                                id="salt"
                                class="input-expandable"
                                placeholder="Enter Salt (or auto-generated)"
                                rows="1"
                                .value=${this.saltText}
                                @input=${this.handleSaltChange}
                            ></textarea>
                            <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                                <button class="btn-icon" @click=${this.generateRandomSalt}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- IV -->
                        <p class="mb-2 text-xs">IV</p>
                        <p class="mb-2 text-xs opacity-75">
                            Initialization Vector (IV) is used to ensure that identical plaintexts encrypt to different ciphertexts.
                        </p>
                        <div class="relative flex items-center mb-4">
                            <textarea 
                                id="iv"
                                class="input-expandable"
                                placeholder="Enter IV (or auto-generated)"
                                rows="1"
                                .value=${this.ivText}
                                @input=${this.handleIvChange}
                            ></textarea>
                            <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                                <button class="btn-icon" @click=${this.generateRandomIv}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Iterations slider -->
                        <p class="mb-2 text-xs">PBKDF2 Iterations: ${this.iterations.toLocaleString()}</p>
                        <p class="mb-2 text-xs opacity-75">
                            Higher values increase security but also processing time. Recommended: 100,000+
                        </p>
                        <tool-slider
                            min="10000"
                            max="1000000"
                            step="10000"
                            .value=${this.iterations.toString()}
                            @change=${this.handleIterationsChange}
                        ></tool-slider>
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
                            ?disabled=${!this.outputText}
                        >
                            ${renderCopyButton(this.isCopied)}
                        </button>
                    </div>
                </div>
                <div class="mt-2">
                    ${this.selectedOperation === 'encrypt' ? html`
                        <tool-switch
                            .checked=${this.encryptionOutputEncoding}
                            leftLabel="Hex"
                            rightLabel="Base64"
                            ariaLabel="Encryption Output Encoding"
                            data-charset="numbers"
                            @change=${this.handleEncryptionOutputEncodingChange}
                        ></tool-switch>
                    ` : html`
                        <tool-switch
                            .checked=${this.decryptionOutputEncoding}
                            leftLabel="UTF-8"
                            rightLabel="Base64"
                            ariaLabel="Decryption Output Encoding"
                            data-charset="numbers"
                            @change=${this.handleDecryptionOutputEncodingChange}
                        ></tool-switch>
                    `}
                </div>
            </div>
        `;
    }

    private handleModeChange(mode: 'encrypt' | 'decrypt') {
        this.selectedOperation = mode;
        
        this.fileName = '';
        this.file = null;
        
        if (mode === 'encrypt') {
            this.inputEncoding = 'utf-8';
        } else {
            this.inputEncoding = this.encryptionOutputEncoding ? 'base64' : 'hex';
        }
        
        this.inputText = '';
        this.outputText = '';
        this.processInput();
    }

    private handleEncryptionModeChange(e: CustomEvent) {
        const newMode = e.detail.value as EncryptionMode;
        this.selectedMode = newMode;
        this.processInput();
    }

    private handleKeySizeChange(e: CustomEvent) {
        this.selectedKeySize = e.detail.value as KeySize;
        this.processInput();
    }

    private handlePasswordChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.passwordText = target.value;
        this.processInput();
    }

    private handleSaltChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.saltText = target.value;
        this.processInput();
    }

    private handleInput(e: Event) {
        if (!this.fileName) {
            const target = e.target as HTMLTextAreaElement;
            this.inputText = target.value;
            this.processInput();
        }
        adjustTextareaHeight(this.input);
        adjustTextareaHeight(this.output);
    }

    private handleIvChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.ivText = target.value;
        this.processInput();
    }

    private handleIterationsChange(e: Event) {
        const target = e.target as HTMLInputElement;
        this.iterations = parseInt(target.value);
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
            // Step 1: Convert from current encoding to binary data (ArrayBuffer)
            let binaryData: ArrayBuffer;
            
            switch (oldEncoding) {
                case 'utf-8':
                    binaryData = new TextEncoder().encode(this.inputText).buffer;
                    break;
                case 'hex':
                    binaryData = this.hexToArrayBuffer(this.inputText);
                    break;
                case 'base64':
                    binaryData = this.base64ToArrayBuffer(this.inputText);
                    break;
                default:
                    throw new Error(`Unsupported input encoding: ${oldEncoding}`);
            }
            
            // Step 2: Convert from binary data to target encoding
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

    private handleEncryptionOutputEncodingChange(e: CustomEvent) {
        this.encryptionOutputEncoding = e.detail.checked;
        this.processInput();
    }
    
    private handleDecryptionOutputEncodingChange(e: CustomEvent) {
        this.decryptionOutputEncoding = e.detail.checked;
        this.processInput();
    }

    private generateRandomPassword(): void {
        // Generate a secure random password (16 characters)
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        const randomValues = new Uint8Array(16);
        window.crypto.getRandomValues(randomValues);
        
        let password = "";
        for (let i = 0; i < 16; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        
        this.passwordText = password;
        this.processInput();
    }

    private generateRandomSalt(): void {
        // Salt should be at least 16 bytes (128 bits)
        const saltBytes = new Uint8Array(16);
        window.crypto.getRandomValues(saltBytes);
        this.saltText = this.arrayBufferToHex(saltBytes);
        this.processInput();
    }

    private generateRandomIv(): void {
        // IV should be 16 bytes (128 bits) for AES
        const ivBytes = new Uint8Array(16);
        window.crypto.getRandomValues(ivBytes);
        this.ivText = this.arrayBufferToHex(ivBytes);
        this.processInput();
    }

    private async processInput(): Promise<void> {
        this.alert = null;

        if ((!this.inputText && !this.file) || !this.passwordText) {
            this.outputText = '';
            return;
        }

        try {
            if (this.selectedOperation === 'encrypt') {
                if (!this.saltText) {
                    this.generateRandomSalt();
                    return;
                }
                
                if (!this.ivText) {
                    this.generateRandomIv();
                    return;
                }
                
                this.outputText = await this.encrypt(this.inputText, this.passwordText, this.saltText, this.ivText); 
            } else {
                if (!this.saltText || !this.ivText) {
                    this.alert = {
                        type: 'error',
                        message: 'Both Salt and IV are required for decryption'
                    };
                    this.outputText = '';
                    return;
                }
                
                this.outputText = await this.decrypt(this.inputText, this.passwordText, this.saltText, this.ivText);
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

    private async deriveKey(password: string, salt: string, keySize: number): Promise<CryptoKey> {
        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            
            const saltBuffer = this.hexToArrayBuffer(salt);
            
            const baseKey = await window.crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            return await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: this.iterations,
                    hash: 'SHA-256'
                },
                baseKey,
                {
                    name: this.getAlgorithmName(),
                    length: keySize
                },
                false,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            throw new Error('Failed to derive encryption key from password');
        }
    }

    private async encrypt(plaintext: string, password: string, salt: string, iv: string): Promise<string> {
        try {
            this.validateInputs();

            let plaintextBuffer: ArrayBuffer;
            
            if (this.file && this.fileName) {
                // If we have a file, use the cached file data
                plaintextBuffer = await this.readFileAsArrayBuffer(this.file);
            } else if (this.inputEncoding === 'hex') {
                // Input is in Hex format
                plaintextBuffer = this.hexToArrayBuffer(plaintext);
            } else if (this.inputEncoding === 'base64') {
                // Input is in Base64 format
                plaintextBuffer = this.base64ToArrayBuffer(plaintext);
            } else {
                // Input is in UTF-8 format
                const encoder = new TextEncoder();
                plaintextBuffer = encoder.encode(plaintext).buffer;
            }

            const ivBuffer = this.hexToArrayBuffer(iv);
            const keySize = parseInt(this.selectedKeySize);
            
            const cryptoKey = await this.deriveKey(password, salt, keySize);

            const algorithmParams = this.createAlgorithmParams(ivBuffer);
            try {
                const encryptedBuffer = await window.crypto.subtle.encrypt(
                    algorithmParams,
                    cryptoKey,
                    plaintextBuffer
                );
    
                return this.encryptionOutputEncoding 
                    ? this.arrayBufferToBase64(encryptedBuffer)
                    : this.arrayBufferToHex(encryptedBuffer);
            } catch (err) {
                throw new Error('The plaintext or key may be incorrect.');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Encryption failed: ${error.message}`);
            } else {
                throw new Error('Encryption failed with an unknown error');
            }
        }
    }

    private async decrypt(ciphertext: string, password: string, salt: string, iv: string): Promise<string> {
        try {
            this.validateInputs();

            let ciphertextBuffer: ArrayBuffer;
            try {
                if (this.inputEncoding === 'hex') {
                    // Input is in Hex format
                    ciphertextBuffer = this.hexToArrayBuffer(ciphertext);
                } else {
                    // Input is in Base64 format
                    ciphertextBuffer = this.base64ToArrayBuffer(ciphertext);
                }
            } catch (error) {
                throw new Error(`Invalid ciphertext format: ${error}`);
            }

            const ivBuffer = this.hexToArrayBuffer(iv);
            const keySize = parseInt(this.selectedKeySize);
            
            const cryptoKey = await this.deriveKey(password, salt, keySize);

            const algorithmParams = this.createAlgorithmParams(ivBuffer);
            try {
                const decryptedBuffer = await window.crypto.subtle.decrypt(
                    algorithmParams,
                    cryptoKey,
                    ciphertextBuffer
                );
    
                if (this.decryptionOutputEncoding) {
                    // Output as Base64 (preserves binary data)
                    return this.arrayBufferToBase64(decryptedBuffer);
                } else {
                    // Output as UTF-8 text (may fail for binary data)
                    try {
                        const decoder = new TextDecoder();
                        return decoder.decode(decryptedBuffer);
                    } catch (error) {
                        // Fallback to Base64 if UTF-8 decoding fails
                        this.alert = {
                            type: 'warning',
                            message: 'The decrypted data cannot be displayed as UTF-8 text. Showing as Base64 instead.'
                        };
                        this.decryptionOutputEncoding = true;
                        return this.arrayBufferToBase64(decryptedBuffer);
                    }
                }
            } catch (err) {
                throw new Error('The ciphertext, key, or IV may be incorrect');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log('Decryption error:', error);
                throw new Error(`Decryption failed: ${error.message}`);
            } else {
                throw new Error('Decryption failed with an unknown error');
            }
        }
    }

    private validateInputs(): void {
        if (!this.passwordText) {
            throw new Error('Password is required');
        }

        if (this.saltText) {
            const hexRegex = /^[0-9a-fA-F]+$/;
            if (!hexRegex.test(this.saltText.replace(/\s/g, ''))) {
                throw new Error('Salt must contain only hexadecimal characters (0-9, a-f, A-F)');
            }
        }

        if (this.ivText) {
            const hexRegex = /^[0-9a-fA-F]+$/;
            if (!hexRegex.test(this.ivText.replace(/\s/g, ''))) {
                throw new Error('IV must contain only hexadecimal characters (0-9, a-f, A-F)');
            }

            const ivLength = this.ivText.replace(/\s/g, '').length;
            if (ivLength !== 32) { // 16 bytes = 32 hex characters
                throw new Error('IV must be exactly 32 hex characters (128 bits)');
            }
        }

        if (this.selectedOperation === 'encrypt' && this.inputEncoding === 'base64' && !this.file) {
            try {
                this.base64ToArrayBuffer(this.inputText);
            } catch (error) {
                throw new Error('Invalid Base64 input. Please provide a valid Base64 string.');
            }
        }
    }

    private getAlgorithmName(): string {
        switch (this.selectedMode) {
            case 'CBC': return 'AES-CBC';
            case 'CTR': return 'AES-CTR';
            case 'GCM': return 'AES-GCM';
            default: return 'AES-CBC';
        }
    }

    private createAlgorithmParams(iv: ArrayBuffer): any {
        if (!iv) {
            throw new Error('IV is required for this encryption mode');
        }

        switch (this.selectedMode) {
            case 'CBC':
                return {
                    name: 'AES-CBC',
                    iv
                };
            case 'CTR':
                return {
                    name: 'AES-CTR',
                    counter: iv,
                    length: 128
                };
            case 'GCM':
                return {
                    name: 'AES-GCM',
                    iv,
                    tagLength: 128
                };
            default:
                return {
                    name: 'AES-CBC',
                    iv
                };
        }
    }

    private hexToArrayBuffer(hexString: string): ArrayBuffer {
        // Remove any spaces or non-hex characters
        const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');
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
            const binaryString = atob(base64.trim());
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

        this.input.value = '';
        this.output.value = '';

        this.input.style.height = `auto`;
        this.output.style.height = `auto`;
        this.requestUpdate();
    }
    
    private triggerFileInput(): void {
        this.fileInput.click();
    }

    private async handleFileSelect(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];
        
        this.clearAll();

        if (file) {
            try {
                this.file = file;
                this.fileName = file.name;
                
                if (this.selectedOperation === 'encrypt') {
                    // Automatically set input encoding to match file type
                    if (file.type.startsWith('text/')) {
                        this.inputEncoding = 'utf-8';
                    } else {
                        this.inputEncoding = 'base64';
                    }
                    
                    const MAX_AUTO_PROCESS_SIZE = 10 * 1024 * 1024;
                    
                    if (file.size > MAX_AUTO_PROCESS_SIZE) {
                        this.alert = {
                            type: 'warning',
                            message: `File exceeds 10MB which may cause performance issues. You can still encrypt the file manually.`,
                        };
                    } else {
                        this.processInput();
                    }
                } else {
                    this.alert = {
                        type: 'error',
                        message: 'File upload is only supported in encryption mode.',
                    };
                    this.clearAll();
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