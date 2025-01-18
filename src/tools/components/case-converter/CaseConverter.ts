import { BaseTool } from '../../base/BaseTool';

export class CaseConverter extends BaseTool {
    protected getToolStyles(): string {
        return `
        `;
    }

    protected setupTemplate(): void {
        this.toolContainer.innerHTML = `
            <div class="tool-container">
                <p>Tool Case</p>
            </div>
        `;
    }

    protected setupEventListeners(): void {
    }
}

customElements.define('case-converter', CaseConverter);