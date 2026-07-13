import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

function getExtensionDefaultPath(relativePath: string): string {
  return path.join(__dirname, '..', 'resources', relativePath)
}

function readExtensionFile(relativePath: string): string | null {
  const fullPath = getExtensionDefaultPath(relativePath)
  try {
    return fs.readFileSync(fullPath, 'utf-8')
  } catch {
    return null
  }
}

export default class MyEslint {
  static async openConfig(resourceUri: vscode.Uri): Promise<void> {
    const configFileUri = vscode.Uri.joinPath(resourceUri, 'eslint.config.js')
    const doc = await vscode.workspace.openTextDocument(configFileUri)
    await vscode.window.showTextDocument(doc, { preview: false })
  }

  static async resetConfig(resourceUri: vscode.Uri): Promise<void> {
    const configFileUri = vscode.Uri.joinPath(resourceUri, 'eslint.config.js')
    const defaultContent = readExtensionFile('eslint.bk.js')
    if (!defaultContent) {
      vscode.window.showErrorMessage('Failed to reset: default config file not found in extension resources')
      return
    }
    // Copy content from eslint.bk.js to the eslint.config.js file
    try {
      fs.mkdirSync(vscode.Uri.joinPath(configFileUri, '..').fsPath, { recursive: true })
      fs.writeFileSync(configFileUri.fsPath, defaultContent, 'utf-8')
    } catch {
      vscode.window.showErrorMessage('Failed to reset: could not write default config to workspace')
      return
    }
    vscode.window.showInformationMessage('ESLint config reset to default')
  }

  static async lintDirectory(resourceUri: vscode.Uri): Promise<void> {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri
    if (!root) {
      vscode.window.showErrorMessage('No workspace folder open')
      return
    }

    const dir = vscode.Uri.joinPath(root, '')
    const files = await vscode.workspace.findFiles(
      '**/*.{ts,js,mjs,cjs}',
      '**/node_modules/**,**/dist/**,**/build/**',
      1
    )

    if (files.length === 0) {
      vscode.window.showWarningMessage('No TS/JS files found to lint')
      return
    }

    const cmd = `npx eslint "${dir.fsPath}"`
    vscode.window.showInformationMessage(`Running ESLint on workspace: ${cmd}`)

    try {
      const { execSync } = await import('child_process') as any
      const output = execSync(cmd, { cwd: dir.fsPath, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })

      if (output.trim()) {
        vscode.window.showErrorMessage('ESLint reported issues')
        const chan = vscode.window.createOutputChannel('ESLint')
        chan.appendLine(output)
        chan.show(true)
      } else vscode.window.showInformationMessage('ESLint passed - no issues found')
    }

    catch (e: any) {
      const code = typeof e.code === 'number' ? e.code : (typeof e.status === 'number' ? e.status : null)

      if (code !== 0 && code !== 1) {
        vscode.window.showErrorMessage(`ESLint error: ${e.message}`)
        return
      }

      const output = e.stdout?.toString() || ''
      const chan = vscode.window.createOutputChannel('ESLint')
      chan.appendLine(output)
      chan.show(true)
      vscode.window.showWarningMessage('ESLint found issues - see Output panel')
    }
  }
}
