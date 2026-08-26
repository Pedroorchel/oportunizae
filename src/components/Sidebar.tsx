import { Home, MessageSquare, Map, Settings, X, LogOut } from 'lucide-react';
import { ScreenId, User } from '../types';
const logo = 'https://www.image2url.com/r2/default/images/1781824138816-3fd9702f-4521-41d2-8411-d8fc61114350.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadCount: number;
  user?: User | null;
  onSignOut: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  unreadCount,
  user,
  onSignOut,
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        <button
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 hover:text-gray-900"
          onClick={onClose}
          aria-label="Fecar menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="sidebar-header mt-4">
          <div className="w-[75px] h-[75px] rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <img src={logo} alt="Oportuniza" className="w-full h-full object-cover object-center block" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-gray-900 text-lg">
              Oportuniza
            </span>
            <p className="text-[10px] text-gray-400 font-medium">Carreira & Vagas</p>
          </div>
        </div>

        <nav className="sidebar-nav mt-6 flex flex-col gap-1">
          <button
            onClick={() => {
              onNavigate('home');
              onClose();
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
              currentScreen === 'home'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              onNavigate('messages');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
              currentScreen === 'messages'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <MessageSquare className="w-4 h-4" />
              <span>Mensagens</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white font-bold text-[9px] rounded-full px-2 py-0.5 min-w-5 text-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onNavigate('map');
              onClose();
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
              currentScreen === 'map'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Mapa</span>
          </button>


          <button
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
              currentScreen === 'settings'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
          
          {user && (
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm text-left text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </nav>

        <div className="text-center text-[10px] text-gray-400 font-mono font-medium mt-auto pt-4 pb-4">
          Oportuniza | Versão 1.5.0
        </div>
      </div>
    </>
  );
}
