import { LitElement, html, css } from 'lit';

export abstract class BaseTool extends LitElement {
    createRenderRoot() {
        return this;
    }

    static styles = css`
    `;

    render() {
        return html`
            <div class="tool-container">
                ${this.renderTool()}
            </div>
        `;
    }

    protected abstract renderTool(): unknown;
}