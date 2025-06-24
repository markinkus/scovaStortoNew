import { get, post } from './api';
import { ParsedReceiptInfo } from '../../types';

export const checkApiKey = async (): Promise<boolean> => {
  try {
    const res = await get<{ configured: boolean }>('/gemini/check');
    return res.configured;
  } catch (err) {
    console.error('Errore verifica chiave Gemini', err);
    return false;
  }
};

export const extractTextWithGemini = async (
  imageBase64: string,
  businessNameHint?: string
): Promise<ParsedReceiptInfo | string | null> => {
  try {
    const data = await post<ParsedReceiptInfo | { raw?: string; error?: string }>('/gemini/extract', {
      imageBase64,
      businessNameHint,
    });
    // If server returns raw or error, handle accordingly
    if ((data as any).error) {
      return (data as any).error as string;
    }
    return data as ParsedReceiptInfo;
  } catch (err: any) {
    console.error('Errore chiamata server Gemini', err);
    return err?.response?.data?.error || err.message;
  }
};
