import { BaseTool } from '../../base/BaseTool';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';

export class UUIDGenerator extends BaseTool {
    private selectedVersion: 'v1' | 'v4' = 'v4';

    protected getToolStyles(): string {
        return `
        `;
    }

    protected setupTemplate(): void {
        this.toolContainer.innerHTML = `
            <div class="tool-inner-container">
                <p class="opacity-75">A UUID (Universally Unique Identifier) is a 128-bit unique identifier that uses timestamp or randomness to ensure global uniqueness across space and time.</p>
                <hr />

                <!-- Version Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="UUID Version">
                        <button 
                            role="radio"
                            aria-checked="false"
                            class="radio-group-button flex justify-center items-center"
                            data-version="v1"
                        >
                            <h4>UUID v1</h4>
                            <span class="text-xs opacity-75 ml-1">(Time-based)</span>
                        </button>
                        <button 
                            role="radio"
                            aria-checked="true"
                            class="radio-group-button flex justify-center items-center"
                            data-version="v4"
                        >
                            <h4>UUID v4</h4>
                            <span class="text-xs opacity-75 ml-1">(Random)</span>
                        </button>
                    </div>
                </div>

                <div class="flex justify-between mt-2 gap-2">
                    <button id="generate" class="btn-primary gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        <h4>Generate</h4>
                    </button>
                </div>
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6 font-mono"
                        placeholder="Output will appear here"
                        rows="3"
                        readonly
                    ></textarea>
                    <div class="absolute right-0 top-2.5 pr-0.5 flex justify-items-center">
                        <button id="copy" class="btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupRadioGroup();
    }

    private setupRadioGroup(): void {
        const radioButtons = this.shadow.querySelectorAll('[role="radio"]');
        radioButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const version = target.dataset.version as 'v1' | 'v4';
                radioButtons.forEach(btn => {
                    btn.setAttribute('aria-checked', 'false');
                });
                target.setAttribute('aria-checked', 'true');
                this.selectedVersion = version;
            });
        });
    }

    protected setupEventListeners(): void {
        const generateBtn = this.shadow.querySelector('#generate') as HTMLButtonElement;
        const outputElement = this.shadow.querySelector('#output') as HTMLTextAreaElement;
        const copyBtn = this.shadow.querySelector('#copy') as HTMLButtonElement;

        if (generateBtn && outputElement) {
            generateBtn.addEventListener('click', () => {
                this.generateUUID(outputElement);
            });
        }

        if (copyBtn && outputElement) {
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(outputElement, copyBtn);
            });
        }
    }

    private generateUUID(outputElement: HTMLTextAreaElement): void {
        const uuid = this.selectedVersion === 'v4' ? uuidv4() : uuidv1();
        outputElement.value = uuid;
    }

    private async copyToClipboard(outputElement: HTMLTextAreaElement, copyBtn: HTMLButtonElement): Promise<void> {
        const text = outputElement.value;
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);

            if (copyBtn) {
                const originalIcon = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                `;
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                `;

                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
}

customElements.define('uuid-generator', UUIDGenerator);