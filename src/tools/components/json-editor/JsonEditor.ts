import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('json-editor')
export class JsonEditor extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">JSON editing tool for modifying JSON data.</p>
                <hr />
            </div>
        `;
    }

    // private handleChange(propertyName: keyof JsonEditorState, value: string) {
    //     this.editorState = {
    //         ...this.editorState,
    //         [propertyName]: value
    //     };
        
    //     (window as any).vscode.postMessage({
    //         type: 'update',
    //         toolId: 'json-editor',
    //         value: this.editorState
    //     });
    // }
}