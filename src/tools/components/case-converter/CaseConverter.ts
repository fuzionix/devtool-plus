import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('case-converter')
export class CaseConverter extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Case conversion transforms text between different capitalizations to match various naming conventions and formatting requirements.</p>
                <hr />
            </div>
        `;
    }
}