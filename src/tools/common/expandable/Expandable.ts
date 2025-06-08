import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tool-expandable')
export class Expandable extends LitElement {
    @property({ type: String }) label = 'Toggle';
    @property({ type: Boolean }) expanded = false;
    @property({ type: Boolean }) initiallyExpanded = false;
    @state() private isExpanded = false;

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .expandable-header {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 4px 0;
        }
        
        .expandable-icon {
            transition: transform 0.2s ease-in-out;
            margin-right: 4px;
        }
        
        .expandable-icon.expanded {
            transform: rotate(90deg);
        }
        
        .expandable-content {
            max-height: 0;
            overflow: hidden;
        }
        
        .expandable-content.expanded {
            max-height: 1000px;
            margin: 8px 0;
        }
        
        .expandable-label {
            margin-top: -4px;
            font-size: 12px;
        }
    `;

    constructor() {
        super();
        this.isExpanded = this.initiallyExpanded;
    }

    connectedCallback() {
        super.connectedCallback();
        this.isExpanded = this.initiallyExpanded || this.expanded;
    }

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('expanded')) {
            this.isExpanded = this.expanded;
        }
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.dispatchEvent(new CustomEvent('toggle', {
            detail: { expanded: this.isExpanded },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="expandable">
                <div class="expandable-header" @click=${this.toggleExpand}>
                    <span class="expandable-icon ${this.isExpanded ? 'expanded' : ''}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </span>
                    <span class="expandable-label">${this.label}</span>
                </div>
                <div class="expandable-content ${this.isExpanded ? 'expanded' : ''}">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}