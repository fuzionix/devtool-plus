import { BaseTool } from '../../base/BaseTool';

export class Base64Encoder extends BaseTool {
    protected getToolStyles(): string {
        return `
        `;
    }

    protected setupTemplate(): void {
        this.toolContainer.innerHTML = `
            <div class="tool-container">
                <p class="opacity-75">Encode text to Base64 or decode Base64 to text</p>
                <hr />
                <input id="input" type="text" placeholder="Enter text to encode" />
                <button id="encode" class="btn-primary mt-2">Encode</button>
                <textarea id="output" class="mt-2" placeholder="Output will appear here"></textarea>
            </div>
        `;
    }

    protected setupEventListeners(): void {
    }
}

customElements.define('base64-encoder', Base64Encoder);