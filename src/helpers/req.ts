import type { OpenAIMessage, OpenAIRequestBody, ErrorResponse } from '../types';
import { uploadFileToGrok } from '../utils';

export async function processRequestBody(body: any): Promise<{ messageText: string; fileAttachments: any[] } | ErrorResponse> {
    if (!body || typeof body !== 'object' || !('messages' in body)) {
        return {
            error: {
                message: "Invalid request body. Expected 'messages' in request body",
                type: "invalid_request",
                param: null,
                code: null
            }
        };
    }

    const messages: OpenAIMessage[] = (body as OpenAIRequestBody).messages;

    if (!messages.length) {
        return {
            error: {
                message: "'messages' cannot be empty",
                type: "invalid_request",
                param: null,
                code: null
            }
        };
    }

    const lastUserMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.role === 'user');

    if (!lastUserMessage) {
        return {
            error: {
                message: "No 'user' message found in messages",
                type: "invalid_request",
                param: null,
                code: null
            }
        };
    }

    const content = lastUserMessage.content;
    let messageText = '';
    let fileAttachments: any[] = [];

    if (typeof content === 'string') {
        messageText = content;
    } else if (Array.isArray(content)) {
        for (const item of content) {
            if (item.type === 'text') {
                messageText += item.text + ' ';
            } else if (item.type === 'image_url') {
                const mediaInfo = await uploadFileToGrok(item.image_url.url);
                fileAttachments.push(mediaInfo);
            }
        }
        messageText = messageText.trim();
    }

    if (!messageText && fileAttachments.length > 0) {
        messageText = "Please analyze the attached files.";
    }

    return { messageText, fileAttachments };
}