declare const inputEditor: any;
declare const outputEditor: any;
declare const vscode: any;

function minifyJson() {
    if (!inputEditor || !outputEditor) return;
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        const jsonObj = JSON.parse(inputText);
        outputEditor.setValue(JSON.stringify(jsonObj));
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid JSON: ' + e.message });
    }
}

function formatJson() {
    if (!inputEditor || !outputEditor) return;
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        const jsonObj = JSON.parse(inputText);
        outputEditor.setValue(JSON.stringify(jsonObj, null, 4)); // Format with 4 spaces
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid JSON: ' + e.message });
    }
}

(window as any).toolLogic = {
    minify: minifyJson,
    format: formatJson,
};