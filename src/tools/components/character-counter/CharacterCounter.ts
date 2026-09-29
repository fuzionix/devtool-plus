import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('character-counter')
export class CharacterCounter extends BaseTool {
    @state() private input = 'This a text message';
    @state() private count: number = 0;
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    private styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        this.updateCount();
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Character Counter allows you to count your string characters length.</p>
                <hr />

                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <div class="flex w-full">
                        <input 
                            type="text" 
                            class="flex-grow"
                            placeholder="Enter value..."
                            .value=${this.input}
                            @input=${this.handleInput}
                        />
                    </div>
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

                <!-- Conversion Results -->
                <div class="mt-2">
                    ${this.renderConversionRow(this.count)}
                </div>
            </div>
        `;
    }

    private renderConversionRow(counted: number) {        
        return html`
            <div class="mb-2">
                <div class="flex items-center gap-6">
                    <!-- Bytes Column -->
                    <div class="w-full flex items-center">
                        <div class="w-8 text-xs">Count</div>
                        <input 
                            type="text" 
                            class="font-mono flex-1 !bg-transparent text-sm" 
                            .value="${counted}"
                            readonly
                        />
                    </div>
                </div>
            </div>
        `;
    }

    private handleInput(e: InputEvent) {
        const input = e.target as HTMLInputElement;
        this.input = input.value;
        
        if (this.input && !/^[0-9]*\.?[0-9]*$/.test(this.input)) {
            this.alert = {
                type: 'error',
                message: 'Please enter a valid number'
            };
            return;
        } else {
            this.alert = null;
        }
        
        this.updateCount();
    }

    private clearAll() {
        this.input = '';
        this.alert = null;
        this.updateCount();
    }

    private updateCount() {
        if (!this.input || isNaN(Number(this.input))) {
            this.count = 0;
            return;
        }
        
        this.count = this.countChars(this.input);
    }

    private countChars(input:string): number {
        const counted: number = input.length;
        return counted;
    }
}