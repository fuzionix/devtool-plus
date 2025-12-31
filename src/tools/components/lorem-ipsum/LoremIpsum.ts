import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { renderCopyButton } from '../../../utils/util';

@customElement('lorem-ipsum')
export class LoremIpsum extends BaseTool {
    @state() private output = '';
    @state() private isCopied = false;
    @state() private amount = 5;
    @state() private numberOf: 'paragraphs' | 'sentences' | 'words' = 'paragraphs';
    @state() private variation: 'random' | 'fixed' = 'random';

    private wordFrequencies: Record<string, number> = {
        "sed": 2.2, "in": 1.8, "ut": 1.6, "sit": 1.5, "amet": 1.5, "et": 1.5, "ac": 1.4, "non": 1.4, "eu": 1.3, "a": 1.3, "quis": 1.2, "eget": 1.2, "vitae": 1.2, "nec": 1.2, "at": 1.2, "nulla": 1.1, "aliquam": 1.1, "id": 1.1, "nunc": 1, "vel": 1, "vestibulum": 1, "mauris": 1, "pellentesque": 1, "ipsum": 0.9, "tincidunt": 0.9, "orci": 0.8, "ex": 0.8, "nisi": 0.8, "donec": 0.8, "ante": 0.8, "turpis": 0.8, "diam": 0.8, "lorem": 0.7, "consectetur": 0.7, "elit": 0.7, "tortor": 0.7, "velit": 0.7, "nisl": 0.7, "augue": 0.7, "risus": 0.7, "quam": 0.7, "volutpat": 0.7, "dolor": 0.6, "leo": 0.6, "praesent": 0.6, "tellus": 0.6, "nibh": 0.6, "finibus": 0.6, "enim": 0.6, "posuere": 0.6, "est": 0.6, "lacus": 0.6, "varius": 0.6, "sem": 0.6, "urna": 0.6, "molestie": 0.6, "malesuada": 0.6, "faucibus": 0.6, "luctus": 0.6, "ultrices": 0.6, "erat": 0.6, "lectus": 0.6, "felis": 0.6, "metus": 0.6, "arcu": 0.6, "justo": 0.6, "purus": 0.6, "mi": 0.6, "neque": 0.6, "dui": 0.6, "eros": 0.6, "massa": 0.6, "ligula": 0.6, "odio": 0.6, "ultricies": 0.5, "accumsan": 0.5, "facilisis": 0.5, "fusce": 0.5, "tempor": 0.5, "sagittis": 0.5, "fringilla": 0.5, "magna": 0.5, "tristique": 0.5, "libero": 0.5, "efficitur": 0.5, "suscipit": 0.5, "vehicula": 0.5, "porttitor": 0.5, "iaculis": 0.5, "dignissim": 0.5, "imperdiet": 0.5, "aenean": 0.5, "lobortis": 0.5, "auctor": 0.5, "suspendisse": 0.5, "bibendum": 0.5, "pharetra": 0.5, "interdum": 0.5, "blandit": 0.5, "mattis": 0.5, "dictum": 0.5, "feugiat": 0.5, "pretium": 0.5, "sapien": 0.5, "mollis": 0.5, "gravida": 0.5, "rhoncus": 0.5, "lacinia": 0.5, "condimentum": 0.4, "duis": 0.4, "ornare": 0.4, "etiam": 0.4, "curabitur": 0.4, "hendrerit": 0.4, "consequat": 0.4, "laoreet": 0.4, "tempus": 0.4, "pulvinar": 0.4, "aliquet": 0.4, "sodales": 0.4, "congue": 0.4, "nullam": 0.4, "maecenas": 0.4, "fermentum": 0.4, "proin": 0.4, "dapibus": 0.4, "integer": 0.4, "viverra": 0.4, "commodo": 0.4, "egestas": 0.4, "semper": 0.4, "quisque": 0.4, "convallis": 0.4, "scelerisque": 0.4, "morbi": 0.4, "eleifend": 0.4, "vivamus": 0.4, "ullamcorper": 0.4, "sollicitudin": 0.4, "maximus": 0.4, "vulputate": 0.4, "cursus": 0.4, "elementum": 0.4, "rutrum": 0.4, "euismod": 0.4, "nam": 0.4, "porta": 0.4, "placerat": 0.4, "venenatis": 0.4, "cras": 0.3, "phasellus": 0.3, "primis": 0.2
    };

    private wordPool: string[];
    private wordWeights: number[];
    private totalWeight: number;

    private readonly STARTER_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    private styles = css`
        ${BaseTool.styles}
    `;

    constructor() {
        super();
        // Initialize word pool and weights once
        this.wordPool = Object.keys(this.wordFrequencies);
        this.wordWeights = Object.values(this.wordFrequencies);
        this.totalWeight = this.wordWeights.reduce((a, b) => a + b, 0);
    }

