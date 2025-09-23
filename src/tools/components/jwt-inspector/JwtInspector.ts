import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
} from '../../../utils/util';

@customElement('jwt-inspector')
export class JwtInspector extends BaseTool {
    @state() private input = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.nahptzfdNj2PE6KIyD_ZcqvtbFzvpuMjBaLzZm_aUoU';
    @state() private secretKey = 'this-is-a-json-web-token-secret-key';
    @state() private secretEncoding: 'utf-8' | 'base64' | 'pem' = 'utf-8';
    @state() private encodingOptions: Array<{ label: string; value: string }> = [
        { label: 'UTF-8', value: 'utf-8' },
        { label: 'Base64', value: 'base64' },
        { label: 'PEM', value: 'pem' }
    ];
    @state() private alertInput: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private alertSecretKey: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private verificationStatus: 'none' | 'verified' | 'invalid' | 'processing' = 'none';
    
    @state() private header: Record<string, any> = {};
    @state() private payload: Record<string, any> = {};

    @query('#input') inputArea!: HTMLTextAreaElement;
    @query('#secretKey') secretKeyArea!: HTMLTextAreaElement;

    constructor() {
        super();
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.decodeJwt();
    }

    private styles = css`
        ${BaseTool.styles}

        .jwt-table {
            width: 100%;
            border-radius: 2px;
            border-collapse: collapse;
            margin-top: 0;
            margin-bottom: 1rem;
        }
        
        .jwt-table th, .jwt-table td {
            padding: 0.375rem 0.5rem;
            border: 1px solid var(--vscode-panel-border);
            text-align: left;
        }
        
        .jwt-table th {
            background-color: var(--vscode-editor-background);
            font-size: 0.75rem;
            text-align: center;
        }
        
        .jwt-section {
            margin-top: 1rem;
        }
        
        .jwt-value {
            word-break: break-all;
            font-family: var(--vscode-editor-font-family);
        }
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties.</p>
                <hr />

                <!-- Input Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0 text-xs">JSON Web Token (JWT)</p>
                </div>
                <div class="relative mt-2">
                    <textarea
                        id="input"
                        class="input-expandable font-mono"
                        placeholder="Enter JWT token"
                        rows="3"
                        .value=${this.input}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="${this.getVerificationStatusText()}">
                            <button class="btn-icon">
                                ${this.renderVerificationIcon()}
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearInput}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.alertInput ? html`
                    <tool-alert
                        .type=${this.alertInput.type}
                        .message=${this.alertInput.message}
                    ></tool-alert>
                ` : ''}

                <!-- Secret / Public Key -->
                <div class="flex justify-between items-baseline mb-2 text-xs mt-4">
                    <p class="mb-0 text-xs">${this.getAlgorithmType() === 'asymmetric' ? 'Public Key' : 'Secret'}</p>
                    <div>
                        <tool-inline-menu
                            .options=${this.encodingOptions}
                            .value=${this.secretEncoding}
                            placeholder="Input Encoding"
                            @change=${this.handleSecretEncodingChange}
                        ></tool-inline-menu>
                    </div>
                </div>
                <div class="relative mt-2">
                    <textarea
                        id="secretKey"
                        class="input-expandable font-mono"
                        placeholder="Enter Secret Key${this.getAlgorithmType() === 'asymmetric' ? ' or Public Key' : ''}"
                        rows="1"
                        .value=${this.secretKey}
                        @input=${this.handleInputSecretKey}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="${this.getVerificationStatusText()}">
                            <button class="btn-icon">
                                ${this.renderVerificationIcon()}
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearSecretKey}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.alertSecretKey ? html`
                    <tool-alert
                        .type=${this.alertSecretKey.type}
                        .message=${this.alertSecretKey.message}
                    ></tool-alert>
                ` : ''}
                
                ${this.updateEncodingOptions()}
                ${this.renderJwtContent()}
            </div>
        `;
    }

    private updateEncodingOptions() {
        const algType = this.getAlgorithmType();
        if (algType === 'symmetric') {
            this.encodingOptions = [
                { label: 'UTF-8', value: 'utf-8' },
                { label: 'Base64', value: 'base64' }
            ];
            if (this.secretEncoding === 'pem') { this.secretEncoding = 'utf-8'; }
        } else if (algType === 'asymmetric') {
            this.encodingOptions = [
                { label: 'PEM', value: 'pem' }
            ];
            if (this.secretEncoding !== 'pem') { this.secretEncoding = 'pem'; }
        }
    }

    private getAlgorithmType(): 'symmetric' | 'asymmetric' | 'unknown' {
        const alg = this.header.alg;
        if (!alg) { return 'unknown'; }
        
        if (alg.startsWith('HS')) {
            return 'symmetric';
        } else if (alg.startsWith('RS') || alg.startsWith('PS') || alg.startsWith('ES')) {
            return 'asymmetric';
        }
        
        return 'unknown';
    }

    private renderVerificationIcon() {
        switch (this.verificationStatus) {
            case 'verified':
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a754" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
                `;
            case 'invalid':
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-x"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                `;
            case 'processing':
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-question-mark-icon lucide-badge-question-mark"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                `;
            default:
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-question-mark-icon lucide-badge-question-mark"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                `;
        }
    }

    private getVerificationStatusText() {
        switch (this.verificationStatus) {
            case 'verified': return 'Verified';
            case 'invalid': return 'Invalid Signature';
            case 'processing': return 'Verifying...';
            default: return 'Not Verified';
        }
    }

    private renderJwtContent() {
        return html`
            ${this.renderHeaderTable()}
            ${this.renderPayloadTable()}
        `;
    }

    private renderHeaderTable() {
        const headerEntries = Object.entries(this.header);
        const hasHeader = headerEntries.length > 0;
        
        return html`
            <div class="jwt-section">
                <div class="mb-2">
                    <div class="text-xs">
                        <p class="mb-0 text-xs">Header</p>
                    </div>
                </div>
                <table class="jwt-table">
                    <thead>
                        <tr>
                            <th style="width: 30%">Name</th>
                            <th style="width: 70%">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hasHeader ? 
                            headerEntries.map(([key, value]) => this.renderTableRow(key, value)) :
                            html`<tr><td colspan="2" class="text-center opacity-75">No header data</td></tr>`
                        }
                    </tbody>
                </table>
            </div>
        `;
    }

    private renderPayloadTable() {
        const payloadEntries = Object.entries(this.payload);
        const hasPayload = payloadEntries.length > 0;
        
        return html`
            <div class="jwt-section">
                <div class="mb-2">
                    <div class="text-xs">
                        <p class="mb-0 text-xs">Payload</p>
                    </div>
                </div>
                <table class="jwt-table">
                    <thead>
                        <tr>
                            <th style="width: 30%">Name</th>
                            <th style="width: 70%">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hasPayload ? 
                            payloadEntries.map(([key, value]) => this.renderTableRow(key, value)) :
                            html`<tr><td colspan="2" class="text-center opacity-75">No payload data</td></tr>`
                        }
                    </tbody>
                </table>
            </div>
        `;
    }

    private renderTableRow(key: string, value: any) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        return html`
            <tr>
                <td>${key}</td>
                <td class="jwt-value">${stringValue}</td>
            </tr>
        `;
    }

    private async handleInput(event: Event): Promise<void> {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        await this.decodeJwt();
    }

    private async handleInputSecretKey(event: Event): Promise<void> {
        const target = event.target as HTMLTextAreaElement;
        this.secretKey = target.value;
        adjustTextareaHeight(target);
        await this.verifyJwt();
    }

    private async handleSecretEncodingChange(event: CustomEvent): Promise<void> {
        this.secretEncoding = event.detail.value;
        await this.verifyJwt();
    }

    private clearInput(): void {
        this.input = '';
        this.header = {};
        this.payload = {};
        this.alertInput = null;
        this.verificationStatus = 'none';
        
        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = '28px';
        }
        
        this.requestUpdate();
    }

    private clearSecretKey(): void {
        this.secretKey = '';
        this.alertSecretKey = null;
        this.verificationStatus = 'none';
        
        const secretKeyTextarea = this.querySelector('#secretKey') as HTMLTextAreaElement;
        if (secretKeyTextarea) {
            secretKeyTextarea.style.height = '28px';
        }
        
        this.requestUpdate();
    }

    private async decodeJwt(): Promise<void> {
        if (!this.input) {
            this.header = {};
            this.payload = {};
            this.alertInput = null;
            this.verificationStatus = 'none';
            return;
        }

        try {
            const parts = this.input.split('.');
            if (parts.length !== 3) {
                this.alertInput = { type: 'error', message: 'Invalid JWT format. Expected three parts separated by dots.' };
                this.verificationStatus = 'invalid';
                return;
            }

            try {
                // Decode header
                const headerStr = atob(this.padBase64(parts[0]));
                this.header = JSON.parse(headerStr);
                
                // Decode payload
                const payloadStr = atob(this.padBase64(parts[1]));
                this.payload = JSON.parse(payloadStr);
                                
                this.alertInput = null;
            } catch (e) {
                this.alertInput = { type: 'error', message: 'Failed to decode JWT parts: ' + (e as Error).message };
                this.verificationStatus = 'invalid';
                return;
            }

            await this.verifyJwt();
        } catch (e) {
            this.alertInput = { type: 'error', message: 'Error decoding JWT: ' + (e as Error).message };
            this.verificationStatus = 'invalid';
        }
    }

    private async verifyJwt(): Promise<void> {
        if (!this.input || !this.secretKey) {
            this.verificationStatus = 'none';
            this.alertSecretKey = null;
            return;
        }

        try {
            this.verificationStatus = 'processing';
            this.alertSecretKey = null;
            
            const parts = this.input.split('.');
            if (parts.length !== 3) {
                this.alertInput = { type: 'error', message: 'Invalid JWT format. Expected three parts separated by dots.' };
                this.verificationStatus = 'invalid';
                return;
            }

            const [headerB64, payloadB64, signatureB64] = parts;
            const data = `${headerB64}.${payloadB64}`;
            const signature = this.base64UrlToArrayBuffer(signatureB64);

            const alg = this.header.alg;
            if (!alg) {
                this.alertSecretKey = { type: 'error', message: 'No algorithm specified in JWT header' };
                this.verificationStatus = 'invalid';
                return;
            }

            const cryptoAlg = this.getWebCryptoAlgorithm(alg);
            if (!cryptoAlg) {
                this.alertSecretKey = { type: 'error', message: `Unsupported algorithm: ${alg}` };
                this.verificationStatus = 'invalid';
                return;
            }

            let key: CryptoKey;
            const isAsymmetricAlg = alg.startsWith('RS') || alg.startsWith('PS') || alg.startsWith('ES');
            
            // Import key based on algorithm and encoding
            if (isAsymmetricAlg && this.secretEncoding === 'pem') {
                try {
                    // Parse PEM and import as appropriate key type
                    key = await this.importKeyFromPem(this.secretKey, cryptoAlg);
                } catch (error) {
                    this.alertSecretKey = { type: 'error', message: `Invalid PEM key: ${(error as Error).message}` };
                    this.verificationStatus = 'invalid';
                    return;
                }
            } else {
                let keyData: ArrayBuffer;
                if (this.secretEncoding === 'base64') {
                    keyData = this.base64ToArrayBuffer(this.secretKey);
                } else {
                    keyData = new TextEncoder().encode(this.secretKey).buffer;
                }

                if (alg.startsWith('HS')) {
                    key = await window.crypto.subtle.importKey(
                        'raw',
                        keyData,
                        cryptoAlg,
                        false,
                        ['verify']
                    );
                } else {
                    this.alertSecretKey = { type: 'warning', message: 'For asymmetric algorithms (RS/PS/ES), PEM format is recommended' };
                    try {
                        key = await window.crypto.subtle.importKey(
                            'spki',
                            keyData,
                            cryptoAlg,
                            false,
                            ['verify']
                        );
                    } catch (error) {
                        this.alertSecretKey = { type: 'error', message: `Invalid key format: ${(error as Error).message}` };
                        this.verificationStatus = 'invalid';
                        return;
                    }
                }
            }

            const dataToVerify = new TextEncoder().encode(data);

            const isValid = await window.crypto.subtle.verify(
                cryptoAlg,
                key,
                signature,
                dataToVerify
            );

            this.verificationStatus = isValid ? 'verified' : 'invalid';
            this.alertSecretKey = isValid 
                ? null 
                : { type: 'error', message: 'Invalid signature' };
        } catch (e) {
            this.verificationStatus = 'invalid';
            this.alertSecretKey = { type: 'error', message: 'Error verifying signature: ' + (e as Error).message };
        }
    }

    private getWebCryptoAlgorithm(jwtAlg: string): HmacImportParams | EcKeyImportParams | RsaHashedImportParams | RsaPssParams | null {
        switch (jwtAlg) {
            case 'HS256':
                return { name: 'HMAC', hash: 'SHA-256' };
            case 'HS384':
                return { name: 'HMAC', hash: 'SHA-384' };
            case 'HS512':
                return { name: 'HMAC', hash: 'SHA-512' };
            
            case 'RS256':
                return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
            case 'RS384':
                return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' };
            case 'RS512':
                return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' };
            
            case 'PS256':
                return { name: 'RSA-PSS', hash: 'SHA-256', saltLength: 32 };
            case 'PS384':
                return { name: 'RSA-PSS', hash: 'SHA-384', saltLength: 48 };
            case 'PS512':
                return { name: 'RSA-PSS', hash: 'SHA-512', saltLength: 64 };
            
            case 'ES256':
                return { name: 'ECDSA', namedCurve: 'P-256' };
            case 'ES384':
                return { name: 'ECDSA', namedCurve: 'P-384' };
            case 'ES512':
                return { name: 'ECDSA', namedCurve: 'P-521' };
            
            default:
                return null;
        }
    }

    private async importKeyFromPem(pemKey: string, algorithm: any): Promise<CryptoKey> {
        // Remove PEM header/footer and whitespace
        const pemContent = pemKey.replace(/-+BEGIN .+?-+/, '').replace(/-+END .+?-+/, '').replace(/\s+/g, '');
        
        // Convert base64 to ArrayBuffer
        const binaryDer = this.base64ToArrayBuffer(pemContent);
        
        let keyFormat = 'spki'; // Default to SubjectPublicKeyInfo format
        let keyUsage: KeyUsage[] = ['verify'];

        console.log('Importing key from PEM:', pemKey);
        
        // Detect if the PEM seems to be a private key
        if (pemKey.includes('PRIVATE KEY')) {
            this.alertSecretKey = { 
                type: 'warning', 
                message: 'You provided a private key, but verification only requires a public key.' 
            };
        }
        
        return await window.crypto.subtle.importKey(
            keyFormat as any,
            binaryDer,
            algorithm,
            false,
            keyUsage
        );
    }

    private base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
        const base64 = this.padBase64(base64Url);
        const binaryString = atob(base64);
        
        // Convert binary string to ArrayBuffer
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        return bytes.buffer;
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        
        // Convert binary string to ArrayBuffer
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        return bytes.buffer;
    }

    private padBase64(base64: string): string {
        // Add padding to base64 if needed
        // Replace URL safe characters with standard Base64 characters
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        
        switch (base64.length % 4) {
            case 0:
                return base64;
            case 2:
                return base64 + '==';
            case 3:
                return base64 + '=';
            default:
                throw new Error('Invalid base64 string');
        }
    }
}