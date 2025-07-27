interface Window {
    jsyaml: any;
    fastXmlParser: any;
}

const loadedScripts: Record<string, Promise<void>> = {};
let scriptsLoaded = false;

function loadScript(url: string): Promise<void> {
    if (Object.prototype.hasOwnProperty.call(loadedScripts, url)) {
        return loadedScripts[url];
    }

    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });

    loadedScripts[url] = promise;
    return promise;
}

async function loadScripts() {
    try {
        await Promise.all([
            loadScript('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js'),
            loadScript('https://cdn.jsdelivr.net/npm/fast-xml-parser@5.2.5/lib/fxp.min.js')
        ]);

        if (!window.jsyaml) {
            throw new Error('js-yaml failed to load properly');
        }
        
        if (!window.fastXmlParser) {
            throw new Error('fast-xml-parser failed to load properly');
        }
        
        scriptsLoaded = true;
        console.log('All scripts loaded successfully');
    } catch (error) {
        console.error('Error loading scripts:', error);
        throw error;
    }
}

function convertJsonToYaml(jsonStr: string): string {
    const jsonObj = JSON.parse(jsonStr);
    return window.jsyaml.dump(jsonObj, { lineWidth: -1 });
}

function convertJsonToXml(jsonStr: string): string {
    const jsonObj = JSON.parse(jsonStr);
    const builder = new window.fastXmlParser.XMLBuilder({
        format: true,
        ignoreAttributes: false,
        indentBy: '  '
    });
    return builder.build(jsonObj);
}

function convertYamlToJson(yamlStr: string): string {
    const yamlObj = window.jsyaml.load(yamlStr);
    return JSON.stringify(yamlObj, null, 2);
}

function convertYamlToXml(yamlStr: string): string {
    const yamlObj = window.jsyaml.load(yamlStr);
    const builder = new window.fastXmlParser.XMLBuilder({
        format: true,
        ignoreAttributes: false,
        indentBy: '  '
    });
    return builder.build(yamlObj);
}

function convertXmlToJson(xmlStr: string): string {
    const parser = new window.fastXmlParser.XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    const xmlObj = parser.parse(xmlStr);
    return JSON.stringify(xmlObj, null, 2);
}

function convertXmlToYaml(xmlStr: string): string {
    const parser = new window.fastXmlParser.XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    const xmlObj = parser.parse(xmlStr);
    return window.jsyaml.dump(xmlObj, { lineWidth: -1 });
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
        await loadScripts();

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

loadScripts().catch(e => console.error('Failed to preload scripts:', e));