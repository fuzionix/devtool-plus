import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

@customElement('tool-slider')
export class Slider extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        
        .slider-container {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
            padding-top: 0px;
            padding-bottom: 16px;
            width: 100%;
        }

        .slider-wrapper {
            position: relative;
            flex: 1;
            transform: translateY(-4px);
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

        .value-tooltip {
            position: absolute;
            top: -24px;
            font-size: 12px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            padding: 2px 6px;
            border-radius: 2px;
            transform: translateX(-50%);
            white-space: nowrap;
            z-index: 50;
            opacity: 0;
            transition: opacity 100ms ease-in-out;
            pointer-events: none;
        }
        
        .value-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: var(--vscode-panel-border) transparent transparent transparent;
        }
        
        .slider:active + .value-tooltip, 
        .slider:hover + .value-tooltip,
        .is-dragging .value-tooltip {
            opacity: 1;
        }

        .number-input {
            width: 60px;
            height: 24px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
            border-radius: 2px;
            margin-left: 10px;
            padding: 0 6px;
            font-size: 12px;
            text-align: center;
        }

        .number-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type=number] {
            -moz-appearance:textfield;
        }
    `;

    @property({ type: Number }) min = 0;
    @property({ type: Number }) max = 100;
    @property({ type: Number }) step = 1;
    @property({ type: Number }) value = 50;
    @property({ type: String }) unit = '';
    @property({ type: Function }) formatter = (val: number) => val.toString();
    @property({ type: Number }) inputWidth = 30;

    @state() private isDragging = false;
    @query('.slider') private sliderElement!: HTMLInputElement;
    @query('.value-tooltip') private tooltipElement!: HTMLDivElement;

    private readonly THUMB_WIDTH = 14;

    render() {
        const formattedValue = this.formatter(this.value) + (this.unit ? ` ${this.unit}` : '');

        return html`
            <div class="slider-container ${this.isDragging ? 'is-dragging' : ''}">
                <div class="slider-wrapper">
                    <input 
                        type="range" 
                        class="slider" 
                        .min=${this.min} 
                        .max=${this.max} 
                        .step=${this.step} 
                        .value=${this.value}
                        @input=${this.handleSliderInput}
                        @mouseover=${this.updateTooltipPosition}
                        @mousedown=${this.handleMouseDown}
                        @mouseup=${this.handleMouseUp}
                        @mouseleave=${this.handleMouseLeave}
                    />
                    <div class="value-tooltip">${formattedValue}</div>
                </div>
                <div class="input-wrapper">
                    <input 
                        type="number"
                        class="number-input"
                        style="width: ${this.inputWidth}px;"
                        .min=${this.min}
                        .max=${this.max}
                        .step=${this.step}
                        .value=${this.value}
                        @input=${this.handleNumberInput}
                    />
                </div>
            </div>
        `;
    }

    firstUpdated() {
        this.updateTooltipPosition();
    }

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('value')) {
            if (this.value < this.min) this.value = this.min;
            if (this.value > this.max) this.value = this.max;
            this.updateTooltipPosition();
        }
    }

    handleMouseDown() {
        this.isDragging = true;
        document.addEventListener('mouseup', this.handleGlobalMouseUp);
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleMouseLeave() {
        if (this.isDragging) {
        }
    }

    private handleGlobalMouseUp = () => {
        this.isDragging = false;
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);
    };

    handleSliderInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = Number(target.value);
        this.value = newValue;
        this.updateTooltipPosition();
        this.setValue(newValue);
        this.dispatchChange();
    }

    handleNumberInput(e: Event) {
        const target = e.target as HTMLInputElement;
        let newValue = Number(target.value);

        if (isNaN(newValue)) {
            newValue = this.value;
        } else {
            newValue = Math.max(this.min, Math.min(this.max, newValue));
        }
        
        this.setValue(newValue);
    }

    setValue(newValue: number) {
        // Enforce step constraints and ensure value is within bounds
        const nearestStep = Math.round((newValue - this.min) / this.step) * this.step + this.min;
        newValue = Number(nearestStep.toFixed(10));
        newValue = Math.max(this.min, Math.min(this.max, newValue));
        
        if (this.value !== newValue) {
            this.value = newValue;
            this.updateTooltipPosition();
            this.dispatchChange();
        }
    }

    updateTooltipPosition() {
        if (!this.sliderElement || !this.tooltipElement) return;

        const sliderRect = this.sliderElement.getBoundingClientRect();
        const effectiveWidth = sliderRect.width - this.THUMB_WIDTH;

        const range = this.max - this.min;
        const valuePercentage = (this.value - this.min) / range;

        const leftPosition = (this.THUMB_WIDTH / 2) + (valuePercentage * effectiveWidth);
        const leftPercentage = (leftPosition / sliderRect.width) * 100;

        this.tooltipElement.style.left = `calc(${leftPercentage}% + 2px)`;
    }

    dispatchChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }
}