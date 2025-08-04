import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import {
    adjustTextareaHeight,
    renderCopyButton
} from '../../../utils/util';

@customElement('unix-path-convertor')
export class UnixPathConvertor extends BaseTool {
    @state() private unixPath = '/c/Path/To/File/Example.txt';
    @state() private unixPathalert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isUnixCopied = false;
    @state() private windowsPath = 'C:\\Path\\To\\File\\Example.txt';
    @state() private windowsPathalert: { type: 'error' | 'warning'; message: string } | null = null;
    @state() private isWindowsCopied = false;

    static styles = css`
        ${BaseTool.styles}
        /* Minimal local styling if needed. */
    `;

    protected renderTool() {
        return html`
            <div class="tool-inner-container">
                <p class="opacity-75">UNIX paths use forward slashes (/) to separate directories, while Windows paths use backslashes (\\). This tool converts between the two formats.</p>
                <hr />

                <!-- UNIX Path Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="unix-input"
                        class="input-expandable"
                        placeholder="Enter UNIX path"
                        rows="2"
                        .value=${this.unixPath}
                        @input=${this.handleUnixPathInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Copy">
                            <button 
                                id="copy-unix" 
                                class="btn-icon"
                                @click=${this.copyUnixPath}
                            >
                                ${renderCopyButton(this.isUnixCopied)}
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear-unix" @click=${this.clearUnix}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.unixPathalert ? html`
                    <tool-alert
                        .type=${this.unixPathalert.type}
                        .message=${this.unixPathalert.message}
                    ></tool-alert>
                ` : ''}

                <!-- Arrow Divider -->
                <div class="flex justify-center mt-2 opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-up"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
                </div>

                <!-- Windows Path Input Field -->
                <div class="relative flex items-center mt-2">
                    <textarea
                        id="windows-input"
                        class="input-expandable"
                        placeholder="Enter Windows path"
                        rows="2"
                        .value=${this.windowsPath}
                        @input=${this.handleWindowsPathInput}
                    ></textarea>
                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Copy">
                            <button 
                                id="copy-windows" 
                                class="btn-icon"
                                @click=${this.copyWindowsPath}
                            >
                                ${renderCopyButton(this.isWindowsCopied)}
                            </button>
                        </tool-tooltip>
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear-windows" @click=${this.clearWindows}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>
                ${this.windowsPathalert ? html`
                    <tool-alert
                        .type=${this.windowsPathalert.type}
                        .message=${this.windowsPathalert.message}
                    ></tool-alert>
                ` : ''}
            </div>
        `;
    }

    private handleUnixPathInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.unixPath = target.value;
        adjustTextareaHeight(target);
        
        // Convert UNIX path to Windows path
        if (this.unixPath) {
            try {
                // Handle /c/ or /c format for drive letters
                const driveLetterMatch = this.unixPath.match(/^\/([a-zA-Z])(\/|$)/);
                if (driveLetterMatch) {
                    // Extract drive letter
                    const driveLetter = driveLetterMatch[1].toUpperCase();
                    // Replace /c/ with C:\
                    const pathAfterDrive = this.unixPath.substring(driveLetterMatch[0].length);
                    this.windowsPath = `${driveLetter}:${pathAfterDrive ? '\\' + pathAfterDrive.replace(/\//g, '\\') : '\\'}`;
                } 
                // Handle network paths
                else if (this.unixPath.startsWith('//')) {
                    this.windowsPath = '\\\\' + this.unixPath.substring(2).replace(/\//g, '\\');
                }
                // Regular path conversion
                else {
                    this.windowsPath = this.unixPath.replace(/\//g, '\\');
                }
                this.windowsPathalert = null;
            } catch (error) {
                this.windowsPathalert = {
                    type: 'error',
                    message: 'Invalid UNIX path format'
                };
                this.windowsPath = '';
            }
        } else {
            this.windowsPath = '';
            this.windowsPathalert = null;
        }
    }

    private handleWindowsPathInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.windowsPath = target.value;
        adjustTextareaHeight(target);
        
        // Convert Windows path to UNIX path
        if (this.windowsPath) {
            try {
                // Handle drive letters (e.g., C:\ or C:)
                const driveLetterMatch = this.windowsPath.match(/^([a-zA-Z]):(\\|$)/);
                if (driveLetterMatch) {
                    // Extract drive letter
                    const driveLetter = driveLetterMatch[1].toLowerCase();
                    // Replace C:\ with /c/
                    const pathAfterDrive = this.windowsPath.substring(2);
                    const formattedPath = pathAfterDrive.startsWith('\\') ? 
                        pathAfterDrive.substring(1).replace(/\\/g, '/') : 
                        pathAfterDrive.replace(/\\/g, '/');
                    this.unixPath = `/${driveLetter}/${formattedPath}`;
                } 
                // Handle network paths (UNC)
                else if (this.windowsPath.startsWith('\\\\')) {
                    this.unixPath = '//' + this.windowsPath.substring(2).replace(/\\/g, '/');
                }
                // Regular path conversion
                else {
                    this.unixPath = this.windowsPath.replace(/\\/g, '/');
                }
                this.unixPathalert = null;
            } catch (error) {
                this.unixPathalert = {
                    type: 'error',
                    message: 'Invalid Windows path format'
                };
                this.unixPath = '';
            }
        } else {
            this.unixPath = '';
            this.unixPathalert = null;
        }
    }

    private async copyUnixPath() {
        if (!this.unixPath) { return; }
        try {
            await navigator.clipboard.writeText(this.unixPath);
            this.isUnixCopied = true;
            setTimeout(() => {
                this.isUnixCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }

    private async copyWindowsPath() {
        if (!this.windowsPath) { return; }
        try {
            await navigator.clipboard.writeText(this.windowsPath);
            this.isWindowsCopied = true;
            setTimeout(() => {
                this.isWindowsCopied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }

    private clearUnix(): void {
        this.unixPath = '';
        this.unixPathalert = null;
        const unixPathTextarea = this.querySelector('#unix-input') as HTMLTextAreaElement;
        if (unixPathTextarea) {
            unixPathTextarea.style.height = `28px`;
        }
        this.requestUpdate();
    }

    private clearWindows(): void {
        this.windowsPath = '';
        this.windowsPathalert = null;
        const windowsPathTextarea = this.querySelector('#windows-input') as HTMLTextAreaElement;
        if (windowsPathTextarea) {
            windowsPathTextarea.style.height = `28px`;
        }
        this.requestUpdate();
    }
}