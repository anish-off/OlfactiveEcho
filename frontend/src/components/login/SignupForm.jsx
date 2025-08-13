import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignupForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const strength = useMemo(()=>{
    let score = 0; const rules = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    rules.forEach(r=> r.test(password) && (score++));
    return { score, ok: score >= 4 };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!strength.ok) return setError('Password too weak');
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);
  await register(formData); // AuthContext register now must accept FormData
  toast.success('Account created');
  navigate('/products');
    } catch (err) {
  const msg = err?.response?.data?.message || 'Registration failed';
  setError(msg);
  toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Create an account</h2>
        <p className="text-muted-foreground mt-2">Get started with OLFACTIVE ECHO</p>
      </div>
      {error && <div className="text-sm text-red-500 border border-red-400 bg-red-50 px-3 py-2 rounded">{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-background text-foreground transition-all"
            placeholder="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-background text-foreground transition-all"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
          <div className="relative">
            <input
              type={showPassword? 'text':'password'}
              id="password"
              name="password"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-background text-foreground transition-all pr-12"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
            <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground hover:text-foreground">{showPassword? 'Hide':'Show'}</button>
          </div>
          <div className="flex items-center gap-2">
            {[0,1,2,3,4].map(i=> <span key={i} className={`h-1 flex-1 rounded ${i < strength.score? 'bg-green-500':'bg-gray-300'}`}></span>)}
          </div>
          <p className={`text-xs ${strength.ok? 'text-green-600':'text-orange-500'}`}>Password must include 8 chars, upper, lower, number, symbol.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm? 'text':'password'}
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-background text-foreground transition-all pr-12"
              placeholder="Repeat password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" onClick={()=>setShowConfirm(s=>!s)} className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground hover:text-foreground">{showConfirm? 'Hide':'Show'}</button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="avatar" className="block text-sm font-medium text-muted-foreground">Avatar (optional)</label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={(e)=> setAvatarFile(e.target.files?.[0]||null)}
            className="w-full text-sm"
          />
          {avatarFile && <p className="text-xs text-muted-foreground">Selected: {avatarFile.name}</p>}
        </div>
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms and Conditions
            </Link>
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting || !strength.ok}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-input bg-background hover:bg-accent text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-input bg-background hover:bg-accent text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 11v2.4h3.97c-.16 1.029-1.2 3.02-3.97 3.02-2.39 0-4.34-1.979-4.34-4.42 0-2.44 1.95-4.42 4.34-4.42 1.36 0 2.27.58 2.79 1.08l1.9-1.83c-1.22-1.14-2.8-1.83-4.69-1.83-3.87 0-7 3.13-7 7s3.13 7 7 7c4.04 0 6.721-2.84 6.721-6.84 0-.46-.051-.81-.111-1.16h-6.61zm0 0 17 2h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2z" />
          </svg>
          Google
        </button>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;