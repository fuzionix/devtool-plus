import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('tool-radio-group')
export class RadioGroup extends LitElement {
    @property({ type: String }) selected = '';
    @property({ type: String }) ariaLabel = 'Options';

    static styles = css`
        :host {
            display: block;
        }

        .radio-group {
            display: flex;
            min-height: 30px;
            border-radius: 2px;
            border: 1px solid var(--vscode-panel-border);
        }

        ::slotted(tool-radio-item) {
            border-radius: 2px;
        }
    `;

    render() {
        return html`
            <div class="radio-group" role="radiogroup" aria-label="${this.ariaLabel}">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
        `;
    }

    private handleSlotChange(e: Event) {
        const slot = e.target as HTMLSlotElement;
        const elements = slot.assignedElements();
        
        elements.forEach(element => {
            if (element.hasAttribute('value')) {
                const value = element.getAttribute('value');
                element.setAttribute('aria-checked', value === this.selected ? 'true' : 'false');
                element.addEventListener('click', this.handleItemClick.bind(this));
            }
        });
    }

    private handleItemClick(e: Event) {
        const target = e.currentTarget as HTMLElement;
        if (!target || !target.hasAttribute('value')) { return; }

        const newValue = target.getAttribute('value') || '';
        
        // If already selected, don't do anything (radio buttons can't be unselected)
        if (newValue === this.selected) { return; }
        
        this.selected = newValue;
        
        // Update aria-checked attributes
        const elements = this.querySelectorAll('[value]');
        elements.forEach(element => {
            const value = element.getAttribute('value');
            element.setAttribute('aria-checked', value === this.selected ? 'true' : 'false');
        });
        
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.selected },
            bubbles: true,
            composed: true
        }));
    }
}