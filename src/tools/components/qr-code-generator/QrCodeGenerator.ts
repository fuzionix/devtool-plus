import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
} from '../../../utils/util';

@customElement('qr-code-generator')
export class QrCodeGenerator extends BaseTool {
    @state() private inputText = '';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Your description here</p>
                <hr />
                <!-- Preview section -->
                <div class="frame flex justify-center items-center min-h-12 mb-2">
                    
                </div>

                <!-- Options section -->
                <tool-radio-group 
                    selected="link" 
                    ariaLabel="View Options" 
                    @change=${this.handleOptionChange}
                >
                    <tool-radio-item value="link" tooltip="Link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </tool-radio-item>
                    <tool-radio-item value="text" tooltip="Text">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-letter-text-icon lucide-letter-text"><path d="M15 12h6"/><path d="M15 6h6"/><path d="m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13"/><path d="M3 18h18"/><path d="M3.92 11h6.16"/></svg>
                    </tool-radio-item>
                    <tool-radio-item value="image" tooltip="Image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </tool-radio-item>
                    <tool-radio-item value="video" tooltip="Video">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-icon lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                    </tool-radio-item>
                </tool-radio-group>

                <!-- Link Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter link here"
                        rows="1"
                        .value=${this.inputText}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                        <div class="inline-flex items-center justify-center py-1.5 min-w-0 w-6 h-6 px-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        </div>
                    </div>
                </div>
                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Image or Video Input Field Example -->
                <div class="relative flex items-center mt-2">
                    <tool-file-dropzone 
                        accept=".json,application/json" 
                        placeholder="Drop your JSON file here"
                        @files-changed=${this.handleFilesChanged}
                    ></tool-file-dropzone>
                </div>
            </div>
        `;
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.inputText = target.value;
        adjustTextareaHeight(target);
    }

    private handleOptionChange(value: string): void {
        // Handle the change of options here
        console.log(`Selected option: ${value}`);
    }

    private handleFilesChanged(e: CustomEvent) {
        const files = e.detail.filesArray;
        
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const jsonContent = JSON.parse(reader.result as string);
                    console.log('Valid JSON loaded:', jsonContent);
                } catch (error) {
                    console.error('Invalid JSON file');
                }
            };
            reader.readAsText(files[0]);
        }
    }

    private clearAll(): void {
        this.inputText = '';
        this.requestUpdate();
    }
}