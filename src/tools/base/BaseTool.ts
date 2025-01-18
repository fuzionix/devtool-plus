export abstract class BaseTool extends HTMLElement {
    protected shadow: ShadowRoot;
    protected toolContainer!: HTMLElement;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.initialize();
    }

    protected initialize(): void {
        this.setupContainer();
        this.setupStyles();
        this.setupTemplate();
        this.setupEventListeners();
    }

    protected setupContainer(): void {
        this.toolContainer = document.createElement('div');
        this.toolContainer.className = 'tool-container';
        this.shadow.appendChild(this.toolContainer);
    }

    protected setupStyles(): void {
        const style = document.createElement('style');
        style.textContent = this.getBaseStyles() + this.getToolStyles();
        this.shadow.appendChild(style);
    }

    protected getBaseStyles(): string {
        return `
            h4 {
                font-weight: 400;
            }
            p {
                opacity: 0.75;
            }
        `;
    }

    protected abstract getToolStyles(): string;
    protected abstract setupTemplate(): void;
    protected abstract setupEventListeners(): void;
}