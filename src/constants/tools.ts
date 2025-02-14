import { Tool, ToolCategory } from '../types/tool';

export const TOOLS: Tool[] = [
    {
        id: 'uuid-generator',
        label: 'UUID Generator',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<uuid-generator></uuid-generator>',
        icon: 'key',
        isNew: true
    },
    {
        id: 'json-minifier',
        label: 'JSON Minifier',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<json-minifier></json-minifier>',
        icon: 'file-json',
        editor: true
    },
    {
        id: 'base64-encoder',
        label: 'Base64 Encoder / Decoder',
        version: '1.0.0',
        category: ToolCategory.Encode,
        template: '<base64-encoder></base64-encoder>',
        icon: 'file-digit'
    },
    {
        id: 'url-encoder',
        label: 'URL Encoder',
        version: '1.0.0',
        category: ToolCategory.Encode,
        template: '<url-encoder></url-encoder>',
        icon: 'link-2'
    },
    {
        id: 'case-converter',
        label: 'Case Converter',
        version: '1.0.0',
        category: ToolCategory.Text,
        template: '<case-converter></case-converter>',
        icon: 'case-camel',
        editor: true
    },
    {
        id: 'token-generator',
        label: 'Token Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<token-generator></token-generator>',
        icon: 'tag'
    }
];