'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// [RF12] Busca apenas o nome do dono do token e valida se o sorteio já ocorreu
export async function getParticipantByToken(token: string) {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
        return { error: 'not_found' as const };
    }

    const { data, error } = await supabaseAdmin
        .from('participants')
        .select('name, drawn_id')
        .eq('secret_token', token)
        .single();

    if (error || !data) {
        return { error: 'not_found' as const };
    }

    if (!data.drawn_id) {
        return { error: 'not_drawn' as const, name: data.name };
    }

    return { name: data.name };
}

// [RF13] Valida o PIN no back-end, grava viewed_at e retorna Nome + Tamanho do sorteado
export async function verifyPinAndReveal(token: string, pin: string) {
    const cleanPin = pin?.trim();

    if (!cleanPin || !/^\d{4}$/.test(cleanPin)) {
        return { error: 'Digite os 4 números do seu PIN.' };
    }

    const { data: owner, error: ownerError } = await supabaseAdmin
        .from('participants')
        .select('id, name, pin, drawn_id, viewed_at')
        .eq('secret_token', token)
        .single();

    if (ownerError || !owner) {
        return { error: 'Link inválido ou não encontrado.' };
    }

    if (owner.pin !== cleanPin) {
        return { error: 'PIN incorreto' };
    }

    if (!owner.drawn_id) {
        return { error: 'O sorteio ainda não foi realizado pelo organizador.' };
    }

    if (!owner.viewed_at) {
        await supabaseAdmin
            .from('participants')
            .update({ viewed_at: new Date().toISOString() })
            .eq('id', owner.id);

        revalidatePath('/noodle');
    }

    const { data: drawnPerson, error: drawnError } = await supabaseAdmin
        .from('participants')
        .select('name, shoe_size')
        .eq('id', owner.drawn_id)
        .single();

    if (drawnError || !drawnPerson) {
        return { error: 'Erro ao carregar os dados do participante sorteado.' };
    }

    return {
        success: true,
        drawnName: drawnPerson.name,
        drawnSize: drawnPerson.shoe_size,
    };
}