import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

@customElement('slug-generator')
export class SlugGenerator extends BaseTool {
    @state() private input = 'Talk is cheap. Show me the slug!';
    @state() private output = '';
    @state() private separator: 'hyphen' | 'underscore' = 'hyphen';
    @state() private preserveLanguage = true;
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    @query('#output') outputTextarea!: HTMLTextAreaElement;

    private styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    connectedCallback() {
        super.connectedCallback();
        this.processInput();
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Slug is a URL-friendly string, typically used to identify a resource in a way that is easy to read and type.</p>
                <hr />

                <!-- Input Label Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs">
                    <p class="mb-0">Input Text</p>
                    <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'Hyphen (-)', value: 'hyphen' },
                                { label: 'Underscore (_)', value: 'underscore' }
                            ]}
                            .value=${this.separator}
                            placeholder="Select Separator"
                            @change=${this.handleSeparatorChange}
                        ></tool-inline-menu>
                    </div>
                </div>
                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter text to generate slug"
                        rows="1"
                        .value=${this.input}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Field -->
                <div class="relative flex items-center">
                    <textarea
                        id="output"
                        class="input-expandable mt-2 pr-6"
                        placeholder="Output will appear here"
                        rows="3"
                        readonly
                        .value=${this.output}
                    ></textarea>
                    <div class="absolute right-0 top-2.5 pr-0.5 flex justify-items-center">
                        <button 
                            id="copy" 
                            class="btn-icon"
                            @click=${this.copyToClipboard}
                        >
                            ${renderCopyButton(this.isCopied)}
                        </button>
                    </div>
                </div>

                <!-- Mode Toggle -->
                <div class="flex items-center mt-2">
                    <tool-switch
                        .checked=${this.preserveLanguage}
                        rightLabel="Preserve non-Latin characters"
                        @change=${this.handleLanguageToggle}
                    ></tool-switch>
                </div>
            </div>
        `;
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        this.processInput();
    }

    private handleSeparatorChange(event: CustomEvent): void {
        this.separator = event.detail.value;
        this.processInput();
    }

    private handleLanguageToggle(event: CustomEvent): void {
        this.preserveLanguage = event.detail.checked;
        this.processInput();
    }

    private async copyToClipboard() {
        if (!this.output) return;
        try {
            await navigator.clipboard.writeText(this.output);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }

    private slugify(text: string, separator: string = '-', preserveLanguage: boolean = false): string {
        if (!text) return '';

        let result = text.trim();
        result = result.replace(/\s+/g, separator);

        if (preserveLanguage) {
            result = result
                .replace(/[.,\/#!$%\^&\*;:{}=`~()'"]/g, '')                     // Remove punctuation
                .replace(/\s+/g, separator)                                     // Replace any remaining whitespace with separator
                .replace(/[^\p{L}\p{N}]+/gu, separator)                         // Replace non-alphanumeric with separator, using Unicode properties
                .toLowerCase()
                .replace(new RegExp(`${separator}{2,}`, 'g'), separator)        // Replace multiple separators with a single one
                .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');   // Remove leading/trailing separator
        } else {
            result = result
                .normalize('NFD')                   // Split accented characters into base characters and diacritical marks
                .replace(/[\u0300-\u036f]/g, '')    // Remove diacritical marks
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')           // Remove non-word chars (except spaces and hyphens)
                .replace(/[\s_-]+/g, separator)     // Replace spaces, underscores, and hyphens with the separator
                .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separator
        }

        return result;
    }

    private async processInput(): Promise<void> {
        this.alert = null;
        if (!this.input) {
            this.output = '';
            return;
        }

        try {
            const separatorChar = this.separator === 'hyphen' ? '-' : '_';
            this.output = this.slugify(this.input, separatorChar, this.preserveLanguage);
        } catch (error) {
            console.error('Error generating slug:', error);
            this.alert = {
                type: 'error',
                message: 'Failed to generate slug. Please try again.'
            };
            this.output = '';
        }

        if (this.outputTextarea) {
            await this.updateComplete;
            adjustTextareaHeight(this.outputTextarea);
        }
    }

    private clearAll(): void {
        this.input = '';
        this.output = '';
        this.alert = null;

        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        const outputTextarea = this.querySelector('#output') as HTMLTextAreaElement;

        inputTextarea.style.height = `28px`;
        outputTextarea.style.height = `auto`;
        this.requestUpdate();
    }
}