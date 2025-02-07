import { Tool, ToolCategory } from '../types/tool';

export const TOOLS: Tool[] = [
    {
        id: 'uuid-generator',
        label: 'UUID Generator',
        description: '1.0.0',
        category: ToolCategory.Data,
        template: '<uuid-generator></uuid-generator>',
        icon: 'key',
        isNew: true
    },
    {
        id: 'base64-encoder',
        label: 'Base64 Encoder / Decoder',
        description: '1.0.0',
        category: ToolCategory.Encode,
        template: '<base64-encoder></base64-encoder>',
        icon: 'file-digit'
    },
    {
        id: 'case-converter',
        label: 'Case Converter',
        description: '1.0.0',
        category: ToolCategory.Text,
        template: '<case-converter></case-converter>',
        icon: 'case-camel',
        editor: [
            {
                id: 'original',
                label: 'Original Text',
                language: 'plaintext',
                readOnly: false,
                placeholder: 'Enter text to convert...',
            },
            {
                id: 'converted',
                label: 'Converted Text',
                language: 'plaintext',
                readOnly: true,
                placeholder: 'Converted text will appear here...',
            }
        ]
    }
];