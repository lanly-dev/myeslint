import * as vscode from 'vscode'
import { ESLint, Linter } from 'eslint'
import configs from './Configs'

export default class MyLint {
  static async openConfig(resourceUri: vscode.Uri): Promise<void> {
    const configFileUri = vscode.Uri.joinPath(resourceUri, '..', 'src', 'Configs.ts')
    const doc = await vscode.workspace.openTextDocument(configFileUri)
    await vscode.window.showTextDocument(doc, { preview: true, preserveFocus: true })
  }

  static async openSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'mylint')
  }

  static async formatFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor to format')
      return
    }

    const document = editor.document
    if (document.languageId !== 'typescript' && document.languageId !== 'javascript') {
      vscode.window.showErrorMessage('ESLint formatting is only supported for TypeScript and JavaScript files')
      return
    }

    const code = document.getText()
    const overrideConfig = await configs()

    // If the user has defined any rules in settings, replace the defaults entirely
    const userRules = vscode.workspace.getConfiguration('mylint').get<Linter.RulesRecord>('rules', {})
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
      vscode.window.showErrorMessage(`Failed to lint file: ${error}`)
      return
    }
    if (!results || results.length === 0) {
      vscode.window.showInformationMessage('No ESLint issues found in file')
      return
    }

    const result = results[0]

    // Write fixed output back to the document if there are fixes available
    if (result.output && result.output !== code) {
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      )
      const edit = new vscode.WorkspaceEdit()
      edit.set(document.uri, [vscode.TextEdit.replace(fullRange, result.output)])
      await vscode.workspace.applyEdit(edit)

      if (result.messages.length > 0) vscode.window.showInformationMessage(`Fixed ESLint issues. ${result.messages.length} issue(s) remain`)
      else vscode.window.showInformationMessage('ESLint auto-fix completed successfully')
    }
    else if (result.output === code)
      vscode.window.showInformationMessage(`${result.messages.length} ESLint issue(s) could not be auto-fixed`)

    // Log remaining issues
    if (result.messages.length > 0) {
      const errorMsg = result.messages.map((m: any) =>
        `[${m.severity === 2 ? 'Error' : m.severity === 1 ? 'Warning' : 'Info'}] Line ${m.line}:${m.column + 1}: ${m.message}`
      ).join('\n')
      console.log(`ESLint remaining issues:\n${errorMsg}`)
    }
  }
}
