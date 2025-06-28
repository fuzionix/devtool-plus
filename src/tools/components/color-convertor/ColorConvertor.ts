import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import '../../common/color-picker/ColorPicker';

@customElement('color-convertor')
export class ColorConvertor extends BaseTool {
    @state() private colorValue = '#3399ff';

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <style>
            .color-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .color-picker-container {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Convert colors between different formats: HEX, RGB, HSL, and HWB. Edit any format directly or use the color picker.</p>
                <hr />
                <div class="color-container">
                    <div class="color-picker-container">
                        <tool-color-picker
                            class="w-full"
                            .value="${this.colorValue}"
                            @change="${this.handleColorChange}"
                        ></tool-color-picker>
                    </div>
                </div>
                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
            </div>
        `;
    }

    private handleColorChange(e: CustomEvent) {
        const value = e.detail.value;
        this.colorValue = value;
        // this.updateAllFormats(value);
    }
}