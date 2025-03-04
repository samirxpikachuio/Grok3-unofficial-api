import type { GrokResponse, OpenAIResponse } from '../types';

export function formatGrokResponse(responseText: string): OpenAIResponse {
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
}