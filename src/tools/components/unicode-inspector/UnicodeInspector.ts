import { html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';
import { BLOCK_TEXT } from './UnicodeInspectorBlockText';

const FORMAT_OPTIONS = [
    { value: 'codepoint', label: 'U+XXXX' },
    { value: 'js', label: '\\uXXXX' },
    { value: 'html', label: '&#xXXXX;' },
    { value: 'css', label: '\\XXXX' },
];

interface UnicodeBlock {
    start: number;
    end: number;
    name: string;
    color: string;
}

@customElement('unicode-inspector')
export class UnicodeInspector extends BaseTool {
    @state() private selectedMode: 'encode' | 'decode' = 'encode';
    @state() private input = '(✘﹏✘ა)';
    @state() private output = '';
    @state() private format: string = 'codepoint';
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isCopied = false;
    @state() private unicodeBlocks: UnicodeBlock[] = [];
    @state() private usedBlocks: Map<string, UnicodeBlock> = new Map();

    @property({ type: Array }) formatOptions = FORMAT_OPTIONS;

    constructor() {
        super();
        this.initUnicodeBlocks();
        this.processInput();
    }

    private styles = css`
        ${BaseTool.styles}

        .block-label {
            display: inline-flex;
            align-items: center;
            margin-right: 8px;
            margin-bottom: 8px;
            font-size: 10px;
            border-radius: 2px;
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
        
        .code-block {
            font-family: monospace;
            white-space: pre-wrap;
            word-break: break-word;
        }
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
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
                        class="input-expandable font-mono"
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
                <div class="mt-2 mb-2">
                    <div class="relative">
                        <div class="input-expandable code-block min-h-16">${this.renderHighlightedCode()}</div>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                            <button 
                                id="copy" 
                                class="btn-icon"
                                @click=${this.copyToClipboard}
                            >
                                ${renderCopyButton(this.isCopied)}
                            </button>
                        </div>
                    </div>
                    ${this.renderBlockLabels()}
                </div>
            </div>
        `;
    }

    private initUnicodeBlocks() {
        const blocksText = this.parseBlocksText();
        const blocks: UnicodeBlock[] = [];
        const lines = blocksText.split('\n');
        
        for (const line of lines) {
            // Skip comments and empty lines
            if (line.startsWith('#') || line.trim() === '') continue;
            
            // Parse block definition line
            const match = line.match(/^([0-9A-F]+)\.\.([0-9A-F]+);\s+(.+)$/);
            if (match) {
                const start = parseInt(match[1], 16);
                const end = parseInt(match[2], 16);
                const name = match[3].trim();
                
                // Generate a deterministic color for this block based on name
                const hash = name.split('').reduce((acc, char) => {
                    return ((acc << 13) - acc) + char.charCodeAt(0);
                }, 0);
                
                const hue = Math.abs(hash) % 360;
                const color = `hsl(${hue}, 60%, 50%)`;
                
                blocks.push({ start, end, name, color });
            }
        }
        
        this.unicodeBlocks = blocks;
    }

    private parseBlocksText() {
        return BLOCK_TEXT;
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
        this.usedBlocks.clear();
        
        if (!this.input) {
            this.output = '';
            return;
        }

        try {
            if (this.selectedMode === 'encode') {
                this.output = this.encodeText(this.input);
            } else {
                this.output = this.decodeText(this.input);
            }
        } catch (error) {
            this.alert = {
                type: 'error',
                message: `Error: ${error instanceof Error ? error.message : String(error)}`
            };
            this.output = '';
        }
    }

    private encodeText(text: string): string {
        const characters = Array.from(text);
        let result = '';
        
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const codePoint = char.codePointAt(0);
            if (codePoint === undefined) continue;
            
            // Find the block this code point belongs to
            const block = this.unicodeBlocks.find(b => codePoint >= b.start && codePoint <= b.end);
            if (block) {
                this.usedBlocks.set(block.name, block);
            }
            
            let encoded = '';
            switch (this.format) {
                case 'codepoint':
                    encoded = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
                    break;
                case 'js':
                    encoded = `\\u${codePoint.toString(16).padStart(4, '0')}`;
                    break;
                case 'html':
                    encoded = `&#x${codePoint.toString(16)};`;
                    break;
                case 'css':
                    encoded = `\\${codePoint.toString(16).padStart(4, '0')}`;
                    break;
            }
            
            if (i > 0) result += ' ';
            result += encoded;
        }
        
        return result;
    }

    private decodeText(text: string): string {
        let result = '';
        
        try {
            let pattern: RegExp;
            let startIndex: number;
            let endIndex: (match: string) => number;
            
            if (this.format === 'codepoint') {
                pattern = /U\+[0-9A-Fa-f]{1,6}/g;
                startIndex = 2;
                endIndex = (match) => match.length;
            } else if (this.format === 'js') {
                pattern = /\\u[0-9a-f]{4,6}/gi;
                startIndex = 2;
                endIndex = (match) => match.length;
            } else if (this.format === 'html') {
                pattern = /&#x[0-9a-f]{1,6};/gi;
                startIndex = 3;
                endIndex = (match) => match.length - 1;
            } else if (this.format === 'css') {
                pattern = /\\[0-9a-f]{1,6}/gi;
                startIndex = 1;
                endIndex = (match) => match.length;
            } else {
                throw new Error('Invalid format selected');
            }
            
            const matches = text.match(pattern);
            if (!matches) {
                throw new Error(`No valid ${this.format} encoded values found`);
            }
            
            for (const match of matches) {
                const codePoint = parseInt(match.substring(startIndex, endIndex(match)), 16);
                result += String.fromCodePoint(codePoint);
                
                // Find the block this code point belongs to
                const block = this.unicodeBlocks.find(b => codePoint >= b.start && codePoint <= b.end);
                if (block) {
                    this.usedBlocks.set(block.name, block);
                }
            }
        } catch (e) {
            throw new Error(`Failed to decode: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        return result;
    }

    private renderHighlightedCode() {
        if (!this.output) return '';
        
        if (this.selectedMode === 'encode') {
            const parts = [];
            const codePoints = this.output.split(' ');
            
            for (let i = 0; i < codePoints.length; i++) {
                const codePoint = codePoints[i];
                let cp: number | null = null;
                
                // Extract the actual code point value based on format
                if (this.format === 'codepoint' && codePoint.startsWith('U+')) {
                    cp = parseInt(codePoint.substring(2), 16);
                } else if (this.format === 'js' && codePoint.startsWith('\\u')) {
                    cp = parseInt(codePoint.substring(2), 16);
                } else if (this.format === 'html' && codePoint.startsWith('&#x')) {
                    cp = parseInt(codePoint.substring(3, codePoint.length - 1), 16);
                } else if (this.format === 'css' && codePoint.startsWith('\\')) {
                    cp = parseInt(codePoint.substring(1), 16);
                }
                
                if (cp !== null) {
                    // Find the block this code point belongs to
                    const block = this.unicodeBlocks.find(b => cp! >= b.start && cp! <= b.end);
                    
                    if (block) {
                        parts.push(html`<span style="border-bottom: 1px solid ${block.color};">${codePoint}</span>`);
                    } else {
                        parts.push(html`${codePoint}`);
                    }
                } else {
                    parts.push(html`${codePoint}`);
                }
                
                if (i < codePoints.length - 1) {
                    parts.push(html` `);
                }
            }
            
            return html`${parts}`;
        } else {
            return this.output;
        }
    }

    private renderBlockLabels() {
        if (this.usedBlocks.size === 0) return '';
        
        const blockLabels = [];
        for (const block of this.usedBlocks.values()) {
            blockLabels.push(html`
                <div class="block-label">
                    <span class="color-dot" style="background-color: ${block.color};"></span>
                    <span>${block.name}</span>
                </div>
            `);
        }
        
        return html`<div class="mt-2 flex flex-wrap">${blockLabels}</div>`;
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
        this.usedBlocks.clear();

        const inputTextarea = this.querySelector('#input') as HTMLTextAreaElement;
        if (inputTextarea) {
            inputTextarea.style.height = '28px';
        }
        
        this.requestUpdate();
    }
}
