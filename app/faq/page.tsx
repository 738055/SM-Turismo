import React from 'react';
import type { Metadata } from 'next';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes',
  description: 'Tire suas dúvidas sobre transporte, reservas e documentos necessários para viajar em Foz do Iguaçu.',
};

export default function FAQ() {
  const faqs = [
    {
      question: "Como funciona a reserva online?",
      answer: "Você escolhe o passeio, a data e a quantidade de pessoas. Ao clicar em comprar, você será redirecionado para o WhatsApp da nossa equipe já com os dados do pedido para finalizar o pagamento e receber o voucher. É simples e seguro."
    },
    {
      question: "Quais são as formas de pagamento?",
      answer: "Aceitamos PIX, Cartão de Crédito (até 10x), e pagamento em espécie no momento do embarque (mediante sinal antecipado)."
    },
    {
      question: "Buscam no hotel?",
      answer: "Sim! Para a maioria dos passeios (Cataratas, Compras PY, Itaipu), o transporte inclui busca e retorno em hotéis localizados na região central e turística de Foz do Iguaçu."
    },
    {
      question: "Preciso de documentos para ir ao Paraguai/Argentina?",
      answer: "Sim, é obrigatório portar RG original (com menos de 10 anos de emissão) ou Passaporte válido. CNH é aceita apenas para entrada no Paraguai (não válida para Argentina). Menores de idade devem estar acompanhados de ambos os pais ou ter autorização judicial."
    },
    {
      question: "Qual a política de cancelamento?",
      answer: "Cancelamentos feitos com até 24 horas de antecedência têm reembolso integral. Cancelamentos no dia do passeio podem ter retenção de taxa administrativa."
    },
    {
      question: "Posso personalizar meu roteiro?",
      answer: "Com certeza. Além dos passeios regulares (coletivos), oferecemos vans privativas onde você define o horário de saída e o tempo de permanência em cada atração."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow text-brand-500">
              <HelpCircle size={32} />
           </div>
           <h1 className="text-3xl font-bold text-dark-900 mb-2">Dúvidas Frequentes</h1>
           <p className="text-gray-500">Tudo o que você precisa saber antes de embarcar.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 open:shadow-md">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none text-dark-900 font-bold text-lg hover:text-brand-600 transition-colors [&::-webkit-details-marker]:hidden">
                 {faq.question}
                 <ChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4 animate-fade-in">
                 {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-brand-50 p-8 rounded-2xl border border-brand-100">
           <h3 className="font-bold text-dark-900 mb-2">Ainda tem dúvidas?</h3>
           <p className="text-gray-600 mb-6">Nossa equipe de especialistas está pronta para te ajudar no WhatsApp.</p>
           <a 
             href="https://wa.me/5545984182779" 
             target="_blank"
             rel="noreferrer"
             className="inline-flex items-center justify-center bg-[#25D366] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#128C7E] transition-colors shadow-lg"
           >
             Falar com Atendente
           </a>
        </div>
      </div>
    </div>
  );
}