/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        vscode: {
          'focus-border': 'var(--vscode-focusBorder)',
          'foreground': 'var(--vscode-foreground)',
          'disabled-foreground': 'var(--vscode-disabledForeground)',
          'widget-border': 'var(--vscode-widget-border)',
          'selection-background': 'var(--vscode-selection-background)',
          'description-foreground': 'var(--vscode-descriptionForeground)',
          'error-foreground': 'var(--vscode-errorForeground)',
          'icon-foreground': 'var(--vscode-icon-foreground)',

          'button': {
            'foreground': 'var(--vscode-button-foreground)',
            'border': 'var(--vscode-button-border)',
            'hover': 'var(--vscode-button-hoverBackground)',
            'separator': 'var(--vscode-button-separator)',
            'secondary': {
              'foreground': 'var(--vscode-button-secondaryForeground)',
              'hover': 'var(--vscode-button-secondaryHoverBackground)',
            },
          },
          'input': {
            'foreground': 'var(--vscode-input-foreground)',
            'border': 'var(--vscode-input-border)',
            'placeholder': 'var(--vscode-input-placeholderForeground)',
          },
          'checkbox': {
            'foreground': 'var(--vscode-checkbox-foreground)',
            'border': 'var(--vscode-checkbox-border)',
            'select': {
              'border': 'var(--vscode-checkbox-selectBorder)',
            },
          },
          'radio': {
            'active': {
              'foreground': 'var(--vscode-radio-activeForeground)',
              'border': 'var(--vscode-radio-activeBorder)',
            },
            'inactive': {
              'foreground': 'var(--vscode-radio-inactiveForeground)',
              'border': 'var(--vscode-radio-inactiveBorder)',
              'hover': 'var(--vscode-radio-inactiveHoverBackground)',
            },
          },
        },
      },
    },
  },
  plugins: [],
};