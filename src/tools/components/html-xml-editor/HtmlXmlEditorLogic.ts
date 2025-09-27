let htmlXmlIndentation = 2;

function formatMarkup(text: string, indentSize = 2): string {
    const parser = new DOMParser();
    let doc;
    let isXml = false;
    
    try {
        doc = parser.parseFromString(text, 'application/xml');
        const xmlParseError = doc.getElementsByTagName('parsererror');
        if (xmlParseError.length === 0) {
            isXml = true;
        }
    } catch (e) {
    }

    if (!isXml) {
        doc = parser.parseFromString(text, 'text/html');
    }

    if (!doc || !doc.documentElement) {
        throw new Error('Could not parse as HTML or XML');
    }

    const formatted = formatNode(doc.documentElement, 0, indentSize, isXml);
    
    if (isXml) {
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + formatted;
    }
    
    return formatted;
}

function formatNode(node: Node, level: number, indentSize: number, isXml: boolean): string {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            return '';
        }
        return ' '.repeat(level * indentSize) + trimmed + '\n';
    }
    
    if (node.nodeType === Node.COMMENT_NODE) {
        return ' '.repeat(level * indentSize) + '<!--' + (node.nodeValue || '') + '-->\n';
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
    }
    
    const element = node as Element;
    const tagName = isXml ? element.tagName : element.tagName.toLowerCase();
    
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    
    let result = ' '.repeat(level * indentSize) + '<' + tagName;
    
    // Add attributes if any
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        result += ' ' + attr.name + '="' + attr.value + '"';
    }
    
    // Handle self-closing elements
    if (element.children.length === 0 && element.textContent?.trim() === '' && 
        (isXml || selfClosingTags.includes(tagName))) {
        if (isXml) {
            result += '/>\n';
        } else {
            result += '>\n';
        }
        return result;
    }
    
    result += '>\n';
    
    // Process child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
        result += formatNode(element.childNodes[i], level + 1, indentSize, isXml);
    }
    
    result += ' '.repeat(level * indentSize) + '</' + tagName + '>\n';
    
    return result;
}

function minifyMarkup(text: string): string {
    const parser = new DOMParser();
    let doc;
    
    try {
        doc = parser.parseFromString(text, 'application/xml');
        const xmlParseError = doc.getElementsByTagName('parsererror');
        if (xmlParseError.length > 0) {
            doc = parser.parseFromString(text, 'text/html');
        }
    } catch (e) {
        throw new Error('Could not parse as HTML or XML');
    }
    
    // Remove comments
    let result = text.replace(/<!--[\s\S]*?-->/g, '');
    // Remove whitespace between tags
    result = result.replace(/>\s+</g, '><');
    // Remove leading and trailing whitespace from lines
    result = result.replace(/^\s+|\s+$/gm, '');
    // Collapse multiple whitespaces
    result = result.replace(/\s{2,}/g, ' ');
    
    return result;
}

function minifyXml() {
    if (!inputEditor || !outputEditor) { return; }
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        
        const result = minifyMarkup(inputText);
        outputEditor.setValue(result);
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid HTML/XML: ' + e.message });
    }
}

function formatXml() {
    if (!inputEditor || !outputEditor) { return; }
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        
        const result = formatMarkup(inputText, htmlXmlIndentation);
        outputEditor.setValue(result);
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid HTML/XML: ' + e.message });
    }
}

function updateHtmlXmlIndentation(args: { indentation: number }) {
    htmlXmlIndentation = args.indentation;
    formatXml();
}

window.toolLogic = {
    minify: minifyXml,
    format: formatXml,
    updateHtmlXmlIndentation
};