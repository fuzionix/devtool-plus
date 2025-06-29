import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import '../../common/color-picker/ColorPicker';
import '../../common/alert/Alert';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import hwbPlugin from 'colord/plugins/hwb';

extend([namesPlugin, hwbPlugin]);

@customElement('color-convertor')
export class ColorConvertor extends BaseTool {
    @state() private colorValue = '#3399ff';
    @state() private formats = {
        hex: '#3399ff',
        rgb: 'rgb(51, 153, 255)',
        hsl: 'hsl(210, 100%, 60%)',
        hwb: 'hwb(210 20% 0%)'
    };
    @state() private errors = {
        hex: '',
        rgb: '',
        hsl: '',
        hwb: ''
    };
    @state() private copiedFormat: string | null = null;

    static styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        this.updateAllFormats(this.colorValue);
    }

    protected renderTool() {
        return html`
            <style>
            .format-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            
            .format-label {
                width: 40px;
                text-transform: uppercase;
            }
            
            .copy-button {
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                cursor: pointer;
                opacity: 0.75;
            }
            
            .copy-button:hover {
                opacity: 1;
            }

            .format-group {
                margin-bottom: 8px;
            }

            .format-group.has-error .format-input {
                border-color: var(--vscode-editorError-foreground);
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Convert colors between different formats: HEX, RGB, HSL, and HWB. Edit any format directly or use the color picker.</p>
                <hr />
                                
                <div class="color-picker-container">
                    <tool-color-picker
                        class="w-full"
                        .value="${this.colorValue}"
                        @change="${this.handleColorChange}"
                    ></tool-color-picker>
                </div>
                
                <!-- Arrow Divider -->
                <div class="flex justify-center my-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                
                <!-- Format outputs -->
                <div class="formats-container">
                    ${this.renderFormatRow('hex', 'HEX')}
                    ${this.renderFormatRow('rgb', 'RGB')}
                    ${this.renderFormatRow('hsl', 'HSL')}
                    ${this.renderFormatRow('hwb', 'HWB')}
                </div>
            </div>
        `;
    }

    private renderFormatRow(format: keyof typeof this.formats, label: string) {
        const isCopied = this.copiedFormat === format;
        const hasError = !!this.errors[format];
        
        return html`
            <div class="format-group ${hasError ? 'has-error' : ''}">
                <div class="format-row">
                    <div class="format-label">${label}</div>
                    <input 
                        type="text" 
                        class="format-input font-mono flex-1 !bg-transparent" 
                        .value="${this.formats[format]}"
                        @input="${(e: InputEvent) => this.handleFormatInput(e, format)}"
                    />
                    <button 
                        class="copy-button ${isCopied ? 'copied' : ''}" 
                        @click="${() => this.copyToClipboard(format)}"
                        title="Copy to clipboard"
                    >
                        ${isCopied 
                            ? html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check" > <path d="M18 6 7 17l-5-5"></path> <path d="m22 10-7.5 7.5L13 16"></path> </svg>` 
                            : html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" > <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path> </svg>`
                        }
                    </button>
                </div>
                ${hasError ? html`<tool-alert type="error" message="${this.errors[format]}"></tool-alert>` : ''}
            </div>
        `;
    }

    private handleColorChange(e: CustomEvent) {
        const value = e.detail.value;
        this.colorValue = value;
        this.updateAllFormats(value);
        this.clearAllErrors();
    }

    private handleFormatInput(e: InputEvent, format: keyof typeof this.formats) {
        const input = e.target as HTMLInputElement;
        const value = input.value.trim();
        
        this.formats = { ...this.formats, [format]: value };
        
        const validationResult = this.validateColor(value, format);
        if (validationResult.isValid) {
            this.errors = { ...this.errors, [format]: '' };
            this.colorValue = validationResult.color as string;
            this.updateAllFormats(this.colorValue);
        } else {
            this.errors = { ...this.errors, [format]: validationResult.error as string };
        }
    }

    private validateColor(value: string, format: keyof typeof this.formats): { isValid: boolean; color?: string; error?: string } {
        try {
            const parsedColor = colord(value);
            
            if (!parsedColor.isValid()) {
                return {
                    isValid: false,
                    error: `Invalid ${format.toUpperCase()} color format`
                };
            }
            
            switch (format) {
                case 'hex':
                    if (!/^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value)) {
                        return {
                            isValid: false,
                            error: 'Invalid HEX format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA'
                        };
                    }
                    break;
                    
                case 'rgb':
                    if (!value.startsWith('rgb') && !value.startsWith('rgba')) {
                        return {
                            isValid: false,
                            error: 'Invalid RGB format. Use rgb(r,g,b) or rgba(r,g,b,a)'
                        };
                    }
                    break;
                    
                case 'hsl':
                    if (!value.startsWith('hsl') && !value.startsWith('hsla')) {
                        return {
                            isValid: false,
                            error: 'Invalid HSL format. Use hsl(h,s%,l%) or hsla(h,s%,l%,a)'
                        };
                    }
                    break;
                    
                case 'hwb':
                    if (!value.startsWith('hwb')) {
                        return {
                            isValid: false,
                            error: 'Invalid HWB format. Use hwb(h w% b%) or hwb(h w% b% / a)'
                        };
                    }
                    break;
            }
            
            // Return the parsed color in the original format for consistency
            return { 
                isValid: true,
                color: parsedColor.toHex()
            };
            
        } catch (error) {
            return {
                isValid: false,
                error: `Invalid ${format.toUpperCase()} color format`
            };
        }
    }

    private clearAllErrors() {
        this.errors = {
            hex: '',
            rgb: '',
            hsl: '',
            hwb: ''
        };
    }

    private updateAllFormats(color: string) {
        try {
            const parsedColor = colord(color);
            
            if (!parsedColor.isValid()) {
                throw new Error('Invalid color');
            }
            
            this.formats = {
                hex: parsedColor.toHex(),
                rgb: parsedColor.toRgbString(),
                hsl: parsedColor.toHslString(),
                hwb: parsedColor.toHwbString()
            };
            
        } catch (error) {
            console.error('Failed to update color formats:', error);
        }
    }

    private async copyToClipboard(format: keyof typeof this.formats) {
        try {
            await navigator.clipboard.writeText(this.formats[format]);
            this.copiedFormat = format;
            setTimeout(() => {
                this.copiedFormat = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    }
}