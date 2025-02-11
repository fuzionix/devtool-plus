import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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
    @state() private selectedCase: CaseType | '' = '';
    @state() private isCopied = false;

    static styles = css`
        ${BaseTool.styles}

    `;

    constructor() {
        super();
        this.addEventListener('updated', ((e: CustomEvent) => {
            this.outputText = e.detail.value;
            this.requestUpdate();
        }) as EventListener);
    }

    public updateSelectedCase(newCase: CaseType | '') {
        this.selectedCase = newCase;
        this.outputText = 'Received new case: ' + newCase;
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
                    id="converted"
                    class="editor-textarea"
                    placeholder="Converted text will appear here"
                    .value=${this.outputText}
                    readonly
                ></textarea>
                <div class="absolute flex flex-col justify-items-center right-[50%] bottom-2 p-0.5 border-[var(--vscode-panel-border)] border-[1px] rounded-sm translate-x-[50%] bg-[var(--vscode-panel-background)]">
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

    private handleInput(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        this.inputText = target.value;
        this.outputText = this.inputText.toUpperCase();
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