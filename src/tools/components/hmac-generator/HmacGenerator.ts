import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight, renderCopyButton } from '../../../utils/util';
import '../../common/alert/Alert';
import '../../common/dropdown-menu/DropdownMenu';
import '../../common/inline-menu/InlineMenu';
import '../../common/switch/Switch';
import '../../common/tooltip/Tooltip';

type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
type KeyFormat = 'text' | 'hex' | 'base64';
type InputFormat = 'text' | 'hex' | 'base64';
type OutputFormat = 'hex' | 'base64';

@customElement('hmac-generator')
export class HMACGenerator extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private keyText = '';
    @state() private fileName = '';
    @state() private file: File | null = null;
    @state() private selectedAlgorithm: HashAlgorithm = 'SHA-256';
    @state() private keyFormat: KeyFormat = 'text';
    @state() private inputFormat: InputFormat = 'text';
    @state() private outputFormat: OutputFormat = 'hex';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    @query('#input') private input!: HTMLTextAreaElement;
    @query('#output') private output!: HTMLTextAreaElement;
    @query('#file-input') private fileInput!: HTMLInputElement;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">HMAC is a mechanism for ensuring the integrity and authenticity of a message using a cryptographic hash function and a secret key.</p>
                <hr />

                <!-- Hidden File Input -->
                <input id="file-input" class="hidden" type="file" @change=${this.handleFileSelect}>

                <!-- Algorithm Selector -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">Hash Algorithm</div>
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
                </div>

                <!-- Secret Key Input -->
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
                        id="key"
                        class="input-expandable"
                        placeholder="Enter secret key"
                        rows="1"
                        .value=${this.keyText}
                        @input=${this.handleKeyChange}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <button class="btn-icon" @click=${this.generateRandomKey}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Input Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">Input Message</p>
                    <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'Text', value: 'text' },
                                { label: 'Hex', value: 'hex' },
                                { label: 'Base64', value: 'base64' }
                            ]}
                            .value=${this.inputFormat}
                            placeholder="Input Format"
                            @change=${this.handleInputFormatChange}
                        ></tool-inline-menu>
                    </div>
                </div>
                <div class="relative flex items-center my-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter message to generate HMAC"
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
                        placeholder="HMAC will appear here"
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

                <!-- Output Format Switch -->
                <div class="flex justify-between items-center mt-2">
                    <div>
                        <tool-switch
                            .checked=${this.outputFormat === 'base64'}
                            leftLabel="Hex"
                            rightLabel="Base64"
                            ariaLabel="Output Format"
                            data-charset="numbers"
                            @change=${this.handleOutputFormatChange}
                        ></tool-switch>
                    </div>
                </div>                
            </div>
        `;
    }

    private handleAlgorithmChange(e: CustomEvent) {
        this.selectedAlgorithm = e.detail.value as HashAlgorithm;
        this.processInput();
    }

    private handleKeyFormatChange(e: CustomEvent) {
        const newFormat = e.detail.value as KeyFormat;
        if (this.keyFormat === newFormat || !this.keyText) {
            this.keyFormat = newFormat;
            return;
        }

        try {
            // Convert key to binary first, then to the new format
            let binaryKey: ArrayBuffer;
            
            switch (this.keyFormat) {
                case 'text':
                    binaryKey = new TextEncoder().encode(this.keyText).buffer;
                    break;
                case 'hex':
                    binaryKey = this.hexToArrayBuffer(this.keyText);
                    break;
                case 'base64':
                    binaryKey = this.base64ToArrayBuffer(this.keyText);
                    break;
                default:
                    throw new Error(`Unsupported key format: ${this.keyFormat}`);
            }
            
            // Convert binary to the new format
            switch (newFormat) {
                case 'text':
                    this.keyText = new TextDecoder().decode(binaryKey);
                    break;
                case 'hex':
                    this.keyText = this.arrayBufferToHex(binaryKey);
                    break;
                case 'base64':
                    this.keyText = this.arrayBufferToBase64(binaryKey);
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

    private handleInputFormatChange(e: CustomEvent) {
        const newFormat = e.detail.value as InputFormat;
        if (this.inputFormat === newFormat || !this.inputText || this.fileName) {
            if (this.fileName) {
                this.alert = {
                    type: 'warning',
                    message: 'Please clear the current file before changing the input format.'
                };
                return;
            }
            this.inputFormat = newFormat;
            return;
        }

        try {
            // Convert input to binary first, then to the new format
            let binaryInput: ArrayBuffer;
            
            switch (this.inputFormat) {
                case 'text':
                    binaryInput = new TextEncoder().encode(this.inputText).buffer;
                    break;
                case 'hex':
                    binaryInput = this.hexToArrayBuffer(this.inputText);
                    break;
                case 'base64':
                    binaryInput = this.base64ToArrayBuffer(this.inputText);
                    break;
                default:
                    throw new Error(`Unsupported input format: ${this.inputFormat}`);
            }
            
            // Convert binary to the new format
            switch (newFormat) {
                case 'text':
                    this.inputText = new TextDecoder().decode(binaryInput);
                    break;
                case 'hex':
                    this.inputText = this.arrayBufferToHex(binaryInput);
                    break;
                case 'base64':
                    this.inputText = this.arrayBufferToBase64(binaryInput);
                    break;
                default:
                    throw new Error(`Unsupported target format: ${newFormat}`);
            }
            
            this.inputFormat = newFormat;
            this.processInput();
        } catch (error) {
            this.alert = {
                type: 'error',
                message: 'Failed to convert input format. The input may contain invalid characters.'
            };
        }
    }

    private handleOutputFormatChange(e: CustomEvent) {
        this.outputFormat = e.detail.checked ? 'base64' : 'hex';
        this.processInput();
    }

    private handleKeyChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.keyText = target.value;
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
            // For text format, generate a readable string
            const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
            let key = "";
            for (let i = 0; i < keyLength; i++) {
                key += charset[randomBytes[i] % charset.length];
            }
            this.keyText = key;
        } else if (this.keyFormat === 'hex') {
            this.keyText = this.arrayBufferToHex(randomBytes);
        } else {
            this.keyText = this.arrayBufferToBase64(randomBytes.buffer);
        }
        
        this.processInput();
    }

    private async processInput(): Promise<void> {
        this.alert = null;
        
        if (!this.inputText && !this.file) {
            this.outputText = '';
            return;
        }

        if (!this.keyText) {
            this.outputText = '';
            return;
        }

        try {
            this.outputText = await this.generateHmac();
        } catch (error) {
            this.alert = {
                type: 'error',
                message: error instanceof Error ? error.message : 'An error occurred during HMAC generation'
            };
            this.outputText = '';
        }

        setTimeout(() => adjustTextareaHeight(this.output), 0);
    }

    private async generateHmac(): Promise<string> {
        try {
            // 1. Convert key to proper format for import
            let keyBuffer: ArrayBuffer;
            
            switch (this.keyFormat) {
                case 'text':
                    keyBuffer = new TextEncoder().encode(this.keyText).buffer;
                    break;
                case 'hex':
                    keyBuffer = this.hexToArrayBuffer(this.keyText);
                    break;
                case 'base64':
                    keyBuffer = this.base64ToArrayBuffer(this.keyText);
                    break;
                default:
                    throw new Error(`Unsupported key format: ${this.keyFormat}`);
            }
            
            // 2. Import the key
            const cryptoKey = await window.crypto.subtle.importKey(
                'raw',
                keyBuffer,
                {
                    name: 'HMAC',
                    hash: { name: this.selectedAlgorithm }
                },
                false,
                ['sign']
            );
            
            // 3. Convert input to proper format
            let messageBuffer: ArrayBuffer;
            
            if (this.file && this.fileName) {
                // If we have a file, use the cached file data
                messageBuffer = await this.readFileAsArrayBuffer(this.file);
            } else {
                switch (this.inputFormat) {
                    case 'text':
                        messageBuffer = new TextEncoder().encode(this.inputText).buffer;
                        break;
                    case 'hex':
                        messageBuffer = this.hexToArrayBuffer(this.inputText);
                        break;
                    case 'base64':
                        messageBuffer = this.base64ToArrayBuffer(this.inputText);
                        break;
                    default:
                        throw new Error(`Unsupported input format: ${this.inputFormat}`);
                }
            }
            
            // 4. Generate the HMAC
            const hmacBuffer = await window.crypto.subtle.sign(
                'HMAC',
                cryptoKey,
                messageBuffer
            );
            
            // 5. Convert output to requested format
            return this.outputFormat === 'hex' 
                ? this.arrayBufferToHex(hmacBuffer)
                : this.arrayBufferToBase64(hmacBuffer);
                
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`HMAC generation failed: ${error.message}`);
            } else {
                throw new Error('HMAC generation failed with an unknown error');
            }
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

        if (this.input) this.input.value = '';
        if (this.output) this.output.value = '';

        if (this.input) this.input.style.height = `auto`;
        if (this.output) this.output.style.height = `auto`;
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
                
                // Automatically set input encoding to match file type
                if (file.type.startsWith('text/')) {
                    this.inputFormat = 'text';
                } else {
                    this.inputFormat = 'hex';
                }
                
                const MAX_AUTO_PROCESS_SIZE = 10 * 1024 * 1024;
                
                if (file.size > MAX_AUTO_PROCESS_SIZE) {
                    this.alert = {
                        type: 'warning',
                        message: `File exceeds 10MB which may cause performance issues. The HMAC generation may take longer.`,
                    };
                }
                
                // Process the file
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
}