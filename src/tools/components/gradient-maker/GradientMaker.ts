import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import namesPlugin from 'colord/plugins/names';

extend([mixPlugin, namesPlugin]);

interface ColorStop {
    position: number;  // 0-100 percentage
    color: string;
    selected: boolean;
}

type GradientType = 'linear' | 'radial' | 'conic';

@customElement('gradient-maker')
export class GradientMaker extends BaseTool {
    @state() private colorStops: ColorStop[] = [
        { position: 0, color: '#0f23fa', selected: false },
        { position: 50, color: '#0f85fa', selected: true },
        { position: 100, color: '#0fe7fa', selected: false }
    ];

    @state() private gradientType: GradientType = 'linear';
    @state() private angle: number = 90;
    @state() private isDragging: boolean = false;
    @state() private activeDragHandle: number | null = null;

    @query('.gradient-bar-container') private gradientBar!: HTMLElement;

    static styles = css`
        ${BaseTool.styles}
        
    `;

    constructor() {
        super();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.endDrag();
    }

    protected renderTool() {
        const resultGradientCSS = this.generateGradientCSS();
        const linearGradientCSS = this.generateLinearGradientCSS();

        return html`
            <style>
            .result-container {
                position: relative;
                height: 60px;
                border-radius: 2px;
                overflow: hidden;
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
            }
            
            .result-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
                background-size: 10px 10px;
                background-position: 0 0, 0 5px, 5px -5px, -5px 0;
                opacity: 0.2;
                z-index: 0;
            }

            .gradient-bar-container {
                position: relative;
                height: 24px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 2px;
                margin: 8px 0;
                cursor: copy;
            }
            
            .gradient-bar-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .gradient-bar-background::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
                background-size: 10px 10px;
                background-position: 0 0, 0 5px, 5px -5px, -5px 0;
                opacity: 0.2;
                z-index: 0;
            }
            
            .gradient-bar {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 2px;
                z-index: 1;
            }
            
            .color-stop-handles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                pointer-events: none;
            }
            
            .color-handle {
                position: absolute;
                width: 12px;
                height: 30px;
                border: 2px solid white;
                border-radius: 6px;
                outline: 2px solid black;
                transform: translate(-50%, -50%);
                top: 50%;
                cursor: ew-resize;
                pointer-events: auto;
            }
            
            .color-handle.selected {
                width: 12px;
                height: 30px;
                z-index: 3;
            }
            
            .color-handle:hover {
                transform: translate(-50%, -50%) scale(1.1);
            }

            .color-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 16px;
                width: 100%;
            }
            
            .color-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 4px;
                border-radius: 2px;
                background-color: var(--vscode-panel-background);
                box-shadow: inset 0 0 0 1px var(--vscode-panel-border);
            }

            .color-item.selected {
                box-shadow: inset 0 0 0 1px var(--vscode-focusBorder);
            }
            
            .color-hex-input {
                flex: 1;
                min-width: 80px;
                background-color: transparent !important;
                color: var(--vscode-input-foreground);
                padding: 2px 8px;
                border: none;
                outline: none;
                box-shadow: none !important;
                font-family: monospace;
                font-size: 14px;
            }
            
            .color-position-input {
                width: 60px;
                background-color: transparent !important;
                color: var(--vscode-input-foreground);
                padding: 2px 8px;
                border: none;
                outline: none;
                box-shadow: none !important;
                font-family: monospace;
                font-size: 14px;
            }

            .color-hex-input:focus,
            .color-position-input:focus {
                outline: none;
            }
            
            .remove-button {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 24px;
                height: 24px;
                background: transparent;
                border: none;
                color: var(--vscode-editor-foreground);
                opacity: 0.7;
                cursor: pointer;
                border-radius: 2px;
            }
            
            .remove-button:hover {
                opacity: 1;
                background-color: var(--vscode-list-hoverBackground);
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Create and customize CSS gradients with multiple color stops.</p>
                <hr />

                <!-- Result Container -->
                <div class="result-container">
                    <div style="position: absolute; inset: 0; background: ${resultGradientCSS}"></div>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center my-4 opacity-75 rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Gradient Bar -->
                <div 
                    class="gradient-bar-container" 
                    @click="${this.handleBarClick}" 
                    @mousedown="${this.handleBarMouseDown}"
                >
                    <div class="gradient-bar-background">
                        <div class="gradient-bar" style="background: ${linearGradientCSS}"></div>
                    </div>
                    <div class="color-stop-handles">
                        ${this.colorStops.map((stop, index) => this.renderColorHandle(stop, index))}
                    </div>
                </div>

                <div class="flex justify-between gap-4 my-4">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Gradient Type
                        </div>
                        <tool-dropdown-menu
                            .options=${[
                                { label: 'Linear', value: 'linear' },
                                { label: 'Radial', value: 'radial' },
                                { label: 'Conic', value: 'conic' }
                            ]}
                            .value="${this.gradientType}"
                            placeholder="Select Gradient Type"
                            @change=${this.handleGradientTypeChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">
                            Rotation Angle
                        </div>
                        <div class="flex">
                            <tool-rotary-knob
                                .value="${this.angle}"
                                min="0"
                                max="360"
                                step="1"
                                size="32"
                                @change="${(e: CustomEvent) => this.handleAngleChange(e)}"
                            >
                            </tool-rotary-knob>
                            <input 
                                type="text" 
                                class="flex-1 h-[32px] ml-2 !py-[6px] text-center !bg-transparent" 
                                .value="${this.angle}°"
                            />
                        </div>
                    </div>
                </div>

                <!-- Color List -->
                <div class="color-list">
                    ${this.colorStops
                        .sort((a, b) => a.position - b.position)
                        .map((stop, index) => this.renderColorListItem(stop, index))}
                </div>
            </div>
        `;
    }

