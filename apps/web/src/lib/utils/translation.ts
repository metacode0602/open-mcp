const TRANSLATION_API_URL = 'https://api.cognitive.microsofttranslator.com/translate';
const TRANSLATION_API_KEY = process.env.NEXT_PUBLIC_AZURE_TRANSLATOR_KEY;
const TRANSLATION_REGION = process.env.NEXT_PUBLIC_AZURE_TRANSLATOR_REGION;

interface TranslationResponse {
  translations: {
    text: string;
    to: string;
  }[];
}

export async function translateText(text: string, targetLang: string = 'zh-CN'): Promise<string> {
  if (!TRANSLATION_API_KEY || !TRANSLATION_REGION) {
    throw new Error('Translation API credentials are not configured');
  }

  try {
    const response = await fetch(`${TRANSLATION_API_URL}?api-version=3.0&to=${targetLang}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': TRANSLATION_API_KEY,
        'Ocp-Apim-Subscription-Region': TRANSLATION_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    });

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    const data = await response.json() as TranslationResponse[];
    
    if (!data?.[0]?.translations?.[0]?.text) {
      throw new Error('Invalid translation response format');
    }

    return data[0].translations[0].text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error instanceof Error ? error : new Error('Failed to translate text');
  }
}