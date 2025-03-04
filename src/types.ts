export interface OpenAIMessage {
    role: 'user' | 'system' | 'assistant';
    content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

export interface OpenAIRequestBody {
    messages: OpenAIMessage[];
}

export interface GrokResponse {
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

export interface OpenAIResponse {
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

export interface ErrorResponse {
    error: {
        message: string;
        type: string;
        param: null | string;
        code: null | number;
    };
}