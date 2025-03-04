import { GROK_API_URL, AUTH_BEARER, AUTH_TOKEN } from '../config';

export async function callGrokApi(messageText: string, fileAttachments: any[]): Promise<string> {
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

    const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: grokRequestHeaders,
        body: JSON.stringify(grokRequestBody)
    });

    return await response.text();
}