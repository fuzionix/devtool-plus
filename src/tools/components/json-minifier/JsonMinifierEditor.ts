import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('json-minifier-editor')
export class JsonMinifierEditor extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';

    static styles = css`
        ${BaseTool.styles}

    `;

    protected renderTool() {
        return html`
            <div class="editor-container flex justify-between h-[calc(100vh)]">
                <textarea
                    id="original"
                    class="editor-textarea"
                    placeholder="Enter text to convert"
                    .value=${this.inputText}
                    @input=${this.handleInput}
                    autofocus
                ></textarea>
                <div class="editor-divider"></div>
                <textarea
                    id="converted"
                    class="editor-textarea"
                    placeholder="Converted text will appear here"
                    .value=${this.outputText}
                    readonly
                ></textarea>
            </div>
        `;
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.inputText = target.value;
        this.outputText = this.inputText.toUpperCase();
    }
}