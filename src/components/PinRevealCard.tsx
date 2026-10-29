'use client';

import { useState } from 'react';
import { verifyPinAndReveal } from '@/app/actions/revealActions';
import { Lock, Unlock, Gift, Footprints, EyeOff } from 'lucide-react';

interface PinRevealCardProps {
    token: string;
    ownerName: string;
}

export default function PinRevealCard({ token, ownerName }: PinRevealCardProps) {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [revealed, setRevealed] = useState<{
        drawnName: string;
        drawnSize: string;
    } | null>(null);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPin(digits);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await verifyPinAndReveal(token, pin);

        if (res?.error) {
            setError(res.error);
        } else if (res?.success && res.drawnName && res.drawnSize) {
            setRevealed({
                drawnName: res.drawnName,
                drawnSize: res.drawnSize,
            });
        }

        setLoading(false);
    };

    // [RF14] Tela Desbloqueada com o Resultado
    if (revealed) {
        return (
            <div className="bg-white p-7 rounded-2xl shadow-2xl border-2 border-amber-300 text-center space-y-6">
                <div className="inline-flex items-center justify-center p-3.5 bg-emerald-100 text-emerald-800 rounded-full">
                    <Gift size={32} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-gray-800">
                        Olá {ownerName}, você tirou:
                    </h2>

                    <div className="bg-red-50/80 border-2 border-red-200 rounded-2xl p-5 space-y-3 text-left">
                        <p className="text-lg text-gray-900">
                            <strong className="font-extrabold text-red-950">Nome:</strong>{' '}
                            <span className="font-bold">{revealed.drawnName}</span>
                        </p>
                        <p className="text-lg text-gray-900 flex items-center gap-2">
                            <strong className="font-extrabold text-red-950">Tamanho:</strong>{' '}
                            <span className="inline-flex items-center gap-1.5 bg-red-700 text-white font-extrabold px-3 py-1 rounded-xl text-base shadow-xs">
                                <Footprints size={16} />
                                {revealed.drawnSize}
                            </span>
                        </p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                    Guarde segredo! Você pode fechar esta página ou voltar ao link a qualquer momento usando seu PIN.
                </p>

                <button
                    type="button"
                    onClick={() => {
                        setRevealed(null);
                        setPin('');
                    }}
                    className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                    <EyeOff size={16} />
                    <span>Ocultar resultado da tela</span>
                </button>
            </div>
        );
    }

    // [RF12] Tela de Bloqueio por PIN
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl shadow-xl space-y-5 border-2 border-amber-200/80 text-center"
        >
            <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-800 rounded-full">
                <Lock size={26} />
            </div>

            <div>
                <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
                    Olá {ownerName}! Digite seu PIN de 4 dígitos para revelar quem você tirou
                </h2>
                <p className="text-xs text-gray-500 mt-1.5">
                    Use a senha de 4 números que você criou no momento da inscrição.
                </p>
            </div>

            <div>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="••••"
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-2xl font-bold rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none transition"
                />
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-100 text-red-800 text-sm font-semibold border border-red-200">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-4 rounded-xl shadow-md hover:from-red-800 hover:to-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
                <Unlock size={18} />
                <span>{loading ? 'Verificando PIN...' : 'Confirmar e Revelar'}</span>
            </button>
        </form>
    );
}