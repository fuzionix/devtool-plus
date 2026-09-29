import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

interface ColorResult {
    rgba: string;
    hex: string;
    alpha: number;
    rgb: [number, number, number];
}

@customElement('blend-unmixer')
export class BlendUnmixer extends BaseTool {
    @state() private bg1 = '#323232';
    @state() private mix1 = '#3D3559';
    @state() private bg2 = '#1e1e1e';
    @state() private mix2 = '#2D2549';
    // @state() private bg1 = '#ff7b00';
    // @state() private mix1 = '#adbd00';
    // @state() private bg2 = '#1e1e1e';
    // @state() private mix2 = '#3c8e0f';
    @state() private useSecondPair = false;
    @state() private results: ColorResult[] = [];
    @state() private message = '';
    @state() private showCopiedMessage = '';

    private styles = css`
        ${BaseTool.styles}
        
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
        }

        .color-input-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
        }
        
        .input-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--vscode-foreground);
            opacity: 0.8;
        }
        
        .color-field {
            min-width: 0;
        }

        .color-field-title {
            margin: 0 0 6px;
            font-size: 11px;
            opacity: 0.9;
            user-select: none;
        }

        .color-field-picker {
            width: 100%;
            height: 28px;
        }

        .color-field-value {
            margin: 6px 0 0;
            font-size: 11px;
            opacity: 0.7;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        
        .results-container {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid var(--vscode-panel-border);
        }
        
        .result-item {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 8px;
            padding: 8px;
            border-radius: 2px;
            background-color: var(--vscode-list-hoverBackground);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .result-item:hover {
            background-color: var(--vscode-list-activeSelectionBackground);
        }
        
        .result-preview {
            width: 40px;
            height: 40px;
            border-radius: 2px;
            border: 1px solid var(--vscode-panel-border);
            background-image: 
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%);
            background-size: 8px 8px;
            background-position: 0 0, 0 4px, 4px -4px, -4px 0;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
        }
        
        .result-preview::after {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--preview-color);
        }
        
        .result-info {
            flex: 1;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
        }
        
        .result-rgba {
            color: var(--vscode-foreground);
            display: flex;
            justify-content: space-between;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .result-hex {
            color: var(--vscode-foreground);
            opacity: 0.7;
            font-size: 11px;
            margin-top: 2px;
        }
        
        .message {
            padding: 8px;
            border-radius: 2px;
            font-size: 12px;
            margin-bottom: 12px;
        }
        
        .message.success {
            background-color: rgba(76, 175, 80, 0.15);
            color: #76c776;
        }
        
        .message.warning {
            background-color: rgba(255, 193, 7, 0.15);
            color: #ffb84d;
        }
        
        .message.error {
            background-color: rgba(244, 67, 54, 0.15);
            color: #f48771;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 12px 0;
        }
        
        .checkbox-label {
            font-size: 13px;
            cursor: pointer;
            user-select: none;
        }
        
        .button-group {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        
        .btn {
            flex: 1;
            padding: 6px 12px;
            border: 1px solid var(--vscode-button-border, transparent);
            border-radius: 2px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .btn:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn-secondary:hover:not(:disabled) {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
    `;

