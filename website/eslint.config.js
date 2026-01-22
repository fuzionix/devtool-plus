import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
    globalIgnores(['dist', 'node_modules', '.git', 'public']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.consfigs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
        }
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        extends: [js.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: globals.node,
        },
    },
])
