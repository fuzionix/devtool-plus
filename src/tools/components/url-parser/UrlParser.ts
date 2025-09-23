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
    @state() private selectedPanel: 'params' | 'detail' = 'params';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    
    @state() private urlComponents = {
        protocol: '',
        domain: '',
        port: '',
        pathname: '',
        query: '',
        hash: ''
    };

    @query('#input') inputArea!: HTMLTextAreaElement;

    constructor() {
        super();
        this.parseUrl();
    }

    private styles = css`
        ${BaseTool.styles}

        .detail-item {
            display: flex;
            align-items: center;
            height: 32px;
            margin-bottom: 8px;
            position: relative;
            background-color: var(--vscode-panel-background);
            box-shadow: inset 0 0 0 1px var(--vscode-panel-border);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .detail-value {
            flex: 1;
            padding: 6px 10px;
            word-break: break-all;
        }

        .detail-separator {
            width: 1px;
            height: 60%;
            background-color: var(--vscode-panel-border);
        }
        
        .detail-label {
            width: 70px;
            padding: 6px 10px;
            color: var(--vscode-descriptionForeground);
            font-size: 0.75rem;
            text-align: right;
        }
        
        .empty-value {
            opacity: 0.5;
            font-style: italic;
        }
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">URLs are used to access resources on the web. They consist of several components, including the protocol, domain, path, and query parameters.</p>
                <hr />

                <!-- Radio Group -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="URL Encoding Mode">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedPanel === 'params' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handlePanelChange('params')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ampersand-icon lucide-ampersand"><path d="M17.5 12c0 4.4-3.6 8-8 8A4.5 4.5 0 0 1 5 15.5c0-6 8-4 8-8.5a3 3 0 1 0-6 0c0 3 2.5 8.5 12 13"/><path d="M16 12h3"/></svg>
                            </span>
                            <h4>Params</h4>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedPanel === 'detail' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handlePanelChange('detail')}
                        >
                            <span class="text-xs opacity-75 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-search-icon lucide-text-search"><path d="M21 5H3"/><path d="M10 12H3"/><path d="M10 19H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>
                            </span>
                            <h4>Detail</h4>
                        </button>
                    </div>
                </div>

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
                ${this.selectedPanel === 'params' ? html`
                    <div class="flex items-center mb-2 gap-2">
                        <span class="flex-[1] !bg-transparent">Keys</span>
                        <span class="text-gray-500">=</span>
                        <span class="flex-[3] !bg-transparent">Values</span>
                    </div>
                    <div>
                        ${this.params.map((param, index) => this.renderParamRow(param, index))}
                    </div>
                ` : html`
                    <div class="mt-2">
                        ${this.renderDetailItem('Protocol', this.urlComponents.protocol)}
                        ${this.renderDetailItem('Domain', this.urlComponents.domain)}
                        ${this.renderDetailItem('Port', this.urlComponents.port)}
                        ${this.renderDetailItem('Path', this.urlComponents.pathname)}
                        ${this.renderDetailItem('Query', this.urlComponents.query)}
                        ${this.renderDetailItem('Fragment', this.urlComponents.hash)}
                    </div>
                `}
            </div>
        `;
    }

    private renderDetailItem(label: string, value: string) {
        return html`
            <div class="detail-item">
                <div class="detail-label">${label}</div>
                <div class="detail-separator"></div>
                <div class="detail-value ${!value ? 'empty-value' : ''}">
                    ${value || 'None'}
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

    private handlePanelChange(mode: 'params' | 'detail') {
        this.selectedPanel = mode;
    }

    private parseUrl(): void {
        if (!this.input.trim()) {
            this.params = [{key: '', value: ''}];
            this.resetUrlComponents();
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

            this.urlComponents = {
                protocol: url.protocol,
                domain: url.hostname,
                port: url.port,
                pathname: url.pathname,
                query: url.search,
                hash: url.hash
            };

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
            this.resetUrlComponents();
            this.alert = {
                type: 'error',
                message: 'Invalid URL format'
            };
        }
    }

    private resetUrlComponents(): void {
        this.urlComponents = {
            protocol: '',
            domain: '',
            port: '',
            pathname: '',
            query: '',
            hash: ''
        };
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
            this.parseUrl();
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
        this.resetUrlComponents();
        this.alert = null;
        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = '28px';
        }
        this.requestUpdate();
    }
}