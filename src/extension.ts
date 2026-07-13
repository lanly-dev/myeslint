import * as vscode from 'vscode'
import MyEslint from './MyEslint'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const rc = vscode.commands.registerCommand
  const d1 = rc('myeslint.openConfig', () => MyEslint.openConfig(true))
  const d2 = rc('myeslint.resetConfig', () => MyEslint.resetConfig())
  const d3 = rc('myeslint.lintDirectory', () => MyEslint.lintDirectory())

  context.subscriptions.push(d1, d2, d3)
}

// This method is called when your extension is deactivated
export function deactivate() {}
