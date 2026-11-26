# SKYNZ Firebase Hybrid AI

SKYNZ Launch Canvas turns a creator brief into an editable creator-page design. Lippy frames the creator's request, Floater routes the work to the selected interchangeable model, and the page-design capability validates and renders the resulting design. Pages can be customized, previewed, saved on the device, reopened, and exported as JSON.

- **Hosted baseline:** https://skynz-hybrid-ai-hackathon.web.app
- **Demonstration:** https://youtu.be/K1SL3r7tBss
- **Source:** https://github.com/Justelliott6/SKYNZ-Firebase-Hybrid-AI
- **Experimental designer branch:** `experimental/ai-page-designer` (not merged or deployed)

## Run locally

Install Node.js 22.12 or later. From this repository, run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (the configured default is http://127.0.0.1:4173). Run `npm test` for the focused design and URL validation checks. Use `npm run build` to create a production build and `npm run preview` to serve it locally.

### Ollama

Install and start Ollama from https://ollama.com/download. If you need a model, run `ollama pull qwen2.5:3b` and select it under Ollama in the app. This route runs locally and needs the local companion server.

An existing SKYNZ beta can provide its adapter without contributing proprietary source. Set the process environment variable `SKYNZ_LOCAL_OLLAMA_ADAPTER` to the absolute path of its `backend/floater/lib/ollama-provider.mjs`, then launch the local server. This integration is optional.

## Firebase setup

The public baseline is configured for the Firebase project `skynz-hybrid-ai-hackathon` on the Spark plan. The web client uses Firebase AI Logic with the Gemini Developer API backend and App Check with reCAPTCHA Enterprise. No paid billing was activated.

To configure another test project:

1. Register a Web app, configure Firebase AI Logic with the Gemini Developer API, and select a model available within its free quota.
2. Register the web app in App Check using a reCAPTCHA Enterprise site key. Allowlist the test host, verify attestation, then enforce App Check for Firebase AI Logic.
3. Copy `.env.example` to `.env.local` and fill in the web app API key, app ID, project ID, and reCAPTCHA Enterprise site key. Optionally set the Firebase model. Never put Gemini API secrets, private credentials, or service accounts in Vite variables.
4. In an eligible desktop Chrome installation, choose **Gemini Nano � on device only** or **Firebase � on device with cloud fallback**. The first on-device model initialization may take several minutes. Hybrid mode prefers Nano when it is available and uses cloud only when on-device inference is unavailable.
5. To test cloud inference directly, choose **Firebase � cloud only (direct)** and consent to Firebase processing the brief. The app displays the engine reported by Firebase for the response.
6. To deploy a static build to a Firebase test project, run `npm run build` and use the Firebase CLI to deploy Hosting only. Authorize the hosted domain in the App Check key. Static hosting does not run the Ollama server.

## AI Page Designer (experimental branch)

The `experimental/ai-page-designer` branch extends the existing structured response and live preview. A design can specify the page composition (editorial, spotlight, grid, or split), background treatment, custom contrast colors, type style, widget placement and size, reduced-motion-aware animation, artwork URL, sections, call-to-action link, media, and a public livestream URL. The existing Gemini Nano, Firebase hybrid/cloud, and Ollama routes remain in the same application.

YouTube, Spotify, SoundCloud, and Twitch URLs are parsed and converted only into the providers' standard embed URLs. Website links render as links. OBS remains the creator's broadcasting application; the page provides a public YouTube/Twitch stream component that can display an OBS broadcast once it is sent to that provider. The page does not collect stream keys or run creator-supplied code.

Before rendering or saving, page fields, colors, section counts, media-provider URLs, and stream URLs are validated. Arbitrary HTML or JavaScript is not accepted. Firebase processing still requires explicit consent. Local saves and JSON export include the full design; older saved text-and-palette pages are upgraded with default layout settings when reopened.

The experimental branch is intentionally separate from the public deployment and Devpost submission. Its focused Node checks cover design normalization, media URL validation, URL rejection, and distinct layout configurations. A branch preview and real model-generated multi-brief review must be completed before merging or deploying it; no expanded-design Firebase inference result is claimed here.

## Verified baseline results

The public Hosting deployment is live. The existing reCAPTCHA Enterprise site key is 40 characters, and App Check enforcement is enabled for Firebase AI Logic.

The project owner manually verified Gemini Nano on desktop Chrome with a new **Midnight Highway** brief. Nano generated an original page, populated the editor, applied the requested Ember palette, and rendered the live preview. The app reported: **"Draft ready � Gemini Nano � on device. Review it before saving."** The project owner also reports Firebase AI Logic monitoring recorded a successful Gemini 3.5 Flash-Lite cloud inference at **2.25 seconds**.

An independent run of **Firebase � on device with cloud fallback** in a separate browser session returned a valid structured creator page and reported **"Draft ready � Gemini � Firebase cloud."** The page was accepted into the editor and live preview, saved, restored after reload, and reopened successfully. The route is configured with Firebase AI Logic `PREFER_ON_DEVICE`, verifying cloud fallback when Nano was unavailable in that browser. No simulated responses were used.

Ollama remains a separate local route. Its independent live inference was not retested during the Firebase deployment session.

- [Firebase hybrid Web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Firebase hybrid structured output](https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output)
- [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)

## Scope and license

The original Launch Canvas, Firebase AI Logic integration, App Check setup, standalone local provider, and editor were developed for the November 2026 hackathon. Established SKYNZ agent code and installations remain separate. The optional local beta adapter is excluded from this repository.

Licensed under [Apache License 2.0](LICENSE).

