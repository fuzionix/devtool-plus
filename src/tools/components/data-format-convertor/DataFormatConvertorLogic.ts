import * as YAML from 'js-yaml';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

let currentFormatFrom = 'json';
let currentFormatTo = 'yaml';
let currentIndentation = 2;
let conversionListener: { dispose: () => void } | null = null;

function normalizeForToml(value: unknown): unknown {
    if (value === null || value === undefined) {
        return 'null';
    }

    if (Array.isArray(value)) {
        return value.map(item => normalizeForToml(item));
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const normalized: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(record)) {
            normalized[key] = normalizeForToml(item);
        }
        return normalized;
    }

    return value;
}

function toJSON(input: string, sourceFormat: string): unknown {
    switch (sourceFormat) {
        case 'json':
            return JSON.parse(input);
        case 'yaml':
            return YAML.load(input);
        case 'xml': {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_'
            });
            return parser.parse(input);
        }
        case 'toml':
            return parseToml(input);
        default:
            throw new Error(`Unsupported source format: ${sourceFormat}`);
    }
}

function fromJSON(jsonObj: unknown, targetFormat: string): string {
    switch (targetFormat) {
        case 'json':
            return JSON.stringify(jsonObj, null, currentIndentation);
        case 'yaml':
            return YAML.dump(jsonObj, { lineWidth: -1, indent: currentIndentation });
        case 'xml': {
            const builder = new XMLBuilder({
                format: true,
                ignoreAttributes: false,
                indentBy: ' '.repeat(currentIndentation)
            });
            return builder.build(jsonObj);
        }
        case 'toml': {
            if (jsonObj === null || typeof jsonObj !== 'object' || Array.isArray(jsonObj)) {
                throw new Error('TOML root must be an object/table.');
            }

            const normalized = normalizeForToml(jsonObj) as Record<string, unknown>;
            return stringifyToml(normalized);
        }
        default:
            throw new Error(`Unsupported target format: ${targetFormat}`);
    }
}

function performConversion(inputText: string, formatFrom: string, formatTo: string) {
    if (!inputEditor || !outputEditor) {
        console.error('Editors not initialized');
        return;
    }

    if (!inputText.trim()) {
        outputEditor.setValue('');
        return;
    }

    if (formatFrom === formatTo) {
        outputEditor.setValue(inputText);
        return;
    }

    try {
        const jsonObj = toJSON(inputText, formatFrom);
        const result = fromJSON(jsonObj, formatTo);
        outputEditor.setValue(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error during conversion:', error);
        outputEditor.setValue(`Error: ${message}`);

        (window as any).vscode.postMessage({
            type: 'error',
            value: `Conversion error: ${message}`
        });
    }
}

function throttle<T extends unknown[]>(func: (...args: T) => void, delay: number) {
    let lastCall = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: T) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= delay) {
            lastCall = now;
            func(...args);
            return;
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            lastCall = Date.now();
            func(...args);
        }, delay - timeSinceLastCall);
    };
}

const convertSmall = throttle((text: string) => {
    performConversion(text, currentFormatFrom, currentFormatTo);
}, 0);

const convertLarge = throttle((text: string) => {
    performConversion(text, currentFormatFrom, currentFormatTo);
}, 800);

function updateFormats(args: { formatFrom: string; formatTo: string; indentation?: number }) {
    currentFormatFrom = args.formatFrom;
    currentFormatTo = args.formatTo;

    if (typeof args.indentation === 'number') {
        currentIndentation = args.indentation;
    }

    const text = inputEditor.getValue();
    if (text.length > 0) {
        performConversion(text, currentFormatFrom, currentFormatTo);
    }
}

function updateIndentation(args: { indentation: number }) {
    currentIndentation = args.indentation;

    const text = inputEditor.getValue();
    if (text.length > 0) {
        performConversion(text, currentFormatFrom, currentFormatTo);
    }
}

function swapContent() {
    const inputText = inputEditor.getValue();
    const outputText = outputEditor.getValue();

    if (inputText.trim() && outputText.trim()) {
        inputEditor.setValue(outputText);
    }
}

function setupRealTimeConversion() {
    if (!inputEditor || !outputEditor) {
        return;
    }

    if (conversionListener) {
        conversionListener.dispose();
        conversionListener = null;
    }

    conversionListener = inputEditor.onDidChangeModelContent(() => {
        const text = inputEditor.getValue();

        if (text.length > 1000) {
            convertLarge(text);
        } else {
            convertSmall(text);
        }
    });

    const initialText = inputEditor.getValue();
    if (initialText.length > 0) {
        performConversion(initialText, currentFormatFrom, currentFormatTo);
    }
}

function initializeWhenReady() {
    if (inputEditor && outputEditor) {
        setupRealTimeConversion();
    } else {
        setTimeout(initializeWhenReady, 100);
    }
}

initializeWhenReady();

function convert(args: { formatFrom: string; formatTo: string; indentation?: number }) {
    updateFormats(args);
}

window.toolLogic = {
    convert,
    updateFormats,
    updateIndentation,
    swapContent
};