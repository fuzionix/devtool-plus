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
import '../../common/expandable/Expandable';

type KeySize = '1024' | '2048' | '4096';
type KeyFormat = 'PKCS#8';
type KeyOutputFormat = 'PEM' | 'DER' | 'JWK';

@customElement('rsa-key-generator')
export class RsaKeyGenerator extends BaseTool {
    @state() private keySize: KeySize = '2048';
    @state() private keyFormat: KeyFormat = 'PKCS#8';
    @state() private outputFormat: KeyOutputFormat = 'PEM';
    @state() private publicKey = '';
    @state() private privateKey = '';
    @state() private isGenerating = false;
    @state() private alert: { type: 'error' | 'warning' | 'info'; message: string } | null = null;
    @state() private publicKeyCopied = false;
    @state() private privateKeyCopied = false;
    @state() private exponent = '65537'; // Default RSA exponent (0x10001)

    @query('#public-key') private publicKeyTextarea!: HTMLTextAreaElement;
    @query('#private-key') private privateKeyTextarea!: HTMLTextAreaElement;

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Generate RSA key pairs for asymmetric encryption, digital signatures, and secure communications.</p>
                <hr />

                <!-- Key Settings -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Key Size (bits)
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: '1024 bits', value: '1024' },
                                { label: '2048 bits', value: '2048' },
                                { label: '4096 bits', value: '4096' }
                            ]}
                            .value=${this.keySize}
                            placeholder="Select Key Size"
                            @change=${this.handleKeySizeChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Key Format
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'PKCS#8', value: 'PKCS#8' },
                            ]}
                            .value=${this.keyFormat}
                            placeholder="Select Key Format"
                            @change=${this.handleKeyFormatChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <!-- Output Format -->
                <div class="flex items-center mt-4 mb-2">
                    <div class="text-xs mr-2">Output Format:</div>
                    <div class="ml-2">
                        <tool-inline-menu
                            .options=${[
                                { label: 'PEM', value: 'PEM' },
                                { label: 'DER (Base64)', value: 'DER' },
                                { label: 'JWK', value: 'JWK' }
                            ]}
                            .value=${this.outputFormat}
                            placeholder="Output Format"
                            @change=${this.handleOutputFormatChange}
                        ></tool-inline-menu>
                    </div>
                </div>

                <!-- Warning about key size -->
                ${this.keySize === '1024' ? html`
                    <tool-alert
                        type="warning"
                        message="1024-bit keys are no longer considered secure for long-term use. Consider using at least 2048 bits for most applications."
                    ></tool-alert>
                ` : ''}
                
                ${this.keySize === '4096' ? html`
                    <tool-alert
                        type="info"
                        message="4096-bit keys provide high security but may be slower to generate and use."
                    ></tool-alert>
                ` : ''}

                <tool-expandable label="Advanced Settings">
                    <div class="content-to-expand">
                        <!-- Public Exponent -->
                        <p class="mb-2 text-xs">Public Exponent</p>
                        <p class="mb-2 text-xs opacity-75">
                            Common values: 65537 (0x10001). This is a prime number used as part of the public key.
                        </p>
                        <div class="relative flex items-center mb-4">
                            <input 
                                type="text"
                                class="input-expandable"
                                placeholder="Public Exponent"
                                .value=${this.exponent}
                                @input=${this.handleExponentChange}
                            />
                        </div>
                    </div>
                </tool-expandable>

                <!-- Generate Button -->
                <div class="flex justify-center mt-4 mb-2">
                    <button 
                        class="btn-primary ${this.isGenerating ? 'opacity-50 cursor-not-allowed' : ''}"
                        @click=${this.generateKeyPair}
                        ?disabled=${this.isGenerating}
                    >
                        ${this.isGenerating ? html`
                            <span class="spinner mr-2"></span>
                            Generating...
                        ` : html`
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-icon lucide-key"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                            </span>
                            Generate RSA Key Pair
                        `}
                    </button>
                </div>

                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Public Key Output -->
                <div class="mt-4">
                    <div class="flex justify-between items-baseline mb-2 text-xs">
                        <p class="mb-0">Public Key</p>
                    </div>
                    <div class="relative flex items-center">
                        <textarea
                            id="public-key"
                            class="input-expandable font-mono"
                            placeholder="Generated public key will appear here"
                            rows=${this.outputFormat === 'JWK' ? '8' : '5'}
                            readonly
                            .value=${this.publicKey}
                        ></textarea>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                            <button 
                                class="btn-icon"
                                @click=${this.copyPublicKey}
                                ?disabled=${!this.publicKey}
                            >
                                ${renderCopyButton(this.publicKeyCopied)}
                            </button>
                        </div>
                        <div class="absolute right-6 top-0.5 pr-0.5 flex justify-items-center">
                            <tool-tooltip text="Download">
                                <button 
                                    class="btn-icon" 
                                    @click=${() => this.downloadKey('public')}
                                    ?disabled=${!this.publicKey}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                </button>
                            </tool-tooltip>
                        </div>
                    </div>
                </div>

                <!-- Private Key Output -->
                <div class="mt-4">
                    <div class="flex justify-between items-baseline mb-2 text-xs">
                        <p class="mb-0">Private Key</p>
                    </div>
                    <div class="relative flex items-center">
                        <textarea
                            id="private-key"
                            class="input-expandable font-mono"
                            placeholder="Generated private key will appear here"
                            rows=${this.outputFormat === 'JWK' ? '15' : '10'}
                            readonly
                            .value=${this.privateKey}
                        ></textarea>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                            <button 
                                class="btn-icon"
                                @click=${this.copyPrivateKey}
                                ?disabled=${!this.privateKey}
                            >
                                ${renderCopyButton(this.privateKeyCopied)}
                            </button>
                        </div>
                        <div class="absolute right-6 top-0.5 pr-0.5 flex justify-items-center">
                            <tool-tooltip text="Download">
                                <button 
                                    class="btn-icon" 
                                    @click=${() => this.downloadKey('private')}
                                    ?disabled=${!this.privateKey}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                </button>
                            </tool-tooltip>
                        </div>
                    </div>
                </div>

                <!-- Security Note -->
                ${this.privateKey ? html`
                    <div class="mt-2 text-xs opacity-75 flex items-start">
                        <div class="w-4 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert-icon lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        </div>
                        <span>
                            Keep your private key secure and never share it. This key was generated locally and was not transmitted over the network.
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    private handleKeySizeChange(e: CustomEvent) {
        this.keySize = e.detail.value as KeySize;
        this.publicKey = '';
        this.privateKey = '';
    }

    private handleKeyFormatChange(e: CustomEvent) {
        this.keyFormat = e.detail.value as KeyFormat;
        // Regenerate keys if we already have keys
        if (this.publicKey && this.privateKey) {
            this.convertExistingKeys();
        }
    }

    private handleOutputFormatChange(e: CustomEvent) {
        this.outputFormat = e.detail.value as KeyOutputFormat;
        // Regenerate keys if we already have keys
        if (this.publicKey && this.privateKey) {
            this.convertExistingKeys();
        }
    }

    private handleExponentChange(e: Event) {
        const input = e.target as HTMLInputElement;
        // Validate that it's a valid number
        const value = input.value.trim();
        if (/^\d+$/.test(value)) {
            this.exponent = value;
        } else {
            this.alert = {
                type: 'error',
                message: 'Public exponent must be a positive integer'
            };
        }
    }

    private async convertExistingKeys() {
        // This would convert existing keys to the new format
        // For simplicity, we'll just regenerate them
        this.publicKey = '';
        this.privateKey = '';
        this.alert = {
            type: 'warning',
            message: 'Please regenerate keys with the new settings'
        };
    }

    private async generateKeyPair() {
        this.isGenerating = true;
        this.alert = null;
        this.publicKey = '';
        this.privateKey = '';

        try {
            const exponentValue = parseInt(this.exponent, 10);
            if (isNaN(exponentValue) || exponentValue < 3 || exponentValue % 2 === 0) {
                throw new Error('Public exponent must be an odd integer greater than or equal to 3');
            }

            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: parseInt(this.keySize, 10),
                    publicExponent: new Uint8Array(this.bigIntToUint8Array(BigInt(this.exponent))),
                    hash: 'SHA-256',
                },
                true,
                ['encrypt', 'decrypt']
            );

            await this.exportKeys(keyPair);

        } catch (error) {
            console.error('Error generating RSA key pair:', error);
            this.alert = {
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to generate RSA key pair'
            };
        } finally {
            this.isGenerating = false;
            
            if (this.publicKeyTextarea && this.privateKeyTextarea) {
                setTimeout(() => {
                    adjustTextareaHeight(this.publicKeyTextarea);
                    adjustTextareaHeight(this.privateKeyTextarea);
                }, 0);
            }
        }
    }

    private bigIntToUint8Array(bigInt: bigint): number[] {
        const result: number[] = [];
        let value = bigInt;
        
        // Special case for 65537 (0x10001), a common RSA exponent
        if (value === 65537n) {
            return [0x01, 0x00, 0x01]; // The bytes of 65537 in big-endian
        }
        
        while (value > 0n) {
            result.unshift(Number(value & 255n));
            value = value >> 8n;
        }
        
        return result.length ? result : [0];
    }

    private async exportKeys(keyPair: CryptoKeyPair) {
        try {
            switch (this.outputFormat) {
                case 'JWK':
                    await this.exportKeysAsJWK(keyPair);
                    break;
                case 'PEM':
                    await this.exportKeysAsPEM(keyPair);
                    break;
                case 'DER':
                    await this.exportKeysAsDER(keyPair);
                    break;
                default:
                    throw new Error('Unsupported output format');
            }
        } catch (error) {
            throw new Error(`Failed to export keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async exportKeysAsJWK(keyPair: CryptoKeyPair) {
        const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
        
        this.publicKey = JSON.stringify(publicJwk, null, 2);
        this.privateKey = JSON.stringify(privateJwk, null, 2);
    }

    private async exportKeysAsPEM(keyPair: CryptoKeyPair) {
        // First export as SPKI for public key
        const publicKeyBuffer = await window.crypto.subtle.exportKey(
            'spki', 
            keyPair.publicKey
        );
        
        // Export private key in the selected format
        const privateKeyFormat = this.keyFormat === 'PKCS#8' ? 'pkcs8' : 'pkcs8';
        const privateKeyBuffer = await window.crypto.subtle.exportKey(
            privateKeyFormat, 
            keyPair.privateKey
        );
        
        // Convert to Base64
        const publicKeyBase64 = this.arrayBufferToBase64(publicKeyBuffer);
        const privateKeyBase64 = this.arrayBufferToBase64(privateKeyBuffer);
        
        // Format as PEM
        this.publicKey = this.formatAsPEM(publicKeyBase64, 'PUBLIC KEY');
        
        // Format private key PEM
        const privateKeyType = this.keyFormat === 'PKCS#8' ? 'PRIVATE KEY' : 'RSA PRIVATE KEY';
        this.privateKey = this.formatAsPEM(privateKeyBase64, privateKeyType);
    }

    private async exportKeysAsDER(keyPair: CryptoKeyPair) {
        // Export as SPKI for public key
        const publicKeyBuffer = await window.crypto.subtle.exportKey(
            'spki', 
            keyPair.publicKey
        );
        
        // Export private key in PKCS#8 format
        const privateKeyBuffer = await window.crypto.subtle.exportKey(
            'pkcs8', 
            keyPair.privateKey
        );
        
        // Convert to Base64
        this.publicKey = this.arrayBufferToBase64(publicKeyBuffer);
        this.privateKey = this.arrayBufferToBase64(privateKeyBuffer);
    }

    private formatAsPEM(base64Data: string, label: string): string {
        // Insert newlines every 64 characters
        let formattedData = '';
        for (let i = 0; i < base64Data.length; i += 64) {
            formattedData += base64Data.slice(i, i + 64) + '\n';
        }
        
        return `-----BEGIN ${label}-----\n${formattedData}-----END ${label}-----`;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private async copyPublicKey() {
        if (!this.publicKey) return;
        
        try {
            await navigator.clipboard.writeText(this.publicKey);
            this.publicKeyCopied = true;
            setTimeout(() => {
                this.publicKeyCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy public key:', err);
            this.alert = {
                type: 'error',
                message: 'Failed to copy public key to clipboard'
            };
        }
    }

    private async copyPrivateKey() {
        if (!this.privateKey) return;
        
        try {
            await navigator.clipboard.writeText(this.privateKey);
            this.privateKeyCopied = true;
            setTimeout(() => {
                this.privateKeyCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy private key:', err);
            this.alert = {
                type: 'error',
                message: 'Failed to copy private key to clipboard'
            };
        }
    }

    private downloadKey(keyType: 'public' | 'private'): void {
        const keyText = keyType === 'public' ? this.publicKey : this.privateKey;
        if (!keyText) return;
        
        let fileName = '';
        let mimeType = 'text/plain';
        let extension = '';
        let base64Data = '';
        
        // Determine file name and mime type based on output format
        switch (this.outputFormat) {
            case 'PEM':
                extension = '.pem';
                mimeType = 'application/x-pem-file';
                // Convert PEM to Base64 by removing headers, footers, and line breaks
                base64Data = btoa(keyText);
                break;
                
            case 'DER':
                extension = '.der';
                mimeType = 'application/octet-stream';
                // DER is already Base64 encoded
                base64Data = btoa(keyText);
                break;
                
            case 'JWK':
                extension = '.json';
                mimeType = 'application/json';
                // JSON string needs to be Base64 encoded
                base64Data = btoa(keyText);
                break;
                
            default:
                extension = '.txt';
                base64Data = btoa(keyText);
                break;
        }
        
        fileName = `rsa-${keyType}-key-${this.keySize}${extension}`;
        (window as any).vscode.postMessage({
            type: 'download',
            payload: {
                base64: base64Data,
                mimeType: mimeType,
                fileName: fileName,
                extension: extension,
                text: keyText  // Include the raw text for text-based formats
            }
        });
    }
}