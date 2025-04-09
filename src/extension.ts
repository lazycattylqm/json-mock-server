// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ChildProcess, spawn } from 'child_process';
import *as fs from 'fs';
import path = require('path');
import treeKill = require('tree-kill');
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "json-mock-server" is now active!');

	const config = vscode.workspace.getConfiguration('json-mock-server');
	const port = config.get<number>('port') as number;

	const wkPth = vscode.workspace.workspaceFolders?.[0].uri.fsPath || ''

	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBar.text = `$(zap) json-mock-server: ${port}`;
	statusBar.tooltip = `json-mock-server: ${port} click to stop`;
	statusBar.command = 'json-mock-server.stop';
	context.subscriptions.push(statusBar);

	let process: ChildProcess | null = null;

	const startServer = () => {
		if (wkPth === '') {
			vscode.window.showErrorMessage('Please open a workspace folder first.');
			return;
		}
		const db = path.join(wkPth, 'db.json');
		const prt = port.toString();
		const jsPath = path.join(__dirname, 'json.mock.server.js');
		const args = [jsPath, '-p', prt, '-d', db];
		process = spawn('node', args);
		if (process === null) {
			vscode.window.showErrorMessage('Failed to start server.');
			return;

		}

		process.on('spawn', () => {
			console.log(`Server started on ${port}`);

			statusBar.show();
		});

		process.on('exit', (code, signal) => {
			console.log(`Server status ${code} and signal ${signal}`);

		});

	}

	const stopServer = () => {
		if (process === null) {
			vscode.window.showErrorMessage('Server is not running.');
			return;
		}
		const pid = process.pid as number;
		treeKill(pid, 'SIGKILL', (err) => {
			if (err) {
				vscode.window.showErrorMessage('Failed to stop server.');
				return;
			}
			console.log(`Server stopped`);
			statusBar.hide();
			process = null;
		}
		);
	}

	const initDb = () => {
		if (wkPth === '') {
			vscode.window.showErrorMessage('Please open a workspace folder first.');
			return;
		}
		const db = path.join(__dirname, 'db.json');
		const targetDb = path.join(wkPth, 'db.json');
		if (!fs.existsSync(targetDb)) {
			fs.mkdirSync(wkPth, { recursive: true });
		}
		fs.cpSync(db, targetDb, { force: true });
		vscode.window.showInformationMessage('db.json file created in workspace folder');
	}

	const disposable = vscode.commands.registerCommand('json-mock-server.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from json-mock-server!');
	});




	context.subscriptions.push(disposable);


	context.subscriptions.push(vscode.commands.registerCommand('json-mock-server.start', () => {
		startServer()
	}));
	context.subscriptions.push(vscode.commands.registerCommand('json-mock-server.stop', () => {
		stopServer()
	}
	));
	context.subscriptions.push(vscode.commands.registerCommand('json-mock-server.init', () => {
		initDb()
	}
	));

}

// This method is called when your extension is deactivated
export function deactivate() { }