    connectedCallback() {
        super.connectedCallback();
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">
                    Calculate the semi-transparent foreground color that produces a given blended color on a background.
                    Supports one or two color pair combinations.
                </p>
                <hr />

                <!-- Color Pair 1 -->
                <div class="input-group">
                    <label class="input-label">Color Pair 1</label>
                    <div class="color-input-grid">
                        ${this.renderColorInput('Background Color', this.bg1, 'bg1')}
                        ${this.renderColorInput('Mixed Color', this.mix1, 'mix1')}
                    </div>
                </div>

                <!-- Use Second Pair Checkbox -->
                <div class="checkbox-group">
                    <input 
                        type="checkbox" 
                        id="useSecondPair"
                        .checked="${this.useSecondPair}"
                        @change="${(e: Event) => this.useSecondPair = (e.target as HTMLInputElement).checked}"
                    />
                    <label for="useSecondPair" class="checkbox-label">Use second color pair (for validation)</label>
                </div>

                <!-- Color Pair 2 (Optional) -->
                ${this.useSecondPair ? html`
                    <div class="input-group">
                        <label class="input-label">Color Pair 2 (Validation)</label>
                        <div class="color-input-grid">
                            ${this.renderColorInput('Background Color', this.bg2, 'bg2')}
                            ${this.renderColorInput('Mixed Color', this.mix2, 'mix2')}
                        </div>
                    </div>
                ` : ''}

                <!-- Calculate Button -->
                <div class="button-group">
                    <button class="btn" @click="${this.calculate}">
                        Calculate Unmix
                    </button>
                </div>

                <!-- Results -->
                ${this.results.length > 0 || this.message ? html`
                    <div class="results-container">
                        ${this.message ? html`
                            <div class="message ${this.getMessageClass()}">
                                ${this.message}
                            </div>
                        ` : ''}

                        ${this.results.length > 0 ? html`
                            <div>
                                <label class="input-label" style="margin-bottom: 8px; display: block;">
                                    Results (${this.results.length})
                                </label>
                                ${this.results.map((result, index) => this.renderResultItem(result, index))}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private renderResultItem(result: ColorResult, index: number) {
        return html`
            <div 
                class="result-item"
                @click="${() => this.copyResult(result)}"
                title="Click to copy RGBA value"
            >
                <div 
                    class="result-preview"
                    style="--preview-color: ${result.rgba}"
                ></div>
                <div class="result-info">
                    <div class="result-rgba">
                        <span>${result.rgba}</span>
                        ${this.showCopiedMessage === `${index}` ? html`
                            <span style="color: var(--vscode-testing-messageTooManyTestsForeground, #4ec9b0);">Copied!</span>
                        ` : ''}
                    </div>
                    <div class="result-hex">${result.hex}</div>
                </div>
            </div>
        `;
    }

    private renderColorInput(
        title: string,
        value: string,
        key: 'bg1' | 'mix1' | 'bg2' | 'mix2'
    ) {
        return html`
            <div class="color-field">
                <p class="color-field-title">${title}</p>
                <tool-color-picker
                    class="color-field-picker"
                    .value="${value}"
                    .format="${'hex' as const}"
                    @change="${(e: CustomEvent) => this.handleColorChange(e, key)}"
                ></tool-color-picker>
                <p class="color-field-value">${this.normalizeHex(value) || value.toUpperCase()}</p>
            </div>
        `;
    }

    private handleColorChange(e: CustomEvent, key: 'bg1' | 'mix1' | 'bg2' | 'mix2') {
        const value = e.detail.value as string;
        this[key] = value;
    }

    private getMessageClass(): string {
        if (this.message.includes('✔️') || this.message.includes('Found')) {
            return 'success';
        }
        if (this.message.includes('❌') || this.message.includes('No')) {
            return 'error';
        }
        return 'warning';
    }

    private calculate() {
        try {
            this.results = [];
            this.message = '';

            const bg1Hex = this.normalizeHex(this.bg1);
            const mix1Hex = this.normalizeHex(this.mix1);

            if (!bg1Hex || !mix1Hex) {
                this.message = '❌ Invalid color format. Please use valid hex colors.';
                return;
            }

            let bg2Hex = null;
            let mix2Hex = null;

            if (this.useSecondPair) {
                bg2Hex = this.normalizeHex(this.bg2);
                mix2Hex = this.normalizeHex(this.mix2);

                if (!bg2Hex || !mix2Hex) {
                    this.message = '❌ Invalid color format in second pair. Please use valid hex colors.';
                    return;
                }
            }

            const bg1 = this.hexToRgb(bg1Hex);
            const mix1 = this.hexToRgb(mix1Hex);
            const bg2 = bg2Hex ? this.hexToRgb(bg2Hex) : null;
            const mix2 = mix2Hex ? this.hexToRgb(mix2Hex) : null;

            // First try rounded alpha values
            const possibleAlphas = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
            let results: ColorResult[] = [];

            for (const alpha of possibleAlphas) {
                const fg1 = this.findForegroundColor(bg1, mix1, alpha);
                if (fg1) {
                    if (bg2 && mix2) {
                        if (!this.colorsMatch(fg1, bg2, mix2, alpha)) {
                            continue;
                        }
                    }
                    results.push({
                        rgba: `rgba(${fg1[0]}, ${fg1[1]}, ${fg1[2]}, ${alpha})`,
                        hex: this.rgbaToHex(fg1[0], fg1[1], fg1[2], alpha),
                        alpha,
                        rgb: fg1
                    });
                }
            }

            if (results.length > 0) {
                this.message = '✔️ Found rounded transparency colors:';
                this.results = results.sort((a, b) => a.alpha - b.alpha);
            } else {
                this.message = '❌ No rounded transparency values found. Trying all possible colors...';
                
                // Try all possible RGB values
                results = [];
                for (let r = 0; r <= 255; r++) {
                    for (let g = 0; g <= 255; g++) {
                        for (let b = 0; b <= 255; b++) {
                            try {
                                const denom1 = r - bg1[0];
                                if (denom1 === 0) continue;

                                const alpha1 = (mix1[0] - bg1[0]) / denom1;
                                if (!(0 < alpha1 && alpha1 < 1)) continue;

                                if (!this.colorsMatch([r, g, b], bg1, mix1, alpha1)) {
                                    continue;
                                }

                                if (bg2 && mix2) {
                                    if (!this.colorsMatch([r, g, b], bg2, mix2, alpha1)) {
                                        continue;
                                    }
                                }

                                results.push({
                                    rgba: `rgba(${r}, ${g}, ${b}, ${alpha1.toFixed(3)})`,
                                    hex: this.rgbaToHex(r, g, b, alpha1),
                                    alpha: alpha1,
                                    rgb: [r, g, b]
                                });
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                }

                if (results.length > 0) {
                    this.message = `✔️ Found ${results.length} valid colors (non-rounded alpha):`;
                    results.sort((a, b) => a.alpha - b.alpha);
                    this.results = results.slice(0, 10); // Limit to first 10 results
                    if (results.length > 10) {
                        this.message += ` (showing first 10 of ${results.length})`;
                    }
                } else {
                    this.message = '🚫 No solution found. Make sure the colors are consistent.';
                }
            }
        } catch (error) {
            this.message = `❌ Error: ${(error as Error).message}`;
            this.results = [];
        }
    }

    private findForegroundColor(
        bg: [number, number, number],
        mix: [number, number, number],
        alpha: number
    ): [number, number, number] | null {
        const fg: number[] = [];

        for (let i = 0; i < 3; i++) {
            const cb = bg[i];
            const cm = mix[i];

            if (alpha === 0) {
                fg.push(cb);
            } else {
                const cf = (cm - (1 - alpha) * cb) / alpha;
                
                // Check if value is within valid range and close to integer
                if (!(0 <= cf && cf <= 255)) {
                    return null;
                }
                
                if (Math.abs(Math.round(cf) - cf) > 1e-6) {
                    return null;
                }

                fg.push(Math.round(cf));
            }
        }

        return [fg[0], fg[1], fg[2]] as [number, number, number];
    }

    private colorsMatch(
        fg: [number, number, number],
        bg: [number, number, number],
        mix: [number, number, number],
        alpha: number
    ): boolean {
        for (let i = 0; i < 3; i++) {
            const blended = Math.round(alpha * fg[i] + (1 - alpha) * bg[i]);
            if (blended !== mix[i]) {
                return false;
            }
        }
        return true;
    }

    private normalizeHex(hex: string): string {
        hex = hex.trim().toUpperCase();
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        
        // Validate hex format
        if (!/^[0-9A-F]{6}$/.test(hex)) {
            return '';
        }
        
        return '#' + hex;
    }

    private hexToRgb(hex: string): [number, number, number] {
        const cleanHex = hex.replace('#', '');
        return [
            parseInt(cleanHex.substring(0, 2), 16),
            parseInt(cleanHex.substring(2, 4), 16),
            parseInt(cleanHex.substring(4, 6), 16)
        ];
    }

    private rgbaToHex(r: number, g: number, b: number, a: number): string {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${(Math.round(a * 255)).toString(16).padStart(2, '0')}`;
        return hex.toUpperCase();
    }

    private async copyResult(result: ColorResult) {
        try {
            await navigator.clipboard.writeText(result.rgba);
            const index = this.results.indexOf(result);
            this.showCopiedMessage = `${index}`;
            setTimeout(() => {
                this.showCopiedMessage = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }
}
