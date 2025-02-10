import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('tool-tooltip')
export class Tooltip extends LitElement {
    static styles = css`
        :host {
            display: inline-block;
            position: relative;
        }
        
        .tooltip {
            visibility: hidden;
            position: absolute;
            z-index: 50;
            bottom: calc(100% + 5px);
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 8px;
            border-radius: 2px;
            font-size: 12px;
            line-height: 16px;
            white-space: nowrap;
            background-color: var(--vscode-panel-background);
            color: var(--vscode-panelTitle-activeForeground);
            border: 1px solid var(--vscode-panel-border);
            opacity: 0;
            transition: opacity 100ms ease-in-out;
        }

        :host(:hover) .tooltip {
            visibility: visible;
            opacity: 1;
            user-select: none;
            pointer-events: none;
        }

        .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: var(--vscode-panel-border) transparent transparent transparent;
        }
    `;

    @property() text = '';

    render() {
        return html`
            <div class="relative inline-flex">
                <slot></slot>
                <div class="tooltip">${this.text}</div>
            </div>
        `;
    }
}