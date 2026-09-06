import { css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

type Subject = 'owner' | 'group' | 'public';
type Permission = 'read' | 'write' | 'execute';

interface PermissionSet {
    read: boolean;
    write: boolean;
    execute: boolean;
}

interface PermissionMatrix {
    owner: PermissionSet;
    group: PermissionSet;
    public: PermissionSet;
}

type AlertState = { type: 'error' | 'warning'; message: string } | null;

@customElement('chmod-calculator')
export class ChmodCalculator extends BaseTool {
    private static readonly SUBJECTS: Subject[] = ['owner', 'group', 'public'];
    private static readonly PERMISSIONS: Permission[] = ['read', 'write', 'execute'];

    @state()
    private permissions: PermissionMatrix = {
        owner: { read: true, write: true, execute: false },
        group: { read: true, write: false, execute: false },
        public: { read: true, write: false, execute: false }
    };

    @state() private octalInput = '644';
    @state() private symbolicInput = 'rw-r--r--';
    @state() private alert: AlertState = null;

    private readonly styles = css`
        ${BaseTool.styles}

        .chmod-grid {
            display: grid;
            grid-template-columns: 88px repeat(3, 1fr);
            gap: 6px;
            align-items: center;
        }

        .grid-header {
            font-size: 0.75rem;
            text-align: center;
        }

        .grid-row-label {
            font-size: 0.75rem;
        }

        .perm-btn {
            min-height: 30px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 2px;
            background: var(--vscode-panel-background);
            color: var(--vscode-foreground);
            cursor: pointer;
            transition: background-color 100ms ease-in-out, border-color 100ms ease-in-out;
        }

        .perm-btn:hover {
            background: var(--vscode-toolbar-hoverBackground);
        }

        .perm-btn[aria-pressed='true'] {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-color: var(--vscode-button-background);
        }

        .output-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 16px;
        }

        .output-label {
            font-size: 0.75rem;
            opacity: 0.75;
            margin-bottom: 4px;
        }

        .output-value {
            font-family: var(--vscode-editor-font-family);
            letter-spacing: 0.02em;
        }
    `;

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">
                    Chmod is a command in Unix-like operating systems used to change file and directory permissions.
                </p>
                <hr />

                <div class="chmod-grid mb-3">
                    <div></div>
                    ${ChmodCalculator.PERMISSIONS.map((permission) => html`
                        <div class="grid-header">
                            <div style="opacity: 0.75; font-size: 0.7rem; margin-bottom: 2px;">
                                ${this.getPermissionWeight(permission)}
                            </div>
                            <div>${this.permissionLabel(permission)}</div>
                        </div>
                    `)}

                    ${ChmodCalculator.SUBJECTS.map((subject) => html`
                        <div class="grid-row-label">${this.subjectLabel(subject)}</div>
                        ${ChmodCalculator.PERMISSIONS.map((permission) => {
                            const active = this.permissions[subject][permission];
                            return html`
                                <button
                                    class="perm-btn"
                                    aria-pressed=${active ? 'true' : 'false'}
                                    title="${this.subjectLabel(subject)}: ${this.permissionLabel(permission)}"
                                    @click=${() => this.togglePermission(subject, permission)}
                                >
                                    ${this.permissionShortLabel(permission)}
                                </button>
                            `;
                        })}
                    `)}
                </div>

                ${this.alert ? html`
                    <tool-alert
                        .type=${this.alert.type}
                        .message=${this.alert.message}
                    ></tool-alert>
                ` : ''}

                <div class="output-grid">
                    <div>
                        <div class="output-label">Octal</div>
                        <input
                            class="output-value"
                            type="text"
                            .value=${this.octalInput}
                            @input=${this.handleOctalInput}
                            spellcheck="false"
                            autocapitalize="off"
                            autocomplete="off"
                            placeholder="e.g. 755"
                        />
                    </div>

                    <div>
                        <div class="output-label">Symbolic</div>
                        <input
                            class="output-value"
                            type="text"
                            .value=${this.symbolicInput}
                            @input=${this.handleSymbolicInput}
                            spellcheck="false"
                            autocapitalize="off"
                            autocomplete="off"
                            placeholder="e.g. rwxr-xr-x"
                        />
                    </div>
                </div>
            </div>
        `;
    }

    private togglePermission(subject: Subject, permission: Permission): void {
        this.permissions = {
            ...this.permissions,
            [subject]: {
                ...this.permissions[subject],
                [permission]: !this.permissions[subject][permission]
            }
        };

        this.syncOutputsFromPermissions();
        this.alert = null;
    }

    private handleOctalInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value.trim();
        this.octalInput = value;

        if (value.length === 0) {
            this.alert = {
                type: 'warning',
                message: 'Octal permission is empty. Use 3 digits from 0 to 7 (e.g. 755).'
            };
            return;
        }

        const parsed = this.parseOctalPermission(value);
        if (parsed) {
            this.permissions = parsed;
            this.symbolicInput = this.permissionsToSymbolic(parsed);
            this.alert = null;
            return;
        }

        if (/^[0-7]{1,2}$/.test(value)) {
            this.alert = {
                type: 'warning',
                message: 'Octal permission is incomplete. Please provide exactly 3 digits.'
            };
            return;
        }

        this.alert = {
            type: 'error',
            message: 'Invalid octal permission. Use exactly 3 digits, each between 0 and 7 (e.g. 421, 644, 755).'
        };
    }

    private handleSymbolicInput(event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.symbolicInput = rawValue;

        if (rawValue.length === 0) {
            this.alert = {
                type: 'warning',
                message: 'Symbolic permission is empty. Use 9 characters such as rwxr-xr-x.'
            };
            return;
        }

        const normalized = this.normalizeSymbolicValue(rawValue);
        const parsed = this.parseSymbolicPermission(normalized);

        if (parsed) {
            this.permissions = parsed;
            this.octalInput = this.permissionsToOctal(parsed);
            this.symbolicInput = normalized;
            this.alert = null;
            return;
        }

        if (normalized.length < 9) {
            this.alert = {
                type: 'warning',
                message: 'Symbolic permission is incomplete. Please provide 9 characters, e.g. r---w---x.'
            };
            return;
        }

        this.alert = {
            type: 'error',
            message: 'Invalid symbolic permission. Use 9 chars with r/w/x or -, e.g. rw-r--r-- or r---w---x.'
        };
    }

    private syncOutputsFromPermissions(): void {
        this.octalInput = this.permissionsToOctal(this.permissions);
        this.symbolicInput = this.permissionsToSymbolic(this.permissions);
    }

    private permissionsToOctal(matrix: PermissionMatrix): string {
        const owner = this.toOctalDigit(matrix.owner);
        const group = this.toOctalDigit(matrix.group);
        const publicValue = this.toOctalDigit(matrix.public);
        return `${owner}${group}${publicValue}`;
    }

    private permissionsToSymbolic(matrix: PermissionMatrix): string {
        return [
            this.toSymbolicTriplet(matrix.owner),
            this.toSymbolicTriplet(matrix.group),
            this.toSymbolicTriplet(matrix.public)
        ].join('');
    }

    private parseOctalPermission(value: string): PermissionMatrix | null {
        if (!/^[0-7]{3}$/.test(value)) {
            return null;
        }

        const [ownerDigit, groupDigit, publicDigit] = value.split('').map(Number);

        return {
            owner: this.permissionSetFromDigit(ownerDigit),
            group: this.permissionSetFromDigit(groupDigit),
            public: this.permissionSetFromDigit(publicDigit)
        };
    }

    private parseSymbolicPermission(value: string): PermissionMatrix | null {
        if (!/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(value)) {
            return null;
        }

        return {
            owner: this.permissionSetFromTriplet(value.slice(0, 3)),
            group: this.permissionSetFromTriplet(value.slice(3, 6)),
            public: this.permissionSetFromTriplet(value.slice(6, 9))
        };
    }

    private normalizeSymbolicValue(value: string): string {
        // Accept optional file type prefix (e.g. -rwxr-xr-x, drwxr-xr-x)
        if (/^[\-dcbpls][rwx-]{9}$/.test(value)) {
            return value.slice(1);
        }
        return value;
    }

    private permissionSetFromDigit(digit: number): PermissionSet {
        return {
            read: (digit & 4) !== 0,
            write: (digit & 2) !== 0,
            execute: (digit & 1) !== 0
        };
    }

    private permissionSetFromTriplet(triplet: string): PermissionSet {
        return {
            read: triplet[0] === 'r',
            write: triplet[1] === 'w',
            execute: triplet[2] === 'x'
        };
    }

    private getPermissionWeight(permission: Permission): number {
        if (permission === 'read') return 4;
        if (permission === 'write') return 2;
        return 1;
    }

    private toOctalDigit(permissionSet: PermissionSet): number {
        let value = 0;
        if (permissionSet.read) value += 4;
        if (permissionSet.write) value += 2;
        if (permissionSet.execute) value += 1;
        return value;
    }

    private toSymbolicTriplet(permissionSet: PermissionSet): string {
        const read = permissionSet.read ? 'r' : '-';
        const write = permissionSet.write ? 'w' : '-';
        const execute = permissionSet.execute ? 'x' : '-';
        return `${read}${write}${execute}`;
    }

    private subjectLabel(subject: Subject): string {
        if (subject === 'owner') return 'Owner';
        if (subject === 'group') return 'Group';
        return 'Public';
    }

    private permissionLabel(permission: Permission): string {
        if (permission === 'read') return 'Read';
        if (permission === 'write') return 'Write';
        return 'Execute';
    }

    private permissionShortLabel(permission: Permission): string {
        if (permission === 'read') return 'R';
        if (permission === 'write') return 'W';
        return 'X';
    }
}