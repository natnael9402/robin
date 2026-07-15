'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
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
import { storage } from '../../shared/lib/storage';
import { CountrySelect } from './components/CountrySelect';

export function LoginPage() {
  useDocumentTitle('Sign In · Paxora Premium');
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = tab === 'email' ? email : phone;
    if (!identifier || !password) return toast.error('Fill all fields');
    if (!captchaToken) return toast.error('Please complete the captcha');
    setLoading(true);
    try {
      await login(identifier, password, captchaToken);
      toast.success('Welcome back');
      storage.setUserName(identifier.split('@')[0] || identifier);
      router.push('/home');
    } catch (err) {
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Welcome to Premium</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handle} className="space-y-6">
          <div className="space-y-4">
            <div className="flex rounded-xl bg-surface-hover border border-white/5 p-0.5">
              <button
                type="button"
                onClick={() => { setTab('email'); setPhone(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'email' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setTab('phone'); setEmail(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'phone' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Phone
              </button>
            </div>
            {tab === 'email' ? (
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
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              leftAdornment={<Lock className="w-5 h-5" />}
              rightAdornment={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              placeholder="Password"
              required
            />
            <div className="flex justify-end -mt-2">
              <Link href="/forgot-password" className="text-xs text-primary font-bold hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <Captcha onVerify={setCaptchaToken} />

          <Button type="submit" variant="lime" size="lg" fullWidth loading={loading} disabled={!captchaToken}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold">Sign up</Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-white/5">
          <Link href="/legal/terms" className="hover:underline hover:text-foreground transition-colors">Terms</Link>
          <span className="mx-2">·</span>
          <Link href="/legal/privacy" className="hover:underline hover:text-foreground transition-colors">Privacy</Link>
        </p>
      </div>
    </div>
  );
}
