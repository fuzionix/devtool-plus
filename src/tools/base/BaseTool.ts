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

    protected async setupStyles(): Promise<void> {
        try {
            const response = await fetch(document.querySelector<HTMLLinkElement>('link[href$="tailwind.css"]')?.href || '');
            const css = await response.text();
            const style = document.createElement('style');
            style.textContent = css;
            this.shadow.prepend(style);
        } catch (error) {
            console.error('Failed to inject styles:', error);
        }
    }

    protected abstract setupTemplate(): void;
    protected abstract setupEventListeners(): void;
}