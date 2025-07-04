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
        const gradientCSS = this.generateGradientCSS();

        return html`
            <style>
            .result-container {
                position: relative;
                height: 60px;
                border-radius: 2px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
                border: 1px solid var(--vscode-widget-border);
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
                border-radius: 6px;
                border: 2px solid white;
                box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25);
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
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Create and customize CSS gradients with multiple color stops.</p>
                <hr />

                <!-- Result Container -->
                <div class="result-container">
                    <div style="position: absolute; inset: 0; background: ${gradientCSS}"></div>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center my-4 opacity-75 rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Gradient Bar -->
                <div class="gradient-bar-container" 
                     @click="${this.handleBarClick}" 
                     @mousedown="${this.handleBarMouseDown}">
                    <div class="gradient-bar-background">
                        <div class="gradient-bar" style="background: ${gradientCSS}"></div>
                    </div>
                    <div class="color-stop-handles">
                        ${this.colorStops.map((stop, index) => this.renderColorHandle(stop, index))}
                    </div>
                </div>

                <!-- Options will go here -->

                <!-- Color list will go here -->
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
}