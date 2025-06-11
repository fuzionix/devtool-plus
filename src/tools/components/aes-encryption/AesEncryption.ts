import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight, renderCopyButton } from '../../../utils/util';
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
    @state() private keyEncoding = false;
    @state() private inputEncoding = false;
    @state() private outputEncoding = false;
    @state() private selectedMode: EncryptionMode = 'CBC';
    @state() private selectedKeySize: KeySize = '256';
    @state() private selectedOperation: Operation = 'encrypt';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    @query('#key') private key!: HTMLTextAreaElement;
    @query('#input') private input!: HTMLTextAreaElement;
    @query('#iv') private iv!: HTMLTextAreaElement;
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
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">Key</p>
                    <tool-switch
                        .checked=${this.keyEncoding}
                        leftLabel="UTF-8"
                        rightLabel="Hex"
                        ariaLabel="Key Encoding"
                        data-charset="numbers"
                        @change=${this.handleKeyEncodingChange}
                    ></tool-switch>
                </div>
                <div class="relative flex items-center mb-4">
                    <textarea
                        id="key"
                        class="input-expandable"
                        placeholder="Enter Key"
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
                    <p class="mb-0">
                        ${this.selectedOperation === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
                    </p>
                    <tool-switch
                        .checked=${this.inputEncoding}
                        leftLabel=${this.selectedOperation === 'encrypt' ? 'UTF-8' : 'Base64'}
                        rightLabel="Hex"
                        ariaLabel="Input Encoding"
                        data-charset="numbers"
                        @change=${this.handleInputEncodingChange}
                    ></tool-switch>
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
                        <div class="relative flex items-center mb-4">
                            <textarea 
                                id="iv"
                                class="input-expandable"
                                placeholder="Enter IV (optional)"
                                rows="1"
                                .value=${this.ivText}
                                @input=${this.handleIvChange}
                                ?disabled=${this.selectedMode === 'ECB'}
                            ></textarea>
                            <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                                <button class="btn-icon" @click=${this.generateRandomIv} ?disabled=${this.selectedMode === 'ECB'}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                                </button>
                            </div>
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
                    <tool-switch
                        .checked=${this.outputEncoding}
                        leftLabel="Hex"
                        rightLabel="Base64"
                        ariaLabel="Output Encoding"
                        data-charset="numbers"
                        @change=${this.handleOutputEncodingChange}
                    ></tool-switch>
                </div>
            </div>
        `;
    }

    private handleModeChange(mode: 'encrypt' | 'decrypt') {
        this.selectedOperation = mode;
        this.processInput();
    }

    private handleEncryptionModeChange(e: CustomEvent) {
        const newMode = e.detail.value as EncryptionMode;
        this.selectedMode = newMode;

        if (newMode === 'ECB') {
            this.ivText = '';
        } else if (!this.ivText) {
            this.generateRandomIv();
        }

        this.processInput();
    }

    private handleKeySizeChange(e: CustomEvent) {
        this.selectedKeySize = e.detail.value as KeySize;
        this.processInput();
    }

    private handleKeyEncodingChange(e: CustomEvent) {
        if (this.keyText) {
            const oldEncoding = this.keyEncoding;
            const newEncoding = e.detail.checked;
            
            try {
                // Converting from UTF-8 to Hex
                if (!oldEncoding && newEncoding) {
                    const encoder = new TextEncoder();
                    const keyBytes = encoder.encode(this.keyText);
                    this.keyText = this.arrayBufferToHex(keyBytes);
                }
                // Converting from Hex to UTF-8
                else if (oldEncoding && !newEncoding) {
                    const keyBuffer = this.hexToArrayBuffer(this.keyText);
                    const decoder = new TextDecoder();
                    this.keyText = decoder.decode(keyBuffer);
                }
            } catch (error) {
                this.alert = {
                    type: 'error',
                    message: 'Failed to convert key format. The key may contain invalid characters.'
                };
                this.keyEncoding = oldEncoding;
                return;
            }
        }
        
        this.keyEncoding = e.detail.checked;
        this.processInput();
    }

    private handleKeyChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.keyText = target.value;
        this.processInput();
        adjustTextareaHeight(this.key);
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.inputText = target.value;
        this.processInput();
        adjustTextareaHeight(this.input);
    }

    private handleIvChange(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.ivText = target.value;
        this.processInput();
        adjustTextareaHeight(this.iv);
    }

    private handleInputEncodingChange(e: CustomEvent) {
        if (this.inputText) {
            const oldEncoding = this.inputEncoding;
            const newEncoding = e.detail.checked;
            
            try {
                if (this.selectedOperation === 'encrypt') {
                    if (!oldEncoding && newEncoding) {
                        const encoder = new TextEncoder();
                        const inputBytes = encoder.encode(this.inputText);
                        this.inputText = this.arrayBufferToHex(inputBytes);
                    } else if (oldEncoding && !newEncoding) {
                        const inputBuffer = this.hexToArrayBuffer(this.inputText);
                        const decoder = new TextDecoder();
                        this.inputText = decoder.decode(inputBuffer);
                    }
                } else {
                    if (!oldEncoding && newEncoding) {
                        const inputBuffer = this.base64ToArrayBuffer(this.inputText);
                        this.inputText = this.arrayBufferToHex(inputBuffer);
                    } else if (oldEncoding && !newEncoding) {
                        const inputBuffer = this.hexToArrayBuffer(this.inputText);
                        this.inputText = this.arrayBufferToBase64(inputBuffer);
                    }
                }
            } catch (error) {
                this.alert = {
                    type: 'error',
                    message: 'Failed to convert input format. The input may contain invalid characters.'
                };
                this.inputEncoding = oldEncoding;
                return;
            }
        }
        
        this.inputEncoding = e.detail.checked;
        this.processInput();
    }

    private handleOutputEncodingChange(e: CustomEvent) {
        this.outputEncoding = e.detail.checked;
        this.processInput();
    }

    private generateRandomKey(): void {
        const keySize = parseInt(this.selectedKeySize);
        const byteLength = keySize / 8;
        const randomBytes = new Uint8Array(byteLength);
        window.crypto.getRandomValues(randomBytes);
        
        if (this.keyEncoding) {
            this.keyText = this.arrayBufferToHex(randomBytes);
        } else {
            this.keyText = this.arrayBufferToBase64(randomBytes);
        }
        
        this.processInput();
        adjustTextareaHeight(this.key);
    }

    private generateRandomIv(): void {
        // IV should be 16 bytes (128 bits) for AES
        const ivBytes = new Uint8Array(16);
        window.crypto.getRandomValues(ivBytes);
        this.ivText = this.arrayBufferToHex(ivBytes);
        this.processInput();
        adjustTextareaHeight(this.iv);
    }

    private async processInput(): Promise<void> {
        this.alert = null;

        if (!this.inputText || !this.keyText) {
            this.outputText = '';
            return;
        }

        try {
            if (this.selectedOperation === 'encrypt') {
                this.outputText = await this.encrypt(this.inputText, this.keyText, this.ivText);
            } else {
                this.outputText = await this.decrypt(this.inputText, this.keyText, this.ivText);
            }
        } catch (error) {
            console.error('Encryption/Decryption error:', error);
            this.alert = {
                type: 'error',
                message: error instanceof Error ? error.message : 'An error occurred during processing'
            };
            this.outputText = '';
        }
    }

    private async encrypt(plaintext: string, key: string, iv: string): Promise<string> {
        try {
            this.validateInputs();

            let keyBuffer: ArrayBuffer;
            if (this.keyEncoding) {
                keyBuffer = this.hexToArrayBuffer(key);
            } else {
                const encoder = new TextEncoder();
                keyBuffer = encoder.encode(key);
            }

            keyBuffer = this.adjustKeyLength(keyBuffer, parseInt(this.selectedKeySize) / 8);

            let ivBuffer: ArrayBuffer | undefined;
            if (this.selectedMode !== 'ECB') {
                if (!iv) {
                    // Create a zero-filled IV when none is provided
                    const zeroIv = new Uint8Array(16);
                    ivBuffer = zeroIv.buffer;
                } else {
                    ivBuffer = this.hexToArrayBuffer(iv);
                }
            }

            let plaintextBuffer: ArrayBuffer;
            if (this.selectedOperation === 'encrypt') {
                if (this.inputEncoding) {
                    // Input is in Hex format
                    plaintextBuffer = this.hexToArrayBuffer(plaintext);
                } else {
                    // Input is in UTF-8 format
                    const encoder = new TextEncoder();
                    plaintextBuffer = encoder.encode(plaintext);
                }
            } else {
                if (this.inputEncoding) {
                    // Input is in Hex format
                    plaintextBuffer = this.hexToArrayBuffer(plaintext);
                } else {
                    // Input is in Base64 format
                    plaintextBuffer = this.base64ToArrayBuffer(plaintext);
                }
            }

            const cryptoKey = await window.crypto.subtle.importKey(
                'raw',
                keyBuffer,
                {
                    name: this.getAlgorithmName(),
                    length: parseInt(this.selectedKeySize)
                },
                false,
                ['encrypt']
            );

            const algorithmParams = this.createAlgorithmParams(ivBuffer);
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                algorithmParams,
                cryptoKey,
                plaintextBuffer
            );

            return this.outputEncoding 
                ? this.arrayBufferToBase64(encryptedBuffer)
                : this.arrayBufferToHex(encryptedBuffer);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Encryption failed: ${error.message}`);
            } else {
                throw new Error('Encryption failed with an unknown error');
            }
        }
    }

    private async decrypt(ciphertext: string, key: string, iv: string): Promise<string> {
        try {
            this.validateInputs();

            let keyBuffer: ArrayBuffer;
            if (this.keyEncoding) {
                keyBuffer = this.hexToArrayBuffer(key);
            } else {
                const encoder = new TextEncoder();
                keyBuffer = encoder.encode(key);
            }

            keyBuffer = this.adjustKeyLength(keyBuffer, parseInt(this.selectedKeySize) / 8);

            let ivBuffer: ArrayBuffer | undefined;
            if (this.selectedMode !== 'ECB') {
                if (!iv) {
                    throw new Error('IV is required for this decryption mode');
                }
                ivBuffer = this.hexToArrayBuffer(iv);
            }

            let ciphertextBuffer: ArrayBuffer;
            if (this.inputEncoding) {
                ciphertextBuffer = this.hexToArrayBuffer(ciphertext);
            } else {
                ciphertextBuffer = this.base64ToArrayBuffer(ciphertext);
            }

            const cryptoKey = await window.crypto.subtle.importKey(
                'raw',
                keyBuffer,
                {
                    name: this.getAlgorithmName(),
                    length: parseInt(this.selectedKeySize)
                },
                false,
                ['decrypt']
            );

            const algorithmParams = this.createAlgorithmParams(ivBuffer);
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                algorithmParams,
                cryptoKey,
                ciphertextBuffer
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Decryption failed: ${error.message}`);
            } else {
                throw new Error('Decryption failed with an unknown error');
            }
        }
    }

    private validateInputs(): void {
        if (this.keyEncoding) {
            const hexRegex = /^[0-9a-fA-F]+$/;
            if (!hexRegex.test(this.keyText.replace(/\s/g, ''))) {
                throw new Error('Hex-encoded key must contain only hexadecimal characters (0-9, a-f, A-F)');
            }
        }

        if (this.selectedMode !== 'ECB' && this.ivText) {
            const hexRegex = /^[0-9a-fA-F]+$/;
            if (!hexRegex.test(this.ivText.replace(/\s/g, ''))) {
                throw new Error('IV must contain only hexadecimal characters (0-9, a-f, A-F)');
            }

            const ivLength = this.ivText.replace(/\s/g, '').length;
            if (ivLength !== 32) { // 16 bytes = 32 hex characters
                throw new Error('IV must be exactly 32 hex characters (128 bits)');
            }
        }

        if (this.selectedOperation === 'decrypt' && !this.inputEncoding) {
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(this.inputText.trim())) {
                throw new Error('Base64-encoded ciphertext must be in valid Base64 format');
            }
        }

        if (this.selectedOperation === 'decrypt' && this.inputEncoding) {
            const hexRegex = /^[0-9a-fA-F]+$/;
            if (!hexRegex.test(this.inputText.replace(/\s/g, ''))) {
                throw new Error('Hex-encoded ciphertext must contain only hexadecimal characters (0-9, a-f, A-F)');
            }
        }
    }

    private adjustKeyLength(keyBuffer: ArrayBuffer, targetByteLength: number): ArrayBuffer {
        const keyBytes = new Uint8Array(keyBuffer);
        
        if (keyBytes.length === targetByteLength) {
            return keyBuffer;
        }
        
        // Padding (using PKCS#7 style)
        if (keyBytes.length < targetByteLength) {
            const paddedKey = new Uint8Array(targetByteLength);
            paddedKey.set(keyBytes);
            const paddingValue = targetByteLength - keyBytes.length;
            for (let i = keyBytes.length; i < targetByteLength; i++) {
                paddedKey[i] = paddingValue;
            }
            return paddedKey.buffer;
        }
        
        // If key is too long, truncate it to the target length
        return keyBytes.slice(0, targetByteLength).buffer;
    }

    private getAlgorithmName(): string {
        switch (this.selectedMode) {
            case 'CBC': return 'AES-CBC';
            case 'ECB': return 'AES-ECB';
            case 'CFB': return 'AES-CFB';
            case 'OFB': return 'AES-OFB';
            case 'CTR': return 'AES-CTR';
            case 'GCM': return 'AES-GCM';
            default: return 'AES-CBC';
        }
    }

    private createAlgorithmParams(iv?: ArrayBuffer): any {
        if (!iv && this.selectedMode !== 'ECB') {
            throw new Error('IV is required for this encryption mode');
        }

        switch (this.selectedMode) {
            case 'CBC':
                return {
                    name: 'AES-CBC',
                    iv
                };
            case 'ECB':
                // ECB doesn't use an IV
                return {
                    name: 'AES-ECB'
                };
            case 'CFB':
                return {
                    name: 'AES-CFB',
                    iv
                };
            case 'OFB':
                return {
                    name: 'AES-OFB',
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
        const binaryString = atob(base64.trim());
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
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