import * as vscode from 'vscode';
import { updateStatusBarItem } from '../updateStatusBarItem';
import { generateGeminiContent } from './gemini';
import { generateOpenaiContent } from './chatgpt';
import { modelProviders, generateContentResultStatus } from '../types/index';

const config = vscode.workspace.getConfiguration('hisunmock');

export async function generateContent(myStatusBarItem: vscode.StatusBarItem, context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, value: string) {
    let modelProvider = config.get('modelProvider');
    let toAI;
    function logObject(myObject: any) {
        let jsonString = JSON.stringify(myObject, null, 2);
        outputChannel.appendLine(jsonString);
    }

    switch (modelProvider) {
        case modelProviders.OpenAI:
            toAI = generateOpenaiContent;
            break;
        case modelProviders.Gemini:
            toAI = generateGeminiContent;
            break;
        default:
            toAI = generateOpenaiContent;
            break;
    }

    try {
        const result = await toAI(outputChannel, value);

        if (result.status === generateContentResultStatus.error) {
            updateStatusBarItem(myStatusBarItem, context, false, 'Error');
            vscode.window.showErrorMessage(result.text);
            return;
        }

        updateStatusBarItem(myStatusBarItem, context, false, 'Done');
        const doc = await vscode.workspace.openTextDocument();
        const editor = await vscode.window.showTextDocument(doc, { preview: false });
        editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), result.text);
        });
    } catch (error) {
        updateStatusBarItem(myStatusBarItem, context, false, 'Error');
        vscode.window.showErrorMessage('生成失败!');
        logObject('error > ' + error);
    }

}