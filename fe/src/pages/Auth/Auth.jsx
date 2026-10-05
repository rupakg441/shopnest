import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '../../schemas/authSchema';
import { login } from '../../features/auth/authSlice';
import { useLoginUserMutation, useLoginAdminMutation, useRegisterUserMutation, useResendVerificationMutation } from '../../features/auth/authApi';
import FormInput from '../../components/forms/FormInput';
const Auth = ({ defaultView = 'login', adminMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [view, setView] = useState(defaultView); // 'login' or 'register'
  const [formError, setFormError] = useState('');
  const [formNotice, setFormNotice] = useState('');
  const [loginUser, { isLoading: loginLoading }] = useLoginUserMutation();
  const [loginAdmin, { isLoading: adminLoginLoading }] = useLoginAdminMutation();
  const [registerUser, { isLoading: registerLoading }] = useRegisterUserMutation();
  const [resendVerification, { isLoading: resendLoading }] = useResendVerificationMutation();

  // Setup form 1: Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    watch: watchLogin,
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // Setup form 2: Register
  const {
    register: registerReg,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: regErrors },
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onLoginSubmit = async (data) => {
    try {
      setFormError('');
      setFormNotice('');
      const credentials = { email: data.email, password: data.password, remember: Boolean(data.remember) };
      const response = adminMode
        ? await loginAdmin(credentials).unwrap()
        : await loginUser(credentials).unwrap();
      dispatch(login(response));
      const defaultPath = ['admin', 'superadmin'].includes(response.user.role) ? '/admin' : '/account';
      navigate(location.state?.from?.pathname || defaultPath, { replace: true });
    } catch (err) {
      setFormError(err?.data?.message || 'Sign in failed. Check your email and password.');
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      setFormError('');
      setFormNotice('');
      const response = await registerUser(data).unwrap();
      if (response.verificationRequired) {
        setFormNotice(`We sent a verification link to ${response.email}.`);
        setView('login');
        return;
      }
      dispatch(login(response));
      navigate('/account');
    } catch (err) {
      setFormError(err?.data?.message || 'Registration failed. Please review your details and try again.');
    }
  };

  return (
    <main className="min-h-screen w-full relative flex">
      {/* Brand logo anchor in top left */}
      <div className="absolute top-8 left-8 z-50">
        <Link to="/" className="font-headline-md text-headline-md text-primary tracking-tighter hover:opacity-80 transition-opacity block">
          ShopNest
        </Link>
      </div>

      {/* Global Navigation Shortcut */}
      <div className="fixed top-6 right-6 z-50 space-x-2 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full px-3 py-2 shadow-sm border border-outline-variant/20">
        <Link to="/products" className="text-xs font-button text-primary hover:underline">Catalog</Link>
        <span className="text-outline-variant/30">|</span>
        <Link to="/cart" className="text-xs font-button text-primary hover:underline">Cart</Link>
      </div>

      {/* Left side: Interactive Forms Container */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-gutter relative z-10 bg-background pt-24 lg:pt-0">
        <div className="w-full max-w-md">
          {/* Sign In Form View */}
          {view === 'login' && (
            <div className="animate-fade-in space-y-lg">
              <header className="space-y-base">
                <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-primary leading-tight">
                  {adminMode ? 'Admin sign in.' : 'Welcome back.'}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Please enter your details to access your account.
                </p>
              </header>

              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="mt-xl space-y-md">
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={loginErrors.email}
                  {...registerLogin("email")}
                />
                
                <div className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                      Password
                    </label>
                    <Link to="/forgot-password" className="font-label-caps text-[10px] text-primary hover:underline tracking-widest uppercase">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className={`w-full px-md py-sm rounded-lg border bg-transparent font-body-md transition-all focus:ring-0 focus:border-primary ${
                      loginErrors.password ? 'border-error' : 'border-outline-variant/60 focus:border-primary'
                    }`}
                    {...registerLogin("password")}
                  />
                  {loginErrors.password && (
                    <span className="text-error font-body-sm text-[12px] block mt-1">{loginErrors.password.message}</span>
                  )}
                </div>

                <div className="flex items-center space-x-base">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-0 cursor-pointer"
                    {...registerLogin("remember")}
                  />
                  <label htmlFor="remember" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading || adminLoginLoading}
                  className="w-full py-md bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider"
                >
                  {loginLoading || adminLoginLoading ? "Signing in..." : adminMode ? "Admin Sign In" : "Sign In"}
                </button>

                {formError && <p role="alert" className="text-error text-sm" aria-live="polite">{formError}</p>}
                {formNotice && <p role="status" className="text-sm text-on-surface-variant" aria-live="polite">{formNotice}</p>}
                {formError.toLowerCase().includes('verification') && (
                  <button
                    type="button"
                    disabled={resendLoading || !watchLogin('email')}
                    onClick={async () => {
                      try {
                        const result = await resendVerification({ email: watchLogin('email') }).unwrap();
                        setFormNotice(result.message);
                      } catch {
                        setFormNotice('Unable to resend the verification email. Please try again.');
                      }
                    }}
                    className="text-sm text-primary underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                )}
              </form>

              <footer className="mt-lg text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {adminMode ? 'Customer account? ' : 'New to ShopNest? '}{' '}
                  <button
                    onClick={() => adminMode ? navigate('/login') : setView('register')}
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    {adminMode ? 'Sign in here' : 'Create an account'}
                  </button>
                  {!adminMode && <> · <Link className="text-primary font-bold hover:underline" to="/admin/login">Admin sign in</Link></>}
                </p>
              </footer>
            </div>
          )}

          {/* Registration Form View */}
          {view === 'register' && (
            <div className="animate-fade-in space-y-lg">
              <header className="space-y-base">
                <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-primary leading-tight">
                  Join ShopNest.
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Curate your perfect space today.
                </p>
              </header>

              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="mt-xl space-y-md">
                {formError && <p role="alert" className="text-error text-sm" aria-live="polite">{formError}</p>}
                {formNotice && <p role="status" className="text-sm text-on-surface-variant" aria-live="polite">{formNotice}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <FormInput
                    label="First Name"
                    error={regErrors.firstName}
                    {...registerReg("firstName")}
                  />
                  <FormInput
                    label="Last Name"
                    error={regErrors.lastName}
                    {...registerReg("lastName")}
                  />
                </div>
                
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={regErrors.email}
                  {...registerReg("email")}
                />
                
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  error={regErrors.password}
                  {...registerReg("password")}
                />

                <div className="flex items-start space-x-base">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-0 cursor-pointer"
                    {...registerReg("terms")}
                  />
                  <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface-variant leading-tight cursor-pointer select-none">
                    I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>.
                  </label>
                </div>
                {regErrors.terms && (
                  <span className="text-error font-body-sm text-[12px] block mt-1">{regErrors.terms.message}</span>
                )}

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-md bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider"
                >
                  {registerLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <footer className="mt-lg text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Already have an account?{' '}
                  <button
                    onClick={() => setView('login')}
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    Sign in here
                  </button>
                </p>
              </footer>
            </div>
          )}
        </div>
      </section>

      {/* Right side: Lifestyle visual */}
      <section className="hidden lg:block w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-105"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHQ2g6lCnytBPGbQrFl7BMyP9EGejOHoyRBcidnt34aOCyJ3xJt17ZvzOOJn0VgKIEAaR75fHYfosGce4zFKb9CWgzx1ECeVnBGo_xqRkj-JC_PlRd4g8nZbPql0Cmil_GHSe355NIozA9gntLaWg5KgPsuNKn8_AtCSDRNTHGmrLL5UBMpXRLdMVPKZ1ABDa2vVFHp0Mk7kMB7-mfUvqB-r_zMlI1IdvoOFJMPar6cowHK3_BFfZJ')"
          }}
        />
        {/* Visual Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-xl bg-gradient-to-t from-black/40 to-transparent">
          <div className="max-w-md text-white space-y-md">
            <span className="font-label-caps text-label-caps text-secondary-fixed tracking-widest uppercase">
              CURATED EXCELLENCE
            </span>
            <h2 className="font-headline-md text-headline-md text-white">
              Elevating the everyday through intentional design.
            </h2>
            <p className="font-body-lg text-body-lg text-white/90">
              Join a community of designers and enthusiasts dedicated to the art of fine living.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Auth;
