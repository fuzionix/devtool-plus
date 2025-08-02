import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
} from '../../../utils/util';

@customElement('url-parser')
export class UrlParser extends BaseTool {
    @state() private input = 'https://example.com/?cat=meow';
    @state() private params: Array<{key: string, value: string}> = [{key: '', value: ''}];
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    @query('#input') inputArea!: HTMLTextAreaElement;

    constructor() {
        super();
        this.parseUrl();
    }

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">URL Parser extracts query parameters from a URL.</p>
                <hr />

                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter URL"
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
                <div class="flex justify-center my-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Parameter Items -->
                <div class="flex items-center mb-2 gap-2">
                    <span class="flex-[1] !bg-transparent">Keys</span>
                    <span class="text-gray-500">=</span>
                    <span class="flex-[3] !bg-transparent">Values</span>
                </div>
                <div>
                    ${this.params.map((param, index) => this.renderParamRow(param, index))}
                </div>
            </div>
        `;
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(this.inputArea);
        this.parseUrl();
    }

    private parseUrl(): void {
        if (!this.input.trim()) {
            this.params = [{key: '', value: ''}];
            this.alert = null;
            return;
        }

        try {
            let url: URL;
            try {
                url = new URL(this.input);
            } catch (e) {
                // If URL is invalid without protocol, try adding https://
                url = new URL(`https://${this.input}`);
            }

            const searchParams = url.searchParams;
            const newParams: Array<{key: string, value: string}> = [];
            
            // Extract all parameters from URL
            searchParams.forEach((value, key) => {
                newParams.push({ key, value });
            });
            
            // Ensure there's always at least one empty param for adding new ones
            if (newParams.length === 0 || (newParams[newParams.length - 1].key !== '' || newParams[newParams.length - 1].value !== '')) {
                newParams.push({ key: '', value: '' });
            }
            
            this.params = newParams;
            this.alert = null;
        } catch (error) {
            this.alert = {
                type: 'error',
                message: 'Invalid URL format'
            };
        }
    }

    private renderParamRow(param: {key: string, value: string}, index: number) {
        return html`
            <div class="mb-2">
                <div class="flex items-center gap-2">
                    <input 
                        type="text" 
                        class="font-mono flex-[1] !bg-transparent" 
                        .value=${param.key}
                        @input=${(e: Event) => this.handleParamChange(index, 'key', (e.target as HTMLInputElement).value)}
                        placeholder="key"
                    />
                    <span class="text-gray-500">=</span>
                    <input 
                        type="text" 
                        class="font-mono flex-[3] !bg-transparent" 
                        .value=${param.value}
                        @input=${(e: Event) => this.handleParamChange(index, 'value', (e.target as HTMLInputElement).value)}
                        placeholder="value"
                    />
                    <button 
                        class="flex items-center justify-center bg-transparent border-none cursor-pointer opacity-75 hover:opacity-100" 
                        title="Remove parameter"
                        @click=${() => this.removeParam(index)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
            </div>
        `;
    }

    private handleParamChange(index: number, field: 'key' | 'value', newValue: string): void {
        const newParams = [...this.params];
        newParams[index] = { ...newParams[index], [field]: newValue };
        
        // If editing the last row and it has content, add a new empty row
        if (index === newParams.length - 1 && (newParams[index].key || newParams[index].value)) {
            newParams.push({ key: '', value: '' });
        }
        
        this.params = newParams;
        this.updateUrlFromParams();
        adjustTextareaHeight(this.inputArea);
    }
    
    private removeParam(index: number): void {
        // Don't remove if it's the only param and it's empty
        if (this.params.length === 1 && !this.params[0].key && !this.params[0].value) {
            return;
        }
        
        const newParams = this.params.filter((_, i) => i !== index);
        
        // Ensure there's always at least one parameter row
        if (newParams.length === 0) {
            newParams.push({ key: '', value: '' });
        }
        
        this.params = newParams;
        this.updateUrlFromParams();
    }
    
    private updateUrlFromParams(): void {
        if (!this.input) {
            return;
        }
        
        try {
            let url: URL;
            try {
                url = new URL(this.input);
                url.search = '';
            } catch (e) {
                url = new URL(`https://${this.input}`);
                url.search = '';
            }
            
            // Only include non-empty parameters
            const validParams = this.params.filter(p => p.key.trim() !== '');
            
            // Add all parameters to the URL
            for (const param of validParams) {
                url.searchParams.append(param.key, param.value);
            }
            
            this.input = url.toString();
            this.alert = null;
        } catch (error) {
            this.alert = {
                type: 'error',
                message: 'Could not update URL'
            };
        }
    }

    private clearAll(): void {
        this.input = '';
        this.params = [{key: '', value: ''}];
        this.alert = null;
        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = '28px';
        }
        this.requestUpdate();
    }
}