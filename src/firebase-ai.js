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

export async function firebaseDraft(prompt, route, progress) {
  if (!firebaseReady) throw new Error('Configure Firebase AI Logic and App Check to use this route.');
  if (!models.has(route)) {
    if (!ai) {
      const app = initializeApp(config);
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(env.VITE_FIREBASE_APPCHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: false
      });
      ai = getAI(app, {backend: new GoogleAIBackend()});
    }
    const cloudModel = env.VITE_FIREBASE_CLOUD_MODEL || 'gemini-3.5-flash-lite';
    const inferenceMode = route === 'hybrid'
      ? InferenceMode.PREFER_ON_DEVICE
      : route === 'cloud' ? InferenceMode.ONLY_IN_CLOUD : InferenceMode.ONLY_ON_DEVICE;
    models.set(route, getGenerativeModel(ai, {
      mode: inferenceMode,
      ...(route !== 'cloud' && {
        onDeviceParams: {promptOptions: {responseConstraint: pageSchema}}
      }),
      ...(route !== 'device' && {
        inCloudParams: {
          model: cloudModel,
          generationConfig: {responseMimeType: 'application/json', responseSchema: pageSchema}
        }
      })
    }));
  }
  const model = models.get(route);
  if (route !== 'cloud') {
    const initialize = model.initializeDeviceModel(progress);
    if (route === 'hybrid') void initialize.catch(() => {});
    else await initialize;
  }
  const {response} = await model.generateContent(prompt);
  const inferenceSource = String(response.inferenceSource || '').toLowerCase();
  const source = {
    on_device: 'Gemini Nano · on device',
    in_cloud: 'Gemini · Firebase cloud'
  }[inferenceSource];
  if (route === 'device' && inferenceSource === 'in_cloud') throw new Error('Unexpected cloud response.');
  if (route === 'cloud' && inferenceSource === 'on_device') throw new Error('Unexpected on-device response.');
  return {
    text: response.text(),
    source: source || (route === 'device'
      ? 'Gemini Nano · on device (on-device-only route)'
      : route === 'cloud' ? 'Firebase cloud · cloud-only route' : 'Firebase · inference location unavailable')
  };
}
