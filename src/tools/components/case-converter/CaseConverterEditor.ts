import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('case-converter-editor')
export class CaseConverterEditor extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="editor-container">
                <!-- Editor-specific content here -->
            </div>
        `;
    }
}