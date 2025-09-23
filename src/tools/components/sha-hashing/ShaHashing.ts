import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight, renderCopyButton } from '../../../utils/util';

type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
type InputEncoding = 'utf-8' | 'hex' | 'base64';
type KeyFormat = 'text' | 'hex' | 'base64';
type OutputFormat = 'hex' | 'base64';

@customElement('sha-hashing')
export class ShaHashing extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private keyFormat: KeyFormat = 'text';
    @state() private selectedAlgorithm: HashAlgorithm = 'SHA-256';
    @state() private inputEncoding: InputEncoding = 'utf-8';
    @state() private outputFormat: OutputFormat = 'hex';
    @state() private isCopied = false;
    @state() private fileName = '';
    @state() private file: File | null = null;
    @state() private hmacMode = false;
    @state() private hmacKey = '';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    @query('#input') private input!: HTMLTextAreaElement;
    @query('#output') private output!: HTMLTextAreaElement;
    @query('#file-input') private fileInput!: HTMLInputElement;

    private styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">SHA (Secure Hash Algorithm) creates fixed-size digital signatures for data, ensuring integrity and authenticity.</p>
                <hr />

                <!-- Hidden File Input -->
                <input id="file-input" class="hidden" type="file" @change=${this.handleFileSelect}>

                <!-- Algorithm Selection -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
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
                            .value=${this.selectedAlgorithm}
                            placeholder="Select Algorithm"
                            @change=${this.handleAlgorithmChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Output Format
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'Hexadecimal', value: 'hex' },
                                { label: 'Base64', value: 'base64' }
                            ]}
                            .value=${this.outputFormat}
                            placeholder="Select Output Format"
                            @change=${this.handleOutputFormatChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <!-- HMAC Toggle -->
                <div class="flex items-center my-4">
                    <div class="flex items-center mr-2">
                        <tool-switch
                            .checked=${this.hmacMode}
                            rightLabel="HMAC Mode"
                            ariaLabel="Enable HMAC Mode"
                            @change=${this.handleHmacToggle}
                        ></tool-switch>
                    </div>
                    <tool-tooltip 
                        text="HMAC combines a cryptographic hash with a secret key"
                        position="left">
                        <span class="opacity-75">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-help-icon lucide-circle-help"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        </span>
                    </tool-tooltip>
                </div>

                <!-- HMAC Key Input -->
                ${this.hmacMode ? html`
                    <div class="flex justify-between items-baseline mb-2 text-xs">
                        <p class="mb-0">Secret Key</p>
                        <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'Text', value: 'text' },
                                { label: 'Hex', value: 'hex' },
                                { label: 'Base64', value: 'base64' }
                            ]}
                            .value=${this.keyFormat}
                            placeholder="Key Format"
                            @change=${this.handleKeyFormatChange}
                        ></tool-inline-menu>
                    </div>
                    </div>
                    <div class="relative flex items-center mb-4">
                        <textarea
                            id="hmac-key"
                            class="input-expandable"
                            placeholder="Enter secret key for HMAC"
                            rows="1"
                            .value=${this.hmacKey}
                            @input=${this.handleHmacKeyChange}
                        ></textarea>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                            <button class="btn-icon" @click=${this.generateRandomKey}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Input Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">Input Message</p>
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
                        placeholder="Enter text to hash"
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

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6"
                        placeholder="Hash output will appear here"
                        rows="2"
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

                <!-- Info about the hash -->
                ${this.outputText ? html`
                    <div class="mt-3 text-xs opacity-75">
                        <span>Length: ${this.getHashBitLength()} bits</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    private handleAlgorithmChange(e: CustomEvent) {
        this.selectedAlgorithm = e.detail.value as HashAlgorithm;
        this.processInput();
    }

    private handleOutputFormatChange(e: CustomEvent) {
        this.outputFormat = e.detail.value as OutputFormat;
        this.processInput();
    }

    private handleHmacToggle(e: CustomEvent) {
        this.hmacMode = e.detail.checked;
        if (this.hmacMode && !this.hmacKey) {
            this.generateRandomKey();
        } else {
            this.processInput();
        }
    }

    private handleKeyFormatChange(e: CustomEvent) {
        const newFormat = e.detail.value as KeyFormat;
        if (this.keyFormat === newFormat || !this.hmacKey) {
            this.keyFormat = newFormat;
            return;
        }

        try {
            // Convert key to binary first, then to the new format
            let binaryKey: ArrayBuffer;
            
            switch (this.keyFormat) {
                case 'text':
                    binaryKey = new TextEncoder().encode(this.hmacKey).buffer;
                    break;
                case 'hex':
                    binaryKey = this.hexToArrayBuffer(this.hmacKey);
                    break;
                case 'base64':
                    binaryKey = this.base64ToArrayBuffer(this.hmacKey);
                    break;
                default:
                    throw new Error(`Unsupported key format: ${this.keyFormat}`);
            }
            
            // Convert binary to the new format
            switch (newFormat) {
                case 'text':
                    try {
                        this.hmacKey = new TextDecoder().decode(binaryKey);
                    } catch (error) {
                        // If binary data can't be represented as text
                        this.alert = {
                            type: 'warning',
                            message: 'The key contains binary data that cannot be represented as text. Switching to hex format.'
                        };
                        this.hmacKey = this.arrayBufferToHex(binaryKey);
                        this.keyFormat = 'hex';
                        return;
                    }
                    break;
                case 'hex':
                    this.hmacKey = this.arrayBufferToHex(binaryKey);
                    break;
                case 'base64':
                    this.hmacKey = this.arrayBufferToBase64(binaryKey);
                    break;
                default:
                    throw new Error(`Unsupported target format: ${newFormat}`);
            }
            
            this.keyFormat = newFormat;
            this.processInput();
        } catch (error) {
            this.alert = {
                type: 'error',
                message: 'Failed to convert key format. The key may contain invalid characters.'
            };
        }
    }

    private handleHmacKeyChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.hmacKey = target.value;
        this.processInput();
    }

    private handleInputEncodingChange(e: CustomEvent) {
        const newEncoding = e.detail.value as InputEncoding;
        if (!this.inputText) {
            this.inputEncoding = newEncoding;
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
        
        if (oldEncoding === newEncoding) return;
        
        try {
            // Convert from current encoding to binary data
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
            
            // Convert from binary data to target encoding
            switch (newEncoding) {
                case 'utf-8':
                    try {
                        this.inputText = new TextDecoder().decode(binaryData);
                    } catch (error) {
                        throw new Error('The data cannot be converted to UTF-8 text');
                    }
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
                message: error instanceof Error ? error.message : 'Failed to convert input format'
            };
        }
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

    private generateRandomKey(): void {
        const keyLengths = {
            'SHA-256': 32,
            'SHA-384': 48,
            'SHA-512': 64
        };
        
        const keyLength = keyLengths[this.selectedAlgorithm];
        const randomBytes = new Uint8Array(keyLength);
        window.crypto.getRandomValues(randomBytes);

        if (this.keyFormat === 'text') {
            // For text format, generate a readable string instead of binary
            const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
            let key = "";
            for (let i = 0; i < keyLength; i++) {
                key += charset[randomBytes[i] % charset.length];
            }
            this.hmacKey = key;
        } else if (this.keyFormat === 'hex') {
            this.hmacKey = this.arrayBufferToHex(randomBytes);
        } else {
            this.hmacKey = this.arrayBufferToBase64(randomBytes.buffer);
        }
        
        this.processInput();
    }

    private async processInput(): Promise<void> {
        this.alert = null;

        if (!this.inputText && !this.file) {
            this.outputText = '';
            return;
        }

        if (this.hmacMode && !this.hmacKey) {
            this.outputText = '';
            return;
        }

        try {
            let inputData: ArrayBuffer;
            
            if (this.file && this.fileName) {
                // If we have a file, use it directly
                if (this.file.size > 10 * 1024 * 1024) {
                    this.alert = {
                        type: 'warning',
                        message: 'Processing large files might take some time and could cause the code editor to become unresponsive.'
                    };
                }
                
                inputData = await this.readFileAsArrayBuffer(this.file);
            } else {
                // Otherwise use the text input
                switch (this.inputEncoding) {
                    case 'utf-8':
                        inputData = new TextEncoder().encode(this.inputText).buffer;
                        break;
                    case 'hex':
                        try {
                            inputData = this.hexToArrayBuffer(this.inputText);
                        } catch (error) {
                            throw new Error('Invalid hexadecimal input');
                        }
                        break;
                    case 'base64':
                        try {
                            inputData = this.base64ToArrayBuffer(this.inputText);
                        } catch (error) {
                            throw new Error('Invalid base64 input');
                        }
                        break;
                    default:
                        throw new Error(`Unsupported input encoding: ${this.inputEncoding}`);
                }
            }
            
            let hashBuffer: ArrayBuffer;
            
            if (this.hmacMode) {
                hashBuffer = await this.calculateHMAC(inputData, this.hmacKey);
            } else {
                hashBuffer = await this.calculateHash(inputData);
            }
            
            // Convert hash to requested output format
            this.outputText = this.outputFormat === 'hex' 
                ? this.arrayBufferToHex(hashBuffer)
                : this.arrayBufferToBase64(hashBuffer);
                
        } catch (error) {
            this.alert = {
                type: 'error',
                message: error instanceof Error ? error.message : 'An error occurred during processing'
            };
            this.outputText = '';
        } finally {
            setTimeout(() => adjustTextareaHeight(this.output), 0);
        }
    }

    private async calculateHash(data: ArrayBuffer): Promise<ArrayBuffer> {
        try {
            return await crypto.subtle.digest(this.selectedAlgorithm, data);
        } catch (error) {
            throw new Error(`Hash calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async calculateHMAC(data: ArrayBuffer, key: string): Promise<ArrayBuffer> {
        try {
            // First, convert the key from its current format to binary
            let keyData: ArrayBuffer;
            
            switch (this.keyFormat) {
                case 'text':
                    keyData = new TextEncoder().encode(key).buffer;
                    break;
                case 'hex':
                    keyData = this.hexToArrayBuffer(key);
                    break;
                case 'base64':
                    keyData = this.base64ToArrayBuffer(key);
                    break;
                default:
                    throw new Error(`Unsupported key format: ${this.keyFormat}`);
            }
            
            // Import the key for HMAC
            const cryptoKey = await window.crypto.subtle.importKey(
                'raw',
                keyData,
                {
                    name: 'HMAC',
                    hash: { name: this.selectedAlgorithm }
                },
                false,
                ['sign']
            );
            
            // Calculate the HMAC
            return await window.crypto.subtle.sign(
                'HMAC',
                cryptoKey,
                data
            );
        } catch (error) {
            throw new Error(`HMAC calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private hexToArrayBuffer(hexString: string): ArrayBuffer {
        // Remove any spaces or non-hex characters
        const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');
        
        if (cleanHex.length % 2 !== 0) {
            throw new Error('Hex string must have an even number of characters');
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
                
                const MAX_DISPLAY_SIZE = 10 * 1024 * 1024;
                
                if (file.size > MAX_DISPLAY_SIZE) {
                    this.alert = {
                        type: 'warning',
                        message: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Large files will be processed but not displayed.`,
                    };
                }
                
                this.processInput();
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

    private getHashBitLength(): number {
        switch (this.selectedAlgorithm) {
            case 'SHA-256': return 256;
            case 'SHA-384': return 384;
            case 'SHA-512': return 512;
            default: return 0;
        }
    }
}