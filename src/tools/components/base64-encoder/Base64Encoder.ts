import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';
import mimeDb from 'mime-db';

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
                const [header, content] = base64Data.split(',');
                base64Data = content;
                this.decodedMimeType = header.split(';')[0].split(':')[1];
                this.decodedData = this.base64ToUint8Array(content);
            } else {
                try {
                    this.decodedData = this.base64ToUint8Array(base64Data);
                    this.decodedMimeType = this.detectMimeType(this.decodedData);

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

    /**
     * Detects the MIME type of a file based on its binary signature/magic numbers
     * @param data - Uint8Array containing the file's binary data to analyze
     * @returns string - The detected MIME type
     */
    private detectMimeType(data: Uint8Array): string {
        if (data.length === 0) {
            return 'text/plain';
        }

        // Define file signatures with variable lengths for better accuracy
        // Format: [mimeType, [signature bytes], minBytesRequired]
        const signatures: Array<[string, number[], number]> = [
            // Images
            ['image/jpeg', [0xFF, 0xD8, 0xFF], 3],
            ['image/png', [0x89, 0x50, 0x4E, 0x47], 4],
            ['image/gif', [0x47, 0x49, 0x46, 0x38], 4],
            ['image/webp', [0x52, 0x49, 0x46, 0x46], 4],
            ['image/bmp', [0x42, 0x4D], 2],
            ['image/tiff', [0x49, 0x49, 0x2A, 0x00], 4], // Little-endian
            ['image/tiff', [0x4D, 0x4D, 0x00, 0x2A], 4], // Big-endian
            ['image/svg+xml', [0x3C, 0x3F, 0x78, 0x6D], 4],
            ['image/x-icon', [0x00, 0x00, 0x01, 0x00], 4],

            // Documents & Archives
            ['application/pdf', [0x25, 0x50, 0x44, 0x46], 4], // %PDF
            ['application/zip', [0x50, 0x4B, 0x03, 0x04], 4], // PK.. (zip, jar, docx, xlsx, etc)
            ['application/zip', [0x50, 0x4B, 0x05, 0x06], 4], // PK.. (empty zip)
            ['application/zip', [0x50, 0x4B, 0x07, 0x08], 4], // PK.. (spanned zip)
            ['application/x-rar-compressed', [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07], 6],
            ['application/x-7z-compressed', [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], 6],
            ['application/gzip', [0x1F, 0x8B, 0x08], 3],
            ['application/x-tar', [0x75, 0x73, 0x74, 0x61, 0x72], 5],
            ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', [0x50, 0x4B, 0x03, 0x04], 4],
            ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', [0x50, 0x4B, 0x03, 0x04], 4],
            ['application/vnd.openxmlformats-officedocument.presentationml.presentation', [0x50, 0x4B, 0x03, 0x04], 4],
            ['application/xml', [0x3C, 0x3F, 0x78, 0x6D], 4],

            // Text formats
            ['application/json', [0x7B], 1],
            ['application/json', [0x5B], 1],
            ['text/html', [0x3C, 0x21, 0x44, 0x4F], 4],
            ['text/html', [0x3C, 0x48, 0x54, 0x4D], 4],
            ['text/html', [0x3C, 0x68, 0x74, 0x6D], 4],
            ['text/css', [0x2F, 0x2A], 2],
            ['application/javascript', [0x2F, 0x2F], 2],
            ['text/plain', [0xEF, 0xBB, 0xBF], 3],

            // Audio
            ['audio/mpeg', [0xFF, 0xFB], 2], // MP3 (MPEG-1)
            ['audio/mpeg', [0xFF, 0xFA], 2], // MP3 (MPEG-2)
            ['audio/mpeg', [0xFF, 0xF3], 2], // MP3 (MPEG-2.5)
            ['audio/mpeg', [0x49, 0x44, 0x33], 3], // ID3 tag
            ['audio/wav', [0x52, 0x49, 0x46, 0x46], 4],
            ['audio/flac', [0x66, 0x4C, 0x61, 0x43], 4],
            ['audio/aac', [0xFF, 0xF1], 2],
            ['audio/ogg', [0x4F, 0x67, 0x67, 0x53], 4],

            // Video
            ['video/mp4', [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], 8],
            ['video/quicktime', [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], 8],
            ['video/x-msvideo', [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49], 11],
            ['video/x-matroska', [0x1A, 0x45, 0xDF, 0xA3], 4],
            ['video/mpeg', [0x00, 0x00, 0x01, 0xB3], 4],
            ['video/x-flv', [0x46, 0x4C, 0x56, 0x01], 4],
            ['video/quicktime', [0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20], 7],

            // Executables & System
            ['application/x-msdownload', [0x4D, 0x5A], 2],
            ['application/x-mach-binary', [0xFE, 0xED, 0xFA, 0xCE], 4],
            ['application/x-mach-binary', [0xFE, 0xED, 0xFA, 0xCF], 4],
            ['application/x-executable', [0x7F, 0x45, 0x4C, 0x46], 4],
            ['application/x-sharedlib', [0x7F, 0x45, 0x4C, 0x46], 4],

            // Fonts
            ['font/ttf', [0x00, 0x01, 0x00, 0x00], 4],
            ['font/otf', [0x4F, 0x54, 0x54, 0x4F], 4],
            ['font/woff', [0x77, 0x4F, 0x46, 0x46], 4],
            ['font/woff2', [0x77, 0x4F, 0x46, 0x32], 4],

            // Database & Data
            ['application/x-sqlite3', [0x53, 0x51, 0x4C, 0x69], 4],
            ['application/vnd.google-earth.kml+xml', [0x3C, 0x3F, 0x78, 0x6D], 4],
        ];

        for (const [mimeType, signature, minBytes] of signatures) {
            if (data.length >= minBytes) {
                // Handle variable-length signatures and masks
                let match = true;
                for (let i = 0; i < signature.length; i++) {
                    if (data[i] !== signature[i]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return mimeType;
                }
            }
        }

        // Secondary detection: Check for tar format (signature at offset 257)
        if (data.length > 262) {
            const tarSignature = [0x75, 0x73, 0x74, 0x61, 0x72];
            if (tarSignature.every((byte, i) => data[257 + i] === byte)) {
                return 'application/x-tar';
            }
        }

        return 'text/plain';
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

            reader.onload = async (e) => {
                try {
                    const result = e.target?.result;
                    if (typeof result === 'string') {
                        this.outputText = btoa(result);
                    } else if (result instanceof ArrayBuffer) {
                        const bytes = new Uint8Array(result);
                        let binary = '';
                        // Convert byte array to binary string
                        bytes.forEach(byte => binary += String.fromCharCode(byte));
                        this.outputText = btoa(binary);
                    }
                    this.uriHeader = `data:${this.inputMimeType};base64,`;
                    this.outputText = this.isShowUriHeader ? `${this.uriHeader}${this.outputText}` : this.outputText;
                    this.requestUpdate();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            if (file.type.startsWith('text/')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
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

    private getBase64String(base64Data: string): { base64: string; mimeType: string } {
        if (base64Data.startsWith('data:')) {
            const [header, content] = base64Data.split(',');
            const mimeType = header.split(';')[0].split(':')[1];
            return { base64: content, mimeType };
        }
        return { base64: base64Data, mimeType: this.decodedMimeType };
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
}