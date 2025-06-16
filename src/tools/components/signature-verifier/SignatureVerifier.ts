import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('signature-verifier')
export class SignatureVerifier extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Digital signature verification allows you to confirm the authenticity and integrity of data. This tool supports RSA and ECDSA signatures.</p>
                <hr />
            </div>
        `;
    }
}