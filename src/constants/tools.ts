import { Tool, ToolCategory } from '../types/tool';

export const TOOLS: Tool[] = [
    {
        id: 'uuid-generator',
        label: 'UUID Generator',
        description: 'Generate UUID strings',
        category: ToolCategory.Data,
        template: `
            <div class="tool-container">
                <p>Tool</p>
            </div>
        `
    },
    {
        id: 'base64',
        label: 'Base64 Encoder / Decoder',
        description: 'Encode/Decode Base64 strings',
        category: ToolCategory.Encode,
        template: `
            <div class="tool-container">
                <p>Tool</p>
            </div>
        `
    },
    {
        id: 'case-converter',
        label: 'Case Converter',
        description: 'Convert text case',
        category: ToolCategory.Text,
        template: `
            <div class="tool-container">
                <p>Tool</p>
            </div>
        `
    }
];