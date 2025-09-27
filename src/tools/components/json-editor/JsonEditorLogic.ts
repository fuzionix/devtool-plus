let jsonIndentation = 2;

function sortJsonObject(obj: any, orderBy: string, sortOrder: string): any {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = sortJsonObject(obj[key], orderBy, sortOrder);
        }
    }

    if (!Array.isArray(obj) && orderBy !== 'default') {
        const sortedEntries = Object.entries(obj).sort((a, b) => {
            // 'a' and 'b' are [key, value] pairs
            let compareA, compareB;

            if (orderBy === 'key') {
                compareA = a[0];
                compareB = b[0];
            } else {
                compareA = JSON.stringify(a[1]);
                compareB = JSON.stringify(b[1]);
            }

            // Handle numeric values for proper comparison
            if (!isNaN(Number(compareA)) && !isNaN(Number(compareB))) {
                compareA = Number(compareA);
                compareB = Number(compareB);
            }

            let result = 0;
            if (compareA < compareB) { result = -1; }
            if (compareA > compareB) { result = 1; }

            return sortOrder === 'desc' ? -result : result;
        });

        return Object.fromEntries(sortedEntries);
    }

    return obj;
}

function minifyJson(params: any = {}) {
    if (!inputEditor || !outputEditor) { return; }
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        
        let jsonObj = JSON.parse(inputText);
        
        if (params.orderBy && params.orderBy !== 'default') {
            jsonObj = sortJsonObject(jsonObj, params.orderBy, params.sortOrder || 'asc');
        }
        
        outputEditor.setValue(JSON.stringify(jsonObj));
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid JSON: ' + e.message });
    }
}

function formatJson(params: any = {}) {
    if (!inputEditor || !outputEditor) { return; }
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        
        let jsonObj = JSON.parse(inputText);
        
        if (params.orderBy && params.orderBy !== 'default') {
            jsonObj = sortJsonObject(jsonObj, params.orderBy, params.sortOrder || 'asc');
        }
        
        outputEditor.setValue(JSON.stringify(jsonObj, null, jsonIndentation));
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid JSON: ' + e.message });
    }
}

function updateIndentation(args: { indentation: number, orderBy: string, sortOrder: string }) {
    jsonIndentation = args.indentation;
    
    const text = inputEditor.getValue();
    if (text.length > 0) {
        formatJson({ orderBy: args.orderBy, sortOrder: args.sortOrder });
    }
}

window.toolLogic = {
    minify: minifyJson,
    format: formatJson,
    updateIndentation,
};