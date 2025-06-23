import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tool-file-dropzone')
export class FileDropzone extends LitElement {
    @property({ type: String }) accept: string = '*'; // File types to accept
    @property({ type: Boolean }) multiple: boolean = false; // Allow multiple files
    @property({ type: String }) placeholder: string = 'Drag & drop a file or click to browse';
    
    @state() private isDragging: boolean = false;
    @state() private files: File[] = [];
    @state() private errorMessage: string | null = null;

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .dropzone {
            box-sizing: border-box;
            width: 100%;
            min-height: 80px;
            border: 1px dashed var(--vscode-panel-border);
            border-radius: 2px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            background-color: var(--vscode-panel-background);
            color: var(--vscode-foreground);
        }

        .dropzone:hover {
            border-color: var(--vscode-focusBorder);
            background-color: var(--vscode-list-hoverBackground);
        }

        .dropzone.dragging {
            border-color: var(--vscode-focusBorder);
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .dropzone-icon {
            width: 16px;
            height: 16px;
            opacity: 0.7;
        }

        .dropzone-text {
            margin: 0;
            text-align: center;
            font-size: 12px;
            opacity: 0.7;
        }

        .file-list {
            width: 100%;
            margin-top: 8px;
        }

        .file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 8px;
            border: solid 1px var(--vscode-panel-border);
            border-radius: 2px;
            margin-top: 4px;
        }

        .file-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
        }

        .remove-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2px;
            border: none;
            background: none;
            color: var(--vscode-icon-foreground);
            cursor: pointer;
            border-radius: 2px;
        }

        .remove-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .error-message {
            color: var(--vscode-errorForeground);
            font-size: 12px;
            margin-top: 8px;
        }

        input[type="file"] {
            display: none;
        }
    `;

    render() {
        return html`
            <div 
                class="dropzone ${this.isDragging ? 'dragging' : ''}"
                @dragenter=${this.handleDragEnter}
                @dragleave=${this.handleDragLeave}
                @dragover=${this.handleDragOver}
                @drop=${this.handleDrop}
                @click=${this.handleClick}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="dropzone-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-up-icon lucide-file-up"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>
                <p class="dropzone-text">${this.placeholder}</p>
                ${this.files.length > 0 ? html`
                    <div class="file-list">
                        ${this.files.map((file, index) => html`
                            <div class="file-item">
                                <span class="file-name">${file.name}</span>
                                <button class="remove-btn" @click=${(e: Event) => this.removeFile(e, index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                        `)}
                    </div>
                ` : ''}
            </div>
            ${this.errorMessage ? html`<p class="error-message">${this.errorMessage}</p>` : ''}
            <input 
                type="file" 
                id="fileInput" 
                @change=${this.handleFileSelection}
                accept=${this.accept}
                ?multiple=${this.multiple}
            >
        `;
    }

    private handleDragEnter(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
    }

    private handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = false;
    }

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = false;
        
        if (!e.dataTransfer) return;
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    private handleClick() {
        const fileInput = this.shadowRoot?.querySelector('#fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    private handleFileSelection(e: Event) {
        const fileInput = e.target as HTMLInputElement;
        if (fileInput.files) {
            const files = Array.from(fileInput.files);
            this.processFiles(files);
            // Reset the input so the same file can be selected again
            fileInput.value = '';
        }
    }

    private processFiles(files: File[]) {
        this.errorMessage = null;
        
        if (!this.multiple && files.length > 1) {
            this.errorMessage = 'Only one file can be selected';
            return;
        }

        if (this.accept !== '*') {
            const acceptedTypes = this.accept.split(',').map(type => type.trim());
            
            for (const file of files) {
                const fileType = file.type;
                const fileExtension = '.' + file.name.split('.').pop();
                
                const isTypeAccepted = acceptedTypes.some(type => {
                    if (type.includes('/')) {
                        return type === fileType || type === fileType.split('/')[0] + '/*';
                    }
                    return type === fileExtension;
                });
                
                if (!isTypeAccepted) {
                    this.errorMessage = `File type not accepted: ${file.name}`;
                    return;
                }
            }
        }

        if (this.multiple) {
            this.files = [...this.files, ...files];
        } else {
            this.files = files;
        }

        this.dispatchEvent(new CustomEvent('files-changed', {
            detail: { 
                files: this.files,
                filesArray: Array.from(this.files)
            },
            bubbles: true,
            composed: true
        }));
    }

    private removeFile(e: Event, index: number) {
        e.stopPropagation(); // Prevent triggering click on the dropzone
        
        const updatedFiles = [...this.files];
        updatedFiles.splice(index, 1);
        this.files = updatedFiles;
        
        this.dispatchEvent(new CustomEvent('files-changed', {
            detail: { 
                files: this.files,
                filesArray: Array.from(this.files)
            },
            bubbles: true,
            composed: true
        }));
    }

    public clearFiles() {
        this.files = [];
        this.errorMessage = null;
        
        this.dispatchEvent(new CustomEvent('files-changed', {
            detail: { 
                files: this.files,
                filesArray: []
            },
            bubbles: true,
            composed: true
        }));
    }
}