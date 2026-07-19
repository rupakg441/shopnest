import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '../../schemas/authSchema';
import { login } from '../../features/auth/authSlice';
import { useLoginUserMutation, useRegisterUserMutation } from '../../features/auth/authApi';
import FormInput from '../../components/forms/FormInput';
import { Layout } from 'lucide-react';

const Auth = ({ defaultView = 'login' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [view, setView] = useState(defaultView); // 'login' or 'register'
  const [loginUser, { isLoading: loginLoading }] = useLoginUserMutation();
  const [registerUser, { isLoading: registerLoading }] = useRegisterUserMutation();

  // Setup form 1: Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
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
      const response = await loginUser({ email: data.email, password: data.password }).unwrap();
      dispatch(login(response));
      navigate('/account');
    } catch (err) {
      
      console.error("Login failed: ", err);
      alert("Invalid credentials.");
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      const response = await registerUser(data).unwrap();
      dispatch(login(response));
      navigate('/account');
    } catch (err) {
      console.error("Registration failed: ", err);
      alert("Registration failed. Please try again.");
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
                  Welcome back.
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
                    <a href="#" className="font-label-caps text-[10px] text-primary hover:opacity-70 transition-opacity tracking-widest uppercase">
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
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
                  disabled={loginLoading}
                  className="w-full py-md bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider"
                >
                  {loginLoading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative py-md">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-base text-on-surface-variant font-label-caps tracking-widest uppercase">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(login({
                        user: { name: "Julianne V.", email: "julianne@example.com", tier: "Premium Member", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjxN5e-VpzuhXSZNgICEqmhN0VtFDgnMo2wP4Zadqz6jlb3PwvIhm-BKEwH_f_-imSLdRhsIpN25FKWsMI1w7iTlDw7ytwrr4bXj9Q2k5CiqubH3nE2H7C9BYNpIQf2clyE_DJSKPfj4mlBvnNWpZtgE5-Bn8dBDK-vr20i2wv7buhe3yUdHFLvBIOot9Y2l4BicMCPIR7yiCLN1t83_dd_LN4_IGklzH6LduPk4RrjyFdUNokK_zd" },
                        token: "mock-session-token-12345"
                      }));
                      navigate('/account');
                    }}
                    className="flex items-center justify-center space-x-base py-sm border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                  >
                    <img
                      alt="Google"
                      className="w-5 h-5"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhbcu39u4rqlVMhLCMDe_V14GYSAIYfKCtIhomGETH9O1hTGxI3-2fAT8Fiw0FQ5XoSxR9qV9ChOactyg1ewR2xcCs9oi6vvnZ-p3odNMWPvtkRE-X9hl9hLgf-MbvTnBz5cnUA_bE8tJBAgi_mxqSohldAbCewkO72kL2omW8BXt7JfD8UQ0AQnoGbvEboSW_eaNBEqxqF-gpMJsjdIOO87Ib-Nt2GWzfd4SVUZxMyoYTjYo7yiRZ"
                    />
                    <span className="font-button text-button">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(login({
                        user: { name: "Admin User", email: "admin@shopnest.com", role: "admin", tier: "Gold Member" },
                        token: "mock-session-token-admin"
                      }));
                      navigate('/admin');
                    }}
                    className="flex items-center justify-center space-x-base py-sm border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                      apps
                    </span>
                    <span className="font-button text-button">Apple</span>
                  </button>
                </div>
              </form>

              <footer className="mt-lg text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  New to ShopNest?{' '}
                  <button
                    onClick={() => setView('register')}
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    Create an account
                  </button>
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
