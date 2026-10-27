export interface Participant {
  id: string;
  name: string;
  phone: string;
  shoe_size: string;
  pin: string;
  secret_token: string;
  drawn_id: string | null;
  whatsapp_sent: boolean;
  viewed_at: string | null;
  created_at: string;
}