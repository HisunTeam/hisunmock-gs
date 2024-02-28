import * as vscode from 'vscode';
import axios from 'axios';
import type { generateContentResult } from '../types/index';
import { generateContentResultStatus } from '../types/index';

export function generateGeminiContent(outputChannel: vscode.OutputChannel, text: string): Promise<generateContentResult> {
    function logObject(myObject: any) {
        let jsonString = JSON.stringify(myObject, null, 2);
        outputChannel.appendLine(jsonString);
    }

    if (!text) {
        return Promise.reject({
            status: generateContentResultStatus.error,
            text: '请输入内容'
        });
    }
    logObject('Gemini');

    let newValue = text;
    newValue = newValue + `\n请根据上面清单输出成 js 对象, 包含 url / method / response, 其中 response 根据[输出]中的内容，且值根据[类型]输出并根据[备注]分析有可能会输出的值，如有枚举值的情况请返回第一个枚举值，如果[备注]分析异常请根据[参数名]来尝试返回值，如果还是无法分析请返回空字符串\n请只返回 js 对象，不要返回其他不相关内容, js 对象字段中后面的备注请保留且不用单独输出`;
    console.log(newValue);
    logObject(text);

    return new Promise<generateContentResult>((resolve, reject) => {
        axios.post('https://googleai2.ivii.top/v1beta/models/gemini-pro:generateContent?key=AIzaSyDO7FV1izcIwhTGkBAZCq3mFE3XBPxJqmU', {
            "contents": [{
                "parts":[{
                "text": newValue
                }]
            }]
            }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response: { data: any; }) => {
            console.log(response.data);
            logObject(response.data);
            let text = '';
            response.data.candidates[0].content.parts.forEach((element: { text: any; }) => {
                text += element.text;
            });
            if (text) {
                text = text.replace(/```js\n/g, '').replace(/```javascript\n/g, '');
                text = text.replace(/\n```/g, '');
            } else {
                return reject({
                    status: generateContentResultStatus.error,
                    text: 'empty text'
                });
            }
            resolve({
                status: generateContentResultStatus.success,
                text: text
            });
        })
        .catch((error: any) => {
            console.error(error);
            logObject('error > ' + error);
            reject({
                status: generateContentResultStatus.error,
                text: error
            });
        });
    });
}