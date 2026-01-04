import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { ColorPicker } from '../../common/color-picker/ColorPicker';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import hwbPlugin from 'colord/plugins/hwb';
import cmykPlugin from 'colord/plugins/cmyk';
import lchPlugin from 'colord/plugins/lch';
import xyzPlugin from 'colord/plugins/xyz';

extend([namesPlugin, hwbPlugin, cmykPlugin, lchPlugin, xyzPlugin]);

@customElement('color-convertor')
export class ColorConvertor extends BaseTool {
    // Store XYZ as the internal representation
    @state() private colorXyz = { x: 0, y: 0, z: 0 };
    @state() private formats = {
        hex: '#0f85fa',
        rgb: 'rgb(15, 133, 250)',
        hsl: 'hsl(210, 96%, 52%)',
        hwb: 'hwb(210 6% 2%)',
        cmyk: 'device-cmyk(94% 47% 0% 2%)',
        lch: 'lch(54.78% 67.95 273.92)',
        xyz: 'color(xyz 0.26 0.24 0.94)',
        name: ''
    };
    @state() private isLight = true;
    @state() private exactName = false;
    @state() private errors = {
        hex: '',
        rgb: '',
        hsl: '',
        hwb: '',
        cmyk: '',
        lch: '',
        xyz: '',
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
        xyz: '',
        name: ''
    };

    @query('tool-color-picker') private colorPicker!: ColorPicker;

    private styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        const initialColor = colord('#0f85fa');
        this.colorXyz = initialColor.toXyz();
        this.updateAllFormats();
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Convert colors between different formats: HEX, RGB, HSL, HWB, CMYK, XYZ, LCH, and named colors. Edit any format directly or use the color picker.</p>
                <hr />

                <div class="relative flex flex-col items-center">
                    <div class="absolute flex items-center top-[6px] left-[6px] z-10 pointer-events-none" style="color: ${this.isLight ? '#000' : '#fff'}">
                        ${this.isLight 
                            ? html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`
                            : html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`
                        }
                    </div>
                    <tool-color-picker
                        class="w-full h-7"
                        .value="${this.getHexFromXyz()}"
                        @change="${this.handleColorChange}"
                    ></tool-color-picker>
                    <p class="mt-1 mb-0 text-xs opacity-75 select-none">Pick your color here</p>
                </div>
                
