import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('url-encoder')
export class UrlEncoder extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">URL encoding converts special characters into a transmitted format over the Internet, replacing unsafe characters with a '%' followed by two hexadecimal digits.</p>
                <hr />
                <div class="flex justify-between items-center">
                    
                </div>
            </div>
        `;
    }
}