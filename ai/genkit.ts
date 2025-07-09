import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Note: The API key must be defined in an environment variable GOOGLE_API_KEY.
// You can get a key at https://aistudio.google.com/app/apikey.
export const ai = genkit({
  plugins: [googleAI()],
});
