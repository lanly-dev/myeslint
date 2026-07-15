import * as vscode from 'vscode'
import MyLint from './MyLint'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const resourceUri = getResourceUri(context)
  const rc = vscode.commands.registerCommand
  const d1 = rc('mylint.openConfig', () => MyLint.openConfig(resourceUri))
  const d2 = rc('mylint.resetConfig', () => MyLint.resetConfig(resourceUri))
  const d3 = rc('mylint.lintFile', () => MyLint .lintFile(resourceUri))
  context.subscriptions.push(d1, d2, d3)
}

function getResourceUri(context: vscode.ExtensionContext): vscode.Uri {
  return vscode.Uri.joinPath(context.extensionUri, 'resources')
}

// This method is called when your extension is deactivated
export function deactivate() { }
