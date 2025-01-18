import { BaseTool } from '../../base/BaseTool';

export class Base64Encoder extends BaseTool {
    protected getToolStyles(): string {
        return `
        `;
    }

    protected setupTemplate(): void {
        this.toolContainer.innerHTML = `
            <div class="tool-container">
                <p>Tool Base</p>
            </div>
        `;
    }

    protected setupEventListeners(): void {
    }
}

customElements.define('base64-encoder', Base64Encoder);