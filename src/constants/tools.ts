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
        id: 'json-editor',
        label: 'JSON Editor',
        version: '1.0.0',
        category: ToolCategory.Data,
        template: '<json-editor></json-editor>',
        icon: 'file-json',
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
        id: 'text-editor',
        label: 'Text Editor',
        version: '1.0.0',
        category: ToolCategory.Text,
        template: '<text-editor></text-editor>',
        icon: 'type',
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
        editor: {
            viewType: 'diff',
            language: 'plaintext'
        }
    },
    {
        id: 'color-convertor',
        label: 'Color Convertor',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-convertor></color-convertor>',
        icon: 'paintbrush-vertical',
    },
    {
        id: 'color-palette',
        label: 'Color Palette Generator',
        version: '1.0.0',
        category: ToolCategory.Design,
        template: '<color-palette></color-palette>',
        icon: 'swatch-book',
        isNew: true
    },
    {
        id: 'token-generator',
        label: 'Token Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<token-generator></token-generator>',
        icon: 'tag'
    },
    {
        id: 'password-generator',
        label: 'Password Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<password-generator></password-generator>',
        icon: 'asterisk',
        isNew: true
    },
    {
        id: 'aes-encryption',
        label: 'AES Encryption / Decryption',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<aes-encryption></aes-encryption>',
        icon: 'lock-keyhole',
    },
    {
        id: 'sha-hashing',
        label: 'SHA Hashing',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<sha-hashing></sha-hashing>',
        icon: 'hash'
    },
    {
        id: 'rsa-key-generator',
        label: 'RSA Key Generator',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<rsa-key-generator></rsa-key-generator>',
        icon: 'key-round'
    },
    {
        id: 'rsa-encryption',
        label: 'RSA Encryption / Decryption',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<rsa-encryption></rsa-encryption>',
        icon: 'file-key-2'
    },
    {
        id: 'signature-verifier',
        label: 'Signature Signer / Verifier',
        version: '1.0.0',
        category: ToolCategory.Cryptography,
        template: '<signature-verifier></signature-verifier>',
        icon: 'signature'
    }
];