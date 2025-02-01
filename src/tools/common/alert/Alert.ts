import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type AlertType = 'error' | 'warning';

@customElement('tool-alert')
export class Alert extends LitElement {
    @property({ type: String }) type: AlertType = 'error';
    @property({ type: String }) message = '';

    static styles = css`
        .alert {
            display: flex;
            align-items: flex-start;
            gap: 0.25rem;
            margin-top: 0.25rem;
            font-size: 0.75rem;
            animation: alertBounce 0.2s ease-in-out forwards;
            user-select: none;
        }

        .alert-error {
            color: var(--vscode-editorError-foreground);
        }

        .alert-warning {
            color: var(--vscode-editorWarning-foreground);
        }

        .alert svg {
            min-width: 14px;
            padding-top: 2px;
        }

        @keyframes alertBounce {
            0% {
                transform: translateY(-4px);
                opacity: 0;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;

    private renderIcon() {
        if (this.type === 'error') {
            return html`
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-x"><path d="m15 9-6 6"/><path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="m9 9 6 6"/></svg>
            `;
        } else {
            return html`
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            `;
        }
    }

    render() {
        if (!this.message) {
            return null;
        }

        return html`
            <div class="alert alert-${this.type}">
                ${this.renderIcon()}
                <span class="alert-message">${this.message}</span>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'tool-alert': Alert;
    }
}