    connectedCallback() {
        super.connectedCallback();
        this.generateText();
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Generate dummy Lorem Ipsum text for design and development.</p>
                <hr />

                <!-- Amount Slider -->
                <div class="flex justify-between items-center mt-4 text-xs">
                    <span>Amount</span>
                </div>
                <tool-slider
                    min="1"
                    max="50"
                    step="1"
                    .value=${this.amount}
                    @change=${this.handleAmountChange}
                ></tool-slider>

                <!-- Options Row -->
                <div class="flex flex-col min-[320px]:flex-row gap-2 my-2">
                    <div class="flex-1">
                        <div class="mb-2 text-xs">Number of</div>
                        <tool-dropdown-menu 
                            .options=${[
                                { value: 'paragraphs', label: 'Paragraphs' },
                                { value: 'sentences', label: 'Sentences' },
                                { value: 'words', label: 'Words' }
                            ]}
                            .value=${this.numberOf}
                            @change=${this.handleNumberOfChange}
                        ></tool-dropdown-menu>
                    </div>
                    <div class="flex-1">
                        <div class="mb-2 text-xs">Variation</div>
                        <tool-dropdown-menu 
                            .options=${[
                                { value: 'random', label: 'Random' },
                                { value: 'fixed', label: 'Fixed' }
                            ]}
                            .value=${this.variation}
                            @change=${this.handleVariationChange}
                        ></tool-dropdown-menu>
                    </div>
                </div>

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </div>

                <!-- Output Section -->
                <div class="relative flex items-start mt-2">
                    <textarea
                        id="output"
                        class="input-expandable pr-6"
                        placeholder="Output will appear here"
                        rows="20"
                        readonly
                        .value=${this.output}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <button 
                            class="btn-icon" 
                            @click=${this.copyToClipboard}
                            title="Copy to clipboard"
                        >
                            ${renderCopyButton(this.isCopied)}
                        </button>
                        <div class="absolute right-0 top-[1.5rem] pr-0.5 flex justify-items-center">
                        <button 
                            id="regenerate" 
                            class="btn-icon"
                            @click=${this.generateText}
                            title="Regenerate Text"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round" 
                                class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"
                            >
                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                    <path d="M3 3v5h5"/>
                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                                    <path d="M16 16h5v5"/>
                            </svg>
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        `;
    }

    private handleAmountChange(e: CustomEvent) {
        this.amount = e.detail.value;
        this.generateText();
    }

    private handleNumberOfChange(e: CustomEvent) {
        this.numberOf = e.detail.value;
        this.generateText();
    }

    private handleVariationChange(e: CustomEvent) {
        this.variation = e.detail.value;
        this.generateText();
    }

    private generateText() {
        let result = '';
        
        if (this.numberOf === 'paragraphs') {
            result = this.generateParagraphs(this.amount);
        } else if (this.numberOf === 'sentences') {
            result = this.generateSentences(this.amount);
        } else if (this.numberOf === 'words') {
            result = this.generateWords(this.amount);
        }

        // Always prepend the starter text
        this.output = this.STARTER_TEXT + ' ' + result;
    }

    private generateParagraphs(count: number): string {
        const paragraphs: string[] = [];
        
        for (let i = 0; i < count; i++) {
            const sentenceCount = this.variation === 'random' 
                ? this.getRandomInt(3, 7)
                : 5;
            
            let paragraph = '';
            for (let j = 0; j < sentenceCount; j++) {
                const wordCount = this.variation === 'random'
                    ? this.getRandomInt(5, 15)
                    : 10;
                
                const sentence = this.generateWordsString(wordCount);
                paragraph += this.capitalize(sentence) + '. ';
            }
            
            paragraphs.push(paragraph.trim());
        }

        return paragraphs.join('\n\n');
    }

    private generateSentences(count: number): string {
        const sentences: string[] = [];
        
        for (let i = 0; i < count; i++) {
            const wordCount = this.variation === 'random'
                ? this.getRandomInt(5, 20)
                : 12;
            
            const sentence = this.generateWordsString(wordCount);
            sentences.push(this.capitalize(sentence) + '.');
        }

        return sentences.join(' ');
    }

    private generateWords(count: number): string {
        return this.generateWordsString(count);
    }

    private generateWordsString(count: number): string {
        const words: string[] = [];
        
        for (let i = 0; i < count; i++) {
            words.push(this.getRandomWordByFrequency());
        }

        return words.join(' ');
    }

    private getRandomWordByFrequency(): string {
        let random = Math.random() * this.totalWeight;
        
        for (let i = 0; i < this.wordPool.length; i++) {
            random -= this.wordWeights[i];
            if (random <= 0) {
                return this.wordPool[i];
            }
        }
        
        // Fallback to last word (shouldn't normally happen)
        return this.wordPool[this.wordPool.length - 1];
    }

    private capitalize(str: string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private async copyToClipboard() {
        if (!this.output) return;
        
        try {
            await navigator.clipboard.writeText(this.output);
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }
}