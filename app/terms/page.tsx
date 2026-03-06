import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Políticas e Termos de Uso - Foz Turismo SM',
  description: 'Leia nossos termos de serviço, política de privacidade e regras de cancelamento.',
};

export default function Terms() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-dark-900 mb-8 border-b pb-4">Políticas e Termos de Uso</h1>

        <div className="prose prose-gray max-w-none text-gray-600">
          
          <h3 className="text-dark-900 font-bold text-xl mt-6 mb-2">1. Privacidade e Proteção de Dados</h3>
          <p className="mb-4">
            A <strong>Foz Turismo SM Viagens e Turismo</strong> compromete-se a proteger a privacidade dos usuários. Os dados coletados (nome, e-mail, telefone) são utilizados exclusivamente para o processamento de reservas e comunicação sobre os serviços contratados. Não vendemos ou compartilhamos seus dados com terceiros para fins de marketing sem seu consentimento explícito.
          </p>

          <h3 className="text-dark-900 font-bold text-xl mt-6 mb-2">2. Reservas e Pagamentos</h3>
          <p className="mb-4">
            Todas as reservas estão sujeitas à disponibilidade. O pagamento pode ser realizado via PIX, Cartão de Crédito ou Transferência Bancária. A reserva só é confirmada após a compensação do pagamento ou envio do comprovante, validado por nossa equipe financeira.
          </p>

          <h3 className="text-dark-900 font-bold text-xl mt-6 mb-2">3. Cancelamentos e Reembolsos</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
             <li>Cancelamentos solicitados com até 24 horas de antecedência do horário do serviço terão reembolso de 100% do valor pago.</li>
             <li>Cancelamentos entre 24h e 4h de antecedência terão reembolso de 50%.</li>
             <li>Não comparecimento (No-Show) sem aviso prévio não dá direito a reembolso.</li>
             <li>Em casos de mau tempo que impeça a realização do passeio (ex: fechamento do Parque Nacional), o passeio será reagendado ou reembolsado integralmente.</li>
          </ul>

          <h3 className="text-dark-900 font-bold text-xl mt-6 mb-2">4. Responsabilidades</h3>
          <p className="mb-4">
            A Foz Turismo SM não se responsabiliza por objetos deixados no interior dos veículos. É responsabilidade do passageiro portar os documentos necessários para travessia de fronteiras (RG ou Passaporte). Caso o passageiro seja impedido de cruzar a fronteira por falta de documentação, não haverá reembolso do transporte.
          </p>

          <h3 className="text-dark-900 font-bold text-xl mt-6 mb-2">5. Uso de Imagem</h3>
          <p className="mb-4">
            Ao participar de nossos passeios, o cliente concorda que fotos e vídeos capturados por nossa equipe podem ser utilizados em nossas redes sociais para fins de divulgação, salvo manifestação expressa em contrário no momento da captura.
          </p>

          <div className="mt-12 p-6 bg-brand-50 border border-brand-100 rounded-lg text-sm text-gray-500">
             <p><strong>Foz Turismo SM Viagens e Turismo LTDA</strong></p>
             <p>CNPJ: 00.000.000/0001-00</p>
             <p>Av. Brasil, 1234 - Foz do Iguaçu, PR</p>
             <p>Atualizado em: Janeiro de 2024</p>
          </div>

        </div>
      </div>
    </div>
  );
}