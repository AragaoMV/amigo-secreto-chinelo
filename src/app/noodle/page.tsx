import { Suspense } from 'react';
import { isAdminAuthenticated, getAdminParticipants } from '@/app/actions/adminActions';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminDashboard from '@/components/AdminDashboard';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

async function AdminContent() {
    const isAuth = await isAdminAuthenticated();

    if (!isAuth) {
        return <AdminLoginForm />;
    }

    const participants = await getAdminParticipants();
    return <AdminDashboard participants={participants} />;
}

export default function AdminPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-emerald-950 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3.5 bg-emerald-800 border-2 border-amber-400/70 rounded-full text-amber-300 mb-3 shadow-lg">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Painel do Organizador
                    </h1>
                    <p className="text-amber-200/90 mt-1 text-sm font-medium">
                        Gerencie os participantes e realize o sorteio do Amigo Havaianas
                    </p>
                    <div className="mt-3">
                        <Link
                            href="/"
                            className="text-xs font-semibold text-amber-300 underline hover:text-white transition"
                        >
                            Voltar para a página de inscrição
                        </Link>
                    </div>
                </header>

                <Suspense
                    fallback={
                        <div className="bg-white/90 p-8 rounded-2xl text-center text-red-900 font-medium animate-pulse max-w-md mx-auto">
                            Carregando painel do organizador...
                        </div>
                    }
                >
                    <AdminContent />
                </Suspense>
            </div>
        </main>
    );
}