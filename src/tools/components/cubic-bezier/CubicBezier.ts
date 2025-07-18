import { html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { renderCopyButton } from '../../../utils/util';
import BezierEasing from 'bezier-easing';

@customElement('cubic-bezier')
export class CubicBezier extends BaseTool {
    @state() private x1 = 0.58;
    @state() private y1 = 0;
    @state() private x2 = 0.42;
    @state() private y2 = 1;
    @state() private isCopied = false;
    @state() private animationId: number | null = null;
    @state() private linearAnimationId: number | null = null;
    @state() private easing: any = null;
    @state() private linearEasing = BezierEasing(0, 0, 1, 1);
    @state() private isDragging = false;

    @query('.bezier-line') private bezierLine!: HTMLElement;
    @query('.bezier-block') private bezierBlock!: HTMLElement;
    @query('.linear-block') private linearBlock!: HTMLElement;
    @query('.p1') private p1Element!: HTMLElement;
    @query('.p2') private p2Element!: HTMLElement;
    @query('.bezier-preview') private previewContainer!: HTMLElement;

    private presets = {
        linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
        easeIn: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
        easeOut: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
        easeInOut: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 }
    };

    connectedCallback() {
        super.connectedCallback();
        this.updateEasing();
    }

    disconnectedCallback() {
        this.stopAllAnimations();
        super.disconnectedCallback();
    }

    private stopAllAnimations() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.linearAnimationId !== null) {
            cancelAnimationFrame(this.linearAnimationId);
            this.linearAnimationId = null;
        }
    }

    updated(changedProperties: Map<string, any>) {
        super.updated(changedProperties);
        
        if (changedProperties.has('x1') || 
            changedProperties.has('y1') || 
            changedProperties.has('x2') || 
            changedProperties.has('y2')) {
            this.updateEasing();
            this.drawCurve();
            
            if (this.bezierBlock && !this.isDragging) {
                this.restartAnimation();
            }
        }
        
        if (changedProperties.has('isDragging')) {
            if (!this.isDragging) {
                this.restartAnimation();
            }
        }
    }

    private updateEasing() {
        try {
            this.easing = BezierEasing(this.x1, this.y1, this.x2, this.y2);
        } catch (e) {
            console.error("Invalid bezier values:", e);
            // Use a fallback if values are invalid
            this.easing = BezierEasing(0.42, 0, 0.58, 1);
        }
    }

    firstUpdated() {
        this.drawCurve();
        
        this.setupDragHandlers(this.p1Element, (x, y) => {
            this.x1 = Math.max(0, Math.min(1, x));
            this.y1 = Math.max(-1, Math.min(2, y)); // Allow extending beyond the control panel
        });
        
        this.setupDragHandlers(this.p2Element, (x, y) => {
            this.x2 = Math.max(0, Math.min(1, x));
            this.y2 = Math.max(-1, Math.min(2, y)); // Allow extending beyond the control panel
        });

        this.startAnimations();
    }

    private applyPreset(preset: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut') {
        const values = this.presets[preset];
        this.x1 = values.x1;
        this.y1 = values.y1;
        this.x2 = values.x2;
        this.y2 = values.y2;
    }

    protected renderTool() {
        return html`
            <style>
            .bezier-preview {
                height: 80px;
                position: relative;
                overflow: hidden;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 2px;
                background-color: var(--vscode-editor-background);
                margin-bottom: 8px;
                padding: 0 20px;
            }
            
            .bezier-block {
                width: 20px;
                height: 20px;
                background-color: var(--vscode-button-background);
                position: absolute;
                top: 15px;
                border-radius: 2px;
            }
            
            .linear-block {
                width: 20px;
                height: 20px;
                background-color: #777;
                position: absolute;
                top: 45px;
                border-radius: 2px;
            }
            
            .bezier-control {
                position: relative;
                width: 100%;
                height: 200px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 2px;
                margin: 16px 0;
                background-color: var(--vscode-editor-background);
            }
            
            .bezier-grid {
                position: absolute;
                width: 100%;
                height: 100%;
                background-size: 20px 20px;
                background-image:
                    linear-gradient(to right, var(--vscode-panel-border) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--vscode-panel-border) 1px, transparent 1px);
                background-position: center;
                opacity: 0.4;
            }
            
            .bezier-point {
                position: absolute;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                cursor: move;
                z-index: 2;
            }
            
            .bezier-point.p1 {
                background-color: var(--vscode-terminal-ansiCyan);
            }
            
            .bezier-point.p2 {
                background-color: var(--vscode-terminal-ansiYellow);
            }
            
            .bezier-point.fixed {
                background-color: var(--vscode-foreground);
                cursor: default;
            }
            
            .bezier-line {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .preview-track {
                position: absolute;
                bottom: 8px;
                left: 20px;
                right: 20px;
                height: 1px;
                background-color: var(--vscode-panel-border);
            }
            
            .bezier-output {
                font-family: var(--vscode-editor-font-family);
                word-spacing: -3px;
            }
            
            .p1-value {
                color: var(--vscode-terminal-ansiCyan);
            }
            
            .p2-value {
                color: var(--vscode-terminal-ansiYellow);
            }
            
            .coordinate-display {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                position: absolute;
                background: var(--vscode-editor-background);
                padding: 2px 5px;
                border-radius: 3px;
                border: 1px solid var(--vscode-panel-border);
                opacity: 0.9;
                pointer-events: none;
            }
            
            .p1-coords {
                left: ${this.x1 * 100}%;
                top: ${(1 - this.y1) * 100 + 15}%;
            }
            
            .p2-coords {
                left: ${this.x2 * 100}%;
                top: ${(1 - this.y2) * 100 + 15}%;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Create and visualize CSS cubic-bezier timing functions.</p>
                <hr />

                <!-- CSS Output Field with Colored Values -->
                <div class="my-4">
                    <div class="relative">
                        <div class="input-expandable code-block">
                            <pre class="bezier-output">cubic-bezier(<span class="p1-value">${this.x1.toFixed(2)}, ${this.y1.toFixed(2)}</span>, <span class="p2-value">${this.x2.toFixed(2)}, ${this.y2.toFixed(2)}</span>)</pre>
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
                </div>

                <!-- Preview Panel -->
                <div class="bezier-preview">
                    <div class="preview-track"></div>
                    <div class="bezier-block"></div>
                    <div class="linear-block"></div>
                </div>

                <!-- Cubic Bezier Curve Control Panel -->
                <div class="bezier-control">
                    <div class="bezier-grid"></div>
                    <svg class="bezier-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="" fill="none" stroke="var(--vscode-button-background)" stroke-width="1.5"></path>
                        <path d="M 0,100 L 100,0" fill="none" stroke="#7774" stroke-width="1.5"></path>
                        <path class="control-line control-line-1" d="" fill="none" stroke="var(--vscode-descriptionForeground)" stroke-width="0.5"></path>
                        <path class="control-line control-line-2" d="" fill="none" stroke="var(--vscode-descriptionForeground)" stroke-width="0.5"></path>
                    </svg>
                    <div class="bezier-point fixed" style="left: 0%; top: 100%;"></div>
                    <div class="bezier-point fixed" style="left: 100%; top: 0%;"></div>
                    <div class="bezier-point p1" style="left: ${this.x1 * 100}%; top: ${(1 - this.y1) * 100}%;"></div>
                    <div class="bezier-point p2" style="left: ${this.x2 * 100}%; top: ${(1 - this.y2) * 100}%;"></div>
                </div>

                <div class="flex justify-between my-2 gap-2">
                    <button @click=${() => this.applyPreset('linear')} class="btn-outline preset-button">
                        <span>Linear</span>
                    </button>
                    <button @click=${() => this.applyPreset('easeIn')} class="btn-outline preset-button">
                        <span>Ease In</span>
                    </button>
                </div>

                <div class="flex justify-between mt-2 mb-4 gap-2">
                    <button @click=${() => this.applyPreset('easeOut')} class="btn-outline preset-button">
                        <span>Ease Out</span>
                    </button>
                    <button @click=${() => this.applyPreset('easeInOut')} class="btn-outline preset-button">
                        <span>Ease In Out</span>
                    </button>
                </div>
            </div>
        `;
    }

    private setupDragHandlers(element: HTMLElement, updateCallback: (x: number, y: number) => void) {
        let isDragging = false;
        const container = element.parentElement as HTMLElement;
        
        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            this.isDragging = true; // Set component-level dragging state
            
            // Pause animations while dragging
            this.stopAllAnimations();
            
            e.preventDefault();
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) { return; }
            
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1 - (e.clientY - rect.top) / rect.height;
            
            updateCallback(x, y);
        };
        
        const onMouseUp = () => {
            isDragging = false;
            this.isDragging = false; // Reset component-level dragging state
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        element.addEventListener('mousedown', onMouseDown);
    }

    private drawCurve() {
        if (!this.bezierLine) { return; }
    
        const path = this.bezierLine.querySelector('path');
        const controlLine1 = this.bezierLine.querySelector('.control-line-1');
        const controlLine2 = this.bezierLine.querySelector('.control-line-2');
        
        if (!path || !controlLine1 || !controlLine2) { return; }
        
        // Create a bezier curve path from (0,100) to (100,0) using control points
        path.setAttribute('d', `M 0,100 C ${this.x1 * 100},${(1 - this.y1) * 100} ${this.x2 * 100},${(1 - this.y2) * 100} 100,0`);
        
        controlLine1.setAttribute('d', `M 0,100 L ${this.x1 * 100},${(1 - this.y1) * 100}`);
        controlLine2.setAttribute('d', `M 100,0 L ${this.x2 * 100},${(1 - this.y2) * 100}`);
    }

    private startAnimations() {
        this.startBezierAnimation();
        this.startLinearAnimation();
    }

    private startBezierAnimation() {
        if (!this.bezierBlock || !this.previewContainer) { return; }
        
        let startTime: number | null = null;
        const duration = 2000;
        const getMaxX = () => {
            const containerWidth = this.previewContainer.clientWidth;
            const blockWidth = 20;
            const bufferSize = 40;
            return containerWidth - blockWidth - bufferSize;
        };
        
        const animate = (timestamp: number) => {
            if (!startTime) { startTime = timestamp; }
            const elapsed = (timestamp - startTime) % duration;
            const progress = elapsed / duration;
            
            // Use bezier-easing library to calculate the y value
            const y = this.easing ? this.easing(progress) : progress;
            
            // This allows negative values to still be visible
            const maxX = getMaxX();
            const initialPos = 20; // Left buffer
            this.bezierBlock.style.left = `${initialPos + y * maxX}px`;
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    private startLinearAnimation() {
        if (!this.linearBlock || !this.previewContainer) { return; }
        
        let startTime: number | null = null;
        const duration = 2000;
        const getMaxX = () => {
            const containerWidth = this.previewContainer.clientWidth;
            const blockWidth = 20;
            const bufferSize = 40;
            return containerWidth - blockWidth - bufferSize;
        };
        
        const animate = (timestamp: number) => {
            if (!startTime) { startTime = timestamp; }
            const elapsed = (timestamp - startTime) % duration;
            const progress = elapsed / duration;
            
            // Standard linear easing
            const y = this.linearEasing(progress);
            
            // This allows negative values to still be visible
            const maxX = getMaxX();
            const initialPos = 20; // Left buffer
            this.linearBlock.style.left = `${initialPos + y * maxX}px`;
            this.linearAnimationId = requestAnimationFrame(animate);
        };
        
        this.linearAnimationId = requestAnimationFrame(animate);
    }
    
    private restartAnimation() {
        this.stopAllAnimations();
        this.startAnimations();
    }

    private async copyToClipboard() {
        const output = `cubic-bezier(${this.x1.toFixed(2)}, ${this.y1.toFixed(2)}, ${this.x2.toFixed(2)}, ${this.y2.toFixed(2)})`;
        
        try {
            await navigator.clipboard.writeText(output);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }
}