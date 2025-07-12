import { Tool, ToolCategory } from '../types/tool';

export const TOOLS: Tool[] = [
    {
        id: 'uuid-generator',
        label: 'UUID Generator',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<uuid-generator></uuid-generator>',
        icon: 'key',
        tags: ['uuid', 'guid', 'id', 'identifier', 'random', 'generator']
    },
    {
        id: 'json-editor',
        label: 'JSON Editor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<json-editor></json-editor>',
        icon: 'file-json',
        tags: ['json', 'format', 'validate', 'data', 'structure', 'editor', 'parse'],
        editor: {
            viewType: 'code',
            language: 'json',
            initialValue: '{\n    "message": "Paste or type your JSON here."\n}',
            editorLogicPath: 'src/tools/components/json-editor/JsonEditorLogic.js'
        }
    },
    {
        id: 'yaml-editor',
        label: 'YAML Editor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<yaml-editor></yaml-editor>',
        icon: 'file-warning',
        tags: ['yaml', 'yml', 'format', 'validate', 'data', 'structure', 'editor', 'parse'],
        editor: {
            viewType: 'code',
            language: 'yaml',
            initialValue: 'message: Paste or type your YAML here.\n',
            editorLogicPath: 'src/tools/components/yaml-editor/YamlEditorLogic.js'
        }
    },
    {
        id: 'base64-encoder',
        label: 'Base64 Encoder / Decoder',
        version: '1.0.0',
        category: ToolCategory.Encode,
        template: '<base64-encoder></base64-encoder>',
        icon: 'file-digit',
        tags: ['base64', 'encode', 'decode', 'conversion', 'binary', 'text', 'string']
    },
    {
        id: 'url-encoder',
        label: 'URL Encoder',
        version: '1.0.0',
        category: ToolCategory.Encode,
        template: '<url-encoder></url-encoder>',
        icon: 'link-2',
        tags: ['url', 'uri', 'encode', 'decode', 'percent-encoding', 'web', 'query']
    },
    {
        id: 'color-convertor',
        label: 'Color Convertor',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-convertor></color-convertor>',
        icon: 'paintbrush-vertical',
        tags: ['color', 'hex', 'rgb', 'hsl', 'convert', 'css', 'design', 'format']
    },
    {
        id: 'color-palette',
        label: 'Color Palette Generator',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-palette></color-palette>',
        icon: 'swatch-book',
        isNew: true,
        tags: ['color', 'palette', 'scheme', 'design', 'ui', 'theme', 'generator', 'harmony']
    },
    {
        id: 'gradient-maker',
        label: 'Gradient Maker',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<gradient-maker></gradient-maker>',
        icon: 'rainbow',
        tags: ['gradient', 'css', 'linear', 'radial', 'design', 'background', 'color', 'transition']
    },
    {
        id: 'cubic-bezier',
        label: 'Cubic Bezier',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<cubic-bezier></cubic-bezier>',
        icon: 'tangent',
        tags: ['bezier', 'animation', 'easing', 'curve', 'timing', 'css', 'transition', 'motion']
    },
    {
        id: 'contrast-checker',
        label: 'Contrast Checker',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<contrast-checker></contrast-checker>',
        icon: 'contrast',
        tags: ['contrast', 'accessibility', 'a11y', 'wcag', 'color', 'ratio', 'readability', 'visibility']
    },
    {
        id: 'color-mixer',
        label: 'Color Mixer',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-mixer></color-mixer>',
        icon: 'blend',
        tags: ['color', 'mix', 'blend', 'combine', 'design', 'rgb', 'hsl', 'shade', 'tint']
    },
    {
        id: 'text-editor',
        label: 'Text Editor',
        version: '1.0.0',
        category: ToolCategory.Text,
        template: '<text-editor></text-editor>',
        icon: 'type',
        tags: ['text', 'editor', 'document', 'plain', 'edit', 'format', 'content'],
        editor: {
            viewType: 'simple',
            editorLogicPath: 'src/tools/components/json-editor/JsonEditorLogic.js'
        }
    },
    {
        id: 'diff-checker',
        label: 'Difference Checker',
        version: '1.0.0',
        category: ToolCategory.Text,
        template: '<diff-checker></diff-checker>',
        icon: 'file-diff',
        tags: ['diff', 'compare', 'text', 'difference', 'changes', 'comparison', 'version'],
        editor: {
            viewType: 'diff',
            language: 'plaintext'
        }
    },
    {
        id: 'token-generator',
        label: 'Token Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<token-generator></token-generator>',
        icon: 'tag',
        tags: ['token', 'api', 'security', 'auth', 'jwt', 'oauth', 'generator', 'random']
    },
    {
        id: 'password-generator',
        label: 'Password Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<password-generator></password-generator>',
        icon: 'asterisk',
        isNew: true,
        tags: ['password', 'security', 'random', 'generator', 'strong', 'credentials', 'secret']
    },
    {
        id: 'aes-encryption',
        label: 'AES Encryption / Decryption',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<aes-encryption></aes-encryption>',
        icon: 'lock-keyhole',
        tags: ['aes', 'encryption', 'decryption', 'security', 'cipher', 'symmetric', 'cryptography']
    },
    {
        id: 'sha-hashing',
        label: 'SHA Hashing',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<sha-hashing></sha-hashing>',
        icon: 'hash',
        tags: ['sha', 'hash', 'sha256', 'sha512', 'digest', 'checksum', 'fingerprint']
    },
    {
        id: 'rsa-key-generator',
        label: 'RSA Key Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<rsa-key-generator></rsa-key-generator>',
        icon: 'key-round',
        tags: ['rsa', 'key', 'public', 'private', 'encryption', 'asymmetric', 'generator', 'pair']
    },
    {
        id: 'rsa-encryption',
        label: 'RSA Encryption / Decryption',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<rsa-encryption></rsa-encryption>',
        icon: 'file-key-2',
        tags: ['rsa', 'encryption', 'decryption', 'asymmetric', 'public-key', 'cryptography', 'security']
    },
    {
        id: 'signature-verifier',
        label: 'Signature Signer / Verifier',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<signature-verifier></signature-verifier>',
        icon: 'signature',
        tags: ['signature', 'sign', 'verify', 'digital', 'certificate', 'authentication', 'cryptography']
    }
];