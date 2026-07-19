import { commands, Range, Uri, TextEdit, window, workspace, WorkspaceEdit } from 'vscode'
import { ESLint, Linter } from 'eslint'
import configs from './Configs'

const { showErrorMessage, showInformationMessage, showTextDocument } = window
export default class MyLint {
  static async openConfig(resourceUri: Uri): Promise<void> {
    const configFileUri = Uri.joinPath(resourceUri, '..', 'src', 'Configs.ts')
    const doc = await workspace.openTextDocument(configFileUri)
    await showTextDocument(doc, { preview: true, preserveFocus: true })
  }

  static async openSettings(): Promise<void> {
    await commands.executeCommand('workbench.action.openSettings', 'mylint')
  }

  static async formatFile(): Promise<void> {
    const editor = window.activeTextEditor
    if (!editor) {
      showErrorMessage('No active text editor to format')
      return
    }

    const document = editor.document
    if (document.languageId !== 'typescript' && document.languageId !== 'javascript') {
      showErrorMessage('ESLint formatting is only supported for TypeScript and JavaScript files')
      return
    }

    const code = document.getText()
    const overrideConfig = await configs()

    // If the user has defined any rules in settings, replace the defaults entirely
    const userRules = workspace.getConfiguration('mylint').get<Linter.RulesRecord>('rules', {})
    if (Object.keys(userRules).length > 0) {
      const rulesConfig = overrideConfig[overrideConfig.length - 1]
      rulesConfig.rules = userRules
    }

    const linter = new ESLint({
      overrideConfigFile: true,
      overrideConfig,
      fix: true,
      allowInlineConfig: false
    })

    let results: ESLint.LintResult[] | undefined
    // Lint and auto-fix the file content using flat config
    try {
      results = await linter.lintText(code)
    } catch (error) {
      showErrorMessage(`Failed to lint file: ${error}`)
      return
    }

    if (!results || results.length === 0) {
      showInformationMessage('No ESLint issues found in file')
      return
    }

    const result = results[0]

    // Write fixed output back to the document if there are fixes available
    if (result.output && result.output !== code) {
      const fullRange = new Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      )
      const edit = new WorkspaceEdit()
      edit.set(document.uri, [TextEdit.replace(fullRange, result.output)])
      await workspace.applyEdit(edit)

      if (result.messages.length > 0) {
        showInformationMessage(`Fixed ESLint issues. ${result.messages.length} issue(s) remain`)
      } else showInformationMessage('ESLint auto-fix completed successfully')
    }
    else if (result.output === code) {
      showInformationMessage(`${result.messages.length} ESLint issue(s) could not be auto-fixed`)
    }

    // Log remaining issues
    if (result.messages.length > 0) {
      const errorMsg = result.messages.map((m: any) => {
        const severity = m.severity === 2 ? 'Error' : m.severity === 1 ? 'Warning' : 'Info'
        return `[${severity}] Line ${m.line}:${m.column + 1}: ${m.message}`
      }).join('\n')
      showInformationMessage(`ESLint remaining issues:\n${errorMsg}`)
    }
  }
}
