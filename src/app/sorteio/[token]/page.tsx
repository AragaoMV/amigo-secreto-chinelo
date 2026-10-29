import { Suspense } from 'react';
import { getParticipantByToken } from '@/app/actions/revealActions';
import PinRevealCard from '@/components/PinRevealCard';
import { TreePine, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface RevealPageProps {
    params: Promise<{ token: string }>;
}

async function RevealContent({ params }: RevealPageProps) {
    const { token } = await params;
    const result = await getParticipantByToken(token);

    if (result.error === 'not_found') {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-4 border-t-4 border-red-700">
                <AlertCircle size={44} className="mx-auto text-red-700" />
                <h2 className="text-xl font-extrabold text-gray-900">
                    Link de sorteio inválido
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Não encontramos nenhum participante associado a este link. Peça ao organizador para reenviar o seu acesso pelo WhatsApp.
                </p>
                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-block text-sm font-bold text-red-700 underline hover:text-red-900"
                    >
                        Ir para a página inicial
                    </Link>
                </div>
            </div>
        );
    }

    if (result.error === 'not_drawn') {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-4 border-t-4 border-amber-500">
                <Clock size={44} className="mx-auto text-amber-600" />
                <h2 className="text-xl font-extrabold text-gray-900">
                    Olá, {result.name}!
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    O sorteio do Amigo Havaianas ainda não foi realizado ou foi reiniciado pelo organizador. Aguarde o aviso no WhatsApp!
                </p>
            </div>
        );
    }

    return <PinRevealCard token={token} ownerName={result.name!} />;
}

export default function RevealPage({ params }: RevealPageProps) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-emerald-950 py-10 px-4">
            <div className="max-w-md mx-auto">
                <header className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3.5 bg-emerald-800 border-2 border-amber-400/70 rounded-full text-amber-300 mb-3 shadow-lg">
                        <TreePine size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Amigo Havaianas de Natal
                    </h1>
                    <p className="text-amber-200/90 mt-1 text-sm font-medium">
                        Área secreta de revelação do seu amigo oculto
                    </p>
                </header>

                <Suspense
                    fallback={
                        <div className="bg-white/90 p-8 rounded-2xl text-center text-red-900 font-medium animate-pulse">
                            Carregando seu envelope secreto...
                        </div>
                    }
                >
                    <RevealContent params={params} />
                </Suspense>
            </div>
        </main>
    );
}