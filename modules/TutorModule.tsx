import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createTutorChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const TutorModule: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
        try {
            const newChat = createTutorChat();
            setChat(newChat);
            setMessages([{ sender: 'ai', text: '¡Hola! Soy ProfeIA. ¿En qué te puedo ayudar hoy? ¡Pilas pues!' }]);
        } catch (error) {
            console.error("Error initializing chat:", error);
            setInitializationError("No se pudo conectar con el Tutor IA. Por favor verifica tu conexión o la clave de API.");
            setMessages([{ sender: 'ai', text: 'Error de conexión. No puedo responder en este momento.' }]);
        }
    };
    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !chat || isLoading) return;

    const userMessage: Message = { sender: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessageStream({ message: currentInput });
      let aiResponse = '';
      
      // Add an initial empty AI message that we will populate as chunks stream in.
      setMessages(prev => [...prev, { sender: 'ai', text: '' }]);
      
      for await (const chunk of result) {
        aiResponse += chunk.text;
        setMessages(prev => {
          const updatedMessages = [...prev];
          // Update the text of the last message in the array
          updatedMessages[updatedMessages.length - 1].text = aiResponse;
          return updatedMessages;
        });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Lo siento, tuve un problema para procesar tu mensaje. Intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, chat, isLoading]);

  return (
    <div className="animate-fade-in flex flex-col h-[70vh] bg-white rounded-2xl shadow-lg border border-gray-200">
       <div className="p-4 border-b border-gray-200 text-center">
         <h2 className="text-xl font-bold text-gray-800">Chatbot ProfeIA</h2>
         <p className="text-sm text-gray-500">Tu tutor de mates 24/7</p>
       </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                <MarkdownRenderer content={msg.text} enableMath={true} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder={initializationError ? "Chat no disponible" : "Escribe tu pregunta aquí..."}
          disabled={isLoading || !!initializationError}
          className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !currentInput.trim() || !!initializationError}
          className="ml-3 bg-blue-600 text-white font-bold p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  );
};

export default TutorModule;