import { html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

const FORMAT_OPTIONS = [
    { value: 'codepoint', label: 'U+XXXX' },
    { value: 'js', label: '\\uXXXX' },
    { value: 'html', label: '&#xXXXX;' },
    { value: 'css', label: '\\XXXX' },
];

@customElement('unicode-inspector')
export class UnicodeInspector extends BaseTool {
    @state() private selectedMode: 'encode' | 'decode' = 'encode';
    @state() private input = '';
    @state() private output = '';
    @state() private format: string = 'codepoint';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;

    @property({ type: Array }) formatOptions = FORMAT_OPTIONS;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <style>
            .block-label {
                display: inline-flex;
                align-items: center;
                margin-right: 8px;
                margin-bottom: 4px;
                font-size: 10px;
                border-radius: 4px;
                padding: 2px 6px;
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
            }
            
            .color-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 4px;
                display: inline-block;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Unicode is a standard for representing text in different writing systems. It enables consistent encoding, representation, and handling of text.</p>
                <hr />

                <!-- Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="ASCII Conversion Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'encode' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('encode')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-left-right-square"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m10 15-3-3 3-3"/><path d="m14 9 3 3-3 3"/></svg>
                            </span>
                            <h4>Encode</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedMode === 'decode' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleModeChange('decode')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            </span>
                            <h4>Decode</h4>
                        </button>
                    </div>
                </div>
                <!-- Input Field -->
                <div class="flex justify-between items-baseline mb-2 text-xs mt-4">
                    <p class="mb-0 text-xs"></p>
                    <div>
                        <tool-inline-menu
                            .options=${this.formatOptions}
                            .value=${this.format}
                            placeholder="Format"
                            @change=${this.handleFormatChange}
                        ></tool-inline-menu>
                    </div>
                </div>
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter text"
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
                        class="input-expandable mt-2 pr-6 font-mono"
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
            </div>
        `;
    }

    private handleModeChange(mode: 'encode' | 'decode') {
        this.selectedMode = mode;
        this.processInput();
    }

    private handleFormatChange(e: CustomEvent) {
        this.format = e.detail.value;
        this.processInput();
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(target);
        this.processInput();
    }

    private processInput(): void {
        this.alert = null;
        if (!this.input) {
            this.output = '';
            return;
        }

        // TODO

        const outputTextarea = this.querySelector('#output') as HTMLTextAreaElement;
        if (outputTextarea) {
            adjustTextareaHeight(outputTextarea);
        }
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