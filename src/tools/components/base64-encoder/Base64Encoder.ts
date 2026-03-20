import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';
import mimeDb from 'mime-db';
import { detectMimeType } from './mimeUtils';

@customElement('base64-encoder')
export class Base64Encoder extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private fileName = '';
    @state() private file: File | null = null;
    @state() private outputMode: 'text' | 'image' | 'document' | 'error' = 'text';
    @state() private decodedMimeType = '';
    @state() private decodedData: string | Uint8Array | null = null;
    @state() private inputMimeType = '';
    @state() private uriHeader = '';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private isShowUriHeader = false;
    @state() private decodedFileSize = 0;

    @query('#input') input!: HTMLTextAreaElement;
    @query('#output') output!: HTMLTextAreaElement;
    @query('#file-input') fileInput!: HTMLInputElement;

    private styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Base64 is an encoding scheme that converts binary data into a text format using 64 characters (A-Z, a-z, 0-9, +, /) for safe data transmission across systems that handle text only.</p>
                <hr />
                <!-- Hidden File Input -->
                <input id="file-input" class="hidden" type="file" @change=${this.handleFileSelect}>
                <!-- Input Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter text or upload file"
                        rows="1"
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
                <div class="flex justify-between mt-2 gap-2">
                    <button id="encode" class="btn-primary gap-2" @click=${this.encode}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-left-right-square"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m10 15-3-3 3-3"/><path d="m14 9 3 3-3 3"/></svg>
                        <h4>Encode</h4>
                    </button>
                    <button id="decode" class="btn-outline gap-2" @click=${this.decode}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        <h4>Decode</h4>
                    </button>
                </div>
                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                <!-- Output Field -->
                ${this.renderOutput()}
            </div>
        `;
    }

    /**
     * Renders the output section based on the current output mode.
     * Supports three modes:
     *  - Txt: Displays the decoded text in a readonly textarea.
     *  - Img: Displays the decoded image.
     *  - Doc: Provides a download button.
     */
    private renderOutput() {
        switch (this.outputMode) {
            case 'image':
                return html`
                    <div class="relative flex items-center">
                        <div class="asset-viewer flex justify-center mt-2 pr-8">
                            <img src="${this.outputText}" alt="Base64 decoded" />
                        </div>
                        <div class="absolute right-0 top-2.5 pr-0.5 flex justify-items-center">
                            <button 
                                class="btn-icon" 
                                @click=${() => this.triggerDownload()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            case 'document':
                return html`
                    <div class="relative flex items-center">
                        <button 
                            class="btn-primary mt-2 gap-2"
                            @click=${() => this.triggerDownload()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            <div class="flex items-center gap-2">
                                <h4>${this.getDownloadButtonText()}</h4>
                                <span class="text-xs opacity-75">${this.formatFileSize(this.decodedFileSize)}</span>
                            </div>
                        </button>
                    </div>
                `;
            case 'text':
                return html`
                    <div class="relative flex items-center">
                        <textarea
                            id="output"
                            class="input-expandable mt-2 pr-6"
                            placeholder="Output will appear here"
                            rows="5"
                            .value=${this.outputText}
                            readonly
                        ></textarea>
                        <div class="absolute right-0 top-2.5 pr-0.5 flex justify-items-center">
                            <button 
                                class="btn-icon" 
                                @click=${this.copyToClipboard}
                            >
                                ${renderCopyButton(this.isCopied)}
                            </button>
                        </div>
                    </div>
                    <div class="flex mt-2">
                        <tool-switch
                            .checked=${this.isShowUriHeader}
                            rightLabel="URI Header"
                            ariaLabel="Toggle show URI Header"
                            @change=${this.handleModeChange}
                        ></tool-switch>
                    </div>
                `;
            default:
                return html`
                    <div class="relative flex items-center opacity-30 select-none">
                        <textarea
                            id="output"
                            class="input-expandable mt-2 pr-6 select-none"
                            placeholder=""
                            rows="2"
                            readonly
                        ></textarea>
                    </div>
                `;
        }
    }

    protected updated(changedProperties: Map<string, unknown>): void {
        super.updated(changedProperties);

        if (this.output && changedProperties.has('outputText')) {
            adjustTextareaHeight(this.output);
        }
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.inputText = target.value;
        adjustTextareaHeight(target);
    }

    private handleModeChange(e: CustomEvent) {
        this.isShowUriHeader = e.detail.checked;
        if (this.outputText.startsWith(this.uriHeader)) {
            this.outputText = this.outputText.replace(this.uriHeader, '');
        }
        this.outputText = this.isShowUriHeader ? `${this.uriHeader}${this.outputText}` : this.outputText;
        this.requestUpdate();
    }

    /**
     * Encodes input text or file content to Base64 format
     * @returns Promise<void>
     */
    private async encode(): Promise<void> {
        this.alert = null;
        try {
            if (!this.inputText && !this.file) {
                this.outputText = '';
                return;
            }

            let result: string;

            if (this.file && this.fileName) {
                // For file input, use the data:URI format
                await this.encodeFile(this.file);
            } else {
                // For text input, convert to Base64 using built-in btoa()
                result = btoa(
                    // Encode URI components to handle special characters
                    encodeURIComponent(this.inputText).replace(/%([0-9A-F]{2})/g,
                        (_, p1) => String.fromCharCode(parseInt(p1, 16))
                    )
                );
                this.outputText = result;
            }

            this.outputMode = 'text';
            this.renderOutput();
            this.requestUpdate();
        } catch (error) {
            this.hideOutput();
            this.alert = {
                type: 'error',
                message: `Failed to Encode: ${String(error).split(':')[2]}`,
            };
        }
    }

    /**
     * Decodes Base64 input to either text, image, or document format
     * Handles both raw Base64 and data:URI formats
     * @returns Promise<void>
     */
    private async decode(): Promise<void> {
        this.alert = null;
        try {
            if (!this.inputText) {
                return;
            }

            let base64Data = this.inputText.trim();

            // Handle data:URI format (e.g. data:image/png;base64,...)
            if (base64Data.startsWith('data:')) {
                const commaIndex = base64Data.indexOf(',');
                if (commaIndex === -1) {
                    this.hideOutput();
                    this.alert = {
                        type: 'error',
                        message: 'Invalid data URI format: missing comma separator'
                    };
                    return;
                }

                const header = base64Data.substring(0, commaIndex);
                const content = base64Data.substring(commaIndex + 1);

                // Check if the data URI explicitly contains base64 encoding
                if (!header.includes(';base64')) {
                    this.hideOutput();
                    this.alert = {
                        type: 'error',
                        message: 'Data URI must contain ";base64" for Base64 decoding. Plain data URIs are not supported.'
                    };
                    return;
                }

                base64Data = content;
                this.decodedMimeType = header.split(';')[0].split(':')[1];
                if (this.decodedMimeType.startsWith('text/plain')) {
                    const bytes = this.base64ToUint8Array(content);
                    this.decodedData = new TextDecoder('utf-8').decode(bytes);
                } else {
                    this.decodedData = this.base64ToUint8Array(content);
                }
            } else {
                try {
                    this.decodedData = this.base64ToUint8Array(base64Data);
                    this.decodedMimeType = detectMimeType(this.decodedData);

                    if (this.decodedMimeType === 'text/plain') {
                        // Attempt to decode as Base64
                        try {
                            const decodedText = decodeURIComponent(
                                atob(base64Data)
                                    .split('')
                                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                                    .join('')
                            );
                            this.decodedData = decodedText;
                        } catch (error) {
                            this.decodedMimeType = 'application/octet-stream';
                        }
                    }
                    this.requestUpdate();
                } catch (error) {
                    this.hideOutput();
                    this.alert = {
                        type: 'error',
                        message: `Failed to Decode: Invalid Base64 string`,
                    };
                    console.error('Decoding error: Invalid Base64 string', error);
                    return;
                }
            }

            // Calculate decoded file size
            if (this.decodedData instanceof Uint8Array) {
                this.decodedFileSize = this.decodedData.length;
            } else if (typeof this.decodedData === 'string') {
                this.decodedFileSize = new Blob([this.decodedData]).size;
            }

            // Set output mode based on MIME type
            if (this.decodedMimeType.startsWith('image/')) {
                this.outputMode = 'image';
                this.outputText = `data:${this.decodedMimeType};base64,${base64Data}`;
            } else if (this.decodedMimeType.startsWith('text/plain')) {
                this.outputMode = 'text';
                this.outputText = this.decodedData as string;
            } else {
                this.outputMode = 'document';
                this.outputText = `data:${this.decodedMimeType};base64,${base64Data}`;
            }

            this.requestUpdate();
        } catch (error) {
            this.hideOutput();
            this.alert = {
                type: 'error',
                message: `Failed to Decode. Please ensure the input is a valid Base64 string.`,
            };
        }
    }

    /**
     * Converts a Base64 encoded string to a Uint8Array of bytes
     * @param base64 The Base64 encoded string to convert
     * @returns Uint8Array containing the decoded bytes
     */
    private base64ToUint8Array(base64: string): Uint8Array {
        const cleanedBase64 = base64.replace(/\s/g, '');
        
        const binaryString = atob(cleanedBase64);
        const bytes = new Uint8Array(binaryString.length);
        // Convert each character in binary string to its byte value
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    private triggerFileInput(): void {
        this.fileInput.click();
    }

    /**
     * Handles file selection event and converts file content to Base64
     * @param event - File input change event
     * @returns Promise<void>
     */
    private async handleFileSelect(event: Event): Promise<void> {
        // Get selected file from input element
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];
        this.clearAll();

        if (file) {
            try {
                this.file = file;
                this.fileName = file.name;
                this.inputMimeType = file.type;

                const MAX_AUTO_ENCODE_SIZE = 10 * 1024 * 1024;

                if (file.size > MAX_AUTO_ENCODE_SIZE) {
                    this.alert = {
                        type: 'warning',
                        message: `File exceeds 10MB which may cause performance issues. You can still encode the file manually.`,
                    };
                    return;
                }

                await this.encodeFile(file);
            } catch (error) {
                this.alert = {
                    type: 'error',
                    message: `Failed to read file. Please ensure it is not corrupted.`,
                };
            }
        }
    }

    private async encodeFile(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const result = e.target?.result;
                    if (!(result instanceof ArrayBuffer)) {
                        reject(new Error('Failed to read file as binary data.'));
                        return;
                    }

                    this.outputText = this.arrayBufferToBase64(result);
                    this.uriHeader = `data:${this.inputMimeType};base64,`;
                    this.outputText = this.isShowUriHeader
                        ? `${this.uriHeader}${this.outputText}`
                        : this.outputText;

                    this.requestUpdate();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    private getBase64String(base64Data: string): { base64: string; mimeType: string } {
        if (base64Data.startsWith('data:')) {
            const [header, content] = base64Data.split(',');
            const mimeType = header.split(';')[0].split(':')[1];
            return { base64: content, mimeType };
        }
        return { base64: base64Data, mimeType: this.decodedMimeType };
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000; // avoid call stack/memory issues on larger files
        let binary = '';

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }

        return btoa(binary);
    }

    private getDownloadButtonText(): string {
        const extension = this.getFileExtension();
        if (extension) {
            return `Download ${extension.toUpperCase()}`;
        }
        return 'Download File';
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private async triggerDownload(): Promise<void> {
        const data = this.getBase64String(this.outputText);
        (window as any).vscode.postMessage({
            type: 'download',
            payload: {
                base64: data.base64,
                mimeType: data.mimeType || this.decodedMimeType,
                fileName: this.fileName || `decoded-file`,
                extension: this.getFileExtension(),
            }
        });
    }

    private getFileExtension(): string {
        const mimeEntry = mimeDb[this.decodedMimeType];
        if (mimeEntry && mimeEntry.extensions && mimeEntry.extensions.length > 0) {
            return mimeEntry.extensions[0];
        }
        return '';
    }

    private clearAll(): void {
        this.inputText = '';
        this.outputText = '';
        this.fileName = '';
        this.file = null;
        this.fileInput.value = '';
        this.outputMode = 'text';
        this.input.style.height = `28px`;
        this.uriHeader = '';
        this.alert = null;
        this.decodedFileSize = 0;
        this.renderOutput();
        this.requestUpdate();
    }

    private async copyToClipboard() {
        if (!this.outputText) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.outputText);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            this.isCopied = false;
        }
    }

    private hideOutput() {
        this.outputText = '';
        this.outputMode = 'error';
        this.requestUpdate();
    }
}