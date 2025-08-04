import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

@customElement('unix-path-convertor')
export class UnixPathConvertor extends BaseTool {
    @state() private unixPath = '';
    @state() private unixPathalert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private windowsPath = '';
    @state() private windowsPathalert: { type: 'error' | 'warning'; message: string } | null = null;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">UNIX paths use forward slashes (/) to separate directories, while Windows paths use backslashes (\\). This tool converts between the two formats.</p>
                <hr />

                <!-- UNIX Path Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="unix-input"
                        class="input-expandable"
                        placeholder="Enter UNIX path"
                        rows="1"
                        .value=${this.unixPath}
                        @input=${this.handleUnixPathInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button 
                                id="copy" 
                                class="btn-icon"
                                @click=${this.copyToClipboard}
                            >
                                ${renderCopyButton(this.isCopied)}
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.unixPathalert ? html`
                    <tool-alert
                        .type=${this.unixPathalert.type}
                        .message=${this.unixPathalert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-up-icon lucide-arrow-down-up"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
                </div>

                <!-- Windows Path Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="windows-input"
                        class="input-expandable"
                        placeholder="Enter Windows path"
                        rows="1"
                        .value=${this.windowsPath}
                        @input=${this.handleWindowsPathInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button 
                                id="copy" 
                                class="btn-icon"
                                @click=${this.copyToClipboard}
                            >
                                ${renderCopyButton(this.isCopied)}
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.windowsPathalert ? html`
                    <tool-alert
                        .type=${this.windowsPathalert.type}
                        .message=${this.windowsPathalert.message}
                    ></tool-alert>
                ` : ''}
            </div>
        `;
    }

    private handleUnixPathInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.unixPath = target.value;
        adjustTextareaHeight(target);
    }

    private handleWindowsPathInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.windowsPath = target.value;
        adjustTextareaHeight(target);
    }

    private async copyToClipboard() {
        if (!this.unixPath && !this.windowsPath) { return; }
        try {
            await navigator.clipboard.writeText(this.unixPath || this.windowsPath);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }

    private clearAll(): void {
        this.unixPath = '';
        this.unixPathalert = null;
        this.windowsPath = '';
        this.windowsPathalert = null;

        const unixPathTextarea = this.querySelector('#unix-input') as HTMLTextAreaElement;
        const windowsPathTextarea = this.querySelector('#windows-input') as HTMLTextAreaElement;

        unixPathTextarea.style.height = `28px`;
        windowsPathTextarea.style.height = `28px`;
        this.requestUpdate();
    }
}