    private renderColorHandle(stop: ColorStop, index: number) {
        return html`
            <div 
                class="color-handle ${stop.selected ? 'selected' : ''}"
                style="left: ${stop.position}%; background-color: ${stop.color};"
                @mousedown="${(e: MouseEvent) => this.handleColorHandleMouseDown(e, index)}"
                @click="${(e: MouseEvent) => this.handleColorHandleClick(e, index)}">
            </div>
        `;
    }

    private renderColorListItem(stop: ColorStop, index: number) {
        return html`
            <div 
                class="color-item ${stop.selected ? 'selected' : ''}" 
                @click="${() => this.selectColorStop(index)}"
            >
                <input 
                    type="text"
                    class="color-hex-input"
                    .value="${stop.color}"
                    @input="${(e: InputEvent) => this.handleHexInput(e, index)}"
                    @blur="${(e: FocusEvent) => this.validateHexInput(e, index)}"
                />

                <div class="w-[1px] h-5 bg-[var(--vscode-panel-border)]"></div>
                
                <div class="flex items-center gap-1">
                    <input 
                        type="number"
                        class="color-position-input"
                        min="0"
                        max="100"
                        .value="${Math.round(stop.position)}"
                        @input="${(e: InputEvent) => this.handlePositionInput(e, index)}"
                    />
                </div>

                <div class="w-[1px] h-5 bg-[var(--vscode-panel-border)]"></div>

                <div class="">
                    <tool-color-picker
                        class="mt-1 w-6 h-6"
                        .value="${stop.color}"
                        .format="${'hex' as const}"
                        @change="${(e: CustomEvent) => this.handleColorChange(e, index)}"
                    ></tool-color-picker>
                </div>
                
                <button 
                    class="remove-button"
                    ?disabled="${this.colorStops.length <= 2}"
                    @click="${(e: MouseEvent) => this.handleRemoveColor(e, index)}"
                    title="Remove color stop"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    }

    private selectColorStop(index: number) {
        this.colorStops = this.colorStops.map((stop, i) => ({
            ...stop,
            selected: i === index
        }));
    }

    private handleHexInput(e: InputEvent, index: number) {
        const input = e.target as HTMLInputElement;
        let value = input.value;
        
        if (value.length > 0 && !value.startsWith('#')) {
            value = '#' + value;
            input.value = value;
        }
        
        if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
            this.updateColorStop(index, { color: value });
        }
    }

    private validateHexInput(e: FocusEvent, index: number) {
        const input = e.target as HTMLInputElement;
        const value = input.value;
        
        // If not a valid hex color, revert to the original value
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
            input.value = this.colorStops[index].color;
        } else {
            // Normalize to the full 6-digit hex if it's a 3-digit shorthand
            const normalizedHex = colord(value).toHex();
            input.value = normalizedHex;
            this.updateColorStop(index, { color: normalizedHex });
        }
    }

    private handlePositionInput(e: InputEvent, index: number) {
        const input = e.target as HTMLInputElement;
        const position = Math.min(100, Math.max(0, parseInt(input.value) || 0));
        
        this.updateColorStop(index, { position });
    }

    private handleColorChange(e: CustomEvent, index: number) {
        const value = e.detail.value;
        this.updateColorStop(index, { color: value });
    }

    private handleRemoveColor(e: MouseEvent, index: number) {
        e.stopPropagation();
        
        if (this.colorStops.length <= 2) {
            return;
        }
        
        const newStops = this.colorStops.filter((_, i) => i !== index);
        
        // If we removed the selected stop, select the first one
        if (this.colorStops[index].selected && newStops.length > 0) {
            newStops[0].selected = true;
        }
        
        this.colorStops = newStops;
    }

    private updateColorStop(index: number, updates: Partial<ColorStop>) {
        this.colorStops = this.colorStops.map((stop, i) => {
            if (i === index) {
                return {
                    ...stop,
                    ...updates
                };
            }
            return stop;
        });
    }

    private handleBarClick(e: MouseEvent) {
        // Don't add a new color stop if we're clicking on an existing handle or dragging
        if ((e.target as Element).classList.contains('color-handle') || this.isDragging) {
            return;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));

        // For simplicity, we'll interpolate between existing colors
        const newColor = this.interpolateColorAtPosition(position);

        // Deselect all existing stops
        const updatedStops = this.colorStops.map(stop => ({
            ...stop,
            selected: false
        }));

        updatedStops.push({
            position,
            color: newColor,
            selected: true
        });

        this.colorStops = updatedStops;
    }

    private handleColorHandleClick(e: MouseEvent, index: number) {
        e.stopPropagation();

        // Update selection state
        this.colorStops = this.colorStops.map((stop, i) => ({
            ...stop,
            selected: i === index
        }));
    }

    private handleColorHandleMouseDown(e: MouseEvent, index: number) {
        e.stopPropagation();
        e.preventDefault();

        this.startDrag(index);

        // Update selection
        this.colorStops = this.colorStops.map((stop, i) => ({
            ...stop,
            selected: i === index
        }));
    }

    private handleBarMouseDown(e: MouseEvent) {
        // Only handle if we're not clicking on a handle
        if (!(e.target as Element).classList.contains('color-handle')) {
            // Intentionally empty - we'll add color stops on click not mousedown
        }
    }

    private handleGradientTypeChange(e: CustomEvent) {
        this.gradientType = e.detail.value;
    }

    private handleAngleChange(e: CustomEvent) {
        this.angle = e.detail.value;
    }

    private startDrag(handleIndex: number) {
        this.isDragging = true;
        this.activeDragHandle = handleIndex;
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        document.body.style.userSelect = 'none';
    }

    private endDrag() {
        this.isDragging = false;
        this.activeDragHandle = null;
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        document.body.style.userSelect = '';
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging || this.activeDragHandle === null || !this.gradientBar) {
            return;
        }

        const rect = this.gradientBar.getBoundingClientRect();

        // Clamp the x position to the bar width, but allow the calculation to work outside
        let clientX = e.clientX;
        let position = ((clientX - rect.left) / rect.width) * 100;

        // Clamp position to 0 - 100 range
        position = Math.min(100, Math.max(0, position));

        this.colorStops = this.colorStops.map((stop, index) => {
            if (index === this.activeDragHandle) {
                return {
                    ...stop,
                    position
                };
            }
            return stop;
        });
    };

    private handleMouseUp = () => {
        this.endDrag();
    };

    private interpolateColorAtPosition(position: number): string {
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);

        let leftStop = sortedStops[0];
        let rightStop = sortedStops[sortedStops.length - 1];

        for (let i = 0; i < sortedStops.length - 1; i++) {
            if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
                leftStop = sortedStops[i];
                rightStop = sortedStops[i + 1];
                break;
            }
        }

        const leftColor = colord(leftStop.color).toRgb();
        const rightColor = colord(rightStop.color).toRgb();

        if (!leftColor || !rightColor) {
            return '#ff0000'; // Fallback color
        }

        // Calculate the percentage between the two stops
        const range = rightStop.position - leftStop.position;
        const factor = range === 0 ? 0 : (position - leftStop.position) / range;

        // Interpolate RGB values
        const r = Math.round(leftColor.r + factor * (rightColor.r - leftColor.r));
        const g = Math.round(leftColor.g + factor * (rightColor.g - leftColor.g));
        const b = Math.round(leftColor.b + factor * (rightColor.b - leftColor.b));

        return `rgb(${r}, ${g}, ${b})`;
    }

    private generateGradientCSS(): string {
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        const stopsCSS = sortedStops.map(stop => {
            const normalizedColor = colord(stop.color).toRgbString();
            return `${normalizedColor} ${stop.position}%`;
        }).join(', ');

        if (this.gradientType === 'linear') {
            return `linear-gradient(${this.angle}deg, ${stopsCSS})`;
        } else if (this.gradientType === 'radial') {
            return `radial-gradient(circle, ${stopsCSS})`;
        } else {
            return `conic-gradient(from ${this.angle}deg, ${stopsCSS})`;
        }
    }

    private generateLinearGradientCSS(): string {
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        const stopsCSS = sortedStops.map(stop => {
            const normalizedColor = colord(stop.color).toRgbString();
            return `${normalizedColor} ${stop.position}%`;
        }).join(', ');

        // Always use 90deg (left to right) for the gradient bar
        return `linear-gradient(90deg, ${stopsCSS})`;
    }
}