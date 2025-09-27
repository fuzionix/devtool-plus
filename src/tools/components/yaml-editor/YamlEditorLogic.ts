import * as yaml from 'js-yaml';

let yamlIndentation = 2;

// Function to sort object by key or value
function sortObject(obj: any, orderBy: string, sortOrder: string): any {
    // If not an object or is null, return as is
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }

    // For nested objects/arrays, recursively sort them
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = sortObject(obj[key], orderBy, sortOrder);
        }
    }

    // Only apply sorting to objects (not arrays)
    if (!Array.isArray(obj) && orderBy !== 'default') {
        const sortedEntries = Object.entries(obj).sort((a, b) => {
            // 'a' and 'b' are [key, value] pairs
            let compareA, compareB;

            if (orderBy === 'key') {
                compareA = a[0];
                compareB = b[0];
            } else { // 'value'
                compareA = JSON.stringify(a[1]);
                compareB = JSON.stringify(b[1]);
            }

            // Handle numeric values for proper comparison
            if (!isNaN(Number(compareA)) && !isNaN(Number(compareB))) {
                compareA = Number(compareA);
                compareB = Number(compareB);
            }

            let result = 0;
            if (compareA < compareB) result = -1;
            if (compareA > compareB) result = 1;

            // Flip the result if descending order
            return sortOrder === 'desc' ? -result : result;
        });

        // Convert back to object
        return Object.fromEntries(sortedEntries);
    }

    return obj;
}

function minifyYaml(params: any = {}) {
    if (!inputEditor || !outputEditor) return;
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        
        // Parse YAML to JS object
        let yamlObj = yaml.load(inputText);
        
        // Apply sorting if requested
        if (params.orderBy && params.orderBy !== 'default') {
            yamlObj = sortObject(yamlObj, params.orderBy, params.sortOrder || 'asc');
        }
        
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

function formatYaml(params: any = {}) {
    if (!inputEditor || !outputEditor) return;
    try {
        const inputText = inputEditor.getValue();
        if (!inputText.trim()) {
            outputEditor.setValue('');
            return;
        }
        
        // Parse YAML to JS object
        let yamlObj = yaml.load(inputText);
        
        // Apply sorting if requested
        if (params.orderBy && params.orderBy !== 'default') {
            yamlObj = sortObject(yamlObj, params.orderBy, params.sortOrder || 'asc');
        }
        
        // Convert back to YAML with nice formatting
        outputEditor.setValue(yaml.dump(yamlObj, { 
            indent: yamlIndentation,
            lineWidth: 80,
            noRefs: true
        }));
    } catch (e: any) {
        outputEditor.setValue(e.message);
        vscode.postMessage({ type: 'error', value: 'Invalid YAML: ' + e.message });
    }
}

function updateIndentation(args: { indentation: number, orderBy: string, sortOrder: string }) {
    yamlIndentation = args.indentation;
    
    const text = inputEditor.getValue();
    if (text.length > 0) {
        formatYaml({ orderBy: args.orderBy, sortOrder: args.sortOrder });
    }
}

window.toolLogic = {
    minify: minifyYaml,
    format: formatYaml,
    updateIndentation
};