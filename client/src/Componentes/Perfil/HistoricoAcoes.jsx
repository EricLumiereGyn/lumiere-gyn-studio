import React, { useState } from "react";
import { History } from "lucide-react";

export default function HistoricoAcoes({ projects }) {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const projetosExibidos = mostrarTodos ? projects : projects.slice(0, 3);

  const getIconeStatus = (status) => {
    switch (status) {
      case "aprovado": return "✅";
      case "comentado": return "💬";
      case "enviado": return "📦";
      case "pendente": return "🕓";
      default: return "📁";
    }
  };

  return (
    <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={20} className="text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">
            {mostrarTodos ? "Todos os Projetos" : "Últimas ações"}
          </h2>
        </div>
        {projects.length > 3 && (
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="text-blue-400 text-sm hover:underline"
          >
            {mostrarTodos ? "Ver menos" : "Ver todos"}
          </button>
        )}
      </div>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
        {projetosExibidos.map((p, i) => (
          <li key={i}>
            {getIconeStatus(p.status)} {p.marca ? `${p.marca}` : "Projeto"}{" "}
            <span className="text-gray-400">"{p.codigo || p.nome}"</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
