import * as yaml from 'js-yaml';

function minifyYaml() {
    if (!inputEditor || !outputEditor) return;
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        // Parse YAML to JS object
        const yamlObj = yaml.load(inputText);
        // Convert back to YAML without indentation (minified)
        outputEditor.setValue(yaml.dump(yamlObj, { 
            indent: 0,
            flowLevel: 0,
            lineWidth: -1 // No line wrapping
        }));
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid YAML: ' + e.message });
    }
}

function formatYaml() {
    if (!inputEditor || !outputEditor) return;
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        // Parse YAML to JS object
        const yamlObj = yaml.load(inputText);
        // Convert back to YAML with nice formatting
        outputEditor.setValue(yaml.dump(yamlObj, { 
            indent: 2,
            lineWidth: 80,
            noRefs: true
        }));
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid YAML: ' + e.message });
    }
}

window.toolLogic = {
    minify: minifyYaml,
    format: formatYaml,
};