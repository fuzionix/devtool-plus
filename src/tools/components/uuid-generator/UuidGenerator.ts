import { BaseTool } from '../../base/BaseTool';

export class UUIDGenerator extends BaseTool {
    protected getToolStyles(): string {
        return `
        `;
    }

    protected setupTemplate(): void {
        this.toolContainer.innerHTML = `
            <div class="tool-container">
                <p>Tool UUID</p>
            </div>
        `;
    }

    protected setupEventListeners(): void {
    }
}

customElements.define('uuid-generator', UUIDGenerator);