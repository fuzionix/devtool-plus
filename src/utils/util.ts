import { html, TemplateResult } from "lit";

/**
 * Adjusts the height of a textarea element based on its scroll height
 *
 * @param {HTMLTextAreaElement} element - The textarea element whose height to adjust
 */
export function adjustTextareaHeight(element: HTMLTextAreaElement) {
    if (element instanceof HTMLTextAreaElement) {
        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
    }
}

/**
 * Renders a copy icon based on the copy state
 *
 * @param {boolean} isCopied - Indicates whether the text was just copied
 * @returns {TemplateResult}
 */
export function renderCopyButton(isCopied: boolean): TemplateResult {
    return isCopied
        ? html`
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-check-check"
            >
                <path d="M18 6 7 17l-5-5"></path>
                <path d="m22 10-7.5 7.5L13 16"></path>
            </svg>
        `
        : html`
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
                class="lucide lucide-copy"
            >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
            </svg>
        `;
}

export function getFileExtensionForLanguage(language: string): string {
    const extensionMap: Record<string, string> = {
        'javascript': '.js',
        'typescript': '.ts',
        'html': '.html',
        'css': '.css',
        'json': '.json',
        'markdown': '.md',
        'xml': '.xml',
        'yaml': '.yaml',
        'python': '.py',
        'java': '.java',
        'c': '.c',
        'cpp': '.cpp',
        'csharp': '.cs',
        'go': '.go',
        'rust': '.rs',
        'php': '.php',
        'ruby': '.rb',
        'sql': '.sql',
        'shellscript': '.sh',
        'plaintext': '.txt'
    };
    
    return extensionMap[language] || '.txt';
}