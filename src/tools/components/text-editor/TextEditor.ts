import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { TextEditorState } from './TextEditorTypes';
import '../../common/dropdown-menu/DropdownMenu';

@customElement('text-editor')
export class TextEditor extends BaseTool {
    @state() private editorState: TextEditorState = {
        caseType: '',
        sortType: '',
        trimType: '',
        duplicateType: ''
    };

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Text editor provides various text transformation tools to manipulate and format text.</p>
                <hr />
                <div class="flex justify-between items-center">
                    <div class="flex items-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-case-sensitive-icon lucide-case-sensitive"><path d="m3 15 4-8 4 8"/><path d="M4 13h6"/><circle cx="18" cy="12" r="3"/><path d="M21 9v6"/></svg>
                    </div>
                    <div class="frame">
                        <span>Convert Case</span>
                    </div>
                    <div class="flex-1 mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <tool-dropdown-menu
                        .options=${
                            [
                                { label: 'No Change', value: '' },
                                { label: 'Upper', value: 'upper' },
                                { label: 'Lower', value: 'lower' },
                                { label: 'Title', value: 'title' },
                                { label: 'Sentence', value: 'sentence' }
                            ]
                        }
                        .value=${this.editorState.caseType}
                        placeholder="Select an option"
                        @change=${(e: CustomEvent) => this.handleChange('caseType', e.detail.value)}
                    ></tool-dropdown-menu>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-aarrow-down-icon lucide-a-arrow-down"><path d="M3.5 13h6"/><path d="m2 16 4.5-9 4.5 9"/><path d="M18 7v9"/><path d="m14 12 4 4 4-4"/></svg>
                    </div>
                    <div class="frame">
                        <span>Sort Lines By</span>
                    </div>
                    <div class="flex-1 mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <tool-dropdown-menu
                        .options=${
                            [
                                { label: 'No Change', value: '' },
                                { label: 'A - Z', value: 'asc' },
                                { label: 'Z - A', value: 'desc' },
                                { label: 'Shortest Length', value: 'length_asc' },
                                { label: 'Longest Length', value: 'length_desc' }
                            ]
                        }
                        .value=${this.editorState.sortType}
                        placeholder="Select an option"
                        @change=${(e: CustomEvent) => this.handleChange('sortType', e.detail.value)}
                    ></tool-dropdown-menu>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-space-icon lucide-space"><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"/></svg>
                    </div>
                    <div class="frame">
                        <span>Trim Spaces</span>
                    </div>
                    <div class="flex-1 mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <tool-dropdown-menu
                        .options=${
                            [
                                { label: 'No Change', value: '' },
                                { label: 'All Spaces', value: 'all' },
                                { label: 'Start & End Only', value: 'start_end' },
                                { label: 'Duplicate Spaces', value: 'duplicate' }
                            ]
                        }
                        .value=${this.editorState.trimType}
                        placeholder="Select an option"
                        @change=${(e: CustomEvent) => this.handleChange('trimType', e.detail.value)}
                    ></tool-dropdown-menu>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-minus-icon lucide-copy-minus"><line x1="12" x2="18" y1="15" y2="15"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </div>
                    <div class="frame">
                        <span>Remove Duplicate</span>
                    </div>
                    <div class="flex-1 mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <tool-dropdown-menu
                        .options=${
                            [
                                { label: 'No Change', value: '' },
                                { label: 'From Start', value: 'start' },
                                { label: 'From End', value: 'end' },
                            ]
                        }
                        .value=${this.editorState.duplicateType}
                        placeholder="Select an option"
                        @change=${(e: CustomEvent) => this.handleChange('duplicateType', e.detail.value)}
                    ></tool-dropdown-menu>
                </div>
            </div>
        `;
    }

    private handleChange(propertyName: keyof TextEditorState, value: string) {
        this.editorState = {
            ...this.editorState,
            [propertyName]: value
        };
        
        (window as any).vscode.postMessage({
            type: 'update',
            toolId: 'text-editor',
            value: this.editorState
        });
    }
}