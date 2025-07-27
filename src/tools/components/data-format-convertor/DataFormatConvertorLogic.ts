interface Window {
    jsyaml: any;
    fxp: any;
}

function convertJsonToYaml(jsonStr: string): string {
    const jsonObj = JSON.parse(jsonStr);
    return window.jsyaml.dump(jsonObj, { lineWidth: -1, indent: 4 });
}

function convertJsonToXml(jsonStr: string): string {
    const jsonObj = JSON.parse(jsonStr);
    const builder = new window.fxp.XMLBuilder({
        format: true,
        ignoreAttributes: false,
        indentBy: '  '
    });
    return builder.build(jsonObj);
}

function convertYamlToJson(yamlStr: string): string {
    const yamlObj = window.jsyaml.load(yamlStr);
    return JSON.stringify(yamlObj, null, 4);
}

function convertYamlToXml(yamlStr: string): string {
    const yamlObj = window.jsyaml.load(yamlStr);
    const builder = new window.fxp.XMLBuilder({
        format: true,
        ignoreAttributes: false,
        indentBy: '  '
    });
    return builder.build(yamlObj);
}

function convertXmlToJson(xmlStr: string): string {
    const parser = new window.fxp.XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    const xmlObj = parser.parse(xmlStr);
    return JSON.stringify(xmlObj, null, 4);
}

function convertXmlToYaml(xmlStr: string): string {
    const parser = new window.fxp.XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    const xmlObj = parser.parse(xmlStr);
    return window.jsyaml.dump(xmlObj, { lineWidth: -1, indent: 4 });
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

    const formatFrom = args.formatFrom;
    const formatTo = args.formatTo;

    // No conversion needed if formats are the same
    if (formatFrom === formatTo) {
        outputEditor.setValue(inputText);
        return;
    }

    try {
        let result: string;

        // Convert based on from/to formats
        if (formatFrom === 'json' && formatTo === 'yaml') {
            result = convertJsonToYaml(inputText);
        } else if (formatFrom === 'json' && formatTo === 'xml') {
            result = convertJsonToXml(inputText);
        } else if (formatFrom === 'yaml' && formatTo === 'json') {
            result = convertYamlToJson(inputText);
        } else if (formatFrom === 'yaml' && formatTo === 'xml') {
            result = convertYamlToXml(inputText);
        } else if (formatFrom === 'xml' && formatTo === 'json') {
            result = convertXmlToJson(inputText);
        } else if (formatFrom === 'xml' && formatTo === 'yaml') {
            result = convertXmlToYaml(inputText);
        } else {
            throw new Error(`Unsupported conversion: ${formatFrom} to ${formatTo}`);
        }

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