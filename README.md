# Unofficial Grok 3 API

Welcome to the unofficial **Grok 3 API**! This project, built with **Elysia** and **Bun.js**, provides a RESTful interface to interact with Grok 3’s powerful capabilities. Whether you’re sending **text, images, or both**, this API delivers responses in an **OpenAI-compatible format**, making integration easy.

> **Disclaimer**: This is an **unofficial API** and is not affiliated with or endorsed by the official Grok 3 project or its creators.

---

## Table of Contents

- [Features](#features)
- [Quickstart](#quickstart)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Authentication Setup](#authentication-setup)
- [Sending Requests](#sending-requests)
- [Response Format](#response-format)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)
- [Rate Limiting & Usage Guidelines](#rate-limiting-and-usage-guidelines)
- [Security Best Practices](#security-best-practices)
- [API Architecture](#api-architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [FAQ](#frequently-asked-questions)
- [Changelog](#changelog)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Multi-Input Support**: Send **text, image URLs, or both**.
- **File Uploads**: Handles **image uploads** to Grok 3 using Bun.js’s **native fetch** and **FormData**.
- **OpenAI Compatibility**: Responses are structured to match OpenAI’s API format.
- **Lightweight & Fast**: Built with **Elysia** and **Bun.js** for high performance.
- **Modular Codebase**: Organized into **modules** for easy maintenance.
- **Error Handling**: Detailed error messages for troubleshooting.

---

## Quickstart

Get started in minutes!

### Clone the Repository
```bash
git clone https://github.com/samirxpikachuio/Grok3-unofficial-api.git
cd Grok3-unofficial-api
```

### Install Dependencies
```bash
bun install
```

### Run the Server
```bash
bun run src/app.ts
```

### Send a Test Request
Replace `$auth_bearer,$auth_token` with your actual API key ([see Authentication Setup](#authentication-setup)).

```bash
curl -X POST http://0.0.0.0:5000/api/grok3 \
-H "Authorization: Bearer $auth_bearer,$auth_token" \
-H "Content-Type: application/json" \
-d '{"messages": [{"role": "user", "content": "Hello, Grok!"}]}'
```

### Response Example
```json
{
    "id": "chatcmpl-xyz789",
    "object": "chat.completion",
    "created": 1694268190,
    "model": "grok-3",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Hi there! How can I assist you today?"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0
    }
}
```

---

## Prerequisites

Ensure you have:

- **Bun.js**: Install from [bun.sh](https://bun.sh/)
- **Git**: For cloning the repository
- **Basic Knowledge**: REST APIs, JSON, and optionally TypeScript
- **Tools**: Browser DevTools, `curl`, or **Postman**

---

## Installation

### Clone the Repository
```bash
git clone https://github.com/samirxpikachuio/Grok3-unofficial-api.git
cd elysia-bun-grok-api
```

### Install Dependencies
```bash
bun install
```

### Configure the API
- Open `src/config.ts`
- Update API URLs or credentials

### Start the Server
```bash
bun run src/app.ts
```
The server runs at **http://0.0.0.0:5000** by default.

---

## Authentication Setup

To use the API, get your API key (`auth_bearer,auth_token`):

1. **Visit** [grok.x.com](https://grok.x.com)
2. **Open DevTools** (`F12` or right-click → Inspect)
3. **Send a Message** (e.g., "Hi")
4. **Find `auth_bearer`**:
   - Go to **Network** tab
   - Locate `client_event.json` request
   - Copy the **Authorization** header (e.g., `Bearer eyJ...`)
5. **Find `auth_token`**:
   - Go to **Application** tab → **Cookies** → `https://x.com`
   - Copy the `auth_token` value
6. **Combine them** with a comma:
   ```bash
   Bearer AAA...,abc123...
   ```
7. **Store Securely** (e.g., in `.env`)
8. **Refresh If Needed** (`401` errors mean expired tokens)

---

## Sending Requests

### Endpoint
- **URL**: `http://0.0.0.0:5000/api/grok3`
- **Method**: `POST`

### Headers
```json
{
    "Authorization": "Bearer $auth_bearer,$auth_token",
    "Content-Type": "application/json"
}
```

### Example Requests
#### Simple Text Request
```json
{
    "messages": [{"role": "user", "content": "What’s the weather like today?"}]
}
```

#### Text + Image Request
```json
{
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image"},
            {"type": "image_url", "image_url": {"url": "https://example.com/pic.jpg"}}
        ]
    }]
}
```

---

## Error Handling

### Common Errors

- **`400 Bad Request`**: Invalid data → **Check JSON syntax**
- **`401 Unauthorized`**: Invalid API key → **Refresh `auth_bearer` & `auth_token`**
- **`429 Too Many Requests`**: Rate limit exceeded → **Slow down requests**
- **`500 Internal Server Error`**: Grok 3 API issue → **Retry later**

### Error Response Example
```json
{
    "error": {
        "message": "Invalid API key",
        "type": "authentication_error",
        "param": null,
        "code": "401"
    }
}
```

---

## Deployment

### Local
```bash
bun run src/app.ts
```

### Docker
```bash
docker build -t grok3-api .
docker run -p 5000:5000 grok3-api
```

---

## Contributing

1. **Fork** the repo
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Commit changes**: `git commit -m "Add my feature"`
4. **Push**: `git push origin feature/my-feature`
5. **Open a Pull Request**

---

## License

**MIT License** – See `LICENSE` for details.

---

## Contact

- **GitHub**: [samirxpikachuio](https://github.com/samirxpikachuio/Grok3-unofficial-api)
- **Email**: samirxpikachuio@gmail.com

