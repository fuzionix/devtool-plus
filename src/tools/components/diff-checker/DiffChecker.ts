import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('diff-checker')
export class DiffChecker extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Compare two texts to see the differences. Left pane is the original text, right pane is the modified text.</p>
                <hr />
                
            </div>
        `;
    }
}