'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Eye, EyeOff, Gift } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useToast } from '../../shared/contexts/ToastContext';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Captcha } from '../../shared/components/ui/Captcha';
import { CountrySelect } from './components/CountrySelect';

export function SignupPage() {
  useDocumentTitle('Sign Up · Paxora Premium');
  const router = useRouter();
  const { signup } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [contactTab, setContactTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');

  const getPasswordErrors = (pw: string): string[] => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(pw)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(pw)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(pw)) errors.push('one number');
    if (!/[^A-Za-z0-9]/.test(pw)) errors.push('one special character');
    return errors;
  };

  const passwordErrors = getPasswordErrors(password);
  const passwordStrength = 5 - passwordErrors.length;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) return toast.error('Email or phone is required');
    if (!name || !password || !confirmPassword) return toast.error('Fill all fields');
    if (passwordErrors.length) return toast.error('Password must have ' + passwordErrors.join(', '));
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (!agreed) return toast.error('You must agree to the terms');
    if (!captchaToken) return toast.error('Please complete the captcha');
    setLoading(true);
    try {
      await signup(email, password, name, captchaToken, phone || undefined, referralCode || undefined);
      toast.success('Account created');
      router.push('/onboard');
    } catch (err) {
      console.error('Signup error:', err);
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-primary tracking-widest drop-shadow-[0_0_20px_rgba(180,134,8,0.3)] mb-4">
            PAXORA
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join Paxora Premium today</p>
        </div>

        <form onSubmit={handle} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              leftAdornment={<User className="w-5 h-5" />}
              placeholder="John Doe"
              required
            />
            <div className="flex rounded-xl bg-surface-hover border border-white/5 p-0.5">
              <button
                type="button"
                onClick={() => { setContactTab('email'); setPhone(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${contactTab === 'email' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setContactTab('phone'); setEmail(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${contactTab === 'phone' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Phone
              </button>
            </div>
            {contactTab === 'email' ? (
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                leftAdornment={<Mail className="w-5 h-5" />}
                placeholder="Email address"
                required
              />
            ) : (
              <div>
                <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">Phone Number</label>
                <div className="flex items-center gap-2 bg-background border rounded-2xl px-4 py-3 transition-all duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                  <PhoneInput
                    defaultCountry="US"
                    value={phone}
                    onChange={(v) => setPhone(v ?? '')}
                    flags={flags}
                    countrySelectComponent={CountrySelect}
                    addInternationalOption={false}
                    className="flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:text-foreground [&_.PhoneInputInput]:text-base [&_.PhoneInputInput]:font-mono [&_.PhoneInputInput]:font-bold [&_.PhoneInputCountry]:mr-1"
                  />
                </div>
                {phone && phone.length > 3 && (
                  <p className="mt-1.5 text-xs text-muted-foreground font-mono tracking-wide">
                    {formatPhoneNumberIntl(phone)}
                  </p>
                )}
              </div>
            )}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                leftAdornment={<Lock className="w-5 h-5" />}
                rightAdornment={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                placeholder="Password"
                required
              />
              {passwordFocused && (
                <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-destructive'
                              : passwordStrength <= 3
                                ? 'bg-warning'
                                : 'bg-success'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {[
                      { check: password.length >= 8, label: 'At least 8 characters' },
                      { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
                      { check: /[a-z]/.test(password), label: 'One lowercase letter' },
                      { check: /[0-9]/.test(password), label: 'One number' },
                      { check: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
                    ].map(({ check, label }) => (
                      <li key={label} className={`text-xs flex items-center gap-1.5 ${check ? 'text-success' : 'text-muted-foreground'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${check ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              leftAdornment={<Lock className="w-5 h-5" />}
              rightAdornment={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              placeholder="Confirm password"
              required
            />
          </div>

          <Input
            label="Referral Code (optional)"
            value={referralCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferralCode(e.target.value)}
            leftAdornment={<Gift className="w-5 h-5" />}
            placeholder="Enter referral code"
          />

          <Captcha onVerify={setCaptchaToken} />

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 group-hover:border-primary transition-colors peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                {agreed && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
              </div>
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">
              I agree to the{' '}
              <Link href="/legal/terms" className="text-primary font-bold hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/legal/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
            </span>
          </label>

          <Button type="submit" variant="lime" size="lg" fullWidth loading={loading} disabled={!agreed || !captchaToken}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Already have an account? <Link href="/login" className="text-primary font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
