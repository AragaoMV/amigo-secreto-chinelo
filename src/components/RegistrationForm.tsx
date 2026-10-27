'use client';

import { useState } from 'react';
import { registerParticipant } from '@/app/actions/participantActions';
import { Gift, Footprints } from 'lucide-react';

const SHOE_SIZES = [
  '19-20',
  '21-22',
  '23-24',
  '25-26',
  '27-28',
  '29-30',
  '31-32',
  '33-34',
  '35-36',
  '37-38',
  '39-40',
  '41-42',
  '43-44',
  '45-46',
];

export default function RegistrationForm() {
  const [phone, setPhone] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Máscara de WhatsApp: (99) 99999-9999
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 10) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!shoeSize) {
      setMessage({ type: 'error', text: 'Selecione o tamanho do chinelo.' });
      setLoading(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('shoe_size', shoeSize);

    const res = await registerParticipant(formData);

    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else if (res?.success) {
      setMessage({
        type: 'success',
        text: 'Inscrição confirmada! Seu nome já está no mural de Natal.',
      });
      form.reset();
      setPhone('');
      setShoeSize('');
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-xl space-y-5 border-2 border-amber-200/80"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Nome Completo
        </label>
        <input
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none transition"
          placeholder="Ex: Maria da Silva"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          WhatsApp (com DDD)
        </label>
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          required
          value={phone}
          onChange={handlePhoneChange}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none transition"
          placeholder="(99) 99999-9999"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-2">
          <Footprints size={16} className="text-red-700" />
          <span>Tamanho do Chinelo</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SHOE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setShoeSize(size)}
              className={`py-2.5 px-1 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                shoeSize === size
                  ? 'bg-red-700 text-white border-red-800 shadow-md scale-105'
                  : 'bg-red-50/60 text-red-950 hover:bg-red-100 border-red-200/70'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          PIN de Segurança (4 números)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Guarde essa senha. Você vai usá-la para abrir o seu resultado no WhatsApp.
        </p>
        <input
          name="pin"
          type="text"
          inputMode="numeric"
          maxLength={4}
          pattern="\d{4}"
          required
          className="w-full px-4 py-3 text-center tracking-[0.5em] text-xl font-bold rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none transition"
          placeholder="••••"
        />
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-xl text-sm font-medium text-center ${
            message.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-4 rounded-xl shadow-md hover:from-red-800 hover:to-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          'Confirmando...'
        ) : (
          <>
            <Gift size={20} /> Participar do Sorteio de Natal
          </>
        )}
      </button>
    </form>
  );
}