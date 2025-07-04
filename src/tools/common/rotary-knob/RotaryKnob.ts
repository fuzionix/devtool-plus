import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

@customElement('tool-rotary-knob')
export class RotaryKnob extends LitElement {
    @property({ type: Number }) value = 0;
    @property({ type: Number }) min = 0;
    @property({ type: Number }) max = 360;
    @property({ type: Number }) step = 1;
    @property({ type: Number }) size = 30;
    @property({ type: String }) color = 'var(--vscode-button-background)';
    
    @state() private isDragging = false;
    @state() private knobRotation = 0;
    @state() private previousAngle = 0;
    
    @query('.knob') private knobElement!: HTMLElement;
    
    private knobCenterX = 0;
    private knobCenterY = 0;
    
    static styles = css`
        :host {
            display: inline-block;
        }
        
        .knob-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
        }
        
        .knob {
            position: relative;
            border-radius: 50%;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border);
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: box-shadow 0.1s ease;
        }
        
        .knob:hover {
            border-color: var(--vscode-focusBorder);
        }
        
        .knob:active {
            cursor: grabbing;
        }

        .knob-dot {
            position: absolute;
            width: 6px;
            height: 6px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 50%;
            background-color: var(--vscode-focusBorder);
            left: 50%;
            transform: translateX(-50%);
        }
    `;

    constructor() {
        super();
        this.updateKnobRotation();
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateKnobRotation();
    }

    firstUpdated() {
        this.updateKnobRotation();
        this.updateKnobCenter();
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('value') || changedProperties.has('min') || changedProperties.has('max')) {
            this.updateKnobRotation();
        }
    }

    render() {
        const size = `${this.size}px`;
        
        return html`
            <div class="knob-container">
                <div 
                    class="knob" 
                    style="width: ${size}; height: ${size};"
                    @mousedown="${this.handleMouseDown}"
                    @touchstart="${this.handleTouchStart}"
                    @dblclick="${this.resetToDefault}"
                >
                    <div 
                        class="knob-dot" 
                        style="transform: translateX(-50%) rotate(${this.knobRotation}deg) translateY(-${this.size * 0.3}px); background-color: ${this.color};"
                    >
                    </div>
                </div>
            </div>
        `;
    }

    private updateKnobRotation() {
        const valueRange = this.max - this.min;
        const percentage = (this.value - this.min) / valueRange;
        this.knobRotation = percentage * 360;
    }

    private updateKnobCenter() {
        if (this.knobElement) {
            const rect = this.knobElement.getBoundingClientRect();
            this.knobCenterX = rect.left + rect.width / 2;
            this.knobCenterY = rect.top + rect.height / 2;
        }
    }

    private handleMouseDown(e: MouseEvent) {
        e.preventDefault();
        this.updateKnobCenter();
        this.startDrag(e.clientX, e.clientY);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    private handleTouchStart(e: TouchEvent) {
        e.preventDefault();
        this.updateKnobCenter();
        const touch = e.touches[0];
        this.startDrag(touch.clientX, touch.clientY);
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd);
    }

    private startDrag(clientX: number, clientY: number) {
        this.isDragging = true;
        this.previousAngle = this.calculateAngle(clientX, clientY);
    }

    private calculateAngle(x: number, y: number): number {
        const deltaX = x - this.knobCenterX;
        const deltaY = y - this.knobCenterY;
        
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        if (angle < 0) {
            angle += 360;
        }
        
        return angle;
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;
        this.updateRotationFromMousePosition(e.clientX, e.clientY);
    };

    private handleTouchMove = (e: TouchEvent) => {
        if (!this.isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updateRotationFromMousePosition(touch.clientX, touch.clientY);
    };

    private handleMouseUp = () => {
        this.endDrag();
    };

    private handleTouchEnd = () => {
        this.endDrag();
    };

    private endDrag() {
        this.isDragging = false;
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }

    private updateRotationFromMousePosition(clientX: number, clientY: number) {
        // Calculate the current angle relative to knob center
        const currentAngle = this.calculateAngle(clientX, clientY);
        
        let deltaAngle = currentAngle - this.previousAngle;
        if (deltaAngle > 180) {
            deltaAngle -= 360;
        } else if (deltaAngle < -180) {
            deltaAngle += 360;
        }
        
        this.previousAngle = currentAngle;
        
        const valueRange = this.max - this.min;
        const deltaValue = (deltaAngle / 360) * valueRange;
        
        let newValue = this.value + deltaValue;
        
        newValue = Math.max(this.min, Math.min(this.max, newValue));
        
        if (this.step > 0) {
            newValue = Math.round(newValue / this.step) * this.step;
        }
        
        if (newValue !== this.value) {
            this.value = newValue;
            this.updateKnobRotation();
            
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: this.value },
                bubbles: true,
                composed: true
            }));
        }
    }
    
    private resetToDefault(e: MouseEvent) {
        e.preventDefault();
        const defaultValue = (this.min + this.max) / 2;
        this.value = defaultValue;
        this.updateKnobRotation();
        
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.endDrag();
    }
}