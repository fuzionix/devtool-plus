import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tool-slider-range')
export class SliderRange extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        
        .slider-container {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 8px;
            width: 100%;
        }

        .slider-container.is-disabled {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }

        .slider-wrapper {
            position: relative;
            flex: 1;
            height: 20px;
            display: flex;
            align-items: center;
        }
        
        /* Base track (background) */
        .slider-base-track {
            position: absolute;
            width: 100%;
            height: 1px;
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 2px;
            z-index: 1;
        }

        /* Active track (highlight between thumbs) */
        .slider-active-track {
            position: absolute;
            height: 1px;
            background: var(--vscode-button-background);
            z-index: 2;
        }
        
        .slider-input {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            position: absolute;
            background: transparent;
            pointer-events: none;
            outline: none;
            margin: 0;
            z-index: 3;
        }
        
        /* Thumb styling */
        .slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 2px;
            background: var(--vscode-button-background);
            cursor: pointer;
            pointer-events: auto;
            border: none;
            transition: background 100ms;
        }
        
        .slider-input::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 2px;
            background: var(--vscode-button-background);
            cursor: pointer;
            pointer-events: auto;
            border: none;
        }
        
        .slider-input::-webkit-slider-thumb:hover {
            background: var(--vscode-button-hoverBackground);
        }

        /* Tooltips */
        .value-tooltip {
            position: absolute;
            top: -28px;
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
            border-width: 3px;
            border-style: solid;
            border-color: var(--vscode-panel-border) transparent transparent transparent;
        }
        
        .slider-wrapper:hover .value-tooltip,
        .is-dragging .value-tooltip {
            opacity: 1;
        }

        /* Number Inputs Section */
        .inputs-container {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .number-input {
            width: 38px;
            height: 24px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
            border-radius: 2px;
            padding: 0 4px;
            font-size: 12px;
            text-align: center;
        }

        .number-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }

        .input-separator {
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            user-select: none;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type=number] {
            -moz-appearance: textfield;
        }
    `;

    @property({ type: Number }) min = 0;
    @property({ type: Number }) max = 100;
    @property({ type: Number }) step = 1;
    @property({ type: Number }) valueStart = 25;
    @property({ type: Number }) valueEnd = 75;
    @property({ type: String }) unit = '';
    @property({ type: Function }) formatter = (val: number) => val.toString();
    @property({ type: Boolean }) disabled = false;

    @state() private isDragging = false;

    private readonly THUMB_WIDTH = 14;

    render() {
        const startPercent = ((this.valueStart - this.min) / (this.max - this.min)) * 100;
        const endPercent = ((this.valueEnd - this.min) / (this.max - this.min)) * 100;
        const halfThumb = this.THUMB_WIDTH / 2;
        
        const trackLeft = `calc(${halfThumb}px + (${startPercent} * (100% - ${this.THUMB_WIDTH}px) / 100))`;
        const trackRight = `calc(${halfThumb}px + (${endPercent} * (100% - ${this.THUMB_WIDTH}px) / 100))`;
        const trackStyle = `left: ${trackLeft}; right: calc(100% - ${trackRight})`;

        console.log(trackStyle);
        
        return html`
            <div class="slider-container ${this.isDragging ? 'is-dragging' : ''} ${this.disabled ? 'is-disabled' : ''}">
                <div class="slider-wrapper">
                    <div class="slider-base-track"></div>
                    <div class="slider-active-track" style="${trackStyle}"></div>
                    
                    <input 
                        type="range" 
                        id="input-start"
                        class="slider-input" 
                        .min=${this.min} 
                        .max=${this.max} 
                        .step=${this.step} 
                        .value=${this.valueStart}
                        ?disabled=${this.disabled}
                        @input=${this.handleInputStart}
                        @mousedown=${this.handleMouseDown}
                        @mouseup=${this.handleMouseUp}
                    />
                    <div class="value-tooltip" style="left: ${this.getTooltipPosition(this.valueStart)}">
                        ${this.formatter(this.valueStart)}${this.unit}
                    </div>

                    <input 
                        type="range" 
                        id="input-end"
                        class="slider-input" 
                        .min=${this.min} 
                        .max=${this.max} 
                        .step=${this.step} 
                        .value=${this.valueEnd}
                        ?disabled=${this.disabled}
                        @input=${this.handleInputEnd}
                        @mousedown=${this.handleMouseDown}
                        @mouseup=${this.handleMouseUp}
                    />
                    <div class="value-tooltip" style="left: ${this.getTooltipPosition(this.valueEnd)}">
                        ${this.formatter(this.valueEnd)}${this.unit}
                    </div>
                </div>

                <div class="inputs-container">
                    <input 
                        type="number"
                        class="number-input"
                        .min=${this.min}
                        .max=${this.valueEnd}
                        .step=${this.step}
                        .value=${this.valueStart}
                        ?disabled=${this.disabled}
                        @input=${(e: Event) => this.handleNumberInput(e, true)}
                    />
                    <span class="input-separator">-</span>
                    <input 
                        type="number"
                        class="number-input"
                        .min=${this.valueStart}
                        .max=${this.max}
                        .step=${this.step}
                        .value=${this.valueEnd}
                        ?disabled=${this.disabled}
                        @input=${(e: Event) => this.handleNumberInput(e, false)}
                    />
                </div>
            </div>
        `;
    }

    private getTooltipPosition(value: number) {
        const percentage = ((value - this.min) / (this.max - this.min)) * 100;
        const halfThumb = this.THUMB_WIDTH / 2;
        return `calc(${halfThumb}px + (${percentage} * (100% - ${this.THUMB_WIDTH}px) / 100))`;
    }

    private handleMouseDown() {
        this.isDragging = true;
        window.addEventListener('mouseup', this.handleGlobalMouseUp);
    }

    private handleMouseUp() {
        this.isDragging = false;
    }

    private handleGlobalMouseUp = () => {
        this.isDragging = false;
        window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    };

    private handleInputStart(e: Event) {
        const val = Number((e.target as HTMLInputElement).value);
        if (val > this.valueEnd) {
            this.valueStart = this.valueEnd;
            (e.target as HTMLInputElement).value = this.valueEnd.toString();
        } else {
            this.valueStart = val;
        }
        this.dispatchChange();
    }

    private handleInputEnd(e: Event) {
        const val = Number((e.target as HTMLInputElement).value);
        if (val < this.valueStart) {
            this.valueEnd = this.valueStart;
            (e.target as HTMLInputElement).value = this.valueStart.toString();
        } else {
            this.valueEnd = val;
        }
        this.dispatchChange();
    }

    private handleNumberInput(e: Event, isStart: boolean) {
        const target = e.target as HTMLInputElement;
        let val = Number(target.value);

        if (isNaN(val)) return;

        if (isStart) {
            val = Math.max(this.min, Math.min(val, this.valueEnd));
            this.valueStart = val;
        } else {
            val = Math.max(this.valueStart, Math.min(val, this.max));
            this.valueEnd = val;
        }
        
        this.dispatchChange();
    }

    private dispatchChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { 
                start: this.valueStart, 
                end: this.valueEnd 
            },
            bubbles: true,
            composed: true
        }));
    }
}