import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import '../../common/slider/Slider';

@customElement('token-generator')
export class TokenGenerator extends BaseTool {
    @state() private sliderValue = 50;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Produces unique strings of customizable length and character sets for authentication, API keys, or session identifiers, ensuring randomness and unpredictability.</p>
                <hr />
                <div class="flex justify-between items-center">
                    Length
                </div>
                <tool-slider
                    min="1"
                    max="100"
                    step="1"
                    .value=${this.sliderValue}
                    @change=${(e: CustomEvent) => this.sliderValue = e.detail.value}
                ></tool-slider>
            </div>
        `;
    }
}