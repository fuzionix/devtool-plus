import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('data-unit-convertor')
export class DataUnitConvertor extends BaseTool {
    @state() private selectedUnit: 'binary' | 'decimal' = 'decimal';
    @state() private input = '1024';
    @state() private inputUnit = 'B';
    @state() private conversions: { unit: string; bitValue: string; bitLabel: string; byteValue: string; byteLabel: string }[] = [];
    @state() private alert: { type: 'error' | 'warning'; message: string } | null = null;

    static styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        this.updateConversions();
    }

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">Data unit conversion allows you to convert between different units of measurement for digital information, such as bytes to kilobytes or megabits to gigabits.</p>
                <hr />

                <!-- Unit System Selection -->
                <div class="">
                    <div class="radio-group" role="radiogroup" aria-label="Unit System">
                        <button 
                            role="radio"
                            aria-checked=${this.selectedUnit === 'binary' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleUnitChange('binary')}
                        >
                            <h4>Binary</h4>
                            <span class="text-xs opacity-75 ml-1">(KiB, MiB, GiB)</span>
                        </button>
                        <button 
                            role="radio"
                            aria-checked=${this.selectedUnit === 'decimal' ? 'true' : 'false'}
                            class="radio-group-button flex justify-center items-center"
                            @click=${() => this.handleUnitChange('decimal')}
                        >
                            <h4>Decimal</h4>
                            <span class="text-xs opacity-75 ml-1">(KB, MB, GB)</span>
                        </button>
                    </div>
                </div>

                <!-- Input Unit Selection -->
                <div class="flex justify-between items-baseline mt-2 text-xs">
                    <p class="mb-0"></p>
                    <div>
                        <tool-inline-menu
                            .options=${this.getUnitOptions()}
                            .value=${this.inputUnit}
                            placeholder="Select Unit"
                            @change=${this.handleInputUnitChange}
                        ></tool-inline-menu>
                    </div>
                </div>

                <!-- Input Field -->
                <div class="relative flex items-center mt-2">
                    <div class="flex w-full">
                        <input 
                            type="text" 
                            class="flex-grow"
                            placeholder="Enter value..."
                            .value=${this.input}
                            @input=${this.handleInput}
                        />
                    </div>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>

                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Arrow Divider -->
                <div class="flex justify-center my-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Conversion Results -->
                <div class="mt-2">
                    ${this.conversions.map(conv => this.renderConversionRow(conv))}
                </div>
            </div>
        `;
    }

    private renderConversionRow(conversion: { unit: string; bitValue: string; bitLabel: string; byteValue: string; byteLabel: string }) {        
        return html`
            <div class="mb-2">
                <div class="flex items-center gap-6">
                    <!-- Bytes Column -->
                    <div class="w-1/2 flex items-center">
                        <div class="w-8 text-xs">${conversion.byteLabel}</div>
                        <input 
                            type="text" 
                            class="font-mono flex-1 !bg-transparent text-sm" 
                            .value="${conversion.byteValue}"
                            readonly
                        />
                    </div>

                    <!-- Bits Column -->
                    <div class="w-1/2 flex items-center">
                        <div class="w-8 text-xs">${conversion.bitLabel}</div>
                        <input 
                            type="text" 
                            class="font-mono flex-1 !bg-transparent text-sm" 
                            .value="${conversion.bitValue}"
                            readonly
                        />
                    </div>
                </div>
            </div>
        `;
    }

    private getUnitOptions() {
        const options = [];
        
        if (this.selectedUnit === 'binary') {
            options.push(
                { label: 'Bytes (B)', value: 'B' },
                { label: 'Kibibytes (KiB)', value: 'KiB' },
                { label: 'Mebibytes (MiB)', value: 'MiB' },
                { label: 'Gibibytes (GiB)', value: 'GiB' },
                { label: 'Tebibytes (TiB)', value: 'TiB' },
                { label: 'Pebibytes (PiB)', value: 'PiB' },
                { label: 'Exbibytes (EiB)', value: 'EiB' },
                { label: 'Zebibytes (ZiB)', value: 'ZiB' },
                { label: 'Yobibytes (YiB)', value: 'YiB' },
            );
        } else {
            options.push(
                { label: 'Bytes (B)', value: 'B' },
                { label: 'Kilobytes (KB)', value: 'KB' },
                { label: 'Megabytes (MB)', value: 'MB' },
                { label: 'Gigabytes (GB)', value: 'GB' },
                { label: 'Terabytes (TB)', value: 'TB' },
                { label: 'Petabytes (PB)', value: 'PB' },
                { label: 'Exabytes (EB)', value: 'EB' },
                { label: 'Zettabytes (ZB)', value: 'ZB' },
                { label: 'Yottabytes (YB)', value: 'YB' },
            );
        }
        
        return options;
    }

    private handleUnitChange(unit: 'binary' | 'decimal') {
        this.selectedUnit = unit;
        
        // Adjust input unit to match the selected unit system
        this.adjustInputUnit();
        
        // Update all conversions
        this.updateConversions();
    }

    private handleInputUnitChange(e: CustomEvent) {
        this.inputUnit = e.detail.value;
        this.updateConversions();
    }

    private adjustInputUnit() {
        // Ensure input unit is valid for the current settings
        const validUnits = this.getUnitOptions().map(opt => opt.value);
        
        if (!validUnits.includes(this.inputUnit)) {
            this.inputUnit = 'B';
        }
    }

    private handleInput(e: InputEvent) {
        const input = e.target as HTMLInputElement;
        this.input = input.value;
        
        if (this.input && !/^[0-9]*\.?[0-9]*$/.test(this.input)) {
            this.alert = {
                type: 'error',
                message: 'Please enter a valid number'
            };
            return;
        } else {
            this.alert = null;
        }
        
        this.updateConversions();
    }

    private clearAll() {
        this.input = '';
        this.alert = null;
        this.updateConversions();
    }

    private updateConversions() {
        if (!this.input || isNaN(Number(this.input))) {
            this.conversions = [];
            return;
        }
        
        const inputValue = parseFloat(this.input);
        
        // Convert to bits as base unit for calculations
        let bitsValue = this.convertToBits(inputValue, this.inputUnit);
        
        // Now generate all conversions with both bit and byte values
        this.conversions = this.generateConversions(bitsValue);
    }

    private convertToBits(value: number, unit: string): number {
        switch (unit) {
            // Bits (decimal)
            case 'bit': return value;
            case 'Kbit': return value * 1000;
            case 'Mbit': return value * 1000 * 1000;
            case 'Gbit': return value * 1000 * 1000 * 1000;
            case 'Tbit': return value * 1000 * 1000 * 1000 * 1000;
            case 'Pbit': return value * 1000 * 1000 * 1000 * 1000 * 1000;
            case 'Ebit': return value * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
            case 'Zbit': return value * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
            case 'Ybit': return value * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
            
            // Bits (binary)
            case 'Kibit': return value * 1024;
            case 'Mibit': return value * 1024 * 1024;
            case 'Gibit': return value * 1024 * 1024 * 1024;
            case 'Tibit': return value * 1024 * 1024 * 1024 * 1024;
            case 'Pibit': return value * 1024 * 1024 * 1024 * 1024 * 1024;
            case 'Eibit': return value * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
            case 'Zibit': return value * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
            case 'Yibit': return value * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
            
            // Bytes (decimal)
            case 'B': return value * 8;
            case 'KB': return value * 8 * 1000;
            case 'MB': return value * 8 * 1000 * 1000;
            case 'GB': return value * 8 * 1000 * 1000 * 1000;
            case 'TB': return value * 8 * 1000 * 1000 * 1000 * 1000;
            case 'PB': return value * 8 * 1000 * 1000 * 1000 * 1000 * 1000;
            case 'EB': return value * 8 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
            case 'ZB': return value * 8 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
            case 'YB': return value * 8 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
            
            // Bytes (binary)
            case 'KiB': return value * 8 * 1024;
            case 'MiB': return value * 8 * 1024 * 1024;
            case 'GiB': return value * 8 * 1024 * 1024 * 1024;
            case 'TiB': return value * 8 * 1024 * 1024 * 1024 * 1024;
            case 'PiB': return value * 8 * 1024 * 1024 * 1024 * 1024 * 1024;
            case 'EiB': return value * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
            case 'ZiB': return value * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
            case 'YiB': return value * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
            
            default: return value;
        }
    }

    private generateConversions(bitsValue: number): { unit: string; bitValue: string; bitLabel: string; byteValue: string; byteLabel: string }[] {
        const conversions: { unit: string; bitValue: string; bitLabel: string; byteValue: string; byteLabel: string }[] = [];
        
        const formatNumber = (num: number): string => {
            if (num === 0) return '0';
            
            // For very small numbers use scientific notation
            if (num < 0.000001) {
                return num.toExponential(6);
            }
            
            // For very large numbers also use scientific notation
            if (num > 1e21) {
                return num.toExponential(6);
            }
            
            return num.toLocaleString(undefined, { 
                maximumFractionDigits: 10,
                minimumFractionDigits: 0
            });
        };
        
        const bytesValue = bitsValue / 8;
        
        if (this.selectedUnit === 'binary') {
            conversions.push({ 
                unit: 'base',
                bitValue: formatNumber(bitsValue), 
                bitLabel: 'bit',
                byteValue: formatNumber(bytesValue), 
                byteLabel: 'B'
            });
            
            conversions.push({ 
                unit: 'kilo',
                bitValue: formatNumber(bitsValue / 1024), 
                bitLabel: 'Kibit',
                byteValue: formatNumber(bytesValue / 1024), 
                byteLabel: 'KiB'
            });
            
            conversions.push({ 
                unit: 'mega',
                bitValue: formatNumber(bitsValue / (1024 * 1024)), 
                bitLabel: 'Mibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024)), 
                byteLabel: 'MiB'
            });
            
            conversions.push({ 
                unit: 'giga',
                bitValue: formatNumber(bitsValue / (1024 * 1024 * 1024)), 
                bitLabel: 'Gibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024 * 1024)), 
                byteLabel: 'GiB'
            });
            
            conversions.push({ 
                unit: 'tera',
                bitValue: formatNumber(bitsValue / (1024 * 1024 * 1024 * 1024)), 
                bitLabel: 'Tibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024 * 1024 * 1024)), 
                byteLabel: 'TiB'
            });
            
            conversions.push({ 
                unit: 'peta',
                bitValue: formatNumber(bitsValue / (1024 * 1024 * 1024 * 1024 * 1024)), 
                bitLabel: 'Pibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024 * 1024 * 1024 * 1024)), 
                byteLabel: 'PiB'
            });
            
            conversions.push({ 
                unit: 'exa',
                bitValue: formatNumber(bitsValue / (1024 * 1024 * 1024 * 1024 * 1024 * 1024)), 
                bitLabel: 'Eibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024 * 1024 * 1024 * 1024 * 1024)), 
                byteLabel: 'EiB'
            });
            
            conversions.push({ 
                unit: 'zetta',
                bitValue: formatNumber(bitsValue / (1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)), 
                bitLabel: 'Zibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)), 
                byteLabel: 'ZiB'
            });
            
            conversions.push({ 
                unit: 'yotta',
                bitValue: formatNumber(bitsValue / (1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)), 
                bitLabel: 'Yibit',
                byteValue: formatNumber(bytesValue / (1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)), 
                byteLabel: 'YiB'
            });
        } else {
            conversions.push({ 
                unit: 'base',
                bitValue: formatNumber(bitsValue), 
                bitLabel: 'bit',
                byteValue: formatNumber(bytesValue), 
                byteLabel: 'B'
            });
            
            conversions.push({ 
                unit: 'kilo',
                bitValue: formatNumber(bitsValue / 1000), 
                bitLabel: 'Kbit',
                byteValue: formatNumber(bytesValue / 1000), 
                byteLabel: 'KB'
            });
            
            conversions.push({ 
                unit: 'mega',
                bitValue: formatNumber(bitsValue / (1000 * 1000)), 
                bitLabel: 'Mbit',
                byteValue: formatNumber(bytesValue / (1000 * 1000)), 
                byteLabel: 'MB'
            });
            
            conversions.push({ 
                unit: 'giga',
                bitValue: formatNumber(bitsValue / (1000 * 1000 * 1000)), 
                bitLabel: 'Gbit',
                byteValue: formatNumber(bytesValue / (1000 * 1000 * 1000)), 
                byteLabel: 'GB'
            });
            
            conversions.push({ 
                unit: 'tera',
                bitValue: formatNumber(bitsValue / (1000 * 1000 * 1000 * 1000)), 
                bitLabel: 'Tbit',
                byteValue: formatNumber(bytesValue / (1000 * 1000 * 1000 * 1000)), 
                byteLabel: 'TB'
            });
            
            conversions.push({ 
                unit: 'peta',
                bitValue: formatNumber(bitsValue / (1000 * 1000 * 1000 * 1000 * 1000)), 
                bitLabel: 'Pbit',
                byteValue: formatNumber(bytesValue / (1000 * 1000 * 1000 * 1000 * 1000)), 
                byteLabel: 'PB'
            });
            
            conversions.push({ 
                unit: 'exa',
                bitValue: formatNumber(bitsValue / (1000 * 1000 * 1000 * 1000 * 1000 * 1000)), 
                bitLabel: 'Ebit',
                byteValue: formatNumber(bytesValue / (1000 * 1000 * 1000 * 1000 * 1000 * 1000)), 
                byteLabel: 'EB'
            });
            
            conversions.push({ 
                unit: 'zetta',
                bitValue: formatNumber(bitsValue / (1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000)), 
                bitLabel: 'Zbit',
                byteValue: formatNumber(bytesValue / (1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000)), 
                byteLabel: 'ZB'
            });
            
            conversions.push({ 
                unit: 'yotta',
                bitValue: formatNumber(bitsValue / (1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000)), 
                bitLabel: 'Ybit',
                byteValue: formatNumber(bytesValue / (1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000)), 
                byteLabel: 'YB'
            });
        }
        
        return conversions;
    }
}