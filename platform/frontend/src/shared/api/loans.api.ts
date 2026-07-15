import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { Loan, UserAsset } from '../types';

const http = createHttpClient(config.apiUrl);

export const loansApi = {
  apply: (amount: number, duration: number, documentType: string, frontImage: File, backImage: File) => {
    const formData = new FormData();
    formData.append('amount', String(amount));
    formData.append('duration', String(duration));
    formData.append('document_type', documentType);
    formData.append('front_image', frontImage);
    formData.append('back_image', backImage);
    return http.post<Loan>('/loans', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeoutMs: 120_000,
    });
  },
  getMyLoans: () => http.get<Loan[]>('/loans'),
};
