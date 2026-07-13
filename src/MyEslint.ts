import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { ESLint } from 'eslint'

export default class MyEslint {
  static async openConfig(resourceUri: vscode.Uri): Promise<void> {
    const configFileUri = vscode.Uri.joinPath(resourceUri, 'eslint.config.js')
    const doc = await vscode.workspace.openTextDocument(configFileUri)
    await vscode.window.showTextDocument(doc, { preview: false })
  }

  static async resetConfig(resourceUri: vscode.Uri): Promise<void> {
    const configFileUri = vscode.Uri.joinPath(resourceUri, 'eslint.config.js')
    const backupConfigFileUri = vscode.Uri.joinPath(resourceUri, 'eslint.bk.js')
    if (!fs.existsSync(backupConfigFileUri.fsPath)) {
      vscode.window.showErrorMessage('Failed to reset: default config file not found in extension resources')
      return
    }
    // Copy content from eslint.bk.js to the eslint.config.js file
    try {
      fs.mkdirSync(vscode.Uri.joinPath(configFileUri, '..').fsPath, { recursive: true })
      const backupContent = fs.readFileSync(backupConfigFileUri.fsPath, 'utf-8')
      fs.writeFileSync(configFileUri.fsPath, backupContent, 'utf-8')
    } catch {
      vscode.window.showErrorMessage('Failed to reset: could not write default config to workspace')
      return
    }
    vscode.window.showInformationMessage('ESLint config reset to default')
  }

  static async lintFile(resourceUri: vscode.Uri): Promise<void> {
    console.log('Starting linting process')
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor to lint')
      return
    }

    const document = editor.document
    if (document.languageId !== 'typescript' && document.languageId !== 'javascript') {
      vscode.window.showErrorMessage('ESLint linting is only supported for TypeScript and JavaScript files')
      return
    }

    const code = document.getText()
    const filePath = document.fileName


    // Get extension path to the bundled resources folder
    const extensionPath = vscode.extensions.getExtension('myeslint')?.extensionPath
    if (!extensionPath) {
      vscode.window.showErrorMessage('MyEslint extension not found')
      return
    }

    // The webpack build outputs resources to 'out/resources/' but VS Code extracts .vsix with
    // files directly in 'resources/'. Use whichever exists.
    const bundledConfigPath = path.join(extensionPath, 'out', 'resources', 'eslint.config.js')
    const fallbackConfigPath = path.join(extensionPath, 'resources', 'eslint.config.js')

    const configToUse = fs.existsSync(bundledConfigPath)
      ? bundledConfigPath
      : (fs.existsSync(fallbackConfigPath) ? fallbackConfigPath : null)

    if (!configToUse || !fs.existsSync(configToUse)) {
      vscode.window.showErrorMessage('ESLint configuration file not found in extension')
      return
    }

    // Load the ESLint configuration from bundled eslint.config.js (CommonJS format)
    const linter = new ESLint({
      overrideConfigFile: configToUse,
      fix: true,
      allowInlineConfig: false
    })

    // Lint and auto-fix the file content using flat config
    const results = await linter.lintText(code, { filePath: filePath || 'file.js' })

    if (results.length === 0) {
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
      else
        vscode.window.showInformationMessage('ESLint auto-fix completed successfully')
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
