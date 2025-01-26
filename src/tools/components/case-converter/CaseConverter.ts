import { BaseTool } from '../../base/BaseTool';

export class CaseConverter extends BaseTool {
    protected getToolStyles(): string {
        return `
        `;
    }

    protected setupTemplate(): void {
        this.toolContainer.innerHTML = `
            <div class="tool-inner-container">
                <p class="opacity-75">Case conversion transforms text between different capitalizations to match various naming conventions and formatting requirements.</p>
                <hr />
            </div>
        `;
    }

    protected setupEventListeners(): void {
    }
}

customElements.define('case-converter', CaseConverter);