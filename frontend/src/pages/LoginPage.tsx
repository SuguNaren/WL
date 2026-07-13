import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import axios from 'axios';
import { LoginShell } from '../components/LoginShell';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

type LoginValues = {
  login: string;
  password: string;
};

type ChangePasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [pendingChange, setPendingChange] = useState<null | {
    token: string;
    user: {
      id: number;
      role: 'ADMIN' | 'EMPLOYEE';
      mustChangePassword: boolean;
      employeeId?: string;
      employeeName?: string;
    };
  }>(null);

  const loginForm = useForm<LoginValues>();
  const changeForm = useForm<ChangePasswordValues>();

  const onLogin = loginForm.handleSubmit(async (values) => {
    setLoginError('');
    try {
      const response = await api.post('/auth/login', values);
      if (response.data.user.mustChangePassword) {
        setPendingChange(response.data);
        return;
      }
      setSession(response.data.accessToken, response.data.user);
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setLoginError('Backend server is not running. Start the project API and database first.');
          return;
        }

        if (error.response.status === 401) {
          setLoginError(
            'Invalid credentials. Use your current password. First-time users should use DOB in DD-MM-YYYY format.'
          );
          return;
        }
      }

      setLoginError('Unable to sign in right now. Please check the backend setup.');
    }
  });

  const onChangePassword = changeForm.handleSubmit(async (values) => {
    setChangePasswordError('');

    if (values.newPassword !== values.confirmPassword) {
      changeForm.setError('confirmPassword', { message: 'Passwords do not match' });
      setChangePasswordError('Passwords do not match.');
      return;
    }

    try {
      const response = await api.post(
        '/auth/change-password',
        { newPassword: values.newPassword },
        { headers: { Authorization: `Bearer ${pendingChange?.token}` } }
      );
      setSession(response.data.accessToken, response.data.user);
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setChangePasswordError('Backend server is not running. Start the project API and database first.');
          return;
        }

        if (error.response.status === 401) {
          setChangePasswordError('Your login session expired. Please sign in again.');
          setPendingChange(null);
          changeForm.reset();
          return;
        }
      }

      setChangePasswordError('Unable to update password right now. Please try again.');
    }
  });

  return (
    <LoginShell>
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-5 inline-flex bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          Staff Access
        </div>
        <h1 className="font-body text-[2.5rem] font-light leading-none text-slate-900 sm:text-[2.75rem]">
          Log in
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Enter employee credentials to continue. First login password is DOB in DD-MM-YYYY format.
        </p>

        {pendingChange ? (
          <form className="mt-8 space-y-6" onSubmit={onChangePassword}>
            <Field label="New Password">
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  {...changeForm.register('newPassword', { required: true })}
                  className="h-14 w-full border-x-0 border-t-0 border-b border-stone-400 bg-stone-50 pl-4 pr-12 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((state) => !state)}
                  className="absolute right-4 top-4 text-slate-500"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password">
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...changeForm.register('confirmPassword', { required: true })}
                  className="h-14 w-full border-x-0 border-t-0 border-b border-stone-400 bg-stone-50 pl-4 pr-12 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((state) => !state)}
                  className="absolute right-4 top-4 text-slate-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>
            {changePasswordError ? <p className="text-sm text-red-600">{changePasswordError}</p> : null}
            <button className="h-14 w-full bg-brand-500 text-base font-semibold text-white">Update Password</button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={onLogin}>
            <Field label="Employee ID / Admin Username">
              <div className="relative">
                <input
                  {...loginForm.register('login', { required: true })}
                  className="h-14 w-full border-x-0 border-t-0 border-b border-stone-400 bg-stone-50 pl-12 pr-4 outline-none"
                />
                <UserRound className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...loginForm.register('password', { required: true })}
                  className="h-14 w-full border-x-0 border-t-0 border-b border-stone-400 bg-stone-50 pl-12 pr-12 outline-none"
                />
                <LockKeyhole className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword((state) => !state)}
                  className="absolute right-4 top-4 text-slate-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <button className="h-14 w-full bg-brand-500 text-base font-semibold text-white">Continue</button>
          </form>
        )}
      </div>
    </LoginShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm text-slate-700">{label}</span>
      {children}
    </label>
  );
}
