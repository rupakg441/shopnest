import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
} from '../../features/auth/authApi';

function AuthCard({ title, children }) {
  return (
    <main className="min-h-screen bg-background grid place-items-center p-gutter">
      <section className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface p-xl shadow-sm">
        <Link to="/" className="font-headline-md text-headline-md text-primary">ShopNest</Link>
        <h1 className="mt-lg font-headline-sm text-headline-sm">{title}</h1>
        {children}
      </section>
    </main>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [requestReset, { isLoading }] = useForgotPasswordMutation();

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const result = await requestReset({ email }).unwrap();
      setMessage(result.message);
    } catch {
      setMessage('Unable to process this request. Please try again.');
    }
  };

  return (
    <AuthCard title="Reset your password">
      <p className="mt-sm text-on-surface-variant">Enter the email address on your account. If it exists, we’ll send a one-time reset link.</p>
      <form onSubmit={submit} className="mt-lg space-y-md">
        <label className="block text-sm">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-xs w-full rounded-lg border-outline-variant" /></label>
        <button disabled={isLoading} className="w-full rounded-xl bg-primary px-md py-sm text-white">{isLoading ? 'Sending…' : 'Send reset link'}</button>
      </form>
      {message && <p role="status" className="mt-md text-sm text-on-surface-variant">{message}</p>}
      <Link className="mt-lg inline-block text-primary underline" to="/login">Return to sign in</Link>
    </AuthCard>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const token = params.get('token') || '';

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const result = await resetPassword({ token, password }).unwrap();
      setMessage(result.message);
    } catch (error) {
      setMessage(error?.data?.message || 'The reset link is invalid or has expired.');
    }
  };

  return (
    <AuthCard title="Choose a new password">
      {!token ? <p className="mt-md text-error">This reset link is missing its token.</p> : (
        <form onSubmit={submit} className="mt-lg space-y-md">
          <label className="block text-sm">New password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-xs w-full rounded-lg border-outline-variant" /></label>
          <button disabled={isLoading} className="w-full rounded-xl bg-primary px-md py-sm text-white">{isLoading ? 'Updating…' : 'Update password'}</button>
        </form>
      )}
      {message && <p role="status" className="mt-md text-sm text-on-surface-variant">{message}</p>}
      <Link className="mt-lg inline-block text-primary underline" to="/login">Return to sign in</Link>
    </AuthCard>
  );
}

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { data, error, isLoading } = useVerifyEmailQuery(token, { skip: !token });
  const message = !token
    ? 'This verification link is missing its token.'
    : isLoading
      ? 'Verifying your email…'
      : data?.message || error?.data?.message || 'The verification link is invalid or expired.';

  return (
    <AuthCard title="Email verification">
      <p role="status" className="mt-md text-on-surface-variant">{message}</p>
      <Link className="mt-lg inline-block text-primary underline" to="/login">Continue to sign in</Link>
    </AuthCard>
  );
}
