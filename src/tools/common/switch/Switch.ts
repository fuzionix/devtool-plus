import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('tool-switch')
export class Switch extends LitElement {
    @property({ type: Boolean }) checked = false;
    @property({ type: String }) leftLabel = '';
    @property({ type: String }) rightLabel = '';
    @property({ type: String }) ariaLabel = '';

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .switch-label {
            font-size: 0.75rem;
            opacity: 0.75;
            user-select: none;
            cursor: pointer;
        }

        .switch-container {
            box-sizing: border-box;
            position: relative;
            width: 36px;
            height: 20px;
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-button-secondaryBackground);
            border-radius: 2px;
            cursor: pointer;
            transition: border 100ms ease-in-out;
        }

        .switch-container:hover {
            border: 1px solid var(--vscode-button-background);
        }

        .switch-handle {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 14px;
            height: 14px;
            background-color: var(--vscode-button-background);
            border-radius: 2px;
            transition: transform 100ms ease-in-out;
        }

        .switch-container.checked .switch-handle {
            transform: translateX(16px);
        }
    `;

    private handleClick() {
        this.checked = !this.checked;
        this.dispatchEvent(new CustomEvent('change', {
            detail: { checked: this.checked },
            bubbles: true,
            composed: true
        }));
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick();
        }
    }

    render() {
        return html`
            ${this.leftLabel ? html`
                <span 
                    class="switch-label ${!this.checked ? 'active' : ''}"
                    @click=${this.handleClick}
                >
                    ${this.leftLabel}
                </span>
            ` : ''}
            
            <div 
                class="switch-container ${this.checked ? 'checked' : ''}"
                role="switch"
                aria-checked=${this.checked}
                aria-label=${this.ariaLabel}
                tabindex="0"
                @click=${this.handleClick}
                @keydown=${this.handleKeyDown}
            >
                <div class="switch-handle"></div>
            </div>

            ${this.rightLabel ? html`
                <span 
                    class="switch-label ${this.checked ? 'active' : ''}"
                    @click=${this.handleClick}
                >
                    ${this.rightLabel}
                </span>
            ` : ''}
        `;
    }
}