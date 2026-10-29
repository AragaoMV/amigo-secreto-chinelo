'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { Participant } from '@/interfaces/iSupabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'amigo_havaianas_admin';

// [RF05] Verifica se o administrador está autenticado
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token === 'authenticated';
}

// [RF05] Login com ADMIN_PASSWORD salvando em Cookie HTTP-only
export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: 'ADMIN_PASSWORD não configurada no .env.local.' };
  }

  if (password !== adminPassword) {
    return { error: 'Senha incorreta. Tente novamente.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 dia
    sameSite: 'lax',
  });

  revalidatePath('/noodle');
  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  revalidatePath('/noodle');
}

// [RF06] Busca completa dos inscritos para o painel (sem revelar quem tirou quem na tela)
export async function getAdminParticipants(): Promise<Participant[]> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return [];

  const { data, error } = await supabaseAdmin
    .from('participants')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao listar participantes no admin:', error);
    return [];
  }

  return data || [];
}

// [RF06] Editar participante
export async function updateParticipant(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { error: 'Acesso negado.' };

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.replace(/\D/g, '');
  const shoe_size = formData.get('shoe_size') as string;
  const pin = (formData.get('pin') as string)?.trim();

  if (!id || !name || !phone || !shoe_size || !pin) {
    return { error: 'Preencha todos os campos corretamente.' };
  }

  if (phone.length < 10 || phone.length > 11) {
    return { error: 'WhatsApp inválido.' };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { error: 'O PIN deve ter 4 números.' };
  }

  // Verifica se o telefone já pertence a outra pessoa
  const { data: existingPhone } = await supabaseAdmin
    .from('participants')
    .select('id')
    .eq('phone', phone)
    .neq('id', id)
    .limit(1);

  if (existingPhone && existingPhone.length > 0) {
    return { error: 'Este WhatsApp já pertence a outro participante.' };
  }

  const { error } = await supabaseAdmin
    .from('participants')
    .update({ name, phone, shoe_size, pin })
    .eq('id', id);

  if (error) {
    console.error('Erro ao editar participante:', error);
    return { error: 'Não foi possível atualizar os dados.' };
  }

  revalidatePath('/noodle');
  revalidatePath('/');
  return { success: true };
}

// [RF06] Excluir participante (permitido apenas antes do sorteio)
export async function deleteParticipant(id: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { error: 'Acesso negado.' };

  // Verifica se o sorteio já foi feito
  const { data: drawnCheck } = await supabaseAdmin
    .from('participants')
    .select('drawn_id')
    .not('drawn_id', 'is', null)
    .limit(1);

  if (drawnCheck && drawnCheck.length > 0) {
    return { error: 'Não é permitido excluir participantes após o sorteio. Resete o sorteio primeiro.' };
  }

  const { error } = await supabaseAdmin
    .from('participants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir participante:', error);
    return { error: 'Erro ao excluir participante.' };
  }

  revalidatePath('/noodle');
  revalidatePath('/');
  return { success: true };
}

// [RF07] Realizar Sorteio em Fila Circular (Fisher-Yates)
export async function performCircularDraw() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { error: 'Acesso negado.' };

  const { data: participants, error } = await supabaseAdmin
    .from('participants')
    .select('id');

  if (error || !participants) {
    return { error: 'Erro ao buscar participantes para o sorteio.' };
  }

  if (participants.length < 3) {
    return { error: 'É necessário ter no mínimo 3 participantes para realizar o sorteio.' };
  }

  // Embaralhamento Fisher-Yates
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Vinculação em fila circular: i -> i+1 e último -> 0
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];

    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({
        drawn_id: receiver.id,
        viewed_at: null,
        whatsapp_sent: false,
      })
      .eq('id', giver.id);

    if (updateError) {
      console.error('Erro ao salvar par do sorteio:', updateError);
      return { error: 'Falha ao gravar o sorteio no banco.' };
    }
  }

  revalidatePath('/noodle');
  revalidatePath('/');
  return { success: true };
}

// [RF11] Resetar Sorteio
export async function resetDraw() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { error: 'Acesso negado.' };

  // Limpa os campos de sorteio de todos os registros
  const { error } = await supabaseAdmin
    .from('participants')
    .update({
      drawn_id: null,
      viewed_at: null,
      whatsapp_sent: false,
    })
    .not('id', 'is', null);

  if (error) {
    console.error('Erro ao resetar sorteio:', error);
    return { error: 'Erro ao resetar o sorteio.' };
  }

  revalidatePath('/noodle');
  revalidatePath('/');
  return { success: true };
}