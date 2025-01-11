import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('devtool-plus.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from devtool-plus!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
