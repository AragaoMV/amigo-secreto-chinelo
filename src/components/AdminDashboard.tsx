'use client';

import { useState } from 'react';
import { Participant } from '@/interfaces/iSupabase';
import {
  performCircularDraw,
  resetDraw,
  deleteParticipant,
  updateParticipant,
  logoutAdmin,
  markWhatsappSent,
} from '@/app/actions/adminActions';
import {
  Shuffle,
  RotateCcw,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  LogOut,
  X,
  Check,
  AlertTriangle,
  Users,
  KeyRound,
  Footprints,
  Send,
  CheckCheck,
} from 'lucide-react';

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

interface AdminDashboardProps {
  participants: Participant[];
}

export default function AdminDashboard({ participants }: AdminDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0); // Confirmação dupla (RF11)
  const [editingUser, setEditingUser] = useState<Participant | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editShoeSize, setEditShoeSize] = useState('');

  const isDrawn = participants.some((p) => p.drawn_id !== null);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return raw;
  };

  const handleEditPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 10) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setEditPhone(value);
  };

  const openEditModal = (p: Participant) => {
    setEditingUser(p);
    setEditPhone(formatPhone(p.phone));
    setEditShoeSize(p.shoe_size);
    setFeedback({ type: '', text: '' });
  };

  const handleDraw = async () => {
    setLoading(true);
    setFeedback({ type: '', text: '' });
    const res = await performCircularDraw();
    if (res?.error) {
      setFeedback({ type: 'error', text: res.error });
    } else {
      setFeedback({
        type: 'success',
        text: 'Sorteio realizado com sucesso! Agora envie os links pelo botão de WhatsApp.',
      });
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (resetStep === 0) {
      setResetStep(1);
      return;
    }
    if (resetStep === 1) {
      setResetStep(2);
      return;
    }

    setLoading(true);
    setFeedback({ type: '', text: '' });
    const res = await resetDraw();
    if (res?.error) {
      setFeedback({ type: 'error', text: res.error });
    } else {
      setFeedback({
        type: 'success',
        text: 'Sorteio resetado! As inscrições estão abertas novamente.',
      });
    }
    setResetStep(0);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover ${name} do amigo oculto?`)) return;
    setLoading(true);
    const res = await deleteParticipant(id);
    if (res?.error) {
      setFeedback({ type: 'error', text: res.error });
    } else {
      setFeedback({ type: 'success', text: `${name} foi removido(a).` });
    }
    setLoading(false);
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('id', editingUser.id);
    formData.append('shoe_size', editShoeSize);

    const res = await updateParticipant(formData);
    if (res?.error) {
      setFeedback({ type: 'error', text: res.error });
    } else {
      setFeedback({ type: 'success', text: 'Dados atualizados com sucesso!' });
      setEditingUser(null);
    }
    setLoading(false);
  };

  // [RF09] Abre o wa.me sem spoiler e marca whatsapp_sent = true no banco
  const handleSendWhatsapp = async (p: Participant) => {
    const cleanPhone = p.phone.replace(/\D/g, '');
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const revealUrl = `${baseUrl}/sorteio/${p.secret_token}`;

    const message =
      `Olá, ${p.name}! O sorteio do nosso *Amigo Havaianas de Natal* foi realizado!\n\n` +
      `Acesse o seu link exclusivo abaixo e digite sua senha de 4 números para descobrir quem você tirou:\n` +
      `${revealUrl}`;

    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
      message
    )}`;

    // Abre o WhatsApp em nova guia imediatamente
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Atualiza o status no banco de dados
    await markWhatsappSent(p.id);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Topo e Ações Principais */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-950 font-extrabold text-xl">
            <Users size={22} className="text-red-700" />
            <h2>Gestão de participantes ({participants.length} inscritos)</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isDrawn
              ? 'Sorteio ativo. Envie os links individuais pelo botão de WhatsApp abaixo.'
              : 'Aguardando sorteio. Mínimo de 3 participantes para sortear.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {!isDrawn ? (
            <button
              onClick={handleDraw}
              disabled={loading || participants.length < 3}
              className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Shuffle size={18} />
              <span>Realizar Sorteio</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleReset}
                disabled={loading}
                className={`flex-1 sm:flex-initial font-bold px-4 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm ${
                  resetStep === 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : resetStep === 1
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                }`}
              >
                {resetStep === 0 && (
                  <>
                    <RotateCcw size={18} />
                    <span>Resetar Sorteio</span>
                  </>
                )}
                {resetStep === 1 && (
                  <>
                    <AlertTriangle size={18} />
                    <span>Tem certeza? (Clique 1/2)</span>
                  </>
                )}
                {resetStep === 2 && (
                  <>
                    <AlertTriangle size={18} />
                    <span>Confirmar Reset Definitivo (2/2)</span>
                  </>
                )}
              </button>

              {resetStep > 0 && (
                <button
                  onClick={() => setResetStep(0)}
                  className="p-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                  title="Cancelar Reset"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => logoutAdmin()}
            className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition cursor-pointer"
            title="Sair do Painel"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback({ type: '', text: '' })}
            className="cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabela de Inscritos (RF06, RF09 e RF10) */}
      <div className="bg-white rounded-2xl shadow-xl border border-amber-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-950 text-amber-100 text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Participante</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4">Havaianas</th>
                <th className="py-3.5 px-4">PIN (Suporte)</th>
                <th className="py-3.5 px-4">Status Visualização</th>
                <th className="py-3.5 px-4 text-right">Ações / Notificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum familiar inscrito até o momento.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-red-50/30 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {formatPhone(p.phone)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 font-bold px-2.5 py-1 rounded-lg text-xs">
                        <Footprints size={13} />
                        {p.shoe_size}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-bold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-xs border border-gray-200">
                        <KeyRound size={12} className="text-gray-500" />
                        {p.pin}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.viewed_at ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={14} />
                          Já viu (
                          {new Date(p.viewed_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          )
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                          <Clock size={14} />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Botão de Disparo Rápido WhatsApp (RF09) - Aparece quando sorteado */}
                        {isDrawn && (
                          <button
                            onClick={() => handleSendWhatsapp(p)}
                            className={`px-3 py-2 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                              p.whatsapp_sent
                                ? 'bg-gray-100 hover:bg-gray-200 text-emerald-800 border border-emerald-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title="Abrir conversa no WhatsApp com o link de revelação"
                          >
                            {p.whatsapp_sent ? (
                              <>
                                <CheckCheck size={14} />
                                <span>WhatsApp Clicado</span>
                              </>
                            ) : (
                              <>
                                <Send size={14} />
                                <span>Enviar WhatsApp</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                          title="Editar dados"
                        >
                          <Pencil size={16} />
                        </button>

                        {!isDrawn && (
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={loading}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition cursor-pointer disabled:opacity-50"
                            title="Excluir participante"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição (RF06) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-red-950">
                Editar Participante
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Nome
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingUser.name}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  WhatsApp
                </label>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={editPhone}
                  onChange={handleEditPhoneChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Numeração da Havaianas
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {SHOE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setEditShoeSize(size)}
                      className={`py-2 px-1 rounded-lg font-bold text-xs transition cursor-pointer border ${
                        editShoeSize === size
                          ? 'bg-red-700 text-white border-red-800'
                          : 'bg-red-50/60 text-red-950 border-red-200/70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  PIN de 4 dígitos
                </label>
                <input
                  name="pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  defaultValue={editingUser.pin}
                  required
                  className="w-full px-3.5 py-2.5 text-center tracking-[0.4em] font-bold rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}