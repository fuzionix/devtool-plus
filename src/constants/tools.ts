import { Tool, ToolCategory } from '../types/tool';

export const TOOLS: Tool[] = [
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
        tags: ['url', 'uri', 'encode', 'decode', 'percent-encoding', 'web', 'query', 'parameter']
    },
    {
        id: 'url-parser',
        label: 'URL Parser',
        version: '1.0.0',
        category: ToolCategory.Encode,
        template: '<url-parser></url-parser>',
        icon: 'link',
        tags: ['url', 'uri', 'parse', 'query', 'parameter', 'web', 'extract', 'structure']
    },
    {
        id: 'color-convertor',
        label: 'Color Convertor',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-convertor></color-convertor>',
        icon: 'paintbrush-vertical',
        tags: ['color', 'hex', 'rgb', 'hsl', 'convert', 'css', 'design', 'format', 'palette', 'picker']
    },
    {
        id: 'color-palette',
        label: 'Color Palette Generator',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-palette></color-palette>',
        icon: 'swatch-book',
        isNew: true,
        tags: ['color', 'palette', 'scheme', 'design', 'ui', 'theme', 'generator', 'harmony', 'complementary', 'analogous', 'triadic']
    },
    {
        id: 'gradient-maker',
        label: 'Gradient Maker',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<gradient-maker></gradient-maker>',
        icon: 'rainbow',
        tags: ['gradient', 'css', 'linear', 'radial', 'design', 'background', 'color', 'transition', 'blend', 'style']
    },
    {
        id: 'cubic-bezier',
        label: 'Cubic Bezier',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<cubic-bezier></cubic-bezier>',
        icon: 'tangent',
        tags: ['bezier', 'animation', 'easing', 'curve', 'timing', 'css', 'transition', 'motion', 'design', 'interactive']
    },
    {
        id: 'contrast-checker',
        label: 'Contrast Checker',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<contrast-checker></contrast-checker>',
        icon: 'contrast',
        tags: ['contrast', 'accessibility', 'a11y', 'wcag', 'color', 'ratio', 'readability', 'visibility', 'design', 'checker', 'compliance']
    },
    {
        id: 'color-mixer',
        label: 'Color Mixer',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-mixer></color-mixer>',
        icon: 'blend',
        tags: ['color', 'mix', 'blend', 'combine', 'design', 'rgb', 'hsl', 'shade', 'tint', 'tone', 'saturation', 'hue']
    },
    {
        id: 'uuid-generator',
        label: 'UUID Generator',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<uuid-generator></uuid-generator>',
        icon: 'rectangle-ellipsis',
        tags: ['uuid', 'guid', 'id', 'identifier', 'random', 'generator', 'unique'],
    },
    {
        id: 'data-format-convertor',
        label: 'Data Format Convertor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<data-format-convertor></data-format-convertor>',
        icon: 'shapes',
        tags: ['convert', 'format', 'json', 'yaml', 'xml', 'data', 'structure', 'parser', 'transform', 'editor'],
        editor: {
            viewType: 'code',
            language: 'json',
            initialValue: '{\n    "message": "Paste or type your data here."\n}',
            editorLogicPath: 'src/tools/components/data-format-convertor/DataFormatConvertorLogic.js'
        }

    },
    {
        id: 'json-editor',
        label: 'JSON Editor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<json-editor></json-editor>',
        icon: 'file-json',
        tags: ['json', 'format', 'validate', 'data', 'structure', 'editor', 'parse', 'object', 'array'],
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
        tags: ['yaml', 'yml', 'format', 'validate', 'data', 'structure', 'editor', 'parse', 'configuration'],
        editor: {
            viewType: 'code',
            language: 'yaml',
            initialValue: 'message: Paste or type your YAML here.\n',
            editorLogicPath: 'src/tools/components/yaml-editor/YamlEditorLogic.js'
        }
    },
    {
        id: 'html-xml-editor',
        label: 'HTML / XML Editor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<html-xml-editor></html-xml-editor>',
        icon: 'file-code',
        tags: ['html', 'xml', 'format', 'validate', 'data', 'structure', 'editor', 'parse', 'markup'],
        editor: {
            viewType: 'code',
            language: 'html',
            initialValue: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>HTML Example</title>\n</head>\n<body>\n    <h1>Paste or type your HTML or XML here.</h1>\n</body>\n</html>',
            editorLogicPath: 'src/tools/components/html-xml-editor/HtmlXmlEditorLogic.js'
        }
    },
    {
        id: 'datetime-convertor',
        label: 'Datetime Convertor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<datetime-convertor></datetime-convertor>',
        icon: 'calendar-clock',
        tags: ['datetime', 'convert', 'format', 'timezone', 'date', 'time', 'parser', 'relative', 'iso'],
    },
    {
        id: 'text-editor',
        label: 'Text Editor',
        version: '1.0.0',
        category: ToolCategory.Text,
        template: '<text-editor></text-editor>',
        icon: 'type',
        tags: ['text', 'editor', 'document', 'plain', 'edit', 'format', 'content', 'write', 'notes'],
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
        tags: ['diff', 'compare', 'text', 'difference', 'changes', 'comparison', 'version', 'editor'],
        editor: {
            viewType: 'diff',
            language: 'plaintext'
        }
    },
    {
        id: 'qr-code-generator',
        label: 'QR Code Generator',
        version: '1.0.0',
        category: ToolCategory.Util,
        template: '<qr-code-generator></qr-code-generator>',
        icon: 'qr-code',
        tags: ['qr', 'code', 'generator', 'barcode', 'scan', 'url', 'data', 'link']
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
        tags: ['password', 'security', 'random', 'generator', 'strong', 'credentials', 'secret', 'authentication']
    },
    {
        id: 'jwt-inspector',
        label: 'JWT Inspector',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<jwt-inspector></jwt-inspector>',
        icon: 'shield-check',
        tags: ['jwt', 'token', 'inspect', 'decode', 'security', 'authentication', 'authorization', 'header', 'payload', 'signature']
    },
    {
        id: 'aes-encryption',
        label: 'AES Encryption / Decryption',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<aes-encryption></aes-encryption>',
        icon: 'lock-keyhole',
        tags: ['aes', 'encryption', 'decryption', 'security', 'cipher', 'symmetric', 'cryptography', 'key', 'algorithm', 'data', 'protection']
    },
    {
        id: 'sha-hashing',
        label: 'SHA Hashing',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<sha-hashing></sha-hashing>',
        icon: 'hash',
        tags: ['sha', 'hash', 'sha256', 'sha512', 'digest', 'checksum', 'fingerprint', 'security', 'cryptography', 'data', 'integrity']
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