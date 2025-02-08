import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('json-minifier')
export class JsonMinifier extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">JSON minification reduces the size of JSON data by removing unnecessary whitespace and characters.</p>
                <hr />
            </div>
        `;
    }
}