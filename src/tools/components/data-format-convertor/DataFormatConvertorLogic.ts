import * as YAML from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

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
        default:
            throw new Error(`Unsupported target format: ${targetFormat}`);
    }
}

async function convert(args: { formatFrom: string, formatTo: string }) {
    if (!inputEditor || !outputEditor) {
        console.error('Editors not initialized');
        return;
    }

    const inputText = inputEditor.getValue();
    if (!inputText.trim()) {
        outputEditor.setValue('');
        return;
    }

    const { formatFrom, formatTo } = args;

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

window.toolLogic = {
    convert
};