import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

type ColumnAlignment = 'left' | 'center' | 'right';

@customElement('markdown-table-builder')
export class MarkdownTableBuilder extends BaseTool {
    @state() private tableData: string[][] = [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']];
    @state() private columnAlignments: ColumnAlignment[] = ['left', 'left'];
    @state() private output = '';
    @state() private isCopied = false;
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    @query('#output') private outputEl!: HTMLTextAreaElement;

    connectedCallback() {
        super.connectedCallback();
        this.generateMarkdown();
    }

    private styles = css`
        ${BaseTool.styles}
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Build Markdown tables with an easy-to-use interface. Add or remove rows and columns as needed.</p>
                <hr />

                <!-- Table Editor -->
                <div class="mt-2 mb-2 overflow-x-auto border border-[var(--vscode-panel-border)] rounded-sm">
                    <div class="flex">
                        <!-- Table cells -->
                        <div class="flex-1">
                            <div class="flex">
                                ${this.columnAlignments.map((alignment, colIndex) => html`
                                    <div class="flex justify-center items-center w-full border-r border-b border-[var(--vscode-panel-border)]">
                                        <button 
                                            class="btn-icon w-[18px] h-[18px] m-0.5" 
                                            @click=${() => this.cycleAlignment(colIndex)}
                                            title="${this.getAlignmentTitle(alignment)}"
                                        >
                                            ${this.renderAlignmentIcon(alignment)}
                                        </button>
                                    </div>
                                `)}
                            </div>
                            ${this.tableData.map((row, rowIndex) => html`
                                <div class="flex">
                                    ${row.map((cell, colIndex) => html`
                                        <div class="w-full p-1 border-r border-b border-[var(--vscode-panel-border)] ${rowIndex === 0 ? 'bg-[var(--vscode-editor-background)]' : ''}">
                                            <input 
                                                type="text" 
                                                class="w-24 min-w-full !bg-transparent"
                                                .value=${cell} 
                                                @input=${(e: InputEvent) => this.updateCell(rowIndex, colIndex, (e.target as HTMLInputElement).value)}
                                                placeholder="${rowIndex === 0 ? 'Header' : 'Cell'}"
                                                style="text-align: ${this.columnAlignments[colIndex]};"
                                            />
                                        </div>
                                    `)}
                                </div>
                            `)}
                        </div>
                        
                        <!-- Column controls -->
                        <div class="flex flex-col border-b border-[var(--vscode-panel-border)]">
                            <div class="p-1 flex flex-col items-center justify-center h-full">
                                <button 
                                    class="btn-icon mb-2" 
                                    @click=${this.addColumn}
                                    title="Add column"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                </button>
                                <button 
                                    class="btn-icon" 
                                    @click=${this.removeColumn}
                                    title="Remove column"
                                    ?disabled=${this.tableData[0].length <= 1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Row controls -->
                    <div class="flex border-t border-[var(--vscode-panel-border)]">
                        <div class="p-1 flex items-center justify-center w-full">
                            <button 
                                class="btn-icon mr-2" 
                                @click=${this.addRow}
                                title="Add row"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            </button>
                            <button 
                                class="btn-icon" 
                                @click=${this.removeRow}
                                title="Remove row"
                                ?disabled=${this.tableData.length <= 2}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Table Output Field -->
                <div class="relative mt-2">
                    <textarea
                        id="output"
                        class="input-expandable font-mono"
                        placeholder="Your table will appear here"
                        rows="3"
                        readonly
                        .value=${this.output}
                        @focus=${(e: FocusEvent) => (e.target as HTMLTextAreaElement).select()}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Copy">
                            <button
                                id="copy-output"
                                class="btn-icon"
                                @click=${this.copyToClipboard}
                            >
                                ${renderCopyButton(this.isCopied)}
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
            </div>
        `;
    }

    private generateMarkdown() {
        if (!this.tableData.length || !this.tableData[0].length) {
            this.output = '';
            return;
        }

        const rows = this.tableData.length;
        const cols = this.tableData[0].length;

        // Header Row
        let markdown = '| ' + this.tableData[0].join(' | ') + ' |\n';
        
        // Separator Row with alignments
        let separator = '|';
        for (let i = 0; i < cols; i++) {
            switch (this.columnAlignments[i]) {
                case 'left':
                    separator += ' :--- |';
                    break;
                case 'center':
                    separator += ' :---: |';
                    break;
                case 'right':
                    separator += ' ---: |';
                    break;
                default:
                    separator += ' --- |';
            }
        }
        markdown += separator + '\n';

        // Data Rows
        for (let i = 1; i < rows; i++) {
            markdown += '| ' + this.tableData[i].join(' | ') + ' |\n';
        }
        
        this.output = markdown;
        
        setTimeout(() => {
            if (this.outputEl) {
                adjustTextareaHeight(this.outputEl);
            }
        }, 0);
    }

    private addRow() {
        if (!this.tableData.length) {
            this.tableData = [['']];
        } else {
            const cols = this.tableData[0].length;
            const newRow = Array(cols).fill('');
            this.tableData = [...this.tableData, newRow];
        }
        this.generateMarkdown();
    }

    private removeRow() {
        if (this.tableData.length <= 2) {
            this.setAlert('warning', 'A table must have at least one header and one data row');
            return;
        }
        this.tableData = this.tableData.slice(0, -1);
        this.generateMarkdown();
    }

    private addColumn() {
        if (!this.tableData.length) {
            this.tableData = [['']];
            this.columnAlignments = ['left'];
        } else {
            this.tableData = this.tableData.map(row => [...row, '']);
            this.columnAlignments = [...this.columnAlignments, 'left'];
        }
        this.generateMarkdown();
    }

    private removeColumn() {
        if (!this.tableData.length || this.tableData[0].length <= 1) {
            this.setAlert('warning', 'A table must have at least one column');
            return;
        }
        this.tableData = this.tableData.map(row => row.slice(0, -1));
        this.columnAlignments = this.columnAlignments.slice(0, -1);
        this.generateMarkdown();
    }

    private updateCell(rowIndex: number, colIndex: number, value: string) {
        const newTableData = [...this.tableData];
        newTableData[rowIndex][colIndex] = value;
        this.tableData = newTableData;
        this.generateMarkdown();
    }

    private cycleAlignment(colIndex: number) {
        const newAlignments = [...this.columnAlignments];
        
        // Cycle through alignments
        switch (newAlignments[colIndex]) {
            case 'left':
                newAlignments[colIndex] = 'center';
                break;
            case 'center':
                newAlignments[colIndex] = 'right';
                break;
            case 'right':
                newAlignments[colIndex] = 'left';
                break;
            default:
                newAlignments[colIndex] = 'left';
        }
        
        this.columnAlignments = newAlignments;
        this.generateMarkdown();
    }

    private getAlignmentTitle(alignment: ColumnAlignment): string {
        switch (alignment) {
            case 'left': return 'Align Left';
            case 'center': return 'Align Center';
            case 'right': return 'Align Right';
        }
    }

    private renderAlignmentIcon(alignment: ColumnAlignment) {
        switch (alignment) {
            case 'left':
                return html`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/></svg>`;
            case 'center':
                return html`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M17 12H7"/><path d="M19 19H5"/></svg>`;
            case 'right':
                return html`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M21 12H9"/><path d="M21 19H7"/></svg>`;
        }
    }

    private setAlert(type: 'error' | 'warning', message: string) {
        this.alert = { type, message };
        setTimeout(() => {
            this.alert = null;
        }, 3000);
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
}