const WHATSAPP_PHONE = '33629070239';
const SNAPCHAT_USERNAME = 'martinluc227';

export const CONTACT_EMAIL = 'support@lanavete.com';
export const CONTACT_PHONE_DISPLAY = '+33 6 29 07 02 39';
export const CONTACT_PHONE_TEL = '+33629070239';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function snapchatUrl(): string {
  return `https://www.snapchat.com/add/${SNAPCHAT_USERNAME}`;
}
