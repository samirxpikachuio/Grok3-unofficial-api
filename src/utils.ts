import { GROK_ATTACHMENT_URL, AUTH_BEARER, AUTH_TOKEN } from './config';

export async function uploadFileToGrok(fileUrl: string): Promise<any> {
    try {
        const fileResponse = await fetch(fileUrl);
        const fileBuffer = await fileResponse.arrayBuffer();
        let contentType = fileResponse.headers.get('content-type') || '';

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
        form.append('file', new Blob([fileBuffer], { type: contentType }), filename);

        const grokRequestHeaders = {
            'authorization': `Bearer ${AUTH_BEARER}`,
            'accept-encoding': 'gzip, deflate, br, zstd',
            'cookie': `auth_token=${AUTH_TOKEN}`
        };

        const uploadResponse = await fetch(GROK_ATTACHMENT_URL, {
            method: 'POST',
            headers: grokRequestHeaders,
            body: form
        });

        const uploadData = await uploadResponse.json();
        return uploadData[0];
    } catch (error) {
        console.error(`Failed to upload file from ${fileUrl}: ${error}`);
        throw new Error(`Failed to upload file from ${fileUrl}`);
    }
}