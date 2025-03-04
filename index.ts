import { Elysia, t } from 'elysia';
import axios from 'axios';
import FormData from 'form-data';

const GROK_API_URL = "https://grok.x.com/2/grok/add_response.json";
const GROK_ATTACHMENT_URL = "https://x.com/i/api/2/grok/attachment.json";
const AUTH_TOKEN = "2e0f4afb61dfd8d5725e778d48e2784ae9d2864f";
const AUTH_BEARER = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

interface OpenAIMessage {
    role: 'user' | 'system' | 'assistant';
    content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

interface OpenAIRequestBody {
    messages: OpenAIMessage[];
}

interface GrokResponse {
    result?: {
        sender?: string;
        message?: string;
        isSoftStop?: boolean;
        imageAttachment?: {
            imageUrl?: string;
            mediaId?: number;
            mediaIdStr?: string;
            fileName?: string;
            mimeType?: string;
        };
        event?: {
            imageAttachmentUpdate?: {
                imageId?: number;
                imageIdStr?: string;
                imageUrl?: string;
                progress?: number;
                checkpoints?: number[];
            }
        };
        doImgGen?: boolean;
    };
}

interface OpenAIResponse {
    id: string;
    object: 'chat.completion';
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: 'assistant';
            content: string;
            images?: string[];
        };
        finish_reason: 'stop';
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface ErrorResponse {
    error: {
        message: string;
        type: string;
        param: null | string;
        code: null | number;
    };
}

async function uploadFileToGrok(fileUrl: string): Promise<any> {
    try {
       
        const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const fileBuffer = fileResponse.data;
        let contentType = fileResponse.headers['content-type'];


        const filename = fileUrl.split('/').pop() || 'upload';
        if (!contentType) {
            const extension = filename.split('.').pop()?.toLowerCase();
            switch (extension) {
                case 'jpg':
                case 'jpeg':
                    contentType = 'image/jpeg';
                    break;
                case 'png':
                    contentType = 'image/png';
                    break;
                case 'mp4':
                    contentType = 'video/mp4';
                    break;
                case 'mp3':
                    contentType = 'audio/mpeg';
                    break;
                default:
                    contentType = 'application/octet-stream';
            }
        }

        
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: filename,
            contentType: contentType
        });

       
        const grokRequestHeaders = {
            'authorization': `Bearer ${AUTH_BEARER}`,
            'accept-encoding': 'gzip, deflate, br, zstd',
            'cookie': `auth_token=${AUTH_TOKEN}`
        };

     
        const uploadResponse = await axios.post(GROK_ATTACHMENT_URL, form, {
            headers: {
                ...grokRequestHeaders,
                ...form.getHeaders()
            }
        });

     
        return uploadResponse.data[0];
    } catch (error) {
        console.error(`Failed to upload file from ${fileUrl}: ${error}`);
        throw new Error(`Failed to upload file from ${fileUrl}`);
    }
}

