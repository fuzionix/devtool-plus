import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';

extend([a11yPlugin]);

@customElement('contrast-checker')
export class ContrastChecker extends BaseTool {
    @state() private backgroundColor = '#000000';
    @state() private foregroundColor = '#ffffff';
    @state() private sampleText = 'Lorem ipsum dolor sit amet.';
    @state() private fontSize = 14;

    private styles = css`
        ${BaseTool.styles}

        .preview-container {
            padding: 24px;
            border-radius: 2px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60px;
            word-break: break-word;
            text-align: center;
            transition: all 0.2s ease;
        }
        
        .result-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px 8px;
            border-radius: 2px;
            font-size: 12px;
        }
        
        .pass {
            background-color: #82d681;
            color: #000;
        }
        
        .fail {
            background-color: #d68680;
            color: #000;
        }
        
        .warning {
            background-color: #d6d480;
            color: #000;
        }
        
        .result-container {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px 12px;
            background-color: var(--vscode-editor-background);
            border-radius: 2px;
            border: 1px solid var(--vscode-panel-border);
        }
        
        .result-value {
            font-size: 20px;
            font-weight: 600;
        }
        
        .guideline-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 8px;
            margin-top: 8px;
        }
        
        .guideline-item {
            display: flex;
            flex-direction: column;
            padding: 8px 12px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 2px;
        }
    `;

    protected renderTool() {
        const contrast = colord(this.foregroundColor).contrast(this.backgroundColor);
        const contrastRounded = Math.round(contrast * 100) / 100;
        
        const isLargeText = this.fontSize >= 18 || (this.fontSize >= 14 && this.isBold());
        const passesAA = isLargeText ? contrast >= 3 : contrast >= 4.5;
        const passesAAA = isLargeText ? contrast >= 4.5 : contrast >= 7;
        
        const bgColor = colord(this.backgroundColor);
        const fgColor = colord(this.foregroundColor);

        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Check color contrast between text and background for accessibility compliance.</p>
                <hr />

                <div class="flex flex-col min-[320px]:flex-row w-full gap-2">
                    <div class="flex-1">
                        <p class="mb-2 text-xs select-none">Background Color</p>
                        <tool-color-picker
                            class="w-full h-7"
                            .value="${this.backgroundColor}"
                            @change="${(e: CustomEvent) => this.handleColorChange(e, 'background')}"
                        ></tool-color-picker>
                        <p class="my-0 text-xs opacity-75">${bgColor.toHex().toUpperCase()}</p>
                    </div>

                    <div class="flex-1">
                        <p class="mb-2 text-xs select-none">Text Color</p>
                        <tool-color-picker
                            class="w-full h-7"
                            .value="${this.foregroundColor}"
                            @change="${(e: CustomEvent) => this.handleColorChange(e, 'foreground')}"
                        ></tool-color-picker>
                        <p class="my-0 text-xs opacity-75">${fgColor.toHex().toUpperCase()}</p>
                    </div>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center my-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Preview Section -->
                <div class="preview-container" style="background-color: ${this.backgroundColor}">
                    <div style="color: ${this.foregroundColor}; font-size: ${this.fontSize}px;">${this.sampleText}</div>
                </div>

                <!-- Contrast Ratio Results -->
                <div class="result-container">
                    <div>
                        <span class="text-xs opacity-75">Contrast Ratio</span>
                        <div class="result-value">${contrastRounded}:1</div>
                    </div>
                    <div class="flex items-center">
                        ${this.renderContrastRating(contrast)}
                    </div>
                </div>

                <!-- WCAG Guidelines -->
                <p class="text-xs mt-4 mb-2">WCAG 2.1 Compliance</p>
                
                <div class="guideline-grid">
                    <!-- AA Level -->
                    <div class="guideline-item">
                        <div class="flex justify-between items-center">
                            <strong class="text-sm">AA</strong>
                            ${passesAA 
                                ? html`<span class="result-badge pass">PASS</span>` 
                                : html`<span class="result-badge fail">FAIL</span>`}
                        </div>
                        <p class="text-xs opacity-75 my-1">
                            Required: ${isLargeText ? '3.0:1' : '4.5:1'}
                        </p>
                    </div>
                    
                    <!-- AAA Level -->
                    <div class="guideline-item">
                        <div class="flex justify-between items-center">
                            <strong class="text-sm">AAA</strong>
                            ${passesAAA 
                                ? html`<span class="result-badge pass">PASS</span>` 
                                : html`<span class="result-badge fail">FAIL</span>`}
                        </div>
                        <p class="text-xs opacity-75 my-1">
                            Required: ${isLargeText ? '4.5:1' : '7.0:1'}
                        </p>
                    </div>
                </div>
                
                <!-- Help Text -->
                <p class="text-[11px] opacity-75 mt-4">
                    <strong>WCAG AA:</strong> Minimum requirement for most websites<br>
                    <strong>WCAG AAA:</strong> Enhanced requirement for optimal accessibility
                </p>
            </div>
        `;
    }

    private handleColorChange(e: CustomEvent, colorType: 'background' | 'foreground') {
        const value = e.detail.value;
        if (colorType === 'background') {
            this.backgroundColor = value;
        } else if (colorType === 'foreground') {
            this.foregroundColor = value;
        }
    }
    
    private isBold(): boolean {
        // For simplicity, just returning false here
        return false;
    }
    
    private renderContrastRating(contrast: number) {
        if (contrast >= 7) {
            return html`
                <div class="flex items-center">
                    <span class="mr-3 result-badge pass">Excellent</span>
                    <span class="text-xs opacity-75">Passes AAA</span>
                </div>
            `;
        } else if (contrast >= 4.5) {
            return html`
                <div class="flex items-center">
                    <span class="mr-3 result-badge pass">Good</span>
                    <span class="text-xs opacity-75">Passes AA & AAA (large text)</span>
                </div>
            `;
        } else if (contrast >= 3) {
            return html`
                <div class="flex items-center">
                    <span class="mr-3 result-badge warning">Fair</span>
                    <span class="text-xs opacity-75">Passes AA (large text only)</span>
                </div>
            `;
        } else {
            return html`
                <div class="flex items-center">
                    <span class="mr-3 result-badge fail">Poor</span>
                    <span class="text-xs opacity-75">Fails all guidelines</span>
                </div>
            `;
        }
    }
}