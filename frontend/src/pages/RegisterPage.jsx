import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Logging you in…');
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="font-heading font-bold text-2xl text-navy mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join ShopEase today</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" required minLength={3} maxLength={30} value={form.username} onChange={set('username')} className="input" placeholder="johndoe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={set('password')} className="input" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" required value={form.confirm} onChange={set('confirm')} className="input" placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-3 mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
