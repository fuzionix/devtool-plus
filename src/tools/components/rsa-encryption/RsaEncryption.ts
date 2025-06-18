import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('rsa-encryption')
export class RsaEncryption extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">RSA cryptography for secure data exchange. Encrypt messages with public keys, and decrypt with private keys.</p>
                <hr />
            </div>
        `;
    }
}