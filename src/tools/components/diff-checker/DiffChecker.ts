import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

@customElement('diff-checker')
export class DiffChecker extends BaseTool {
    static styles = css`
        ${BaseTool.styles}
    `;

    @state() private originalStats = {
        lines: 0,
        chars: 0,
        words: 0
    };

    @state() private modifiedStats = {
        lines: 0,
        chars: 0,
        words: 0
    };

    @state() private similarity = 100;
    @state() private originalText = "This is the original text. You can edit it here.";
    @state() private modifiedText = "This is the modified text. You can edit it here.";

    constructor() {
        super();
        this.updateStats(this.originalText, this.modifiedText);
        
        window.addEventListener('message', event => {
            const message = event.data;
            if ((message.type === 'update' || message.type === 'updateFromEditor') && message.toolId === 'diff-checker') {
                this.originalText = message.value.original || "";
                this.modifiedText = message.value.modified || "";
                this.updateStats(this.originalText, this.modifiedText);
            }
        });
    }

    protected renderTool() {
        const lineDiff = this.modifiedStats.lines - this.originalStats.lines;
        const wordDiff = this.modifiedStats.words - this.originalStats.words;
        const charDiff = this.modifiedStats.chars - this.originalStats.chars;

        return html`
            <style>
            .stats-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-top: 8px;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                padding: 4px 8px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 2px;
            }
            
            .stat-title {
                font-size: 12px;
                opacity: 0.7;
                margin-bottom: 4px;
            }
            
            .stat-value {
                font-size: 14px;
                font-weight: 600;
            }
            
            .diff-indicator {
                font-size: 12px;
                margin-top: 2px;
            }
            
            .diff-positive {
                color: var(--vscode-testing-iconPassed, #73c991);
            }
            
            .diff-negative {
                color: var(--vscode-testing-iconFailed, #f14c4c);
            }
            
            .similarity-container {
                grid-column: span 3;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 6px 8px 4px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 2px;
            }
            
            .similarity-value {
                font-size: 18px;
                font-weight: 600;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">Compare two texts to see the differences. Left pane is the original text, right pane is the modified text.</p>
                <hr />
                
                <div class="stats-container">
                    <div class="stat-item">
                        <span class="stat-title">Lines</span>
                        <span class="stat-value">${this.originalStats.lines} → ${this.modifiedStats.lines}</span>
                        ${lineDiff !== 0 ? html`
                            <span class="diff-indicator ${lineDiff > 0 ? 'diff-positive' : 'diff-negative'}">
                                ${lineDiff > 0 ? '+' : ''}${lineDiff}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="stat-item">
                        <span class="stat-title">Words</span>
                        <span class="stat-value">${this.originalStats.words} → ${this.modifiedStats.words}</span>
                        ${wordDiff !== 0 ? html`
                            <span class="diff-indicator ${wordDiff > 0 ? 'diff-positive' : 'diff-negative'}">
                                ${wordDiff > 0 ? '+' : ''}${wordDiff}
                            </span>
                        ` : ''}
                    </div>

                    <div class="stat-item">
                        <span class="stat-title">Characters</span>
                        <span class="stat-value">${this.originalStats.chars} → ${this.modifiedStats.chars}</span>
                        ${charDiff !== 0 ? html`
                            <span class="diff-indicator ${charDiff > 0 ? 'diff-positive' : 'diff-negative'}">
                                ${charDiff > 0 ? '+' : ''}${charDiff}
                            </span>
                        ` : ''}
                    </div>
                    
                    
                    <div class="similarity-container">
                        <span class="stat-title">Similarity</span>
                        <span class="similarity-value">${this.similarity}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    private updateStats(originalText: string, modifiedText: string) {
        this.originalStats = {
            lines: this.countLines(originalText),
            chars: originalText.length,
            words: this.countWords(originalText)
        };
        
        this.modifiedStats = {
            lines: this.countLines(modifiedText),
            chars: modifiedText.length,
            words: this.countWords(modifiedText)
        };
        
        this.similarity = this.calculateSimilarity(originalText, modifiedText);
    }

    private countLines(text: string): number {
        return text ? text.split('\n').length : 0;
    }

    private countWords(text: string): number {
        return text ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    }

    private calculateSimilarity(str1: string, str2: string): number {
        if (!str1 && !str2) return 100;
        if (!str1 || !str2) return 0;

        // Use Levenshtein distance

        const len1 = str1.length;
        const len2 = str2.length;
        
        // Create a matrix for the calculation
        const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
        
        // Initialize the first column and row
        for (let i = 0; i <= len1; i++) dp[i][0] = i;
        for (let j = 0; j <= len2; j++) dp[0][j] = j;
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i-1] === str2[j-1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i-1][j] + 1,        // deletion
                    dp[i][j-1] + 1,        // insertion
                    dp[i-1][j-1] + cost    // substitution
                );
            }
        }
        
        const distance = dp[len1][len2];
        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 100 : parseFloat(((1 - distance / maxLen) * 100).toFixed(2));
    }
}