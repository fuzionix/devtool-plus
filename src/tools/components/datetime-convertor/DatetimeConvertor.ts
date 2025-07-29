import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('datetime-convertor')
export class DatetimeConvertor extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Your description here</p>
                <hr />
                
            </div>
        `;
    }
}