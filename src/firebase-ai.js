import {initializeApp} from 'firebase/app';
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from 'firebase/app-check';
import {getAI, getGenerativeModel, GoogleAIBackend, InferenceMode, Schema} from 'firebase/ai';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  appId: env.VITE_FIREBASE_APP_ID,
  projectId: env.VITE_FIREBASE_PROJECT_ID
};

const pageSchema = Schema.object({
  properties: {
    title: Schema.string(),
    tagline: Schema.string(),
    about: Schema.string(),
    action: Schema.string(),
    palette: Schema.enumString({enum: ['violet', 'ocean', 'ember', 'paper']})
  }
});

export const firebaseReady = Object.values(config).every(Boolean) && Boolean(env.VITE_FIREBASE_APPCHECK_SITE_KEY);
const models = new Map();
let ai;

export async function firebaseDraft(prompt, hybrid, progress) {
  if (!firebaseReady) throw new Error('Configure Firebase AI Logic and App Check to use this route.');
  if (!models.has(hybrid)) {
    if (!ai) {
      const app = initializeApp(config);
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(env.VITE_FIREBASE_APPCHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: false
      });
      ai = getAI(app, {backend: new GoogleAIBackend()});
    }
    const cloudModel = env.VITE_FIREBASE_CLOUD_MODEL || 'gemini-3.5-flash-lite';
    models.set(hybrid, getGenerativeModel(ai, {
      mode: hybrid ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: {
        promptOptions: {responseConstraint: pageSchema}
      },
      ...(hybrid && {
        inCloudParams: {
          model: cloudModel,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: pageSchema
          }
        }
      })
    }));
  }
  const model = models.get(hybrid);
  const initialize = model.initializeDeviceModel(progress);
  if (hybrid) void initialize.catch(() => {});
  else await initialize;
  const {response} = await model.generateContent(prompt);
  const source = {ON_DEVICE: 'Gemini Nano · on device', IN_CLOUD: 'Gemini · Firebase cloud'}[response.inferenceSource];
  if (!hybrid && response.inferenceSource === 'IN_CLOUD') throw new Error('Unexpected cloud response.');
  return {text: response.text(), source: source ?? (hybrid ? 'Firebase · inference location unavailable' : 'Gemini Nano · on device')};
}
