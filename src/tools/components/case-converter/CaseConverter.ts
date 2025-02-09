import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { CaseType } from './CaseConverterTypes';
import '../../common/dropdown-menu/DropdownMenu';

@customElement('case-converter')
export class CaseConverter extends BaseTool {
    @state() private selectedValue: CaseType | '' = '';

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Case conversion transforms text between different capitalizations to match various naming conventions and formatting requirements.</p>
                <hr />
                <div class="flex justify-between items-center">
                    <div class="frame">
                        <span>Original Text</span>
                    </div>
                    <div class="flex-1 mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <tool-dropdown-menu
                        .options=${
                            [
                                { label: 'Upper', value: 'upper' },
                                { label: 'Lower', value: 'lower' },
                                { label: 'Title', value: 'title' },
                                { label: 'Sentence', value: 'Sentence' }
                            ]
                        }
                        .value=${this.selectedValue}
                        placeholder="Select an option"
                        @change=${this.handleChange}
                    ></tool-dropdown-menu>
                </div>
            </div>
        `;
    }

    private handleChange(e: CustomEvent) {
        this.selectedValue = e.detail.value;
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'case-converter',
            value: this.selectedValue
        });
    }
}