                <!-- Arrow Divider -->
                <div class="flex justify-center my-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                
                <!-- Format outputs -->
                <div>
                    ${this.renderFormatRow('hex', 'HEX')}
                    ${this.renderFormatRow('rgb', 'RGB')}
                    ${this.renderFormatRow('hsl', 'HSL')}
                    ${this.renderFormatRow('hwb', 'HWB')}
                    ${this.renderFormatRow('cmyk', 'CMYK')}
                    ${this.renderFormatRow('lch', 'LCH')}
                    ${this.renderFormatRow('xyz', 'XYZ')}
                    ${this.renderNameRow()}
                </div>
            </div>
        `;
    }

    private renderFormatRow(format: keyof typeof this.formats, label: string) {
        if (format === 'name') return html``;
        
        const isCopied = this.copiedFormat === format;
        const hasError = !!this.errors[format];
        
        return html`
            <div class="mb-2 ${hasError ? 'has-error' : ''}">
                <div class="flex items-center gap-2">
                    <div class="w-10 uppercase">${label}</div>
                    <input 
                        type="text" 
                        class="font-mono flex-1 !bg-transparent ${hasError ? 'border-[var(--vscode-editorError-foreground)]' : ''}" 
                        .value="${this.formats[format]}"
                        @focus="${() => this.handleFormatFocus(format)}"
                        @blur="${() => this.handleFormatBlur(format)}"
                        @input="${(e: InputEvent) => this.handleFormatInput(e, format)}"
                    />
                    <button 
                        class="flex items-center justify-center bg-transparent border-none cursor-pointer opacity-75 hover:opacity-100" 
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
            <div class="mb-2">
                <div class="flex items-center gap-2">
                    <div class="w-10 uppercase">NAME</div>
                    ${hasName 
                        ? html`
                            <div class="font-mono flex-1 flex items-center">
                                <input 
                                    type="text" 
                                    class="!bg-transparent w-full" 
                                    .value="${colorName}"
                                    @focus="${() => this.handleFormatFocus(format)}"
                                    @blur="${() => this.handleFormatBlur(format)}"
                                    @input="${(e: InputEvent) => this.handleFormatInput(e, format)}"
                                />
                                ${!this.exactName ? html`<span class="absolute right-12 text-[10px] bg-[var(--vscode-badge-background)] text-[var(--vscode-badge-foreground)] ml-1.5 px-1 py-0.5 rounded-sm uppercase">approx</span>` : ''}
                            </div>
                            <button 
                                class="flex items-center justify-center bg-transparent border-none cursor-pointer opacity-75 hover:opacity-100" 
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
        const hexValue = e.detail.value;
        const parsedColor = colord(hexValue);
        this.colorXyz = parsedColor.toXyz();
        this.updateAllFormats();
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
            
            const parsedColor = colord(value);
            this.colorXyz = parsedColor.toXyz();
            
            this.updateAllFormats();
            this.updateColorPicker();
        } else {
            this.errors = { ...this.errors, [format]: validationResult.error as string };
        }
    }

    private handleNameInput(value: string) {
        try {
            const parsedColor = colord(value);
            
            if (parsedColor.isValid()) {
                this.colorXyz = parsedColor.toXyz();
                this.updateAllFormats();
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

    private getHexFromXyz(): string {
        try {
            const parsedColor = colord(this.colorXyz);
            return parsedColor.toHex();
        } catch (error) {
            return '#000000';
        }
    }

    private formatXyzString(xyz: { x: number; y: number; z: number }): string {
        return `color(xyz ${xyz.x.toFixed(2)} ${xyz.y.toFixed(2)} ${xyz.z.toFixed(2)})`;
    }

    private parseXyzString(value: string): { x: number; y: number; z: number } | null {
        const xyzRegex = /color\(\s*xyz\s+([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)\s*\)/i;
        const matches = value.match(xyzRegex);
        
        if (!matches) {
            return null;
        }
        
        return {
            x: parseFloat(matches[1]),
            y: parseFloat(matches[2]),
            z: parseFloat(matches[3])
        };
    }

    private updateColorPicker() {
        if (this.colorPicker) {
            this.colorPicker.value = this.getHexFromXyz();
            this.colorPicker.requestUpdate();
        }
    }

    private validateColor(value: string, format: keyof typeof this.formats): { isValid: boolean; color?: string; error?: string } {
        try {
            let parsedColor: any;
            
            // Special handling for XYZ format
            if (format === 'xyz') {
                const xyzValues = this.parseXyzString(value);
                if (!xyzValues) {
                    return {
                        isValid: false,
                        error: 'Invalid XYZ format. Use color(xyz x y z) e.g., color(xyz 0.26 0.24 0.94)'
                    };
                }
                parsedColor = colord(xyzValues);
            } else {
                parsedColor = colord(value);
            }
            
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

                case 'xyz':
                    break;
            }
            
            return { isValid: true };
            
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
            xyz: '',
            name: ''
        };
    }

    private updateAllFormats() {
        try {
            const parsedColor = colord(this.colorXyz);
            
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
                    xyz: this.formatXyzString(this.colorXyz),
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
                    xyz: this.formatXyzString(this.colorXyz),
                    name: closestName || ''
                };
                this.exactName = false;
            }
            
            this.isLight = parsedColor.isLight();
        } catch (error) {
            console.error('Failed to update color formats:', error);
        }
    }

    private async copyToClipboard(format: keyof typeof this.formats) {
        if (!this.formats[format]) return;
        
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