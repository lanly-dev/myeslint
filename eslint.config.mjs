import typescriptEslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default [{
  files: ['**/*.ts', '**/*.js']
}, {
  ignores: ['node_modules', 'dist']
},
{
  plugins: {
    '@typescript-eslint': typescriptEslint.plugin,
    '@stylistic': stylistic
  },

  languageOptions: {
    parser: typescriptEslint.parser,
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      __dirname: 'readonly',
      console: 'readonly',
      module: 'readonly',
      process: 'readonly',
      require: 'readonly'
    }
  },

  rules: {
    '@typescript-eslint/naming-convention': ['warn', {
      selector: 'import',
      format: ['camelCase', 'PascalCase']
    }],
    '@stylistic/indent': ['error', 2],
    '@stylistic/max-len': ['error', { code: 120 }],
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'no-throw-literal': 'warn',
    'quote-props': ['error', 'as-needed'],
    'constructor-super': 'warn',
    'no-const-assign': 'warn',
    'no-this-before-super': 'warn',
    'no-undef': 'warn',
    'no-unreachable': 'warn',
    'no-unused-vars': 'warn',
    'valid-typeof': 'warn',
    curly: ['error', 'multi-line'],
    eqeqeq: 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: ['error', 'never']
  }
}]
