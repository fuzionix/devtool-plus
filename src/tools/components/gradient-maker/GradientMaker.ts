import { html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { renderCopyButton } from '../../../utils/util';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import namesPlugin from 'colord/plugins/names';

extend([mixPlugin, namesPlugin]);

interface ColorStop {
    id: string;
    position: number;  // 0 - 100 percentage
    color: string;
    selected: boolean;
}

type GradientType = 'linear' | 'radial' | 'conic';

@customElement('gradient-maker')
export class GradientMaker extends BaseTool {
    @state() private gradientType: GradientType = 'linear';
    @state() private angle: number = 90;
    @state() private isDragging: boolean = false;
    @state() private activeDragHandleId: string | null = null;
    @state() private lastDragEndTime: number = 0;
    @state() private outputFormat: boolean = true; // true = 'hex', false = 'rgb'
    @state() private isCopied: boolean = false;

    @state() private colorStops: ColorStop[] = [
        { 
            id: crypto.randomUUID(), 
            position: 0, 
            color: this.outputFormat ? '#0f23fa' : 'rgb(15, 35, 250)', 
            selected: false 
        },
        { 
            id: crypto.randomUUID(), 
            position: 50, 
            color: this.outputFormat ? '#0f85fa' : 'rgb(15, 133, 250)', 
            selected: true 
        },
        { 
            id: crypto.randomUUID(), 
            position: 100, 
            color: this.outputFormat ? '#0fe7fa' : 'rgb(15, 231, 250)', 
            selected: false 
        }
    ];

    @query('.gradient-bar-container') private gradientBar!: HTMLElement;

    private styles = css`
        ${BaseTool.styles}

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
            margin: 16px 0 8px;
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
            z-index: 3;
        }

        .color-handle.selected::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background-color: white;
            box-shadow: 0 0 0 2px black;
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
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
        
        .code-keyword {
            color: var(--vscode-symbolIcon-variableForeground, #5bbec3);
        }
        
        .code-function {
            color: var(--vscode-symbolIcon-functionForeground, #c586c0);
        }
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
        const cssOutput = `background: ${resultGradientCSS};`;

        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Create and customize CSS gradients with multiple color stops.</p>
                <hr />

                <!-- Result Container -->
                <div class="result-container">
                    <div style="position: absolute; inset: 0; background: ${resultGradientCSS}"></div>
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
                        ${this.colorStops
                            .sort((a, b) => a.position - b.position)
                            .map(stop => this.renderColorHandle(stop))}
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
                                .value="${this.angle}°"
                                type="text" 
                                class="flex-1 h-[32px] ml-2 !py-[6px] text-center !bg-transparent" 
                                @input="${(e: InputEvent) => this.handleInputAngleChange(e)}"
                            />
                        </div>
                    </div>
                </div>

                <!-- Color List -->
                <div class="color-list">
                    ${this.colorStops
                        .sort((a, b) => a.position - b.position)
                        .map(stop => this.renderColorListItem(stop))}
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>
                
                <!-- CSS Output Field -->
                <div class="mt-2 mb-2">
                    <div class="relative">
                        <div class="input-expandable code-block">
                            ${this.renderHighlightedCode(cssOutput)}
                        </div>
                        <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                            <button 
                                id="copy" 
                                class="btn-icon"
                                @click=${this.copyToClipboard}
                            >
                                ${renderCopyButton(this.isCopied)}
                            </button>
                        </div>
                    </div>

                    <div class="mt-2">
                        <tool-switch
                            .checked="${this.outputFormat}"
                            leftLabel="RGB"
                            rightLabel="HEX"
                            ariaLabel="Color Format"
                            @change=${this.handleOutputFormatChange}
                        ></tool-switch>
                    </div>
                </div>
            </div>
        `;
    }

    private renderHighlightedCode(code: string) {
        const parts = [];
        
        // Highlight 'background' property
        const bgSplit = code.split('background:');
        
        if (bgSplit.length > 1) {
            parts.push(html`<span class="code-keyword">background</span>:`);
            const remainingCode = bgSplit[1];
            
            const gradientTypes = ['linear-gradient', 'radial-gradient', 'conic-gradient'];
            let highlighted = false;
            
            for (const gradType of gradientTypes) {
                if (remainingCode.includes(gradType)) {
                    const funcSplit = remainingCode.split(gradType);
                    parts.push(funcSplit[0]);
                    parts.push(html`<span class="code-function">${gradType}</span>`);
                    parts.push(funcSplit[1]);
                    highlighted = true;
                    break;
                }
            }
            
            if (!highlighted) {
                parts.push(remainingCode);
            }
        } else {
            parts.push(code);
        }
        
        return parts;
    }

    private renderColorHandle(stop: ColorStop) {
        return html`
            <div 
                class="color-handle ${stop.selected ? 'selected' : ''}"
                style="left: ${stop.position}%; background-color: ${stop.color};"
                @mousedown="${(e: MouseEvent) => this.handleColorHandleMouseDown(e, stop.id)}"
                @click="${(e: MouseEvent) => this.handleColorHandleClick(e, stop.id)}">
            </div>
        `;
    }

    private renderColorListItem(stop: ColorStop) {
        return html`
            <div 
                class="color-item ${stop.selected ? 'selected' : ''}" 
                @click="${() => this.selectColorStop(stop.id)}"
            >
                <input 
                    type="text"
                    class="color-hex-input"
                    .value="${stop.color}"
                    @input="${(e: InputEvent) => this.handleHexInput(e, stop.id)}"
                    @blur="${(e: FocusEvent) => this.validateHexInput(e, stop.id)}"
                />

                <div class="w-[1px] h-5 bg-[var(--vscode-panel-border)]"></div>
                
                <div class="flex items-center gap-1">
                    <input 
                        type="number"
                        class="color-position-input"
                        min="0"
                        max="100"
                        .value="${Math.round(stop.position)}"
                        @input="${(e: InputEvent) => this.handlePositionInput(e, stop.id)}"
                    />
                </div>

                <div class="w-[1px] h-5 bg-[var(--vscode-panel-border)]"></div>

                <div class="">
                    <tool-color-picker
                        class="mt-1 w-6 h-6"
                        .value="${stop.color}"
                        .format="${this.outputFormat ? 'hex' : 'rgb'}"
                        @change="${(e: CustomEvent) => this.handleColorChange(e, stop.id)}"
                    ></tool-color-picker>
                </div>
                
                <button 
                    class="remove-button"
                    ?disabled="${this.colorStops.length <= 2}"
                    @click="${(e: MouseEvent) => this.handleRemoveColor(e, stop.id)}"
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

    private selectColorStop(id: string) {
        this.colorStops = this.colorStops.map(stop => ({
            ...stop,
            selected: stop.id === id
        }));
    }

    private handleHexInput(e: InputEvent, id: string) {
        const input = e.target as HTMLInputElement;
        let value = input.value;
        
        if (value.length > 0 && !value.startsWith('#')) {
            value = '#' + value;
            input.value = value;
        }
        
        if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
            this.updateColorStop(id, { color: value });
        }
    }

    private validateHexInput(e: FocusEvent, id: string) {
        const input = e.target as HTMLInputElement;
        const value = input.value;
        
        const stop = this.colorStops.find(s => s.id === id);
        if (!stop) { return; }
        
        // If not a valid hex color, revert to the original value
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
            input.value = stop.color;
        } else {
            // Normalize to the full 6-digit hex if it's a 3-digit shorthand
            const normalizedHex = colord(value).toHex();
            input.value = normalizedHex;
            this.updateColorStop(id, { color: normalizedHex });
        }
    }

    private handlePositionInput(e: InputEvent, id: string) {
        const input = e.target as HTMLInputElement;
        const position = Math.min(100, Math.max(0, parseInt(input.value) || 0));
        
        this.updateColorStop(id, { position });
    }

    private handleColorChange(e: CustomEvent, id: string) {
        const value = e.detail.value;
        this.updateColorStop(id, { color: value });
    }

    private handleRemoveColor(e: MouseEvent, id: string) {
        e.stopPropagation();
        
        if (this.colorStops.length <= 2) {
            return;
        }
        
        const newStops = this.colorStops.filter(stop => stop.id !== id);
        
        // If we removed the selected stop, select the first one
        const wasSelected = this.colorStops.find(stop => stop.id === id)?.selected || false;
        if (wasSelected && newStops.length > 0) {
            newStops[0].selected = true;
        }
        
        this.colorStops = newStops;
    }

    private updateColorStop(id: string, updates: Partial<ColorStop>) {
        this.colorStops = this.colorStops.map(stop => {
            if (stop.id === id) {
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
        
        // Prevent adding a new stop if we just finished dragging (within 200ms)
        const now = Date.now();
        if (now - this.lastDragEndTime < 200) {
            return;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
        let newColor;
        if (this.outputFormat) {
            newColor = colord(this.interpolateColorAtPosition(position)).toHex();
        } else {
            newColor = colord(this.interpolateColorAtPosition(position)).toRgbString();
        }

        // Deselect all existing stops
        const updatedStops = this.colorStops.map(stop => ({
            ...stop,
            selected: false
        }));

        const newStop = {
            id: crypto.randomUUID(),
            position,
            color: newColor,
            selected: true
        };

        updatedStops.push(newStop);

        this.colorStops = updatedStops;
    }

    private handleColorHandleClick(e: MouseEvent, id: string) {
        e.stopPropagation();

        // Update selection state
        this.colorStops = this.colorStops.map(stop => ({
            ...stop,
            selected: stop.id === id
        }));
    }

    private handleColorHandleMouseDown(e: MouseEvent, id: string) {
        e.stopPropagation();
        e.preventDefault();

        this.startDrag(id);

        // Update selection
        this.colorStops = this.colorStops.map(stop => ({
            ...stop,
            selected: stop.id === id
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

    private handleInputAngleChange(e: InputEvent) {
        const input = e.target as HTMLInputElement;
        let value = parseInt(input.value.replace('°', '')) || 0;
        value = Math.min(360, Math.max(0, value));
        this.angle = value;
        input.value = `${value}°`;
    }

    private startDrag(id: string) {
        this.isDragging = true;
        this.activeDragHandleId = id;
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        document.body.style.userSelect = 'none';
    }

    private endDrag() {
        this.isDragging = false;
        this.activeDragHandleId = null;
        this.lastDragEndTime = Date.now();
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        document.body.style.userSelect = '';
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging || !this.activeDragHandleId || !this.gradientBar) {
            return;
        }

        const rect = this.gradientBar.getBoundingClientRect();

        // Clamp the x position to the bar width, but allow the calculation to work outside
        let clientX = e.clientX;
        let position = ((clientX - rect.left) / rect.width) * 100;

        // Clamp position to 0 - 100 range
        position = Math.min(100, Math.max(0, position));

        // Update the position of the active handle by ID
        this.colorStops = this.colorStops.map(stop => {
            if (stop.id === this.activeDragHandleId) {
                return {
                    ...stop,
                    position
                };
            }
            return stop;
        });
    };

    private handleMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        this.endDrag();
    };

    private handleOutputFormatChange(e: CustomEvent) {
        const newFormat = e.detail.checked;
        this.outputFormat = newFormat;

        this.colorStops = this.colorStops.map(stop => {
            return {
                ...stop,
                color: this.formatColor(stop.color, newFormat)
            };
        });
    }

    private formatColor(color: string, format: boolean): string {
        const colorObj = colord(color);
        return format ? colorObj.toHex() : colorObj.toRgbString();
    }

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
            const formattedColor = this.formatColor(stop.color, this.outputFormat);
            return `${formattedColor} ${Math.round(stop.position)}%`;
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

        return `linear-gradient(90deg, ${stopsCSS})`;
    }

    private async copyToClipboard() {
        const cssOutput = `background: ${this.generateGradientCSS()};`;
        if (!cssOutput) { return; }
        
        try {
            await navigator.clipboard.writeText(cssOutput);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }
}