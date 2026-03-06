import React from 'react';
import { ShieldCheck, Heart, Users, Globe } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre a Foz Turismo SM',
  description: 'Conheça a história da Foz Turismo SM, sua agência de turismo completa em Foz do Iguaçu.',
};

export default function About() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
      
      {/* Hero Section */}
      <div className="relative h-[400px] bg-brand-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Equipe Foz Turismo SM"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <span className="text-brand-300 font-bold uppercase tracking-widest text-sm mb-2 block">Nossa Essência</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Foz do Iguaçu do jeito certo!</h1>
          <p className="text-xl text-gray-200">
            Anos de experiência conectando viajantes às maravilhas de Foz do Iguaçu com segurança e qualidade.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-16">
        
        {/* Nossa História */}
        <div className="mb-16">
           <h2 className="text-3xl font-bold text-dark-900 mb-6 text-center">Nossa História</h2>
           <div className="prose prose-lg text-gray-600 mx-auto leading-relaxed text-justify">
             <p className="mb-4">
               A <strong>Foz Turismo SM</strong> nasceu do amor pela cidade e do desejo de proporcionar experiências autênticas em Foz do Iguaçu. Criamos uma agência onde o cliente não é apenas um passageiro, mas um viajante que merece o melhor da região.
             </p>
             <p>
               Nossa missão é simples: eliminar a complexidade do turismo e deixar você livre para apenas aproveitar. Da reserva ao retorno, cuidamos de cada detalhe para que sua viagem seja inesquecível.
             </p>
             <p>
               Hoje, contamos com uma frota moderna e uma equipe apaixonada. Seja para compras no Paraguai, aventuras nas Cataratas ou um jantar na Argentina, a <strong>Foz Turismo SM</strong> está pronta para te levar.
             </p>
           </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                 <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Segurança Total</h3>
              <p className="text-gray-600">Nossas vans são revisadas rigorosamente. Sua família é nosso bem mais precioso.</p>
           </div>
           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                 <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Turismo com Amor</h3>
              <p className="text-gray-600">Amamos Foz e queremos que você ame também. Cada roteiro é feito com carinho.</p>
           </div>
           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                 <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Atendimento Humano</h3>
              <p className="text-gray-600">Atendimento humanizado, sem robôs. Aqui você fala com gente de verdade.</p>
           </div>
           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                 <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Conexão Fronteira</h3>
              <p className="text-gray-600">Somos especialistas em cruzar fronteiras (Brasil, Paraguai e Argentina) sem estresse.</p>
           </div>
        </div>

        {/* CTA */}
        <div className="bg-brand-600 text-white rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10">
             <h2 className="text-2xl md:text-4xl font-bold mb-6">Bora girar por Foz?</h2>
             <p className="text-brand-100 mb-8 max-w-xl mx-auto text-lg">
               Deixe a logística chata com a gente e preocupe-se apenas em se divertir.
             </p>
             <Link href="/products" className="inline-block bg-white text-brand-700 font-bold py-4 px-10 rounded-full transition-transform hover:scale-105 shadow-lg">
               Ver Roteiros Foz Turismo SM
             </Link>
           </div>
        </div>

      </div>
    </div>
  );
}