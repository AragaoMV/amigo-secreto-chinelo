'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { Participant } from '@/interfaces/iSupabase';
import { revalidatePath } from 'next/cache';

// Verifica se o sorteio já ocorreu (RF04)
export async function checkDrawStatus(): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from('participants')
        .select('drawn_id')
        .not('drawn_id', 'is', null)
        .limit(1);

    if (error) {
        console.error('Erro ao checar status do sorteio:', error);
        return false;
    }

    return data && data.length > 0;
}

// Busca apenas nomes para o mural público, sem expor dados sensíveis (RF03 e RNF02)
export async function getPublicParticipants(): Promise<Pick<Participant, 'name'>[]> {
    const { data, error } = await supabaseAdmin
        .from('participants')
        .select('name')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Erro ao buscar participantes:', error);
        return [];
    }

    return data || [];
}

// Cadastro de Participante com validação de WhatsApp único (RF01 e RF02)
export async function registerParticipant(formData: FormData) {
    const name = (formData.get('name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.replace(/\D/g, ''); // Apenas números
    const shoe_size = formData.get('shoe_size') as string;
    const pin = (formData.get('pin') as string)?.trim();

    if (!name || !phone || !shoe_size || !pin) {
        return { error: 'Preencha todos os campos e selecione o tamanho do chinelo.' };
    }

    if (phone.length < 10 || phone.length > 11) {
        return { error: 'Digite um número de WhatsApp válido com DDD.' };
    }

    if (!/^\d{4}$/.test(pin)) {
        return { error: 'O PIN deve conter exatamente 4 dígitos numéricos.' };
    }

    // Prevenção de Duplicidade por WhatsApp (RF02)
    const { data: existingUser } = await supabaseAdmin
        .from('participants')
        .select('id')
        .eq('phone', phone)
        .limit(1);

    if (existingUser && existingUser.length > 0) {
        return { error: 'Este WhatsApp já está cadastrado no sorteio!' };
    }

    // Inserção no banco
    const { error: insertError } = await supabaseAdmin
        .from('participants')
        .insert([{ name, phone, shoe_size, pin }]);

    if (insertError) {
        console.error('Erro ao salvar participante:', insertError);
        return { error: 'Erro interno ao realizar cadastro. Tente novamente.' };
    }

    revalidatePath('/'); // Atualiza o mural imediatamente
    return { success: true };
}