import { Elysia } from 'elysia';
import { grokRoute } from './routes/grok';

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
            };
        }
        set.status = 500;
        return {
            error: {
                message: `Grok API request failed: ${(error as Error).message}`,
                type: "api_error",
                param: null,
                code: null
            }
        };
    })
    .use(grokRoute)
    .listen(5000, () => {
        console.log('Server running at http://0.0.0.0:5000');
    });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);