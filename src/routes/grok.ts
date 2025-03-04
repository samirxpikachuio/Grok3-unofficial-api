import { Elysia, t } from 'elysia';
import { processRequestBody } from '../helpers/req';
import { callGrokApi } from '../methods/call';
import { formatGrokResponse } from '../helpers/response';
import type { ErrorResponse } from '../types';

export const grokRoute = new Elysia()
    .post('/api/grok3', async ({ body, set }) => {
        const processed = await processRequestBody(body);
        if ('error' in processed) {
            set.status = 400;
            return processed as ErrorResponse;
        }

        const { messageText, fileAttachments } = processed;

        try {
            const responseText = await callGrokApi(messageText, fileAttachments);
            const openaiResponse = formatGrokResponse(responseText);
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
    });