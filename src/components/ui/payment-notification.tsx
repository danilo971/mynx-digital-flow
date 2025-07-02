import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentNotificationProps {
  onClose?: () => void;
}

const PaymentNotification: React.FC<PaymentNotificationProps> = ({ onClose }) => {
  const handleSaibaMais = () => {
    window.open('https://www.shopify.com/br', '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-lg relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            ⚠️ Pagamento Pendente - Cartão Inválido! Atualize seus dados de pagamento agora para evitar interrupção do serviço.
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSaibaMais}
            variant="outline"
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 border-white font-semibold"
          >
            Saiba Mais
          </Button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentNotification;

