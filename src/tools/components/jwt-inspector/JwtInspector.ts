import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
} from '../../../utils/util';

@customElement('jwt-inspector')
export class JwtInspector extends BaseTool {
    @state() private input = '';
    @state() private secretKey = '';
    @state() private secretEncoding: 'utf-8' | 'base64' = 'utf-8';
    @state() private isVerified = false;
    @state() private alertInput: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private alertSecretKey: { type: 'error' | 'warning'; message: string } | null = null;
    
    @state() private header: Record<string, any> = {};
    @state() private payload: Record<string, any> = {};

    @query('#input') inputArea!: HTMLTextAreaElement;
    @query('#secretKey') secretKeyArea!: HTMLTextAreaElement;

    constructor() {
        super();
    }

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <style>
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
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties.</p>
                <hr />

                <!-- Input Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0 text-xs">JSON Web Token (JWT)</p>
                </div>
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable font-mono"
                        placeholder="Enter JWT token"
                        rows="1"
                        .value=${this.input}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="${this.isVerified ? 'Verified' : 'Invalid'}">
                            <button class="btn-icon">
                                ${this.isVerified ? html`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a754" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
                                ` : html`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-x"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                                `}
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

                <!-- Secret Key -->
                <div class="flex justify-between items-baseline mb-2 text-xs mt-4">
                    <p class="mb-0 text-xs">Secret</p>
                    <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'UTF-8', value: 'utf-8' },
                                { label: 'Base64', value: 'base64' }
                            ]}
                            .value=${this.secretEncoding}
                            placeholder="Input Encoding"
                            @change=${this.handleSecretEncodingChange}
                        ></tool-inline-menu>
                    </div>
                </div>
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="secretKey"
                        class="input-expandable font-mono"
                        placeholder="Enter Secret Key"
                        rows="1"
                        .value=${this.secretKey}
                        @input=${this.handleInputSecretKey}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="${this.isVerified ? 'Verified' : 'Invalid'}">
                            <button class="btn-icon">
                                ${this.isVerified ? html`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a754" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
                                ` : html`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-x"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                                `}
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

                ${this.renderJwtContent()}
            </div>
        `;
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
                <div class="flex justify-between items-center mb-2">
                    <div class="flex justify-between items-baseline text-xs">
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
                <div class="flex justify-between items-baseline mb-2">
                    <div class="flex justify-between items-baseline text-xs">
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

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        this.decodeJwt();
    }

    private handleInputSecretKey(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.secretKey = target.value;
        adjustTextareaHeight(target);
        this.verifyJwt();
    }

    private handleSecretEncodingChange(event: CustomEvent): void {
        this.secretEncoding = event.detail.value;
        this.verifyJwt();
    }

    private clearInput(): void {
        this.input = '';
        this.header = {};
        this.payload = {};
        this.alertInput = null;
        this.isVerified = false;
        
        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = '28px';
        }
        
        this.requestUpdate();
    }

    private clearSecretKey(): void {
        this.secretKey = '';
        this.alertSecretKey = null;
        this.isVerified = false;
        
        const secretKeyTextarea = this.querySelector('#secretKey') as HTMLTextAreaElement;
        if (secretKeyTextarea) {
            secretKeyTextarea.style.height = '28px';
        }
        
        this.requestUpdate();
    }

    private decodeJwt(): void {
        if (!this.input) {
            this.header = {};
            this.payload = {};
            this.alertInput = null;
            this.isVerified = false;
            return;
        }

        try {
            const parts = this.input.split('.');
            if (parts.length !== 3) {
                this.alertInput = { type: 'error', message: 'Invalid JWT format. Expected three parts separated by dots.' };
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
            }

            this.verifyJwt();
        } catch (e) {
            this.alertInput = { type: 'error', message: 'Error decoding JWT: ' + (e as Error).message };
        }
    }

    private verifyJwt(): void {
        if (!this.input || !this.secretKey) {
            this.isVerified = false;
            return;
        }

        try {
            // Simulate verification result (in real implementation, this would check the signature)
            // For demonstration, we'll just check if the secret key length is more than 8 characters
            this.isVerified = this.secretKey.length >= 8;
            
        } catch (e) {
            this.isVerified = false;
            this.alertSecretKey = { type: 'error', message: 'Error verifying signature: ' + (e as Error).message };
        }
    }

    private padBase64(base64: string): string {
        // Add padding to base64 if needed
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