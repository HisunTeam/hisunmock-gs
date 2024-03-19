import OpenAI from 'openai';
import * as vscode from 'vscode';
import type { generateContentResult } from '../types/index';
import { generateContentResultStatus } from '../types/index';

const openai = new OpenAI({
    baseURL: 'http://43.159.54.85:3000/v1/',
    apiKey: '1'
    // baseURL: 'https://key.wenwen-ai.com/v1/',
    // apiKey: 'sk-NYsoG3VBKDiTuvdtC969F95aFc4f45379aD3854a93602327'
});

export async function generateOpenaiContent(outputChannel: vscode.OutputChannel, text: string): Promise<generateContentResult> {
    function logObject(myObject: any) {
        let jsonString = JSON.stringify(myObject, null, 2);
        outputChannel.appendLine(jsonString);
    }
    logObject('OpenAI');
    logObject(text);

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
        model: 'gpt-4-turbo-preview',
        messages: [
            { role: "system", "content": `你是一个 mock 模拟数据生成专家，请根据我的内容输出成 JavaScript 对象, 内容将是 Markdown 格式
            然后你需要输出的 JavaScript 对象中包含 url / method / response。
            [url] 根据 [URL] 或 [地址信息] 获得值。
            [method] 根据 [Method] 或 [请求方式] 获得值。
            [response] 根据[输出]中的表格来生成键值对, 键名(Key)根据列名为[参数名]或[字段名]来命名, 且它的属性值(Value)根据列名[参数名]或[字段名]结合[字段描述]猜测有可能输出的值并随机输出一个语种为中文并且不能为空字符串和 null，值的类型必须按照列名[类型]规则，如[备注]中有约定字段有可能的值按照约定值来输出。
            如果有多条输出请返回多个 JavaScript 对象, 并连接成数组。
            必须只返回 JavaScript 对象不要返回 json 格式, 属性名不要用单引号或双引号包裹并在它的后面注释含义，不要返回其他不相关内容，返回格式如下
            \`\`\`javascript
            {
                url: "/",
                method: "",
                response: {
                }
            }
            \`\`\`
            下面我将输入 Markdown 内容`},
            { role: 'user', content: text }
        ],
    };
    try {
        const completion = await openai.chat.completions.create(params);
        logObject(completion.choices[0]?.message?.content);
        let text = completion.choices[0]?.message?.content || '';
        const regex = /```(js|javascript|json)\n/g;
        if (text) {
            if (!text.match(regex)) {
                return {
                    status: generateContentResultStatus.error,
                    text: text
                };
            }

            text = text.replace(regex, '');
            text = text.replace(/\n```/g, '');
        } else {
            return Promise.reject({
                status: generateContentResultStatus.error,
                text: 'empty text'
            });
        }
        return {
            status: generateContentResultStatus.success,
            text: text || ''
        };
    } catch (error) {
        logObject('api error');
        logObject(error);
        if (error instanceof OpenAI.APIError) {
            return {
                status: generateContentResultStatus.error,
                text: error?.code || ''
            };
        } else {
            return {
                status: generateContentResultStatus.error,
                text: '未知错误'
            };
        }
    }
}
