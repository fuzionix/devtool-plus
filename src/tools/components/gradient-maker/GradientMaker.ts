import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
// import { colord, extend } from 'colord';
// import mixPlugin from 'colord/plugins/mix';

// extend([mixPlugin]);

interface ColorStop {
    position: number;  // 0-100 percentage
    color: string;
    selected: boolean;
}

type GradientType = 'linear' | 'radial' | 'conic';

@customElement('gradient-maker')
export class GradientMaker extends BaseTool {
    @state() private colorStops: ColorStop[] = [
        { position: 0, color: '#3366ff', selected: true },
        { position: 100, color: '#ff6699', selected: false }
    ];

    @state() private gradientType: GradientType = 'linear';
    @state() private angle: number = 90;

    static styles = css`
    ${BaseTool.styles}
    
  `;

    constructor() {
        super();
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
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 8px;
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

        .result-gradient {
            position: absolute;
            inset: 0;
            z-index: 1;
        }

        .gradient-bar-container {
            position: relative;
            height: 24px;
            border-radius: 2px;
            margin: 8px 0;
            cursor: crosshair;
            overflow: hidden;
        }
        
        .gradient-bar {
            width: 100%;
            height: 100%;
        }
        
        .gradient-bar::before {
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
        </style>
        <div class="tool-inner-container">
            <p class="opacity-75">Create and customize CSS gradients with multiple color stops.</p>
            <hr />

            <!-- Result Container -->
            <div class="result-container">
                <div class="result-gradient" style="background: ${gradientCSS}"></div>
            </div>

            <!-- Arrow Divider -->
            <div class="flex justify-center my-4 opacity-75 rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </div>
        </div>
    `;
    }

    private generateGradientCSS(): string {
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        const stopsCSS = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

        if (this.gradientType === 'linear') {
            return `linear-gradient(${this.angle}deg, ${stopsCSS})`;
        } else if (this.gradientType === 'radial') {
            return `radial-gradient(circle, ${stopsCSS})`;
        } else {
            return `conic-gradient(from ${this.angle}deg, ${stopsCSS})`;
        }
    }
}