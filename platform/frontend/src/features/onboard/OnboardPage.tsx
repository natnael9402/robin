'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, DollarSign, Target, TrendingUp, PiggyBank, Building, GraduationCap, Globe } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useToast } from '../../shared/contexts/ToastContext';
import { onboardApi } from './api/onboard.api';
import { Button } from '../../shared/components/ui/Button';

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary / Wages', icon: Briefcase },
  { value: 'business', label: 'Business', icon: Building },
  { value: 'investment', label: 'Investments', icon: TrendingUp },
  { value: 'inheritance', label: 'Inheritance', icon: PiggyBank },
  { value: 'freelance', label: 'Freelance', icon: Globe },
  { value: 'student', label: 'Student / Allowance', icon: GraduationCap },
  { value: 'other', label: 'Other', icon: DollarSign },
];

const INCOME_RANGES = [
  { value: 'under_25k', label: 'Under $25,000' },
  { value: '25k_50k', label: '$25,000 - $50,000' },
  { value: '50k_100k', label: '$50,000 - $100,000' },
  { value: '100k_250k', label: '$100,000 - $250,000' },
  { value: '250k_plus', label: '$250,000+' },
];

const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Employed (Full-time)' },
  { value: 'part_time', label: 'Employed (Part-time)' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
];

const INVESTMENT_GOALS = [
  { value: 'long_term_growth', label: 'Long-term Growth' },
  { value: 'short_term_profit', label: 'Short-term Profit' },
  { value: 'passive_income', label: 'Passive Income' },
  { value: 'wealth_preservation', label: 'Wealth Preservation' },
  { value: 'learning', label: 'Learning & Exploring' },
];

export function OnboardPage() {
  useDocumentTitle('Tell Us About Yourself · PAXORA Premium');
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [incomeSource, setIncomeSource] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: 'Income Source', description: 'Where does your income come from?' },
    { title: 'Annual Income', description: 'What is your yearly income range?' },
    { title: 'Employment', description: 'What is your employment status?' },
    { title: 'Investment Goal', description: 'What brings you to PAXORA?' },
  ];

  const canContinue = () => {
    switch (step) {
      case 0: return !!incomeSource;
      case 1: return !!annualIncome;
      case 2: return !!employmentStatus;
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onboardApi.submit({
        income_source: incomeSource,
        annual_income: annualIncome,
        employment_status: employmentStatus,
        investment_goal: investmentGoal || undefined,
      });
      toast.success('Welcome to PAXORA Premium!');
      router.push('/kyc-verification');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-widest drop-shadow-[0_0_20px_rgba(180,134,8,0.3)] mb-3">
            PAXORA
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{steps[step].title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{steps[step].description}</p>
        </div>

        <div className="flex gap-1.5 mb-8 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                i === step ? 'bg-primary' : i < step ? 'bg-primary/40' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="space-y-3 min-h-[320px]">
          {step === 0 && (
            <div className="grid grid-cols-1 gap-2">
              {INCOME_SOURCES.map((opt) => {
                const Icon = opt.icon;
                const selected = incomeSource === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setIncomeSource(opt.value)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_12px_var(--primary-glow)]'
                        : 'border-border-light bg-surface-hover/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    <Icon size={18} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-2">
              {INCOME_RANGES.map((opt) => {
                const selected = annualIncome === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnnualIncome(opt.value)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_12px_var(--primary-glow)]'
                        : 'border-border-light bg-surface-hover/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    <DollarSign size={18} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-2">
              {EMPLOYMENT_STATUSES.map((opt) => {
                const selected = employmentStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setEmploymentStatus(opt.value)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_12px_var(--primary-glow)]'
                        : 'border-border-light bg-surface-hover/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    <Briefcase size={18} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium mb-3">Select your primary goal (optional)</p>
              <div className="grid grid-cols-1 gap-2">
                {INVESTMENT_GOALS.map((opt) => {
                  const selected = investmentGoal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setInvestmentGoal(selected ? '' : opt.value)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_12px_var(--primary-glow)]'
                          : 'border-border-light bg-surface-hover/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <Target size={18} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={loading}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <Button
              variant="lime"
              size="lg"
              className="flex-1"
              disabled={!canContinue()}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="lime"
              size="lg"
              className="flex-1"
              loading={loading}
              onClick={handleSubmit}
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
