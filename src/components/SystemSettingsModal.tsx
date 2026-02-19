import { useState } from 'react';
import { Modal } from '@/components/ui';
import { SettingsModal } from './SettingsModal';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  ChevronRight 
} from 'lucide-react';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'account' | 'notifications' | 'security' | 'appearance' | 'language' | 'data';

export const SystemSettingsModal = ({ isOpen, onClose }: SystemSettingsModalProps) => {
  const [showAccountModal, setShowAccountModal] = useState(false);

  const settingsSections = [
    {
      id: 'account' as SettingsSection,
      title: 'Configurar Cuenta',
      description: 'Gestiona tu información personal y credenciales',
      icon: <User className="w-5 h-5" />,
      available: true,
    },
    {
      id: 'notifications' as SettingsSection,
      title: 'Notificaciones',
      description: 'Configura cómo y cuándo recibir notificaciones',
      icon: <Bell className="w-5 h-5" />,
      available: false,
    },
    {
      id: 'security' as SettingsSection,
      title: 'Seguridad',
      description: 'Configuración de seguridad y privacidad',
      icon: <Shield className="w-5 h-5" />,
      available: false,
    },
    {
      id: 'appearance' as SettingsSection,
      title: 'Apariencia',
      description: 'Personaliza el tema y la apariencia de la aplicación',
      icon: <Palette className="w-5 h-5" />,
      available: false,
    },
    {
      id: 'language' as SettingsSection,
      title: 'Idioma',
      description: 'Selecciona tu idioma preferido',
      icon: <Globe className="w-5 h-5" />,
      available: false,
    },
    {
      id: 'data' as SettingsSection,
      title: 'Datos',
      description: 'Gestiona tus datos y exportaciones',
      icon: <Database className="w-5 h-5" />,
      available: false,
    },
  ];

  const handleSectionClick = (section: SettingsSection) => {
    if (section === 'account') {
      setShowAccountModal(true);
    }
  };

  const handleAccountModalClose = () => {
    setShowAccountModal(false);
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  return (
    <>
      <Modal isOpen={isOpen && !showAccountModal} onClose={onClose} title="Configuración del Sistema" size="lg">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-6">
            Gestiona todas las configuraciones de tu cuenta y personaliza tu experiencia en la plataforma.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                disabled={!section.available}
                className={`group relative flex flex-col gap-3 p-5 rounded-xl border-2 transition-all text-left ${
                  section.available
                    ? 'border-gray-200 hover:border-mint-400 hover:bg-gradient-to-br hover:from-mint-50 hover:to-white hover:shadow-md cursor-pointer'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                    section.available
                      ? 'bg-gradient-to-br from-mint-100 to-mint-50 text-mint-600 group-hover:scale-110'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {section.icon}
                  </div>
                  {section.available && (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-mint-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  )}
                  {!section.available && (
                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                      Próximamente
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1.5 ${
                    section.available ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {section.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    section.available ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {section.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <SettingsModal isOpen={showAccountModal} onClose={handleAccountModalClose} />
    </>
  );
};

