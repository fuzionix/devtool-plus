import { css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';
import { adjustTextareaHeight } from '../../../utils/util';

type AlertKind = 'error' | 'warning';

interface AlertState {
    type: AlertKind;
    message: string;
}

interface ParsedField {
    raw: string;
    values: number[];
    set: Set<number>;
    any: boolean;
}

interface ParsedCron {
    rawFields: [string, string, string, string, string];
    minute: ParsedField;
    hour: ParsedField;
    dayOfMonth: ParsedField;
    month: ParsedField;
    dayOfWeek: ParsedField;
}

interface CommonExample {
    expression: string;
    description: string;
}

interface CronFieldInfo {
    field: string;
    range: string;
    meaning: string;
}

@customElement('crontab-generator')
export class CrontabGenerator extends BaseTool {
    private static readonly MONTH_NAME_MAP: Record<string, number> = {
        JAN: 1,
        FEB: 2,
        MAR: 3,
        APR: 4,
        MAY: 5,
        JUN: 6,
        JUL: 7,
        AUG: 8,
        SEP: 9,
        OCT: 10,
        NOV: 11,
        DEC: 12
    };

    private static readonly WEEKDAY_NAME_MAP: Record<string, number> = {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6
    };

    private static readonly MONTH_LABELS: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];

    private static readonly WEEKDAY_LABELS: string[] = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    private static readonly COMMON_EXAMPLES: CommonExample[] = [
        { expression: '* * * * *', description: 'Every minute.' },
        { expression: '*/5 * * * *', description: 'Every 5 minutes.' },
        { expression: '0 * * * *', description: 'At minute 0 of every hour.' },
        { expression: '30 9 * * 1-5', description: 'At 09:30 on weekdays (Mon-Fri).' },
        { expression: '0 0 * * *', description: 'Every day at midnight.' },
        { expression: '0 0 1 * *', description: 'At midnight on the 1st of each month.' },
    ];

    private static readonly FIELD_INFO: CronFieldInfo[] = [
        { field: 'Minute', range: '0-59', meaning: 'Which minute of the hour to run.' },
        { field: 'Hour', range: '0-23', meaning: 'Which hour of the day to run.' },
        { field: 'Day of month', range: '1-31', meaning: 'Which day number in the month to run.' },
        { field: 'Month', range: '1-12 or JAN-DEC', meaning: 'Which month to run.' },
        { field: 'Day of week', range: '0-7 or SUN-SAT', meaning: 'Which weekday to run (0 or 7 = Sunday).' }
    ];

    private readonly styles = css`
        ${BaseTool.styles}

        .summary-card {
            background-color: var(--vscode-panel-background);
            box-shadow: inset 0 0 0 1px var(--vscode-panel-border);
            border-radius: 2px;
            padding: 8px 10px;
        }

        .next-at-value {
            font-family: var(--vscode-editor-font-family);
        }

        .example-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 2px;
            border: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-panel-background);
            color: var(--vscode-foreground);
            cursor: pointer;
            text-align: left;
            transition: background-color 100ms ease-in-out, border-color 100ms ease-in-out;
        }

        .example-item:hover {
            background-color: var(--vscode-toolbar-hoverBackground);
        }

        .example-item.is-active {
            border-color: var(--vscode-focusBorder);
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .example-cron {
            font-family: var(--vscode-editor-font-family);
            font-size: 0.75rem;
            white-space: nowrap;
        }

        .example-desc {
            font-size: 0.75rem;
            opacity: 0.85;
            text-align: right;
        }

        .field-row {
            display: grid;
            grid-template-columns: 88px 96px 1fr;
            gap: 8px;
            align-items: center;
            min-height: 28px;
            margin-bottom: 6px;
            padding: 6px 8px;
            border-radius: 2px;
            background-color: var(--vscode-panel-background);
            box-shadow: inset 0 0 0 1px var(--vscode-panel-border);
        }

        .field-label {
            font-size: 0.75rem;
            color: var(--vscode-descriptionForeground);
        }

        .field-range {
            font-family: var(--vscode-editor-font-family);
            font-size: 0.75rem;
            opacity: 0.9;
        }

        .field-meaning {
            font-size: 0.75rem;
            opacity: 0.9;
        }
    `;

    @state() private input = '*/5 * * * *';
    @state() private humanReadable = '';
    @state() private nextAt = '—';
    @state() private alert: AlertState | null = null;

    @query('#cron-input') private inputArea!: HTMLTextAreaElement;

    constructor() {
        super();
        this.evaluateExpression();
    }

    protected firstUpdated(): void {
        if (this.inputArea) {
            adjustTextareaHeight(this.inputArea);
            setTimeout(() => this.inputArea?.focus(), 0);
        }
    }

    protected renderTool() {
        return html`
            <style>${this.styles}</style>
            <div class="tool-inner-container">
                <p class="opacity-75">Crontab is a time-based job scheduler in Unix-like operating systems. It allows users to schedule tasks to run automatically at specified times and intervals.</p>
                <hr />

                <div class="relative flex items-center mb-2">
                    <textarea
                        id="cron-input"
                        class="input-expandable font-mono"
                        placeholder="E.g. 23 0-20/2 * * *"
                        rows="1"
                        .value=${this.input}
                        @input=${this.handleInput}
                    ></textarea>

                    <div class="absolute right-0 top-0.5 pr-0.5 flex justify-items-center">
                        <tool-tooltip text="Clear">
                            <button class="btn-icon" id="clear" @click=${this.clearAll}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                        </tool-tooltip>
                    </div>
                </div>

                ${this.alert ? html`
                    <tool-alert .type=${this.alert.type} .message=${this.alert.message}></tool-alert>
                ` : ''}
                
                <div class="summary-card mb-2">
                    <div class="text-xs opacity-70 mb-1">Human readable</div>
                    <div class="text-base font-medium">${this.humanReadable}</div>
                </div>
                
                <div class="summary-card mb-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs opacity-70">Next at</span>
                        <span class="text-xs next-at-value">${this.nextAt}</span>
                    </div>
                </div>

                <div class="mt-4">
                    <h6 class="text-xs opacity-70 mb-2">Common Examples</h6>
                    <div class="flex flex-col gap-1">
                        ${CrontabGenerator.COMMON_EXAMPLES.map((example) => html`
                            <button
                                class="example-item ${this.input.trim() === example.expression ? 'is-active' : ''}"
                                title="Use ${example.expression}"
                                @click=${() => this.applyExample(example.expression)}
                            >
                                <span class="example-cron">${example.expression}</span>
                                <span class="example-desc">${example.description}</span>
                            </button>
                        `)}
                    </div>
                </div>

                <div class="mt-4">
                    <h6 class="text-xs opacity-70 mb-2">Cron Format</h6>
                    ${CrontabGenerator.FIELD_INFO.map((info) => html`
                        <div class="field-row">
                            <span class="field-label">${info.field}</span>
                            <span class="field-range">${info.range}</span>
                            <span class="field-meaning">${info.meaning}</span>
                        </div>
                    `)}
                    <p class="text-xs opacity-60 mt-2 mb-0">
                        Special characters:
                        <span class="font-mono">*</span> any,
                        <span class="font-mono">,</span> list,
                        <span class="font-mono">-</span> range,
                        <span class="font-mono">/</span> step.
                    </p>
                </div>
            </div>
        `;
    }

    private handleInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.input = target.value;
        adjustTextareaHeight(this.inputArea);
        this.evaluateExpression();
    }

    private clearAll(): void {
        this.input = '';
        this.humanReadable = 'Enter a cron expression to generate description.';
        this.nextAt = '—';
        this.alert = null;

        if (this.inputArea) {
            this.inputArea.style.height = '28px';
        }
    }

    private applyExample(expression: string): void {
        this.input = expression;
        this.evaluateExpression();
        if (this.inputArea) {
            this.inputArea.value = expression;
            adjustTextareaHeight(this.inputArea);
        }
    }

    private evaluateExpression(): void {
        const expression = this.input.trim();
        if (!expression) {
            this.humanReadable = 'Enter a cron expression to generate description.';
            this.nextAt = '—';
            this.alert = null;
            return;
        }

        try {
            const parsed = this.parseCronExpression(expression);
            this.humanReadable = this.buildHumanReadable(parsed);

            const nextRun = this.findNextRun(parsed, new Date());
            if (nextRun) {
                this.nextAt = this.formatDateTime(nextRun);
                this.alert = null;
            } else {
                this.nextAt = 'Not found';
                this.alert = {
                    type: 'warning',
                    message: 'No next execution found in the search window.'
                };
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Invalid cron expression.';
            this.humanReadable = 'Unable to parse expression.';
            this.nextAt = '—';
            this.alert = {
                type: 'error',
                message
            };
        }
    }

    private parseCronExpression(expression: string): ParsedCron {
        const normalized = this.expandAlias(expression);
        const parts = normalized.trim().split(/\s+/);

        if (parts.length !== 5) {
            throw new Error('Cron expression must contain exactly 5 fields.');
        }

        const minute = this.parseField(parts[0], 0, 59);
        const hour = this.parseField(parts[1], 0, 23);
        const dayOfMonth = this.parseField(parts[2], 1, 31);
        const month = this.parseField(parts[3], 1, 12, CrontabGenerator.MONTH_NAME_MAP);
        const dayOfWeek = this.parseField(parts[4], 0, 7, CrontabGenerator.WEEKDAY_NAME_MAP, true);

        return {
            rawFields: [parts[0], parts[1], parts[2], parts[3], parts[4]],
            minute,
            hour,
            dayOfMonth,
            month,
            dayOfWeek
        };
    }

    private expandAlias(expression: string): string {
        const alias = expression.trim().toLowerCase();
        const aliasMap: Record<string, string> = {
            '@yearly': '0 0 1 1 *',
            '@annually': '0 0 1 1 *',
            '@monthly': '0 0 1 * *',
            '@weekly': '0 0 * * 0',
            '@daily': '0 0 * * *',
            '@midnight': '0 0 * * *',
            '@hourly': '0 * * * *'
        };

        if (alias.startsWith('@')) {
            if (!Object.prototype.hasOwnProperty.call(aliasMap, alias)) {
                throw new Error(`Unsupported cron alias: ${expression}`);
            }
            return aliasMap[alias];
        }

        return expression;
    }

    private parseField(
        raw: string,
        min: number,
        max: number,
        nameMap?: Record<string, number>,
        normalizeSunday = false
    ): ParsedField {
        const trimmed = raw.trim();
        if (!trimmed) {
            throw new Error('Empty cron field detected.');
        }

        const segments = trimmed.split(',');
        const collected: number[] = [];

        for (const segment of segments) {
            const parsedSegment = this.parseSegment(segment.trim(), min, max, nameMap);
            collected.push(...parsedSegment);
        }

        const normalized = normalizeSunday
            ? collected.map((value) => (value === 7 ? 0 : value))
            : collected;

        const uniqueSorted = Array.from(new Set(normalized)).sort((a, b) => a - b);
        if (uniqueSorted.length === 0) {
            throw new Error(`Invalid field: "${raw}"`);
        }

        const expected = normalizeSunday
            ? [0, 1, 2, 3, 4, 5, 6]
            : this.buildRange(min, max);

        return {
            raw: trimmed,
            values: uniqueSorted,
            set: new Set(uniqueSorted),
            any: this.sameNumberList(uniqueSorted, expected)
        };
    }

    private parseSegment(
        segment: string,
        min: number,
        max: number,
        nameMap?: Record<string, number>
    ): number[] {
        const stepParts = segment.split('/');
        if (stepParts.length > 2) {
            throw new Error(`Invalid step syntax: "${segment}"`);
        }

        if (stepParts.length === 2) {
            const base = stepParts[0];
            const step = this.parsePositiveInteger(stepParts[1], 'step');

            let start = min;
            let end = max;

            if (base !== '*') {
                if (base.includes('-')) {
                    const [startToken, endToken] = base.split('-');
                    if (!startToken || !endToken) {
                        throw new Error(`Invalid range: "${segment}"`);
                    }

                    start = this.parseValue(startToken, min, max, nameMap);
                    end = this.parseValue(endToken, min, max, nameMap);
                    if (start > end) {
                        throw new Error(`Range start must be <= end in "${segment}"`);
                    }
                } else {
                    start = this.parseValue(base, min, max, nameMap);
                    end = max;
                }
            }

            return this.buildSteppedRange(start, end, step);
        }

        if (segment === '*') {
            return this.buildRange(min, max);
        }

        if (segment.includes('-')) {
            const [startToken, endToken] = segment.split('-');
            if (!startToken || !endToken) {
                throw new Error(`Invalid range: "${segment}"`);
            }

            const start = this.parseValue(startToken, min, max, nameMap);
            const end = this.parseValue(endToken, min, max, nameMap);
            if (start > end) {
                throw new Error(`Range start must be <= end in "${segment}"`);
            }

            return this.buildRange(start, end);
        }

        return [this.parseValue(segment, min, max, nameMap)];
    }

    private parsePositiveInteger(token: string, label: string): number {
        if (!/^\d+$/.test(token)) {
            throw new Error(`Invalid ${label}: "${token}"`);
        }

        const value = Number.parseInt(token, 10);
        if (value <= 0) {
            throw new Error(`${label} must be greater than 0.`);
        }

        return value;
    }

    private parseValue(
        token: string,
        min: number,
        max: number,
        nameMap?: Record<string, number>
    ): number {
        const upperToken = token.toUpperCase();
        let value: number | undefined;

        if (nameMap && Object.prototype.hasOwnProperty.call(nameMap, upperToken)) {
            value = nameMap[upperToken];
        } else if (/^\d+$/.test(token)) {
            value = Number.parseInt(token, 10);
        }

        if (value === undefined) {
            throw new Error(`Invalid token: "${token}"`);
        }

        if (value < min || value > max) {
            throw new Error(`Value out of range: "${token}" (allowed ${min}-${max})`);
        }

        return value;
    }

    private buildRange(start: number, end: number): number[] {
        const length = end - start + 1;
        return Array.from({ length }, (_, index) => start + index);
    }

    private buildSteppedRange(start: number, end: number, step: number): number[] {
        const values: number[] = [];
        for (let value = start; value <= end; value += step) {
            values.push(value);
        }
        return values;
    }

    private sameNumberList(a: number[], b: number[]): boolean {
        if (a.length !== b.length) {
            return false;
        }

        for (let index = 0; index < a.length; index += 1) {
            if (a[index] !== b[index]) {
                return false;
            }
        }

        return true;
    }

    private buildHumanReadable(parsed: ParsedCron): string {
        const [minuteRaw, hourRaw] = parsed.rawFields;
        const timePart = this.describeTimePart(minuteRaw, hourRaw);
        const datePart = this.describeDatePart(parsed);

        if (!datePart) {
            return timePart;
        }

        return `${timePart.slice(0, -1)} ${datePart}.`;
    }

    private describeTimePart(minuteRaw: string, hourRaw: string): string {
        const minuteIsSingle = this.isSingleNumber(minuteRaw);
        const hourIsSingle = this.isSingleNumber(hourRaw);

        if (minuteIsSingle && hourIsSingle) {
            const minute = Number.parseInt(minuteRaw, 10);
            const hour = Number.parseInt(hourRaw, 10);
            return `At ${this.pad2(hour)}:${this.pad2(minute)}.`;
        }

        if (minuteIsSingle) {
            const minute = Number.parseInt(minuteRaw, 10);
            return `At minute ${minute} past ${this.describeHourExpression(hourRaw)}.`;
        }

        if (hourIsSingle) {
            const hour = Number.parseInt(hourRaw, 10);
            return `At ${this.describeMinuteExpression(minuteRaw)} past hour ${hour}.`;
        }

        if (minuteRaw === '*' && hourRaw === '*') {
            return 'Every minute.';
        }

        if (minuteRaw === '*') {
            return `Every minute of ${this.describeHourExpression(hourRaw)}.`;
        }

        if (hourRaw === '*') {
            return `At ${this.describeMinuteExpression(minuteRaw)} of every hour.`;
        }

        return `At ${this.describeMinuteExpression(minuteRaw)} of ${this.describeHourExpression(hourRaw)}.`;
    }

    private describeDatePart(parsed: ParsedCron): string {
        const clauses: string[] = [];

        if (!parsed.month.any) {
            clauses.push(`in ${this.describeMonths(parsed.month.values)}`);
        }

        if (!parsed.dayOfMonth.any && !parsed.dayOfWeek.any) {
            clauses.push(
                `when day-of-month matches "${parsed.dayOfMonth.raw}" or weekday is ${this.describeWeekdays(parsed.dayOfWeek.values)}`
            );
        } else if (!parsed.dayOfMonth.any) {
            const dayDesc = this.describeDayOfMonth(parsed.dayOfMonth.raw);
            const article = dayDesc.startsWith('every') ? '' : 'the ';
            clauses.push(`on ${article}${dayDesc} of the month`);
        } else if (!parsed.dayOfWeek.any) {
            clauses.push(`on ${this.describeWeekdays(parsed.dayOfWeek.values)}`);
        }

        return clauses.join(' ');
    }

    private describeMinuteExpression(raw: string): string {
        return this.describeUnitExpression(raw, 'minute');
    }

    private describeHourExpression(raw: string): string {
        return this.describeUnitExpression(raw, 'hour');
    }

    private describeUnitExpression(raw: string, unit: 'minute' | 'hour'): string {
        if (raw === '*') {
            return `every ${unit}`;
        }

        const wildcardStep = raw.match(/^\*\/(\d+)$/);
        if (wildcardStep) {
            const step = Number.parseInt(wildcardStep[1], 10);
            return `every ${step} ${unit}`;
        }

        const rangeStep = raw.match(/^(\d+)-(\d+)\/(\d+)$/);
        if (rangeStep) {
            const start = Number.parseInt(rangeStep[1], 10);
            const end = Number.parseInt(rangeStep[2], 10);
            const step = Number.parseInt(rangeStep[3], 10);
            if (unit === 'hour') {
                return `every ${step} ${unit} from ${this.pad2(start)}:00 through ${this.pad2(end)}:00`;
            }
            return `every ${step} ${unit} from ${start} through ${end}`;
        }

        const range = raw.match(/^(\d+)-(\d+)$/);
        if (range) {
            const start = Number.parseInt(range[1], 10);
            const end = Number.parseInt(range[2], 10);
            if (unit === 'hour') {
                return `every ${unit} from ${this.pad2(start)}:00 through ${this.pad2(end)}:00`;
            }
            return `every ${unit} from ${start} through ${end}`;
        }

        if (raw.includes(',')) {
            const values = raw.split(',').map((part) => part.trim());
            return `${unit}s ${this.joinWithAnd(values)}`;
        }

        if (this.isSingleNumber(raw)) {
            return `${unit} ${Number.parseInt(raw, 10)}`;
        }

        return `${unit} pattern "${raw}"`;
    }

    private describeDayOfMonth(raw: string): string {
        if (this.isSingleNumber(raw)) {
            const dayNum = Number.parseInt(raw, 10);
            return this.toOrdinal(dayNum);
        }

        const wildcardStep = raw.match(/^\*\/(\d+)$/);
        if (wildcardStep) {
            const step = Number.parseInt(wildcardStep[1], 10);
            return `every ${this.toOrdinal(step)} day`;
        }

        const rangeStep = raw.match(/^(\d+)-(\d+)\/(\d+)$/);
        if (rangeStep) {
            const start = Number.parseInt(rangeStep[1], 10);
            const end = Number.parseInt(rangeStep[2], 10);
            const step = Number.parseInt(rangeStep[3], 10);
            return `every ${this.toOrdinal(step)} day from ${start} through ${end}`;
        }

        const range = raw.match(/^(\d+)-(\d+)$/);
        if (range) {
            return `${range[1]} through ${range[2]}`;
        }

        if (raw.includes(',')) {
            return this.joinWithAnd(raw.split(',').map((part) => part.trim()));
        }

        return raw;
    }

    private describeMonths(values: number[]): string {
        if (values.length >= 12) {
            return 'every month';
        }

        const labels = values.map((month) => CrontabGenerator.MONTH_LABELS[month - 1]);
        return this.joinWithAnd(labels);
    }

    private describeWeekdays(values: number[]): string {
        if (values.length >= 7) {
            return 'every day of the week';
        }

        const labels = values.map((day) => CrontabGenerator.WEEKDAY_LABELS[day]);
        return this.joinWithAnd(labels);
    }

    private findNextRun(parsed: ParsedCron, from: Date): Date | null {
        const candidate = new Date(from.getTime());
        candidate.setSeconds(0, 0);
        candidate.setMinutes(candidate.getMinutes() + 1);

        const maxIterations = 4_300_000;

        for (let index = 0; index < maxIterations; index += 1) {
            if (!parsed.month.set.has(candidate.getMonth() + 1)) {
                this.jumpToNextAllowedMonth(candidate, parsed.month.values);
                continue;
            }

            if (!this.matchesDay(candidate, parsed)) {
                candidate.setDate(candidate.getDate() + 1);
                candidate.setHours(0, 0, 0, 0);
                continue;
            }

            if (!parsed.hour.set.has(candidate.getHours())) {
                const nextHour = this.nextGreaterValue(parsed.hour.values, candidate.getHours());
                if (nextHour === undefined) {
                    candidate.setDate(candidate.getDate() + 1);
                    candidate.setHours(parsed.hour.values[0], 0, 0, 0);
                } else {
                    candidate.setHours(nextHour, 0, 0, 0);
                }
                continue;
            }

            if (!parsed.minute.set.has(candidate.getMinutes())) {
                const nextMinute = this.nextGreaterValue(parsed.minute.values, candidate.getMinutes());
                if (nextMinute === undefined) {
                    candidate.setHours(candidate.getHours() + 1, parsed.minute.values[0], 0, 0);
                } else {
                    candidate.setMinutes(nextMinute, 0, 0);
                }
                continue;
            }

            return candidate;
        }

        return null;
    }

    private matchesDay(date: Date, parsed: ParsedCron): boolean {
        const dayOfMonth = date.getDate();
        const dayOfWeek = date.getDay();

        const domMatch = parsed.dayOfMonth.set.has(dayOfMonth);
        const dowMatch = parsed.dayOfWeek.set.has(dayOfWeek);

        if (parsed.dayOfMonth.any && parsed.dayOfWeek.any) {
            return true;
        }

        if (parsed.dayOfMonth.any) {
            return dowMatch;
        }

        if (parsed.dayOfWeek.any) {
            return domMatch;
        }

        return domMatch || dowMatch;
    }

    private jumpToNextAllowedMonth(date: Date, allowedMonths: number[]): void {
        const currentMonth = date.getMonth() + 1;
        const nextMonth = allowedMonths.find((month) => month > currentMonth);

        if (nextMonth === undefined) {
            date.setFullYear(date.getFullYear() + 1);
            date.setMonth(allowedMonths[0] - 1, 1);
        } else {
            date.setMonth(nextMonth - 1, 1);
        }

        date.setHours(0, 0, 0, 0);
    }

    private nextGreaterValue(values: number[], current: number): number | undefined {
        return values.find((value) => value > current);
    }

    private isSingleNumber(value: string): boolean {
        return /^\d+$/.test(value);
    }

    private toOrdinal(value: number): string {
        const mod100 = value % 100;
        if (mod100 >= 11 && mod100 <= 13) {
            return `${value}th`;
        }

        const mod10 = value % 10;
        if (mod10 === 1) return `${value}st`;
        if (mod10 === 2) return `${value}nd`;
        if (mod10 === 3) return `${value}rd`;
        return `${value}th`;
    }

    private joinWithAnd(values: string[]): string {
        if (values.length === 0) return '';
        if (values.length === 1) return values[0];
        if (values.length === 2) return `${values[0]} and ${values[1]}`;
        return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
    }

    private formatDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = this.pad2(date.getMonth() + 1);
        const day = this.pad2(date.getDate());
        const hour = this.pad2(date.getHours());
        const minute = this.pad2(date.getMinutes());
        const second = this.pad2(date.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    private pad2(value: number): string {
        return String(value).padStart(2, '0');
    }
}