# SKYNZ Firebase Hybrid AI

Launch Canvas turns a creator brief into an editable launch page. Lippy frames the brief, Floater selects the requested route, and the page editor previews validated content. Edit, save and reopen a page in the same browser or export it as JSON.

## Local installation

Install Node.js 22.12 or later. Run npm ci and npm run dev, then open http://127.0.0.1:4173. Try the sample brief or enter your own. Run npm test for tests. Run npm run build and npm run preview to test the compiled app.

### Ollama

Install and start Ollama from https://ollama.com/download. If you need a model, run ollama pull qwen2.5:3b and select it under Ollama in the app. This route runs on CPU and needs the local companion server. The device and cloud Firebase routes do not need Ollama.

An existing SKYNZ beta can provide its adapter without contributing proprietary source. Set the process environment variable SKYNZ_LOCAL_OLLAMA_ADAPTER to the absolute path of its backend/floater/lib/ollama-provider.mjs, then launch the local server. This is optional.

## Firebase configuration

1. Register a Web app in a dedicated Spark test project. Open Firebase AI Logic and set up the Gemini Developer API backend. Keep billing disconnected and select a cloud model available within the project's free quota.
2. In the same project register the web app in App Check with a score-based reCAPTCHA Enterprise key. Allowlist the test host on a dedicated test key, verify attestation and enforce App Check for Firebase AI Logic. For local debug environments, follow Firebase's debug-provider guide and keep the debug token out of all source and published builds.
3. Copy .env.example to .env.local. Fill in the Web app API key, app ID, project ID and reCAPTCHA Enterprise site key. Optionally set the Firebase cloud model. These values configure the web client. Never put Gemini API secrets, private credentials or service accounts in Vite variables.
4. Restart Vite and open the app in eligible desktop Chrome with Gemini Nano enabled. Click Generate draft in Gemini Nano mode to initialize the device model and run a synthetic brief. The first download can take several minutes.
5. Choose the Firebase hybrid route and allow fallback for a single synthetic brief. On a device where Gemini Nano is unavailable, verify that the status shows Firebase cloud inference. Consent resets after each request. The on-device-only mode never offers cloud fallback.
6. Optional Hosting uses the supplied firebase.json. Build the app with npm run build. With an authorized Firebase test project, deploy only Hosting using the official Firebase CLI, then authorize its host in the App Check key. Static hosting does not run the Ollama server.

- [Firebase hybrid Web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [App Check local debugging](https://firebase.google.com/docs/app-check/web/debug-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)

## Scope and license

Launch Canvas, the Firebase SDK integration, App Check, the standalone local provider and editor are new for the November 2026 hackathon. The public implementation follows the existing Lippy and Floater roles. The established SKYNZ agent code and installations remain separate. The original beta adapter is an optional local integration and is excluded from this distribution.

The source in this repository is licensed under [Apache License 2.0](LICENSE). Live Firebase testing needs a configured test project and eligible Chrome installation.
