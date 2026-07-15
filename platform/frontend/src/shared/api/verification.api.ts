import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { Verification } from '../types';

const http = createHttpClient(config.apiUrl);

export interface VerificationSubmitInput {
  documentType: string;
  documentNumber: string;
  frontImage: File;
  backImage: File;
  selfieImage: File;
}

export const verificationApi = {
  submit: (data: VerificationSubmitInput) => {
    const formData = new FormData();
    formData.append('document_type', data.documentType);
    formData.append('document_number', data.documentNumber);
    formData.append('front_image', data.frontImage);
    formData.append('back_image', data.backImage);
    formData.append('selfie_image', data.selfieImage);
    return http.post<Verification>('/kyc-submissions', formData, { timeoutMs: 120_000 });
  },
  getStatus: () =>
    http.get<any>('/kyc-submissions').then((res) => {
      const list = res?.submissions?.data ?? (Array.isArray(res) ? res : []);
      const sub = list[0] ?? {};
      return { status: sub.status ?? 'unverified', documents: {} };
    }),
};
