import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    renderCopyButton
} from '../../../utils/util';
import { CaseType } from './CaseConverterTypes';
import '../../common/tooltip/Tooltip';

@customElement('case-converter-editor')
export class CaseConverterEditor extends BaseTool {
    @state() private inputText = '';
    @state() private outputText = '';
    @state() private selectedCase: CaseType | '' = 'upper';
    @state() private isCopied = false;

    @query('#original') private originalTextarea!: HTMLTextAreaElement;
    @query('#modified') private modifiedTextarea!: HTMLTextAreaElement;

    static styles = css`
        ${BaseTool.styles}

    `;

    constructor() {
        super();
        this.addEventListener('updated', ((e: CustomEvent) => {
            if (e.detail.value) {
                const caseType = e.detail.value;
                this.selectedCase = caseType;
                this.updateOutput();
            }
        }) as EventListener);
    }

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
                    id="modified"
                    class="editor-textarea"
                    placeholder="Converted text will appear here"
                    .value=${this.outputText}
                    readonly
                ></textarea>
                <div class="absolute flex flex-col justify-items-center right-[50%] bottom-[50%] p-0.5 border-[var(--vscode-panel-border)] border-[1px] rounded-sm translate-x-[50%] translate-y-[50%] bg-[var(--vscode-panel-background)]">
                    <tool-tooltip text="Clear">
                        <button class="btn-icon" id="clear" @click=${this.clearAll}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </tool-tooltip>
                    <tool-tooltip text="Copy to clipboard">
                        <button class="btn-icon" id="copy" @click=${this.copyToClipboard}>
                            ${renderCopyButton(this.isCopied)}
                        </button>
                    </tool-tooltip>
                </div>
            </div>
        `;
    }

    firstUpdated() {
        this.originalTextarea.addEventListener('scroll', () => this.syncScroll('input'));
        this.modifiedTextarea.addEventListener('scroll', () => this.syncScroll('output'));
    }

    private syncScroll(source: 'input' | 'output') {
        if (!this.originalTextarea || !this.modifiedTextarea) return;
        const sourceElement = source === 'input' ? this.originalTextarea : this.modifiedTextarea;
        const targetElement = source === 'input' ? this.modifiedTextarea : this.originalTextarea;
        targetElement.scrollTop = sourceElement.scrollTop;
        targetElement.scrollLeft = sourceElement.scrollLeft;
    }

    private convertCase(text: string, caseType: CaseType): string {
        if (!text) return '';

        switch (caseType) {
            case 'upper':
                return text.toUpperCase();
            case 'lower':
                return text.toLowerCase();
            case 'title':
                return text
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            case 'sentence':
                let result = text;
                result = result.charAt(0).toUpperCase() + result.slice(1);

                // Capitalize first character after sentence endings, newlines, and ellipsis
                result = result.replace(
                    /([.!?]\s+|\n\s*|\.\.\.\s+)([a-z])/g,
                    (_, separator, letter) => separator + letter.toUpperCase()
                );

                // Handle abbreviations (e.g., Mr., Dr., etc.)
                const abbreviations = /(\b)(mr\.|mrs\.|ms\.|dr\.|prof\.|sr\.|jr\.|vs\.|etc\.)\s+([a-z])/gi;
                result = result.replace(
                    abbreviations,
                    (_, start, abbr, letter) => start + abbr + ' ' + letter.toLowerCase()
                );

                return result;
            default:
                return text;
        }
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.inputText = target.value;
        this.updateOutput();
    }

    private updateOutput() {
        if (this.selectedCase && this.inputText) {
            this.outputText = this.convertCase(this.inputText, this.selectedCase);
        } else {
            this.outputText = this.inputText;
        }
    }

    private async copyToClipboard() {
        if (!this.outputText) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.outputText);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            this.isCopied = false;
        }
    }

    private clearAll() {
        this.inputText = '';
        this.outputText = '';
    }
}