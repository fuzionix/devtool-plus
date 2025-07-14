import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('tool-radio-item')
export class RadioItem extends LitElement {
    @property({ type: String }) value = '';
    @property({ type: String }) tooltip = '';
    @property({ type: Boolean, reflect: true }) selected = false;

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            min-width: 32px;
            cursor: pointer;
            color: var(--vscode-foreground);
            background-color: var(--vscode-panel-background);
            position: relative;
            border-right: 1px solid var(--vscode-input-background);
        }

        :host(:last-child) {
            border-right: none;
        }

        :host([aria-checked="true"]) {
            color: var(--vscode-button-foreground);
            background-color: var(--vscode-button-background);
        }

        :host(:hover:not([aria-checked="true"])) {
            background-color: var(--vscode-menu-background);
        }

        .icon-container {
            width: 100%;
            height: 100%;
        }

        .radio-tooltip {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `;

    render() {
        return html`
            <div 
                class="icon-container" 
                role="radio"
                aria-checked="false"
            >
                <tool-tooltip class="radio-tooltip" text="${this.tooltip}">
                    <slot></slot>
                </tool-tooltip>
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.hasAttribute('value')) {
            this.setAttribute('value', this.value);
        }
    }
}