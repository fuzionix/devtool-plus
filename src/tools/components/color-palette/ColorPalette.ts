import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import namesPlugin from 'colord/plugins/names';

extend([mixPlugin, namesPlugin]);

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
                    linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.1) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.1) 75%);
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

                <!-- Hues (Different Hues, Same Saturation/Lightness) -->
                <div class="flex flex-col mb-4">
                    <div class="text-xs">Hues</div>
                    <div class="color-grid">
                        ${this.generateHues().map((color) => this.renderColorSwatch(color))}
                    </div>
                </div>

                <!-- Transparent (Different Opacity Levels) -->
                <div class="flex flex-col mb-4">
                    <div class="text-xs">Transparent</div>
                    <div class="color-grid">
                        ${this.generateTransparent().map((color) => this.renderColorSwatch(color))}
                    </div>
                </div>

                <!-- Complementary Colors -->
                <div class="flex flex-col mb-4">
                    <div class="text-xs">Complementary Colors</div>
                    <div class="color-grid">
                        ${this.generateComplementaryColors().map((color) => this.renderColorSwatch(color))}
                    </div>
                </div>

                <!-- Triangle Colors -->
                <div class="flex flex-col mb-4">
                    <div class="text-xs">Triangle Colors</div>
                    <div class="color-grid">
                        ${this.generateTriangleColors().map((color) => this.renderColorSwatch(color))}
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
        return colord(hexColor).isLight() ? '#000000' : '#ffffff';
    }

    private generateComplementaryColors(): string[] {
        const base = colord(this.baseColor);
        const baseHsl = base.toHsl();
        
        // Complementary color is opposite on the color wheel (180 degrees apart)
        const complementaryHue = (baseHsl.h + 180) % 360;
        const complementary = colord({ 
            h: complementaryHue, 
            s: baseHsl.s, 
            l: baseHsl.l 
        }).toHex();
        
        return [this.baseColor, complementary];
    }

    private generateTriangleColors(): string[] {
        const base = colord(this.baseColor);
        const baseHsl = base.toHsl();
        
        // Triangle colors are 120 degrees apart on the color wheel
        const color1Hue = (baseHsl.h + 120) % 360;
        const color2Hue = (baseHsl.h + 240) % 360;
        
        const color1 = colord({ 
            h: color1Hue, 
            s: baseHsl.s, 
            l: baseHsl.l 
        }).toHex();
        
        const color2 = colord({ 
            h: color2Hue, 
            s: baseHsl.s, 
            l: baseHsl.l 
        }).toHex();
        
        return [this.baseColor, color1, color2];
    }

    private generateTints(): string[] {
        const base = colord(this.baseColor);
        const tints = [this.baseColor];
        
        for (let i = 1; i < this.colorSteps; i++) {
            const amount = i / (this.colorSteps + 1);
            const tint = base.mix('white', amount).toHex();
            tints.push(tint);
        }
        
        return tints;
    }

    private generateShades(): string[] {
        const base = colord(this.baseColor);
        const shades = [this.baseColor];
        
        for (let i = 1; i < this.colorSteps; i++) {
            const amount = i / (this.colorSteps + 1);
            const shade = base.mix('black', amount).toHex();
            shades.push(shade);
        }
        
        return shades;
    }

    private generateHues(): string[] {
        const base = colord(this.baseColor);
        const baseHsl = base.toHsl();
        const hues: string[] = [];
        
        const colorsPerSide = Math.floor(this.colorSteps / 2);
        const hasExtraColor = this.colorSteps % 2 === 0;
        
        // Generate left side colors (negative hue offsets)
        for (let i = colorsPerSide; i > 0; i--) {
            const hueOffset = (60 / this.colorSteps) * i;
            const newHue = ((baseHsl.h - hueOffset) + 360) % 360;
            
            const color = colord({ h: newHue, s: baseHsl.s, l: baseHsl.l });
            hues.push(color.toHex());
        }
        
        // Add the original color in the middle
        hues.push(this.baseColor);
        
        // Generate right side colors (positive hue offsets)
        for (let i = 1; i < colorsPerSide + (hasExtraColor ? 0 : 1); i++) {
            const hueOffset = (60 / this.colorSteps) * i;
            const newHue = (baseHsl.h + hueOffset) % 360;
            
            const color = colord({ h: newHue, s: baseHsl.s, l: baseHsl.l });
            hues.push(color.toHex());
        }
        
        return hues;
    }

    private generateTransparent(): string[] {
        const base = colord(this.baseColor);
        const transparentColors: string[] = [];
        
        for (let i = 0; i < this.colorSteps; i++) {
            const opacity = 1 - (i / (this.colorSteps + 1));
            const rgba = base.alpha(opacity).toHex();
            transparentColors.push(rgba);
        }
        
        return transparentColors;
    }
}