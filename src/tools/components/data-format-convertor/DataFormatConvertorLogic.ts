import * as YAML from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as TOML from 'toml';

let currentFormatFrom = 'json';
let currentFormatTo = 'yaml';
let conversionListener: { dispose: () => void } | null = null;

function toJSON(input: string, sourceFormat: string): any {
    switch (sourceFormat) {
        case 'json':
            return JSON.parse(input);
        case 'yaml':
            return YAML.load(input);
        case 'xml':
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: "@_"
            });
            return parser.parse(input);
        case 'toml':
            return TOML.parse(input);
        default:
            throw new Error(`Unsupported source format: ${sourceFormat}`);
    }
}

function fromJSON(jsonObj: any, targetFormat: string): string {
    switch (targetFormat) {
        case 'json':
            return JSON.stringify(jsonObj, null, 4);
        case 'yaml':
            return YAML.dump(jsonObj, { lineWidth: -1, indent: 2 });
        case 'xml':
            const builder = new XMLBuilder({
                format: true,
                ignoreAttributes: false,
                indentBy: '  '
            });
            return builder.build(jsonObj);
        case 'toml':
            throw new Error("TOML stringification is not supported. Please choose a different target format.");
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

    // No conversion needed if formats are the same
    if (formatFrom === formatTo) {
        outputEditor.setValue(inputText);
        return;
    }

    try {
        const jsonObj = toJSON(inputText, formatFrom);
        const result = fromJSON(jsonObj, formatTo);
        
        outputEditor.setValue(result);
    } catch (error: any) {
        console.error('Error during conversion:', error);
        outputEditor.setValue(`Error: ${error.message}`);
        
        (window as any).vscode.postMessage({
            type: 'error',
            value: `Conversion error: ${error.message}`
        });
    }
}

function throttle(func: (...args: any[]) => void, delay: number) {
    let lastCall = 0;
    let timeout: NodeJS.Timeout | null = null;

    return function(...args: any[]) {
        const now = new Date().getTime();
        const timeSinceLastCall = now - lastCall;
        
        if (timeSinceLastCall >= delay) {
            lastCall = now;
            return func(...args);
        } else {
            clearTimeout(timeout!);
            timeout = setTimeout(() => {
                lastCall = new Date().getTime();
                func(...args);
            }, delay - timeSinceLastCall);
        }
    };
}

const convertSmall = throttle((text) => {
    performConversion(text, currentFormatFrom, currentFormatTo);
}, 0);

const convertLarge = throttle((text) => {
    performConversion(text, currentFormatFrom, currentFormatTo);
}, 800);

function updateFormats(args: { formatFrom: string, formatTo: string }) {
    currentFormatFrom = args.formatFrom;
    currentFormatTo = args.formatTo;
    
    const text = inputEditor.getValue();
    if (text.length > 0) {
        performConversion(text, currentFormatFrom, currentFormatTo);
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

function convert(args: { formatFrom: string, formatTo: string }) {
    updateFormats(args);
}

window.toolLogic = {
    convert,
    updateFormats
};