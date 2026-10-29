import { Suspense } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import { checkDrawStatus, getPublicParticipants } from '@/app/actions/participantActions';
import { TreePine, CheckCircle2, Footprints, Users } from 'lucide-react';

async function HomeContent() {
  const isDrawn = await checkDrawStatus();
  const participants = await getPublicParticipants();

  return (
    <>
      {/* Trava Pós-Sorteio (RF04) ou Formulário de Inscrição (RF01) */}
      {isDrawn ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-t-4 border-emerald-600">
          <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Os nomes já foram sorteados!
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            O registro fechou! Dê uma olhada no seu <b>WhatsApp</b> e abra o seu link exclusivo para descobrir quem vai ganhar uma Havaianas nova de você neste Natal.
          </p>
        </div>
      ) : (
        <RegistrationForm />
      )}

      {/* Mural de Participantes Confirmados (RF03) */}
      <section className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-950">
            <Users size={18} className="text-emerald-700" />
            <h2 className="text-base font-bold">
              Quem já está na participando
            </h2>
          </div>
          <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full">
            {participants.length}
          </span>
        </div>

        {participants.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            A árvore ainda está vazia. Puxa a fila e seja o primeiro da família a entrar!
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5">
            {participants.map((p, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-red-50/50 px-3 py-2.5 rounded-xl border border-red-100"
              >
                <Footprints size={15} className="text-red-700 shrink-0" />
                <span className="truncate">{p.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-emerald-950 py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Cabeçalho Natalino */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-emerald-800 border-2 border-amber-400/70 rounded-full text-amber-300 mb-3 shadow-lg">
            <TreePine size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Amigo Havaianas de Natal
          </h1>
          <p className="text-amber-200/90 mt-2 text-sm font-medium leading-relaxed px-2">
            Natal em família pede presente no pé! Escolha sua numeração, entre no amigo oculto e vamos celebrar.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="bg-white/90 p-8 rounded-2xl text-center text-red-900 font-medium animate-pulse">
              Preparando a árvore de Natal...
            </div>
          }
        >
          <HomeContent />
        </Suspense>
      </div>
    </main>
  );
}