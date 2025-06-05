import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../tooltip/Tooltip';

@customElement('tool-slider')
export class Slider extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        
        .slider-container {
            position: relative;
            padding-top: 20px;
            width: 100%;
        }
        
        .slider-value {
            position: absolute;
            top: 0;
            left: 0;
            font-size: 12px;
            color: var(--vscode-foreground);
            opacity: 0.8;
            transform: translateX(-50%);
            white-space: nowrap;
        }
        
        .slider {
            -webkit-appearance: none;
            width: 100%;
            height: 1px;
            border-radius: 2px;
            background: var(--vscode-scrollbarSlider-background);
            outline: none;
        }
        
        .slider:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 2px;
            background: var(--vscode-button-background);
            cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 2px;
            background: var(--vscode-button-background);
            cursor: pointer;
        }
        
        .slider::-webkit-slider-thumb:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .slider::-moz-range-thumb:hover {
            background: var(--vscode-button-hoverBackground);
        }
    `;

    @property({ type: Number }) min = 0;
    @property({ type: Number }) max = 100;
    @property({ type: Number }) step = 1;
    @property({ type: Number }) value = 50;
    @property({ type: String }) unit = '';
    @property({ type: Function }) formatter = (val: number) => val.toString();

    @state() private isDragging = false;

    render() {
        return html`
            <div class="slider-container">
                <input 
                    type="range" 
                    class="slider" 
                    .min=${this.min} 
                    .max=${this.max} 
                    .step=${this.step} 
                    .value=${this.value}
                    @input=${this.handleSliderInput}
                    @mousedown=${() => this.isDragging = true}
                    @mouseup=${() => this.isDragging = false}
                    @mouseleave=${() => this.isDragging && (this.isDragging = false)}
                />
            </div>
        `;
    }

    handleSliderInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = Number(target.value);
        this.value = newValue;
        this.dispatchChange();
    }

    dispatchChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('value')) {
            if (this.value < this.min) this.value = this.min;
            if (this.value > this.max) this.value = this.max;
        }
    }
}