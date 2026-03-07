'use client';

import React, { useState } from 'react';
import { X, MapPin, Plane, Ticket } from 'lucide-react';
import { Product, ProductType } from '@/lib/types';
import TourWizard from './TourWizard';
import AirportTransferWizard from './AirportTransferWizard';

interface Props {
  editingProduct?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const PRODUCT_TYPES: { type: ProductType; icon: React.ReactNode; label: string; description: string }[] = [
  {
    type: 'tour',
    icon: <MapPin size={28} />,
    label: 'Passeio / Atrativo',
    description: 'Cataratas, City Tour, Itaipu, passeios com guia',
  },
  {
    type: 'transfer',
    icon: <Plane size={28} />,
    label: 'Transfer Aeroporto',
    description: 'IGU, IGR, AGT — Ida e Volta com configuração de veículos',
  },
  {
    type: 'ticket',
    icon: <Ticket size={28} />,
    label: 'Ingresso',
    description: 'Ingressos avulsos para atrações e eventos',
  },
];

export default function ProductFormWrapper({ editingProduct, onClose, onSaved }: Props) {
  // Se editando, pular a seleção de tipo
  const [selectedType, setSelectedType] = useState<ProductType | null>(
    editingProduct?.product_type ?? null
  );

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  // Passo 1: seleção de tipo (apenas criação nova)
  if (!selectedType) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="bg-dark-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Novo Produto — Passo 1: Tipo</h2>
          <button onClick={handleClose}><X size={24} /></button>
        </div>
        <div className="p-8">
          <p className="text-gray-500 mb-6 text-sm">
            Qual tipo de produto você deseja cadastrar? Cada tipo possui um wizard especializado.
          </p>
          <div className="space-y-4">
            {PRODUCT_TYPES.map(({ type, icon, label, description }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="w-full flex items-center gap-5 p-5 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
              >
                <div className="text-gray-400 group-hover:text-brand-600 transition-colors shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-dark-900 text-base">{label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Passo 2+: renderiza o wizard especializado
  if (selectedType === 'transfer') {
    return (
      <AirportTransferWizard
        editingProduct={editingProduct}
        onClose={handleClose}
        onSaved={onSaved}
      />
    );
  }

  // Tour e Ticket usam o mesmo wizard de Tour (ticket é tour simplificado)
  return (
    <TourWizard
      productType={selectedType}
      editingProduct={editingProduct}
      onClose={handleClose}
      onSaved={onSaved}
    />
  );
}
