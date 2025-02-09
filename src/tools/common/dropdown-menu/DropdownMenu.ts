import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tool-dropdown-menu')
export class DropdownMenu extends LitElement {
    @property({ type: Array }) options: { label: string; value: string }[] = [];
    @property({ type: String }) placeholder: string = 'Select an option';
    @property({ type: String }) value: string = '';

    @state() private isOpen: boolean = false;

    static styles = css`
        :host {
            display: block;
            position: relative;
            width: 100%;
        }

        .dropdown {
            box-sizing: border-box;
            position: relative;
            width: 100%;
        }

        .selection-body {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;
            padding: 6px 10px;
            background-color: var(--vscode-panel-background);
            box-shadow: inset 0 0 0 1px var(--vscode-panel-border);
            border-radius: 2px;
            cursor: pointer;
            user-select: none;
            color: var(--vscode-input-foreground);
        }

        .selection-body:hover {
            background-color: var(--vscode-panel-background);
            box-shadow: inset 0 0 0 1px var(--vscode-focusBorder);
        }

        .selection-body.open {
            box-shadow: inset 0 0 0 1px var(--vscode-focusBorder);
        }

        .chevron {
            width: 16px;
            height: 16px;
        }

        .chevron.open {
            transform: rotate(180deg);
        }

        .options-panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            visibility: hidden;
            opacity: 0;
            transition: opacity 100ms ease-in-out;
        }

        .options-panel.open {
            visibility: visible;
            opacity: 1;
        }

        .option {
            margin: 0 4px;
            padding: 4px 10px;
            border-radius: 3px;
            cursor: pointer;
            color: var(--vscode-dropdown-foreground);
        }

        .option:hover {
            color: var(--vscode-button-foreground);
            background-color: var(--vscode-button-background);
        }

        .option:first-child {
            margin-top: 4px;
        }

        .option:last-child {
            margin-bottom: 4px;
        }

        .option.selected {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .placeholder {
            color: var(--vscode-input-placeholderForeground);
        }
    `;

    render() {
        const selectedOption = this.options.find(opt => opt.value === this.value);

        return html`
            <div class="dropdown">
                <div 
                    class="selection-body ${this.isOpen ? 'open' : ''}"
                    @click=${this.toggleDropdown}
                >
                    <span class="${!selectedOption ? 'placeholder' : ''}">
                        ${selectedOption ? selectedOption.label : this.placeholder}
                    </span>
                    <svg 
                        class="chevron ${this.isOpen ? 'open' : ''}"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="options-panel ${this.isOpen ? 'open' : ''}">
                    ${this.options.map(option => html`
                        <div 
                            class="option ${option.value === this.value ? 'selected' : ''}"
                            @click=${() => this.selectOption(option)}
                        >
                            ${option.label}
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    private toggleDropdown() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            // Add click outside listener when dropdown is opened
            setTimeout(() => {
                window.addEventListener('click', this.handleClickOutside);
            });
        }
    }

    private selectOption(option: { label: string; value: string }) {
        this.value = option.value;
        this.isOpen = false;
        // Remove click outside listener when option is selected
        window.removeEventListener('click', this.handleClickOutside);

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: option.value },
            bubbles: true,
            composed: true
        }));
    }

    private handleClickOutside = (event: MouseEvent) => {
        const path = event.composedPath();
        if (!path.includes(this)) {
            this.isOpen = false;
            window.removeEventListener('click', this.handleClickOutside);
        }
    };

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('click', this.handleClickOutside);
    }
}