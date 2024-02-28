// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import mammoth from 'mammoth';
import htmltomd from 'html-to-md';
import { updateStatusBarItem } from './updateStatusBarItem';
import { generateContent } from './model/index';

let myStatusBarItem: vscode.StatusBarItem;
let outputChannel = vscode.window.createOutputChannel("hisunmock Log");
function logObject(myObject: any) {
    let jsonString = JSON.stringify(myObject, null, 2);
    outputChannel.appendLine(jsonString);
}
const loadingWarningText = '请等待上一次 Mock 生成完成';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('hisunmock.generate', async () => {
        if (context.globalState.get('g_isLoading', false)) {
            vscode.window.showErrorMessage(loadingWarningText);
            return;
        }

        const text = await vscode.window.showInputBox({
            prompt: '请输入接口文档内容',
            placeHolder: ''
        });
        if (!text) {
            vscode.window.showErrorMessage('请输入内容');
            return;
        }

        updateStatusBarItem(myStatusBarItem, context, true, 'processing');
        try {
            await generateContent(myStatusBarItem, context, outputChannel, text);
        } catch (error) {
            updateStatusBarItem(myStatusBarItem, context, false, 'Error');
            vscode.window.showErrorMessage('生成失败');
            logObject('error > ' + error);
        }
    });

    let disposable2 = vscode.commands.registerCommand('hisunmock.selectedDocumentGeneration', async () => {
        if (context.globalState.get('g_isLoading', false)) {
            vscode.window.showErrorMessage(loadingWarningText);
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('没有打开的编辑器');
            return;
        }

        let selection = editor.selection;
        let text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showErrorMessage('没有选中内容');
            return;
        }

        updateStatusBarItem(myStatusBarItem, context, true, 'processing');
        try {
            await generateContent(myStatusBarItem, context, outputChannel, text);
        } catch (error) {
            updateStatusBarItem(myStatusBarItem, context, false, 'Error');
            vscode.window.showErrorMessage('生成失败');
            logObject('error > ' + error);
        }
    });

    let disposable3 = vscode.commands.registerCommand('hisunmock.wordGeneration', async () => {
        if (context.globalState.get('g_isLoading', false)) {
            vscode.window.showErrorMessage(loadingWarningText);
            return;
        }
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Open',
            filters: {
               'word files': ['docx']
            }
        });

        updateStatusBarItem(myStatusBarItem, context, true, 'processing');

        if (fileUri && fileUri[0]) {
            try {
                const htmlResult = await mammoth.convertToHtml({ path: fileUri[0].fsPath });
                const markdown = htmltomd(htmlResult.value);
                const regexes = [
                    /#.输入输出接口([\s\S]*?)(?=#.组件列表)/,
                    /#.页面服务交易设计([\s\S]*?)(?=#.服务层模块设计)/,
                    /#.模块清单([\s\S]*?)(?=#.交易接口)/
                ];

                let match = null;
                for (const regex of regexes) {
                    match = markdown.match(regex);
                    if (match !== null) {
                        break;
                    }
                }

                if (match === null) {
                    updateStatusBarItem(myStatusBarItem, context, false, 'Error');
                    vscode.window.showErrorMessage('未找到匹配内容，请检查文档是否存在接口内容。');
                    return;
                }

                await generateContent(myStatusBarItem, context, outputChannel, match[1]);
            } catch (error) {
                updateStatusBarItem(myStatusBarItem, context, false, 'Error');
                vscode.window.showErrorMessage('生成失败');
                logObject('error > ' + error);
            }
        }
    });

    myStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    updateStatusBarItem(myStatusBarItem, context, false, '');

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
}

// This method is called when your extension is deactivated
export function deactivate() {}
