'use client';

import { useState } from 'react';
import { loginAdmin } from '@/app/actions/adminActions';
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLoginForm() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await loginAdmin(formData);

        if (res?.error) {
            setError(res.error);
        }
        setLoading(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-5 border-2 border-amber-200/80"
        >
            <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-800 rounded-full mb-2">
                    <Lock size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">
                    Acesso do Organizador
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Digite a senha mestre definida no arquivo .env.local
                </p>
            </div>

            <div>
                <input
                    name="password"
                    type="password"
                    required
                    placeholder="Senha Mestre"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none"
                />
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-100 text-red-800 text-sm font-medium text-center border border-red-200">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:from-red-800 hover:to-red-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
                <span>{loading ? 'Verificando...' : 'Entrar no Painel'}</span>
                <ArrowRight size={18} />
            </button>
        </form>
    );
}