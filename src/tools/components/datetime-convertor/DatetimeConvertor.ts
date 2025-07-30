import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('datetime-convertor')
export class DatetimeConvertor extends BaseTool {
    @state() private input = '';
    @state() private formats = {
        iso: '',
        timestamp: '',
        utc: '',
        local: '',
        relative: '',
        unix: '',
    };
    @state() private errors = {
        iso: '',
        timestamp: '',
        utc: '',
        local: '',
        relative: '',
        unix: '',
    };
    @state() private datetimeFormat = 'iso';
    @state() private copiedFormat: string | null = null;
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private inputFocused = false;
    
    private updateTimer: number | null = null;
    private currentDate: Date | null = null;

    constructor() {
        super();
        this.updateCurrentTime();
        this.startTimer();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopTimer();
    }

    static styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Convert between different datetime formats</p>
                <hr />

                <div class="flex flex-row-reverse justify-between items-baseline text-xs">
                    <div>
                        <tool-inline-menu
                            .options=${[
                                { label: 'ISO 8601', value: 'iso' },
                                { label: 'Timestamp (ms)', value: 'timestamp' },
                                { label: 'UNIX (s)', value: 'unix' },
                                { label: 'UTC', value: 'utc' },
                                { label: 'Local', value: 'local' },
                            ]}
                            .value=${this.datetimeFormat}
                            placeholder="Datetime Format"
                            @change=${this.handleDatetimeFormatChange}
                        ></tool-inline-menu>
                    </div>
                </div>

                <!-- Input Field -->
                <div class="relative flex items-center mt-1">
                    <textarea
                        id="input"
                        class="input-expandable"
                        placeholder="Enter datetime"
                        rows="1"
                        .value=${this.input}
                        @input=${this.handleInput}
                        @focus=${this.handleFocus}
                        @blur=${this.handleBlur}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Now">
                            <button class="btn-icon" @click=${this.setNow}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </button>
                        </tool-tooltip>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                
                <!-- Format outputs -->
                <div>
                    ${this.renderFormatRow('iso', 'ISO')}
                    ${this.renderFormatRow('timestamp', 'MS')}
                    ${this.renderFormatRow('unix', 'UNIX')}
                    ${this.renderFormatRow('utc', 'UTC')}
                    ${this.renderFormatRow('local', 'Local')}
                    ${this.renderFormatRow('relative', 'Relative')}
                </div>
            </div>
        `;
    }

    private startTimer() {
        if (!this.updateTimer) {
            this.updateTimer = window.setInterval(() => {
                if (!this.inputFocused) {
                    this.updateCurrentTime();
                }
            }, 1000);
        }
    }

    private stopTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    private updateCurrentTime() {
        this.currentDate = new Date();
        this.updateFormats(this.currentDate);
        this.input = this.formatDateBySelection(this.currentDate);
    }

    private setNow() {
        this.updateCurrentTime();
    }

    private formatDateBySelection(date: Date): string {
        switch (this.datetimeFormat) {
            case 'iso':
                return date.toISOString();
            case 'timestamp':
                return date.getTime().toString();
            case 'unix':
                return Math.floor(date.getTime() / 1000).toString();
            case 'utc':
                return date.toUTCString();
            case 'local':
                return date.toLocaleString();
            default:
                return date.toISOString();
        }
    }

    private updateFormats(date: Date) {
        try {
            this.formats = {
                iso: date.toISOString(),
                timestamp: date.getTime().toString(),
                unix: Math.floor(date.getTime() / 1000).toString(),
                utc: date.toUTCString(),
                local: date.toLocaleString(),
                relative: this.getRelativeTimeString(date),
            };
            this.clearErrors();
        } catch (error) {
            this.alert = {
                type: 'error',
                message: 'Invalid date format'
            };
        }
    }

    private getRelativeTimeString(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 0) {
            return 'in the future';
        }
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    }

    private clearErrors() {
        this.errors = {
            iso: '',
            timestamp: '',
            utc: '',
            local: '',
            relative: '',
            unix: '',
        };
        this.alert = null;
    }

    private parseInput(input: string): Date | null {
        let date: Date | null = null;
        
        // Try parsing as ISO string
        try {
            date = new Date(input);
            if (!isNaN(date.getTime())) {
                return date;
            }
        } catch (e) {}
        
        // Try parsing as timestamp (milliseconds)
        try {
            const timestamp = Number(input);
            if (!isNaN(timestamp)) {
                date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        } catch (e) {}
        
        // Try parsing as UNIX timestamp (seconds)
        try {
            const unixTimestamp = Number(input) * 1000;
            if (!isNaN(unixTimestamp)) {
                date = new Date(unixTimestamp);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        } catch (e) {}
        
        return null;
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        
        const parsedDate = this.parseInput(this.input);
        if (parsedDate) {
            this.currentDate = parsedDate;
            this.updateFormats(parsedDate);
        } else {
            this.alert = {
                type: 'error',
                message: 'Invalid date format'
            };
        }
    }

    private handleFocus(): void {
        this.inputFocused = true;
    }

    private handleBlur(): void {
        this.inputFocused = false;
    }

    private handleDatetimeFormatChange(event: CustomEvent): void {
        this.datetimeFormat = event.detail.value;
        if (this.currentDate) {
            this.input = this.formatDateBySelection(this.currentDate);
        }
        this.requestUpdate();
    }

    private renderFormatRow(format: keyof typeof this.formats, label: string) {
        const isCopied = this.copiedFormat === format;
        const hasError = !!this.errors[format];
        
        return html`
            <div class="mb-2 ${hasError ? 'has-error' : ''}">
                <div class="flex items-center gap-2">
                    <div class="w-16 uppercase">${label}</div>
                    <input 
                        type="text" 
                        class="font-mono flex-1 !bg-transparent ${hasError ? 'border-[var(--vscode-editorError-foreground)]' : ''}" 
                        .value="${this.formats[format]}"
                        readonly
                    />
                    <button 
                        class="flex items-center justify-center bg-transparent border-none cursor-pointer opacity-75 hover:opacity-100" 
                        @click="${() => this.copyToClipboard(format)}"
                        title="Copy to clipboard"
                    >
                        ${isCopied 
                            ? html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check" > <path d="M18 6 7 17l-5-5"></path> <path d="m22 10-7.5 7.5L13 16"></path> </svg>` 
                            : html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" > <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path> </svg>`
                        }
                    </button>
                </div>
                ${hasError ? html`<tool-alert type="error" message="${this.errors[format]}"></tool-alert>` : ''}
            </div>
        `;
    }

    private async copyToClipboard(format: keyof typeof this.formats) {
        if (!this.formats[format]) return; // Don't copy empty values
        
        try {
            await navigator.clipboard.writeText(this.formats[format]);
            this.copiedFormat = format;
            setTimeout(() => {
                this.copiedFormat = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    }

    private clearAll(): void {
        this.input = '';
        this.alert = null;
        this.updateCurrentTime();
        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = `28px`;
        }
        this.requestUpdate();
    }
}