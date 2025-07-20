import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tool-color-picker')
export class ColorPicker extends LitElement {
    @property({ type: String }) value = '#3399ff';
    @property({ type: Boolean }) showAlpha = true;
    @property({ type: String }) format: 'hex' | 'rgb' | 'hsl' = 'hex';
    
    @state() private isOpen = false;
    @state() private hue = 210;         // 0: red, 120: green, 240: blue
    @state() private saturation = 100;  // 0: 0% (gray), 100: 100%: full color 
    @state() private lightness = 60;    // 0: black, 100: white
    @state() private alpha = 100;       // 0: fully transparent, 100: fully opaque
    @state() private isDraggingColor = false;
    @state() private isDraggingHue = false;
    @state() private pointerX = 100;    // Visual pointer X position (0-100%)
    @state() private pointerY = 0;      // Visual pointer Y position (0-100%)
    @state() private rgbCache = { r: 51, g: 153, b: 255 };

    // Keep track of the last processed value to avoid redundant processing
    private lastProcessedValue = '';

    // For positioning and mouse interactions
    private colorRect?: DOMRect;
    private hueRect?: DOMRect;

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
        }

        .color-button {
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 2px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .color-button:hover {
            border-color: var(--vscode-focusBorder);
        }

        .color-button::before {
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

        .color-button-inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .picker-panel {
            position: absolute;
            top: calc(100% + 5px);
            right: 0;
            width: 200px;
            background: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 8px;
            z-index: 1000;
            display: none;
            user-select: none;
        }

        .picker-panel.open {
            display: block;
        }

        .color-area {
            position: relative;
            width: 100%;
            height: 150px;
            margin-bottom: 8px;
            border-radius: 2px;
            cursor: crosshair;
            background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);
        }

        .color-area-pointer {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        .hue-slider {
            position: relative;
            width: 100%;
            height: 10px;
            margin-bottom: 8px;
            border-radius: 2px;
            background: linear-gradient(to right, 
                #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
            cursor: pointer;
        }

        .hue-slider-handle {
            position: absolute;
            width: 2px;
            height: 14px;
            background: black;
            border: 0.5px solid white;
            border-radius: 2px;
            top: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        .alpha-slider {
            position: relative;
            width: 100%;
            height: 10px;
            margin-bottom: 8px;
            cursor: pointer;
        }

        .alpha-slider-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 2px;
            overflow: hidden;
            background-image: 
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px -5px, -5px 0;
        }

        .alpha-slider-inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 2px;
        }

        .alpha-slider-handle {
            position: absolute;
            width: 2px;
            height: 14px;
            background: black;
            border: 0.5px solid white;
            border-radius: 2px;
            top: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        .color-inputs {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .color-input {
            flex: 1;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 2px;
            padding: 2px 6px;
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        .color-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }

        .format-toggle {
            font-size: 11px;
            color: white;
            background-color: transparent;
            border: none;
            opacity: 0.75;
            cursor: pointer;
            transition: opacity 100ms ease-in-out;
        }

        .format-toggle:hover {
            opacity: 1;
        }
    `;

    constructor() {
        super();
        this.parseColor(this.value);
        this.lastProcessedValue = this.value;

        this.updatePointerPositions();
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('value') && this.value !== this.lastProcessedValue) {
            this.parseColor(this.value);
            this.lastProcessedValue = this.value;
            this.updatePointerPositions();
        }
    }

    private updatePointerPositions() {
        this.pointerX = this.saturation;
        if (this.lightness <= 50) {
            this.pointerY = 100 - (this.lightness * 2);
        } else {
            this.pointerY = 0;
        }
    }

    render() {
        const colorStyle = this.getColorStyle();
        const huePosition = (this.hue / 360) * 100;
        const alphaPosition = this.alpha;
        
        return html`
            <div class="color-button" @click="${this.togglePanel}">
                <div class="color-button-inner" style="background: ${colorStyle}"></div>
            </div>
            <div class="picker-panel ${this.isOpen ? 'open' : ''}">
                <div 
                    class="color-area" 
                    style="background-color: hsl(${this.hue}, 100%, 50%)"
                    @mousedown="${this.startDragColor}"
                    @touchstart="${this.startDragColor}"
                >
                    <div class="color-area-pointer" style="left: ${this.pointerX}%; top: ${this.pointerY}%"></div>
                </div>
                <div 
                    class="hue-slider" 
                    @mousedown="${this.startDragHue}"
                    @touchstart="${this.startDragHue}"
                >
                    <div class="hue-slider-handle" style="left: ${huePosition}%"></div>
                </div>
                ${this.showAlpha ? html`
                    <div 
                        class="alpha-slider"
                        @mousedown="${this.handleAlphaMouseDown}"
                        @touchstart="${this.handleAlphaMouseDown}"
                    >
                        <div class="alpha-slider-background"></div>
                        <div class="alpha-slider-inner" style="background: linear-gradient(to right, transparent, ${this.getColorWithoutAlpha()})"></div>
                        <div class="alpha-slider-handle" style="left: ${alphaPosition}%"></div>
                    </div>
                ` : ''}
                <div class="color-inputs">
                    <input 
                        type="text" class="color-input" 
                        .value="${this.getFormattedColor()}" 
                        @input="${this.handleInputChange}" 
                    />
                    <button class="format-toggle" @click="${this.cycleFormat}">
                        ${this.format.toUpperCase()}
                    </button>
                </div>
            </div>
        `;
    }

    private togglePanel() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.addGlobalListeners();
        } else {
            this.removeGlobalListeners();
        }
    }

    private closePanel() {
        this.isOpen = false;
        this.removeGlobalListeners();
    }

    private addGlobalListeners() {
        window.addEventListener('mousedown', this.handleClickOutside);
        window.addEventListener('resize', this.closePanel);
    }

    private removeGlobalListeners() {
        window.removeEventListener('mousedown', this.handleClickOutside);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('resize', this.closePanel);
    }

    private handleClickOutside = (e: MouseEvent) => {
        const path = e.composedPath();
        if (!path.includes(this)) {
            this.closePanel();
        }
    };

    private startDragColor(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        this.isDraggingColor = true;
        
        const colorArea = this.shadowRoot?.querySelector('.color-area') as HTMLElement;
        this.colorRect = colorArea.getBoundingClientRect();
        
        if (e instanceof MouseEvent) {
            this.updateColorFromPosition(e.clientX, e.clientY);
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        } else {
            const touch = e.touches[0];
            this.updateColorFromPosition(touch.clientX, touch.clientY);
            window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            window.addEventListener('touchend', this.handleTouchEnd);
        }
    }

    private startDragHue(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        this.isDraggingHue = true;
        
        const hueSlider = this.shadowRoot?.querySelector('.hue-slider') as HTMLElement;
        this.hueRect = hueSlider.getBoundingClientRect();
        
        if (e instanceof MouseEvent) {
            this.updateHueFromPosition(e.clientX);
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        } else {
            const touch = e.touches[0];
            this.updateHueFromPosition(touch.clientX);
            window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            window.addEventListener('touchend', this.handleTouchEnd);
        }
    }

    private handleAlphaMouseDown(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        const alphaSlider = this.shadowRoot?.querySelector('.alpha-slider') as HTMLElement;
        const rect = alphaSlider.getBoundingClientRect();
        
        const updateAlpha = (clientX: number) => {
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            this.alpha = Math.round((x / rect.width) * 100);
            this.updateValue();
        };
        
        if (e instanceof MouseEvent) {
            updateAlpha(e.clientX);
            
            const handleMouseMove = (e: MouseEvent) => {
                updateAlpha(e.clientX);
            };
            
            const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            const touch = e.touches[0];
            updateAlpha(touch.clientX);
            
            const handleTouchMove = (e: TouchEvent) => {
                e.preventDefault();
                const touch = e.touches[0];
                updateAlpha(touch.clientX);
            };
            
            const handleTouchEnd = () => {
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            };
            
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (this.isDraggingColor && this.colorRect) {
            this.updateColorFromPosition(e.clientX, e.clientY);
        } else if (this.isDraggingHue && this.hueRect) {
            this.updateHueFromPosition(e.clientX);
        }
    };

    private handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        
        if (this.isDraggingColor && this.colorRect) {
            this.updateColorFromPosition(touch.clientX, touch.clientY);
        } else if (this.isDraggingHue && this.hueRect) {
            this.updateHueFromPosition(touch.clientX);
        }
    };

    private handleMouseUp = () => {
        this.isDraggingColor = false;
        this.isDraggingHue = false;
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    };

    private handleTouchEnd = () => {
        this.isDraggingColor = false;
        this.isDraggingHue = false;
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    };

    private updateColorFromPosition(clientX: number, clientY: number) {
        if (!this.colorRect) {
            return;
        }
        
        // Calculate visual pointer position
        const x = Math.max(0, Math.min(clientX - this.colorRect.left, this.colorRect.width));
        const y = Math.max(0, Math.min(clientY - this.colorRect.top, this.colorRect.height));
        
        this.pointerX = Math.round((x / this.colorRect.width) * 100);
        this.pointerY = Math.round((y / this.colorRect.height) * 100);
        
        // Convert pointer position to HSL values
        this.saturation = this.pointerX;
        
        // For the top row (y=0): right side is 50% lightness, left side is 100% lightness
        // For the bottom row (y=height): lightness is 0% across
        if (this.pointerY === 0) {
            // Top row: 100% to 50%
            this.lightness = 100 - (this.saturation / 2);
        } else if (this.pointerY === 100) {
            // Bottom row: always 0%
            this.lightness = 0;
        } else {
            // Interpolate between top and bottom rows
            const topLightness = 100 - (this.saturation / 2);
            this.lightness = Math.round(topLightness * (1 - this.pointerY / 100));
        }
        
        const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
        this.rgbCache = {
            r: Math.round(rgb.r),
            g: Math.round(rgb.g),
            b: Math.round(rgb.b)
        };
        
        this.updateValue();
    }

    private updateHueFromPosition(clientX: number) {
        if (!this.hueRect) {
            return;
        }
        
        const x = Math.max(0, Math.min(clientX - this.hueRect.left, this.hueRect.width));
        this.hue = Math.round((x / this.hueRect.width) * 360);
        
        const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
        this.rgbCache = {
            r: Math.round(rgb.r),
            g: Math.round(rgb.g),
            b: Math.round(rgb.b)
        };
        
        this.updateValue();
    }

    private getColorStyle() {
        if (this.showAlpha && this.alpha < 100) {
            return `rgba(${this.rgbCache.r}, ${this.rgbCache.g}, ${this.rgbCache.b}, ${this.alpha / 100})`;
        }
        return `rgb(${this.rgbCache.r}, ${this.rgbCache.g}, ${this.rgbCache.b})`;
    }

    private getColorWithoutAlpha() {
        return `rgb(${this.rgbCache.r}, ${this.rgbCache.g}, ${this.rgbCache.b})`;
    }

    private getFormattedColor() {
        switch (this.format) {
            case 'hex':
                return this.toHex();
            case 'rgb':
                return this.toRGB();
            case 'hsl':
                return this.toHSL();
            default:
                return this.toHex();
        }
    }

    private toHex() {
        const { r, g, b } = this.rgbCache;
        
        const toHex = (c: number) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        if (this.showAlpha && this.alpha < 100) {
            const alpha = toHex(Math.round((this.alpha / 100) * 255));
            return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`;
        }
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    private toRGB() {
        const { r, g, b } = this.rgbCache;
        
        if (this.showAlpha && this.alpha < 100) {
            return `rgba(${r}, ${g}, ${b}, ${this.alpha / 100})`;
        }
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    private toHSL() {
        if (this.showAlpha && this.alpha < 100) {
            return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha / 100})`;
        }
        
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }

    private updateValue() {
        const newValue = this.getFormattedColor();
        if (this.value !== newValue) {
            this.lastProcessedValue = newValue;
            this.value = newValue;
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: this.value },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleInputChange(e: InputEvent) {
        const input = e.target as HTMLInputElement;
        const value = input.value.trim();
        
        // Special case for hex colors - store exact value
        if (value.startsWith('#') && this.isValidHexColor(value)) {
            // Store the direct RGB values to avoid conversion errors
            const { r, g, b, a } = this.hexToRgb(value);
            this.rgbCache = { r, g, b };
            
            if (a !== undefined) {
                this.alpha = Math.round((a / 255) * 100);
            } else {
                this.alpha = 100;
            }
            
            // Still update HSL for UI interactions
            const { h, s, l } = this.rgbToHsl(r, g, b);
            this.hue = Math.round(h);
            this.saturation = Math.round(s);
            this.lightness = Math.round(l);
            
            this.updatePointerFromHsl();
            
            this.lastProcessedValue = value;
            this.value = value;
            this.format = 'hex';
            
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: this.value },
                bubbles: true,
                composed: true
            }));
            
            return;
        }
        
        if (this.parseColor(value)) {
            this.updateValue();
        }
    }
    
    private isValidHexColor(color: string): boolean {
        return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.test(color);
    }
    
    private hexToRgb(hex: string) {
        hex = hex.replace(/^#/, '');
        let r: number, g: number, b: number, a: number | undefined;
        
        if (hex.length === 6) {
            // 6 digits: #RRGGBB
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (hex.length === 8) {
            // 8 digits: #RRGGBBAA
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = parseInt(hex.substring(6, 8), 16);
        } else {
            // Invalid hex
            r = 0;
            g = 0;
            b = 0;
        }
        
        return { r, g, b, a };
    }
    
    private updatePointerFromHsl() {
        this.pointerX = this.saturation;
        
        if (this.lightness <= 50) {
            this.pointerY = 100 - (this.lightness * 2);
        } else {
            const factor = (this.lightness - 50) / 50;
            this.pointerY = 0;
            
            // Adjust saturation based on lightness
            if (this.saturation > 0) {
                this.pointerX = this.saturation - (this.saturation * factor);
            }
        }
    }

    private cycleFormat() {
        const formats = ['hex', 'rgb', 'hsl'] as const;
        const currentIndex = formats.indexOf(this.format);
        this.format = formats[(currentIndex + 1) % formats.length];
        this.updateValue();
    }

    private parseColor(color: string): boolean {
        // HEX
        const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
        
        // RGB(A)
        const rgbRegex = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i;
        
        // HSL(A)
        const hslRegex = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i;
        
        let match;
        
        // Try parsing as HEX
        if ((match = hexRegex.exec(color))) {
            const [, r, g, b, a] = match;
            const rVal = parseInt(r, 16);
            const gVal = parseInt(g, 16);
            const bVal = parseInt(b, 16);
            
            this.rgbCache = { r: rVal, g: gVal, b: bVal };
            
            const { h, s, l } = this.rgbToHsl(rVal, gVal, bVal);
            this.hue = Math.round(h);
            this.saturation = Math.round(s);
            this.lightness = Math.round(l);
            
            if (a) {
                this.alpha = Math.round((parseInt(a, 16) / 255) * 100);
            } else {
                this.alpha = 100;
            }
            
            this.updatePointerFromHsl();
            return true;
        }
        
        // Try parsing as RGB
        if ((match = rgbRegex.exec(color))) {
            const [, r, g, b, a] = match;
            const rVal = parseInt(r);
            const gVal = parseInt(g);
            const bVal = parseInt(b);
            
            this.rgbCache = { r: rVal, g: gVal, b: bVal };
            
            const { h, s, l } = this.rgbToHsl(rVal, gVal, bVal);
            this.hue = Math.round(h);
            this.saturation = Math.round(s);
            this.lightness = Math.round(l);
            
            if (a !== undefined) {
                this.alpha = Math.round(parseFloat(a) * 100);
            } else {
                this.alpha = 100;
            }
            
            this.updatePointerFromHsl();
            return true;
        }
        
        // Try parsing as HSL
        if ((match = hslRegex.exec(color))) {
            const [, h, s, l, a] = match;
            
            this.hue = parseInt(h);
            this.saturation = parseInt(s);
            this.lightness = parseInt(l);
            
            // Update RGB cache for precise representation
            const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
            this.rgbCache = {
                r: Math.round(rgb.r),
                g: Math.round(rgb.g),
                b: Math.round(rgb.b)
            };
            
            if (a !== undefined) {
                this.alpha = Math.round(parseFloat(a) * 100);
            } else {
                this.alpha = 100;
            }
            
            this.updatePointerFromHsl();
            return true;
        }
        
        return false;
    }

    // Color conversion utilities
    private hslToRgb(h: number, s: number, l: number) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) {
                    t += 1;
                }
                if (t > 1) {
                    t -= 1;
                }
                if (t < 1/6) {
                    return p + (q - p) * 6 * t;
                }
                if (t < 1/2) {
                    return q;
                }
                if (t < 2/3) {
                    return p + (q - p) * (2/3 - t) * 6;
                }
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: r * 255,
            g: g * 255,
            b: b * 255,
            a: this.alpha / 100
        };
    }

    private rgbToHsl(r: number, g: number, b: number) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeGlobalListeners();
    }
}