import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('password-generator')
export class PasswordGenerator extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Generate strong, secure passwords with customizable options for length and character types.</p>
                <hr />
            </div>
        `;
    }
}