const app = new Elysia()
    .onError(({ code, error, set }) => {
        if (code === 'VALIDATION') {
            set.status = 400;
            return {
                error: {
                    message: error.message,
                    type: "invalid_request",
                    param: null,
                    code: null
                }
            } as ErrorResponse;
        }
        set.status = 500;
        return {
            error: {
                message: `Grok API request failed: ${(error as Error).message}`,
                type: "api_error",
                param: null,
                code: null
            }
        } as ErrorResponse;
    })
    .post('/api/grok3', async ({ body, headers, set }) => {

    
        if (!body || typeof body !== 'object' || !('messages' in body)) {
            set.status = 400;
            return {
                error: {
                    message: "Invalid request body. Expected 'messages' in request body",
                    type: "invalid_request",
                    param: null,
                    code: null
                }
            } as ErrorResponse;
        }

        const messages: OpenAIMessage[] = (body as OpenAIRequestBody).messages;

        if (!messages.length) {
            set.status = 400;
            return {
                error: {
                    message: "'messages' cannot be empty",
                    type: "invalid_request",
                    param: null,
                    code: null
                }
            } as ErrorResponse;
        }

        
        const lastUserMessage = messages
            .slice()
            .reverse()
            .find(msg => msg.role === 'user');

        if (!lastUserMessage) {
            set.status = 400;
            return {
                error: {
                    message: "No 'user' message found in messages",
                    type: "invalid_request",
                    param: null,
                    code: null
                }
            } as ErrorResponse;
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

       
        const grokRequestHeaders = {
            'authorization': `Bearer ${AUTH_BEARER}`,
            'content-type': 'application/json; charset=UTF-8',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'cookie': `auth_token=${AUTH_TOKEN}`
        };

        const grokRequestBody = {
            responses: [{
                message: messageText,
                sender: 1,
                promptSource: "",
                fileAttachments: fileAttachments
            }],
            systemPromptName: "",
            grokModelOptionId: "grok-3",
            returnSearchResults: true,
            returnCitations: true,
            promptMetadata: {
                promptSource: "NATURAL",
                action: "INPUT"
            },
            requestFeatures: {
                eagerTweets: true,
                serverHistory: true
            },
            enableCustomization: true,
            enableSideBySide: true,
            toolOverrides: {},
            isDeepsearch: false,
            isReasoning: false
        };

        try {
            const grokResponse = await axios.post(GROK_API_URL, grokRequestBody, {
                headers: grokRequestHeaders
            });

            const responseText: string = grokResponse.data;
            const responseLines = responseText.split('\n').filter(line => line);

            let completeContent = '';
            let imageUrls: string[] = [];
            let isImageGeneration = false;

            for (const line of responseLines) {
                try {
                    const grokData: GrokResponse = JSON.parse(line);
                    if (grokData.result?.doImgGen === true) {
                        isImageGeneration = true;
                    }
                    if (grokData.result?.sender === "ASSISTANT" && grokData.result.message) {
                        completeContent += grokData.result.message || '';
                    }
                    if (grokData.result?.event?.imageAttachmentUpdate?.progress === 100) {
                        const imageUrl = grokData.result.event.imageAttachmentUpdate.imageUrl;
                        if (imageUrl && imageUrl.startsWith("https://ton.x.com")) {
                            if (!imageUrls.includes(imageUrl)) {
                                imageUrls.push(imageUrl);
                            }
                        }
                    }
                    if (grokData.result?.imageAttachment?.imageUrl) {
                        const imageUrl = grokData.result.imageAttachment.imageUrl;
                        if (imageUrl && imageUrl.startsWith("https://ton.x.com")) {
                            if (!imageUrls.includes(imageUrl)) {
                                imageUrls.push(imageUrl);
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`Warning: Could not parse response line: ${e}`);
                }
            }

            const openaiResponse: OpenAIResponse = {
                id: "chatcmpl-" + Math.random().toString(36).substring(2, 15),
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: "grok-3",
                choices: [{
                    index: 0,
                    message: {
                        role: "assistant",
                        content: completeContent
                    },
                    finish_reason: "stop"
                }],
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0
                }
            };

            if (imageUrls.length > 0) {
                openaiResponse.choices[0].message.images = imageUrls.filter(url =>
                    url.startsWith("https://ton.x.com")
                );
                if (isImageGeneration && !completeContent.trim()) {
                    openaiResponse.choices[0].message.content = "Here are the generated images:";
                }
            }

            return openaiResponse;
        } catch (error: any) {
            console.error(`Grok API request failed: ${error}`);
            set.status = 500;
            return {
                error: {
                    message: "Grok API request failed",
                    type: 'api_error',
                    param: null,
                    code: null
                }
            } as ErrorResponse;
        }
    }, {
        body: t.Object({
            messages: t.Array(
                t.Object({
                    role: t.Union([t.Literal('user'), t.Literal('system'), t.Literal('assistant')]),
                    content: t.Union([
                        t.String(),
                        t.Array(
                            t.Union([
                                t.Object({
                                    type: t.Literal('text'),
                                    text: t.String()
                                }),
                                t.Object({
                                    type: t.Literal('image_url'),
                                    image_url: t.Object({
                                        url: t.String()
                                    })
                                })
                            ])
                        )
                    ])
                })
            )
        })
    })
    .listen(5000, () => {
        console.log('Server running at http://0.0.0.0:5000');
    });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);