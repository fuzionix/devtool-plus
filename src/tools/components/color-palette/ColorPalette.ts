import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('color-palette')
export class ColorPalette extends BaseTool {
    @state() private baseColor = '#0f85fa';
    @state() private colorSteps = 12;
    @state() private copiedColor: string | null = null;

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <style>
            .color-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 4px;
                margin-top: 8px;
            }

            .color-section {
                display: flex;
                flex-direction: column;
                margin-bottom: 16px;
            }

            .color-swatch {
                position: relative;
                height: 40px;
                border-radius: 2px;
                cursor: pointer;
                transition: transform 0.1s ease;
                overflow: hidden;
            }

            .color-swatch:hover {
                transform: scale(1);
            }

            .color-swatch::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%);
                background-size: 10px 10px;
                background-position: 0 0, 0 5px, 5px -5px, -5px 0;
                z-index: -1;
            }

            .color-label {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                font-size: 12px;
                background-color: rgba(0, 0, 0, 0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .color-label p {
                margin: 0;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-size: 14px;
                color: white;
                text-align: center;
            }

            .color-swatch:hover .color-label {
                opacity: 1;
            }
            </style>

            <div class="tool-inner-container">
                <p class="opacity-75">Generate a harmonious color palette from a base color.</p>
                <hr />

                <div>
                    <div class="flex justify-between items-center text-xs">
                        Color Steps
                    </div>
                    <tool-slider
                        min="4"
                        max="16"
                        step="1"
                        .value=${this.colorSteps}
                        @change=${this.handleStepsChange}
                    ></tool-slider>
                </div>

                <div class="color-picker-container flex flex-col items-center">
                    <tool-color-picker
                        class="w-full"
                        .value="${this.baseColor}"
                        @change="${this.handleColorChange}"
                    ></tool-color-picker>
                    <p class="mt-1 mb-0 text-xs opacity-75 select-none">Pick your color here</p>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center my-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Tints (Adding White) -->
                <div class="flex flex-col mb-4">
                    <div class="text-xs">Tints</div>
                    <div class="color-grid">
                        ${this.generateTints().map((color) => this.renderColorSwatch(color))}
                    </div>
                </div>

                <!-- Shades (Adding Black) -->
                <div class="flex flex-col mb-4">
                    <div class="text-xs">Shades</div>
                    <div class="color-grid">
                        ${this.generateShades().map((color) => this.renderColorSwatch(color))}
                    </div>
                </div>
            </div>
        `;
    }

    private renderColorSwatch(color: string) {
        const textColor = this.getContrastColor(color);
        const showCopied = this.copiedColor === color;

        return html`
            <div 
                class="color-swatch" 
                style="background-color: ${color}; color: ${textColor}"
                @click="${() => this.copyToClipboard(color)}"
            >
                <div class="color-label">
                    <p>${showCopied ? 'Copied!' : color}</p>
                </div>
            </div>
        `;
    }

    private handleColorChange(e: CustomEvent) {
        this.baseColor = e.detail.value;
    }

    private handleStepsChange(e: CustomEvent) {
        this.colorSteps = e.detail.value;
    }

    private async copyToClipboard(color: string) {
        try {
            await navigator.clipboard.writeText(color);
            this.copiedColor = color;
            setTimeout(() => {
                this.copiedColor = null;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy color:', err);
        }
    }

    private getContrastColor(hexColor: string): string {
        hexColor = hexColor.replace('#', '');
        
        // Parse HEX color
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        // Calculate perceived brightness (YIQ formula)
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        
        // Return black or white based on contrast
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    private hexToRgb(hex: string): {r: number, g: number, b: number} {
        hex = hex.replace('#', '');
        
        // Parse HEX color
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return {r, g, b};
    }

    private rgbToHex(r: number, g: number, b: number): string {
        // Ensure values are in valid range
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));
        
        return '#' + 
            r.toString(16).padStart(2, '0') + 
            g.toString(16).padStart(2, '0') + 
            b.toString(16).padStart(2, '0');
    }

    private generateTints(): string[] {
        const {r, g, b} = this.hexToRgb(this.baseColor);
        const tints: string[] = [this.baseColor];
        
        for (let i = 1; i < this.colorSteps; i++) {
            const amount = i / (this.colorSteps + 1);
            const newR = r + (255 - r) * amount;
            const newG = g + (255 - g) * amount;
            const newB = b + (255 - b) * amount;
            
            tints.push(this.rgbToHex(newR, newG, newB));
        }
        
        return tints;
    }

    private generateShades(): string[] {
        const {r, g, b} = this.hexToRgb(this.baseColor);
        const shades: string[] = [this.baseColor];
        
        for (let i = 1; i < this.colorSteps; i++) {
            const amount = i / (this.colorSteps + 1);
            const newR = r * (1 - amount);
            const newG = g * (1 - amount);
            const newB = b * (1 - amount);
            
            shades.push(this.rgbToHex(newR, newG, newB));
        }
        
        return shades;
    }
}