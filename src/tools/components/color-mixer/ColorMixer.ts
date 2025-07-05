import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';

extend([mixPlugin]);

@customElement('color-mixer')
export class ColorMixer extends BaseTool {
    @state() private colors = ['#0f2efa', '#0fdbfa'];
    @state() private resultColor = '#0f85fa';
    @state() private isResultHovered = false;
    @state() private showCopiedMessage = false;

    static styles = css`
        ${BaseTool.styles}
    `;

    connectedCallback() {
        super.connectedCallback();
        this.updateResultColor();
    }

    protected renderTool() {
        return html`
            <style>
            .color-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;
            }
            
            .color-item {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .result-container {
                position: relative;
                height: 60px;
                border-radius: 2px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .result-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
                background-size: 10px 10px;
                background-position: 0 0, 0 5px, 5px -5px, -5px 0;
                opacity: 0.2;
                z-index: 0;
            }
            
            .result-color {
                position: absolute;
                inset: 0;
                z-index: 1;
            }
            
            .result-value {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(0, 0, 0, 0.6);
                color: white;
                font-family: monospace;
                font-size: 14px;
                z-index: 2;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .result-value.visible {
                opacity: 1;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Mix multiple colors together to create a new color. Add up to 5 colors or remove colors as needed.</p>
                <hr />

                <!-- Result Color -->
                <div 
                    class="result-container" 
                    @mouseenter="${() => this.isResultHovered = true}" 
                    @mouseleave="${() => this.isResultHovered = false}"
                    @click="${this.copyResultColor}"
                >
                    <div class="result-color" style="background-color: ${this.resultColor}"></div>
                    <div class="result-value ${this.isResultHovered ? 'visible' : ''}">
                        ${this.showCopiedMessage ? 'Copied!' : this.resultColor}
                    </div>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center my-4 opacity-75 rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Color List -->
                <div class="color-list">
                    ${this.colors.map((color, index) => this.renderColorItem(color, index))}
                </div>

                <!-- Button Container -->
                <div class="flex button-container w-full mt-2 gap-2">
                    <button 
                        class="btn flex-1 justify-center items-center border border-dashed border-[var(--vscode-panel-border)] hover:border-[var(--vscode-focusBorder)] hover:bg-[var(--vscode-list-hoverBackground)] transition-all duration-200 rounded p-1"
                        @click="${this.removeColor}"
                        ?disabled="${this.colors.length <= 1}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                    </button>
                    <button 
                        class="btn flex-1 justify-center items-center border border-dashed border-[var(--vscode-panel-border)] hover:border-[var(--vscode-focusBorder)] hover:bg-[var(--vscode-list-hoverBackground)] transition-all duration-200 rounded p-1"
                        @click="${this.addColor}"
                        ?disabled="${this.colors.length >= 5}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                </div>
            </div>
        `;
    }

    private renderColorItem(color: string, index: number) {
        return html`
            <div class="color-item">
                <tool-color-picker
                    class="flex-1 h-7"
                    .value="${color}"
                    .format="${'hex' as const}"
                    @change="${(e: CustomEvent) => this.handleColorChange(e, index)}"
                ></tool-color-picker>
            </div>
        `;
    }

    private handleColorChange(e: CustomEvent, index: number) {
        const value = e.detail.value;
        this.colors = [
            ...this.colors.slice(0, index),
            value,
            ...this.colors.slice(index + 1)
        ];
        this.updateResultColor();
    }

    private addColor() {
        if (this.colors.length < 5) {
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            this.colors = [...this.colors, randomColor];
            this.updateResultColor();
        }
    }

    private removeColor() {
        if (this.colors.length > 1) {
            this.colors = this.colors.slice(0, -1);
            this.updateResultColor();
        }
    }

    private updateResultColor() {
        if (this.colors.length === 1) {
            this.resultColor = this.colors[0];
            return;
        }

        const hslColors = this.colors.map(color => colord(color).toHsl());
                
        // For hue (H), we need special handling since it's a circular value (0-360)
        let cosSum = 0;
        let sinSum = 0;
        
        hslColors.forEach(color => {
            const weight = color.s;
            if (weight > 0) {
                const hueRadians = (color.h * Math.PI) / 180;
                cosSum += Math.cos(hueRadians) * weight;
                sinSum += Math.sin(hueRadians) * weight;
            }
        });
        
        // Calculate average hue considering it's circular nature
        let avgH = 0;
        const totalWeight = hslColors.reduce((sum, c) => sum + c.s, 0);
        
        if (totalWeight > 0) {
            avgH = Math.atan2(sinSum / totalWeight, cosSum / totalWeight) * (180 / Math.PI);
            if (avgH < 0) {
                avgH += 360;
            }
        } else {
            avgH = hslColors.reduce((sum, c) => sum + c.h, 0) / hslColors.length;
        }
        
        const avgS = hslColors.reduce((sum, c) => sum + c.s, 0) / hslColors.length;
        const avgL = hslColors.reduce((sum, c) => sum + c.l, 0) / hslColors.length;
        
        this.resultColor = colord({h: avgH, s: avgS, l: avgL}).toHex();
    }

    private async copyResultColor() {
        try {
            await navigator.clipboard.writeText(this.resultColor);
            this.showCopiedMessage = true;
            setTimeout(() => {
                this.showCopiedMessage = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
}