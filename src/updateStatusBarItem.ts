import * as vscode from "vscode";
var statusbartimer: NodeJS.Timeout;

export async function updateStatusBarItem(
    myStatusBarItem: vscode.StatusBarItem,
    context: vscode.ExtensionContext,
    isLoading: boolean,
    info: string
): Promise<void> {
    myStatusBarItem.show();
    if (statusbartimer) {
        clearTimeout(statusbartimer);
    }
    if (isLoading) {
        context.globalState.update('g_isLoading', true);
        myStatusBarItem.text = `$(loading~spin) ` + info;
    } else {
        context.globalState.update('g_isLoading', false);
        myStatusBarItem.text = `$(hisunCodeX-dark) ` + info;
        statusbartimer = setTimeout(() => {
            myStatusBarItem.text = `$(hisunCodeX-dark)`;
        }, 30000);
    }
}
