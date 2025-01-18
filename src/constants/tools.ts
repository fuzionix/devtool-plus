import { Tool, ToolCategory } from '../types/tool';

export const TOOLS: Tool[] = [
    {
        id: 'uuid-generator',
        label: 'UUID Generator',
        description: 'Generate UUID strings',
        category: ToolCategory.Data,
        template: '<uuid-generator></uuid-generator>'
    },
    {
        id: 'base64-encoder',
        label: 'Base64 Encoder / Decoder',
        description: 'Encode/Decode Base64 strings',
        category: ToolCategory.Encode,
        template: '<base64-encoder></base64-encoder>'
    },
    {
        id: 'case-converter',
        label: 'Case Converter',
        description: 'Convert text case',
        category: ToolCategory.Text,
        template: '<case-converter></case-converter>'
    }
];