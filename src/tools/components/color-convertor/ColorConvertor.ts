import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import '../../common/color-picker/ColorPicker';
import '../../common/alert/Alert';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import hwbPlugin from 'colord/plugins/hwb';
import cmykPlugin from 'colord/plugins/cmyk';
import lchPlugin from 'colord/plugins/lch';
import { ColorPicker } from '../../common/color-picker/ColorPicker';

extend([namesPlugin, hwbPlugin, cmykPlugin, lchPlugin]);

@customElement('color-convertor')
export class ColorConvertor extends BaseTool {
    @state() private colorValue = '#3399ff';
    @state() private formats = {
        hex: '#3399ff',
        rgb: 'rgb(51, 153, 255)',
        hsl: 'hsl(210, 100%, 60%)',
        hwb: 'hwb(210 20% 0%)',
        cmyk: 'device-cmyk(80% 40% 0% 0%)',
        lch: 'lch(63.01% 54.38 262.33)',
        name: ''
    };
    @state() private exactName = false; // Track if the name is exact or approximate
    @state() private errors = {
        hex: '',
        rgb: '',
        hsl: '',
        hwb: '',
        cmyk: '',
        lch: '',
        name: ''
    };
    @state() private copiedFormat: string | null = null;
    @state() private editingFormat: string | null = null;
    @state() private originalValues = {
        hex: '',
        rgb: '',
        hsl: '',
        hwb: '',
        cmyk: '',
        lch: '',
        name: ''
    };

    @query('tool-color-picker') private colorPicker!: ColorPicker;

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

