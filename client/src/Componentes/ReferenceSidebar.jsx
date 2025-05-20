import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ReferenceSidebar({ src }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!src) return null;

  return (
    <>
      {/* Painel lateral fixo */}
      <div className="fixed top-24 right-4 z-40">
        <div className={`transition-all duration-300 ease-in-out ${collapsed ? "w-10" : "w-44"} bg-neutral-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden`}>
          <div className="flex justify-between items-center px-2 py-1 border-b border-gray-800">
            {!collapsed && <span className="text-xs text-gray-400">Imagem de Referência</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-white p-1"
            >
              {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
          {!collapsed && (
            <div className="p-2">
              <img
                src={src}
                alt="Imagem original"
                className="w-full h-auto object-contain rounded-md cursor-pointer"
                onClick={() => setShowModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal fullscreen */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={src}
              alt="Imagem ampliada"
              className="max-w-3xl max-h-[90vh] rounded-xl shadow-lg"
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
