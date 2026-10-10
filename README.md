# DROP AZEG

Static storefront for DROP AZEG.

## Local setup

1. Install [Node.js](https://nodejs.org/).
2. Copy `.env.example` to `.env` and set `WHATSAPP_BUSINESS_NUMBER` to the business number with country code and digits only.
3. Run `npm run build` to generate the local `config.js` file.
4. Serve this folder with a local web server, for example `python -m http.server 8000`, then open `http://localhost:8000`.

`.env` and the generated `config.js` are ignored by Git. A browser-based storefront must include its WhatsApp destination in the generated client-side configuration to create order links; this keeps the number out of the repository but does not hide it from site visitors.
