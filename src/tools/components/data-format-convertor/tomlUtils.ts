export function jsonToToml(obj: any, options: { indent?: string } = {}): string {
    const indent = options.indent || '  ';
    return convertObjectToToml(obj, '', indent);
}

function convertObjectToToml(obj: any, path: string = '', indent: string = '  ', depth: number = 0): string {
    if (obj === null || obj === undefined) {
        return '';
    }

    let result = '';
    
    // Process simple key/value pairs first
    const simpleEntries: [string, any][] = [];
    const objectEntries: [string, object][] = [];
    const arrayEntries: [string, any[]][] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                // Array of objects needs special handling
                objectEntries.push([key, value]);
            } else {
                arrayEntries.push([key, value]);
            }
        } else if (typeof value === 'object' && value !== null) {
            objectEntries.push([key, value]);
        } else {
            simpleEntries.push([key, value]);
        }
    });

    simpleEntries.forEach(([key, value]) => {
        result += `${escapeKey(key)} = ${formatValue(value)}\n`;
    });
    
    arrayEntries.forEach(([key, value]) => {
        result += `${escapeKey(key)} = ${formatArray(value)}\n`;
    });
    
    if ((simpleEntries.length > 0 || arrayEntries.length > 0) && objectEntries.length > 0) {
        result += '\n';
    }
    
    objectEntries.forEach(([key, value], index) => {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (typeof item === 'object' && item !== null) {
                    const tableName = path ? `${path}.${key}` : key;
                    result += `[[${tableName}]]\n`;
                    result += convertObjectToToml(item, '', indent, depth + 1);
                    result += '\n';
                }
            });
        } else {
            const newPath = path ? `${path}.${key}` : key;
            result += `[${newPath}]\n`;
            result += convertObjectToToml(value, '', indent, depth + 1);
            if (index < objectEntries.length - 1) {
                result += '\n';
            }
        }
    });
    
    return result;
}

function escapeKey(key: string): string {
    // If the key contains spaces or special characters, wrap it in quotes
    if (/[^A-Za-z0-9_-]/.test(key)) {
        return `"${key.replace(/"/g, '\\"')}"`;
    }
    return key;
}

function formatValue(value: any): string {
    if (value === null || value === undefined) {
        return 'null';
    }
    
    const type = typeof value;
    
    switch (type) {
        case 'string':
            // Use triple quotes for multiline strings
            if (value.includes('\n')) {
                return `"""\n${value}\n"""`;
            }
            return `"${value.replace(/"/g, '\\"')}"`;
        
        case 'number':
        case 'boolean':
            return String(value);
            
        case 'object':
            if (value instanceof Date) {
                return value.toISOString();
            }
            return 'null';
            
        default:
            return 'null';
    }
}

function formatArray(arr: any[]): string {
    if (arr.length === 0) {
        return '[]';
    }
    
    // Check if all items are of the same primitive type
    const firstType = typeof arr[0];
    const allSameType = arr.every(item => typeof item === firstType && 
        (firstType !== 'object' || item === null));
    
    // Simple, single-line array for primitive values
    if (allSameType && firstType !== 'object') {
        const items = arr.map(item => formatValue(item)).join(', ');
        return `[${items}]`;
    }
    
    // Multi-line array for mixed types or complex values
    const items = arr.map(item => formatValue(item)).join(',\n  ');
    return `[\n  ${items}\n]`;
}