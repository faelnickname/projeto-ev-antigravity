import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mordomo EV — Assistente Pessoal',
  description: 'Controle seus dispositivos inteligentes por voz',
};

export default function MordomoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
