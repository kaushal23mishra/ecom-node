module.exports = {
    // Line width
    printWidth: 100,

    // Indentation
    tabWidth: 2,
    useTabs: false,

    // Semicolons
    semi: true,

    // Quotes
    singleQuote: true,
    quoteProps: 'as-needed',

    // JSX
    jsxSingleQuote: false,

    // Trailing commas
    trailingComma: 'es5',

    // Spacing
    bracketSpacing: true,
    bracketSameLine: false,

    // Arrow functions
    arrowParens: 'always',

    // Line endings
    endOfLine: 'lf',

    // Embedded language formatting
    embeddedLanguageFormatting: 'auto',

    // HTML whitespace
    htmlWhitespaceSensitivity: 'css',

    // Prose wrap
    proseWrap: 'preserve',

    // Ignore patterns
    overrides: [
        {
            files: '*.json',
            options: {
                printWidth: 80,
            },
        },
        {
            files: '*.md',
            options: {
                proseWrap: 'always',
                printWidth: 80,
            },
        },
    ],
};
