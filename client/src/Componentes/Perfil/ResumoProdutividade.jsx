import React from "react";
import {
  CheckCircle,
  Clock,
  PackageCheck,
  Activity,
} from "lucide-react"; // ícones do Lucide

export default function ResumoProdutividade({ resumo }) {
  const cards = [
    {
      label: "Projetos feitos",
      valor: resumo.totalProjetos,
      icon: <PackageCheck className="w-6 h-6 text-indigo-400" />,
    },
    {
      label: "Enviados para a Tiny",
      valor: resumo.enviadosParaTiny,
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
    },
    {
      label: "Pendentes",
      valor: resumo.pendentes,
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
    },
    {
      label: "Última Atividade",
      valor: resumo.ultimaAtividade,
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 p-4 rounded-xl shadow-md text-center hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="flex items-center justify-center mb-2">{card.icon}</div>
          <p className="text-gray-400 text-sm">{card.label}</p>
          <p className="text-xl font-bold text-white">{card.valor}</p>
        </div>
      ))}
    </div>
  );
}