            .name-format-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                min-height: 22px;
            }

            .approximate-badge {
                position: absolute;
                right: 48px;
                font-size: 10px;
                background: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                margin-left: 6px;
                padding: 2px 4px;
                border-radius: 2px;
                text-transform: uppercase;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Convert colors between different formats: HEX, RGB, HSL, HWB, CMYK, LCH, and named colors. Edit any format directly or use the color picker.</p>
                <hr />
                                
                <div class="color-picker-container flex flex-col items-center">
                    <tool-color-picker
                        class="w-full"
                        .value="${this.colorValue}"
                        @change="${this.handleColorChange}"
                    ></tool-color-picker>
                    <p class="mt-1 mb-0 text-xs opacity-75 select-none">Pick your color here</p>
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
                    ${this.renderFormatRow('cmyk', 'CMYK')}
                    ${this.renderFormatRow('lch', 'LCH')}
                    ${this.renderNameRow()}
                </div>
            </div>
        `;
    }

    private renderFormatRow(format: keyof typeof this.formats, label: string) {
        if (format === 'name') return html``; // Name has a special renderer
        
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
                        @focus="${() => this.handleFormatFocus(format)}"
                        @blur="${() => this.handleFormatBlur(format)}"
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

    private renderNameRow() {
        const format = 'name';
        const isCopied = this.copiedFormat === format;
        const colorName = this.formats.name;
        const hasName = !!colorName;
        
        return html`
            <div class="format-group">
                <div class="format-row">
                    <div class="format-label">NAME</div>
                    ${hasName 
                        ? html`
                            <div class="font-mono flex-1 flex items-center">
                                <input 
                                    type="text" 
                                    class="format-input !bg-transparent w-full" 
                                    .value="${colorName}"
                                    @focus="${() => this.handleFormatFocus(format)}"
                                    @blur="${() => this.handleFormatBlur(format)}"
                                    @input="${(e: InputEvent) => this.handleFormatInput(e, format)}"
                                />
                                ${!this.exactName ? html`<span class="approximate-badge">approx</span>` : ''}
                            </div>
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
                        `
                        : html`<span class="flex-1 opacity-50 italic">No color name available</span>`
                    }
                </div>
            </div>
        `;
    }

    private handleFormatFocus(format: keyof typeof this.formats) {
        this.editingFormat = format;
        this.originalValues[format] = this.formats[format];
    }

    private handleFormatBlur(format: keyof typeof this.formats) {
        if (this.editingFormat === format) {
            this.editingFormat = null;
        }
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
        
        // Special case for name format
        if (format === 'name') {
            this.handleNameInput(value);
            return;
        }
        
        const validationResult = this.validateColor(value, format);
        if (validationResult.isValid) {
            this.errors = { ...this.errors, [format]: '' };
            
            // Only update other formats when the input is valid
            if (format === 'hsl') {
                // Special handling for HSL to preserve the exact values
                this.updateOtherFormatsFromHsl(value);
            } else if (format === 'lch') {
                // Special handling for LCH
                this.updateOtherFormatsFromLch(value);
            } else {
                this.colorValue = validationResult.color as string;
                this.updateOtherFormats(this.colorValue, format);
            }
            
            // Update the color picker value to match
            this.updateColorPicker();
        } else {
            this.errors = { ...this.errors, [format]: validationResult.error as string };
        }
    }

    private handleNameInput(value: string) {
        try {
            const parsedColor = colord(value);
            
            if (parsedColor.isValid()) {
                this.colorValue = parsedColor.toHex();
                this.updateAllFormats(this.colorValue);
                this.updateColorPicker();
                this.errors = { ...this.errors, name: '' };
                this.exactName = true;
            } else {
                this.errors = { ...this.errors, name: 'Invalid color name' };
            }
        } catch (error) {
            this.errors = { ...this.errors, name: 'Invalid color name' };
        }
    }

    private updateColorPicker() {
        if (this.colorPicker) {
            // Update the color picker's value property directly
            this.colorPicker.value = this.colorValue;
            
            // Force the color picker to update its internal state
            this.colorPicker.requestUpdate();
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
                    
                case 'cmyk':
                    if (!value.startsWith('device-cmyk')) {
                        return {
                            isValid: false,
                            error: 'Invalid CMYK format. Use device-cmyk(c% m% y% k%) or device-cmyk(c% m% y% k% / a)'
                        };
                    }
                    break;
                    
                case 'lch':
                    if (!value.startsWith('lch')) {
                        return {
                            isValid: false,
                            error: 'Invalid LCH format. Use lch(l% c h) or lch(l% c h / a)'
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
            hwb: '',
            cmyk: '',
            lch: '',
            name: ''
        };
    }

    private updateAllFormats(color: string) {
        try {
            const parsedColor = colord(color);
            
            if (!parsedColor.isValid()) {
                throw new Error('Invalid color');
            }
            
            const exactName = parsedColor.toName();
            
            if (exactName) {
                this.formats = {
                    hex: parsedColor.toHex(),
                    rgb: parsedColor.toRgbString(),
                    hsl: parsedColor.toHslString(),
                    hwb: parsedColor.toHwbString(),
                    cmyk: parsedColor.toCmykString(),
                    lch: parsedColor.toLchString(),
                    name: exactName
                };
                this.exactName = true;
            } else {
                const closestName = parsedColor.toName({ closest: true });
                
                this.formats = {
                    hex: parsedColor.toHex(),
                    rgb: parsedColor.toRgbString(),
                    hsl: parsedColor.toHslString(),
                    hwb: parsedColor.toHwbString(),
                    cmyk: parsedColor.toCmykString(),
                    lch: parsedColor.toLchString(),
                    name: closestName || ''
                };
                this.exactName = false;
            }
            
        } catch (error) {
            console.error('Failed to update color formats:', error);
        }
    }

    private updateOtherFormats(color: string, currentFormat: keyof typeof this.formats) {
        try {
            const parsedColor = colord(color);
            
            if (!parsedColor.isValid()) {
                throw new Error('Invalid color');
            }
            
            const exactName = parsedColor.toName();
            let colorName = '';
            
            if (exactName) {
                colorName = exactName;
                this.exactName = true;
            } else {
                colorName = parsedColor.toName({ closest: true }) || '';
                this.exactName = false;
            }
            
            // Update all formats except the one being edited
            const updatedFormats = { ...this.formats };
            
            if (currentFormat !== 'hex') updatedFormats.hex = parsedColor.toHex();
            if (currentFormat !== 'rgb') updatedFormats.rgb = parsedColor.toRgbString();
            if (currentFormat !== 'hsl') updatedFormats.hsl = parsedColor.toHslString();
            if (currentFormat !== 'hwb') updatedFormats.hwb = parsedColor.toHwbString();
            if (currentFormat !== 'cmyk') updatedFormats.cmyk = parsedColor.toCmykString();
            if (currentFormat !== 'lch') updatedFormats.lch = parsedColor.toLchString();
            
            updatedFormats.name = colorName;
            
            this.formats = updatedFormats;
        } catch (error) {
            console.error('Failed to update other color formats:', error);
        }
    }

    private updateOtherFormatsFromHsl(hslValue: string) {
        try {
            // Parse the HSL values manually to prevent precision issues
            const hslRegex = /hsla?\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)/i;
            const matches = hslValue.match(hslRegex);
            
            if (!matches) {
                throw new Error('Invalid HSL format');
            }
            
            const h = parseInt(matches[1], 10);
            const s = parseFloat(matches[2]);
            const l = parseFloat(matches[3]);
            const a = matches[4] ? parseFloat(matches[4]) : 1;
            
            const parsedColor = colord({ h, s, l, a });
            
            const exactName = parsedColor.toName();
            let colorName = '';
            
            if (exactName) {
                colorName = exactName;
                this.exactName = true;
            } else {
                colorName = parsedColor.toName({ closest: true }) || '';
                this.exactName = false;
            }
            
            // Update all formats except HSL
            this.formats = {
                ...this.formats,
                hex: parsedColor.toHex(),
                rgb: parsedColor.toRgbString(),
                hwb: parsedColor.toHwbString(),
                cmyk: parsedColor.toCmykString(),
                lch: parsedColor.toLchString(),
                name: colorName
            };
            
            this.colorValue = parsedColor.toHex();
            
        } catch (error) {
            console.error('Failed to update from HSL:', error);
        }
    }

    private updateOtherFormatsFromLch(lchValue: string) {
        try {
            const lchRegex = /lch\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?\s*\)/i;
            const matches = lchValue.match(lchRegex);
            
            if (!matches) {
                throw new Error('Invalid LCH format');
            }
            
            const parsedColor = colord(lchValue);
            
            if (!parsedColor.isValid()) {
                throw new Error('Invalid LCH color');
            }
            
            const exactName = parsedColor.toName();
            let colorName = '';
            
            if (exactName) {
                colorName = exactName;
                this.exactName = true;
            } else {
                colorName = parsedColor.toName({ closest: true }) || '';
                this.exactName = false;
            }
            
            // Update all formats except LCH
            this.formats = {
                ...this.formats,
                hex: parsedColor.toHex(),
                rgb: parsedColor.toRgbString(),
                hsl: parsedColor.toHslString(),
                hwb: parsedColor.toHwbString(),
                cmyk: parsedColor.toCmykString(),
                name: colorName
            };
            
            this.colorValue = parsedColor.toHex();
            
        } catch (error) {
            console.error('Failed to update from LCH:', error);
        }
    }

    private async copyToClipboard(format: keyof typeof this.formats) {
        if (!this.formats[format]) return; // Don't copy empty values
        
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