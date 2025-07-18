import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight } from '../../../utils/util';
import * as QRCode from 'qrcode';

type QrCodeType = 'link' | 'text' | 'image' | 'video';

@customElement('qr-code-generator')
export class QrCodeGenerator extends BaseTool {
    @state() private inputText = 'https://example.com';
    @state() private qrCodeDataUrl = '';
    @state() private selectedType: QrCodeType = 'link';
    @state() private alert: { type: 'error' | 'warning' | 'success'; message: string } | null = null;
    @state() private errorCorrection: 'L' | 'M' | 'Q' | 'H' = 'M';
    @state() private padding = 4;
    @state() private backgroundColor = '#ffffff';
    @state() private foregroundColor = '#000000';
    @state() private maskPattern = 2;

    static styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        this.generateQrCode();
    }

    protected renderTool() {
        return html`
            <style>           
            .qr-image {
                max-width: 200px;
                max-height: 200px;
            }
            
            .file-container {
                margin-top: 8px;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Generate QR codes from various data types. Select the input type and enter your data.</p>
                <hr />
                
                <!-- QR Code Preview section -->
                <div class="relative frame flex justify-center items-center min-h-[200px] mb-2">
                    ${this.qrCodeDataUrl 
                        ? html`<img class="qr-image" src="${this.qrCodeDataUrl}" alt="Generated QR Code" />`
                        : html`<span class="opacity-75">QR code will appear here</span>`
                    }
                    <div class="absolute right-0 top-0.5 pr-0.5 flex flex-col justify-items-center">
                        <tool-tooltip text="Export PNG">
                            <button 
                                class="btn-icon" 
                                @click=${() => this.downloadQrcode('png')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-down-icon lucide-image-down"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19 3 3v-5.5"/><path d="m17 22 3-3"/><circle cx="9" cy="9" r="2"/></svg>
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Export SVG">
                            <button 
                                class="btn-icon" 
                                @click=${() => this.downloadQrcode('svg')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>

                <!-- Input Type Options -->
                <tool-radio-group 
                    selected="${this.selectedType}" 
                    ariaLabel="Input Type" 
                    @change=${this.handleTypeChange}
                >
                    <tool-radio-item value="link" tooltip="Link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </tool-radio-item>
                    <tool-radio-item value="text" tooltip="Text">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-letter-text-icon lucide-letter-text"><path d="M15 12h6"/><path d="M15 6h6"/><path d="m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13"/><path d="M3 18h18"/><path d="M3.92 11h6.16"/></svg>
                    </tool-radio-item>
                    <tool-radio-item value="image" tooltip="Image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </tool-radio-item>
                    <tool-radio-item value="video" tooltip="Video">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-icon lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                    </tool-radio-item>
                </tool-radio-group>

                <!-- Conditional Input Fields -->
                ${this.renderInputField()}
                
                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <!-- QR Settings -->
                <div class="flex flex-col min-[320px]:flex-row gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Error correction
                        </div>
                        <tool-dropdown-menu 
                            .options=${[
                                { value: 'L', label: 'Low (7%)' },
                                { value: 'M', label: 'Medium (15%)' },
                                { value: 'Q', label: 'Quartile (25%)' },
                                { value: 'H', label: 'High (30%)' }
                            ]}
                            .value=${'M'}
                            @change=${this.handleErrorCorrectionChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                    <div class="mb-2 text-xs">
                            Padding
                        </div>
                        <tool-dropdown-menu 
                            .options=${[
                                { value: '0', label: 'None' },
                                { value: '2', label: 'Small' },
                                { value: '4', label: 'Medium' },
                                { value: '8', label: 'Large' }
                            ]}
                            .value=${'4'}
                            @change=${this.handlePaddingChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <div class="flex flex-col min-[320px]:flex-row w-full gap-4">
                    <div class="flex-1">
                        <p class="mb-2 text-xs select-none">Background Color</p>
                        <tool-color-picker
                            class="w-full h-7"
                            .value="${this.backgroundColor}"
                            @change="${(e: CustomEvent) => this.handleColorChange(e, 'background')}"
                        ></tool-color-picker>
                    </div>

                    <div class="flex-1">
                        <p class="mb-2 text-xs select-none">Foreground Color</p>
                        <tool-color-picker
                            class="w-full h-7"
                            .value="${this.foregroundColor}"
                            @change="${(e: CustomEvent) => this.handleColorChange(e, 'foreground')}"
                        ></tool-color-picker>
                    </div>
                </div>

                <tool-expandable label="Advanced Settings" class="mt-2">
                    <div class="content-to-expand">
                        <p class="mb-2 text-xs">Mask Pattern</p>
                        <tool-slider
                            min="0"
                            max="7"
                            step="1"
                            .value="${this.maskPattern}"
                            @change=${this.handleMaskPatternChange}
                        ></tool-slider>
                    </div>
                </tool-expandable>
            </div>
        `;
    }

    private renderInputField() {
        console.log('Selected Type:', this.selectedType);
        switch(this.selectedType) {
            case 'link':
                return html`
                    <div class="relative flex items-center mt-4">
                        <textarea
                            id="input-link"
                            class="input-expandable"
                            placeholder="Enter URL"
                            rows="1"
                            .value=${this.inputText}
                            @input=${this.handleInput}
                        ></textarea>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                            <tool-tooltip text="Clear">
                                <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </tool-tooltip>
                            <div class="inline-flex items-center justify-center py-1.5 min-w-0 w-6 h-6 px-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            </div>
                        </div>
                    </div>
                `;
            
            case 'text':
                return html`
                    <div class="relative flex items-center mt-4">
                        <textarea
                            id="input-text"
                            class="input-expandable"
                            placeholder="Enter text content"
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
                            <div class="inline-flex items-center justify-center py-1.5 min-w-0 w-6 h-6 px-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-letter-text-icon lucide-letter-text"><path d="M15 12h6"/><path d="M15 6h6"/><path d="m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13"/><path d="M3 18h18"/><path d="M3.92 11h6.16"/></svg>
                            </div>
                        </div>
                    </div>
                `;
            
            case 'image':
                return html`
                    <div class="file-container">
                        <tool-file-dropzone 
                            accept=".jpg,.jpeg,.png,.gif,.webp,.svg,image/*" 
                            placeholder="Drop your image file here"
                            @files-changed=${this.handleImageFileChanged}
                        >
                            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </tool-file-dropzone>
                    </div>
                `;
            
            case 'video':
                return html`
                    <div class="file-container">
                        <tool-file-dropzone 
                            accept=".mp4,.webm,.ogg,.mov,video/*" 
                            placeholder="Drop your video file here"
                            @files-changed=${this.handleVideoFileChanged}
                        >
                            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-icon lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                        </tool-file-dropzone>
                    </div>
                `;
            
            default:
                return html``;
        }
    }

    private handleTypeChange(event: CustomEvent): void {
        const newType = event.detail.value as QrCodeType;
        this.selectedType = newType;
        this.inputText = '';
        this.qrCodeDataUrl = '';
        this.alert = null;
        this.requestUpdate();
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.inputText = target.value;
        adjustTextareaHeight(target);
        this.generateQrCode();
    }

    private handleErrorCorrectionChange(event: CustomEvent): void {
        this.errorCorrection = event.detail.value as 'L' | 'M' | 'Q' | 'H';
        this.generateQrCode();
    }

    private handlePaddingChange(event: CustomEvent): void {
        this.padding = parseInt(event.detail.value, 10);
        this.generateQrCode();
    }

    private async handleImageFileChanged(event: CustomEvent): Promise<void> {
        const files = event.detail.filesArray as File[];
        
        if (files.length === 0) {
            this.qrCodeDataUrl = '';
            return;
        }
        
        try {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                this.alert = { type: 'error', message: 'Please select a valid image file.' };
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const fileDataUrl = reader.result as string;
                this.inputText = fileDataUrl;
                this.generateQrCode();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.alert = { type: 'error', message: 'Failed to process image file.' };
        }
    }

    private async handleVideoFileChanged(event: CustomEvent): Promise<void> {
        const files = event.detail.filesArray as File[];
        
        if (files.length === 0) {
            this.qrCodeDataUrl = '';
            return;
        }
        
        try {
            const file = files[0];
            if (!file.type.startsWith('video/')) {
                this.alert = { type: 'error', message: 'Please select a valid video file.' };
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const fileDataUrl = reader.result as string;
                this.inputText = fileDataUrl;
                this.generateQrCode();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.alert = { type: 'error', message: 'Failed to process video file.' };
        }
    }

    private handleColorChange(e: CustomEvent, colorType: 'background' | 'foreground') {
        const value = e.detail.value;
        if (colorType === 'background') {
            this.backgroundColor = value;
        } else if (colorType === 'foreground') {
            this.foregroundColor = value;
        }
        this.generateQrCode();
    }

    private handleMaskPatternChange(e: Event) {
        const target = e.target as HTMLInputElement;
        this.maskPattern = Number(target.value);
        this.generateQrCode();
    }

    private async generateQrCode(): Promise<void> {
        if (!this.inputText.trim()) {
            this.qrCodeDataUrl = '';
            return;
        }

        try {
            const options = {
                errorCorrectionLevel: this.errorCorrection,
                margin: this.padding,
                width: 200,
                color: {
                    dark: this.foregroundColor || '#000000',
                    light: this.backgroundColor || '#ffffff'
                },
                maskPattern: this.maskPattern as QRCode.QRCodeMaskPattern,
            };

            const dataUrl = await QRCode.toDataURL(this.inputText, options);
            this.qrCodeDataUrl = dataUrl;
            this.alert = null;
        } catch (error) {
            this.alert = { 
                type: 'error', 
                message: 'Failed to generate QR code. The input may be too long or contain invalid characters.' 
            };
            this.qrCodeDataUrl = '';
        }
    }

    private async downloadQrcode(format: 'png' | 'svg'): Promise<void> {
        if (!this.qrCodeDataUrl) {
            this.alert = { 
                type: 'warning', 
                message: 'No QR code to download. Please generate a QR code first.' 
            };
            return;
        }

        try {
            if (format === 'png') {
                const base64 = this.qrCodeDataUrl.split(',')[1];
                const fileName = `qrcode-${new Date().getTime()}.png`;
                (window as any).vscode?.postMessage?.({
                    type: 'download',
                    payload: {
                        base64,
                        fileName,
                        extension: 'png'
                    }
                });
            } else if (format === 'svg') {
                const svgString = await QRCode.toString(this.inputText, {
                    errorCorrectionLevel: this.errorCorrection,
                    margin: this.padding,
                    type: 'svg',
                    color: {
                        dark: this.foregroundColor || '#000000',
                        light: this.backgroundColor || '#ffffff'
                    }
                });
                
                const base64 = btoa(unescape(encodeURIComponent(svgString)));
                const fileName = `qrcode-${new Date().getTime()}.svg`;
                (window as any).vscode?.postMessage?.({
                    type: 'download',
                    payload: {
                        base64,
                        fileName,
                        extension: 'svg'
                    }
                });
            }
        } catch (error) {
            this.alert = { 
                type: 'error', 
                message: 'Failed to download QR code. Please try again.' 
            };
            console.error('Error downloading QR code:', error);
        }
    }

    private clearAll(): void {
        this.inputText = '';
        this.qrCodeDataUrl = '';
        this.alert = null;
        
        if (this.selectedType === 'image' || this.selectedType === 'video') {
            const dropzone = this.shadowRoot?.querySelector('tool-file-dropzone') as any;
            if (dropzone && typeof dropzone.clearFiles === 'function') {
                dropzone.clearFiles();
            }
        }
        
        this.requestUpdate();
    }
}