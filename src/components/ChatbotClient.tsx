'use client';

import dynamic from 'next/dynamic';

const Chatbot = dynamic(() => import('@/chatbot/page'), {
  ssr: false
});

export default function ChatbotClient() {
  return <Chatbot />;
} 