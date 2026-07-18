import typescriptEslint from 'typescript-eslint'
import { Linter } from 'eslint'

async function getConfigs(): Promise<Linter.Config[]> {
  const stylistic = (await import('@stylistic/eslint-plugin')).default

  return [
    { files: ['**/*.ts', '**/*.js'] },
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
        '@stylistic/indent': ['error', 2],
        '@stylistic/max-len': ['warn', { code: 120 }],
        '@typescript-eslint/naming-convention': ['warn', {
          selector: 'import',
          format: ['camelCase', 'PascalCase']
        }],
        'comma-dangle': ['error', 'never'],
        'constructor-super': 'warn',
        'eol-last': ['error', 'always'],
        'no-const-assign': 'warn',
        'no-this-before-super': 'warn',
        'no-throw-literal': 'warn',
        'no-undef': 'warn',
        'no-unreachable': 'warn',
        'no-unused-vars': 'warn',
        'quote-props': ['error', 'as-needed'],
        'valid-typeof': 'warn',
        curly: ['error', 'multi-line'],
        eqeqeq: 'error',
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
        semi: ['error', 'never']
      }
    }
  ]
}

export default getConfigs
