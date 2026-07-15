import { createHttpClient } from '../../../shared/api/httpClient';
import { config } from '../../../shared/lib/config';

const http = createHttpClient(config.apiUrl);

export interface OnboardingData {
  income_source: string;
  annual_income: string;
  employment_status: string;
  investment_goal?: string;
}

export const onboardApi = {
  submit: (data: OnboardingData) =>
    http.post<{ onboarding: OnboardingData }>('/onboarding', data),

  getStatus: () =>
    http.get<{ onboarding: OnboardingData | null }>('/onboarding'),
};
