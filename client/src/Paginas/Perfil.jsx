import React, { useEffect, useState } from "react";
import HeaderPerfil from "../Componentes/Perfil/HeaderPerfil";
import ResumoProdutividade from "../Componentes/Perfil/ResumoProdutividade";
import HistoricoAcoes from "../Componentes/Perfil/HistoricoAcoes";
import Medalhas from "../Componentes/Perfil/Medalhas";
import GraficoPerformance from "../Componentes/Perfil/GraficoPerformance";
import { calcularResumo, calcularConquistas } from "../Componentes/Perfil/utils/calculosPerfil";
import GraficoAnalytics from "../Componentes/Perfil/GraficoAnalytics";

export default function Perfil() {
  const user = JSON.parse(localStorage.getItem("authUser"));
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/historico/${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.historico) {
          const ordenado = [...data.historico].sort((a, b) => new Date(b.data) - new Date(a.data));
          setProjects(ordenado);
        } else {
          setProjects([]);
        }
      })
      .catch(() => setProjects([]));
  }, []);  


  const resumo = calcularResumo(projects);
  const conquistas = calcularConquistas(projects);

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
  
        {/* Botão de Voltar */}
        <div className="flex flex-col items-center justify-center mb-6">
  <div className="text-sm text-gray-400 flex items-center gap-2 mb-2">
    <a href="/" className="hover:underline text-white">🏠 Início</a>
    <span>/</span>
    <span className="text-gray-300">👤 Perfil</span>
  </div>

  <button
    onClick={() => window.history.back()}
    className="bg-white text-black text-sm px-5 py-1.5 rounded-xl hover:bg-gray-200 transition"
  >
    ← Voltar
  </button>
</div>

  
        {/* Cabeçalho com dados */}
        <HeaderPerfil user={user} />
  
        {/* Painel de Resumo */}
        <section className="bg-neutral-800 border border-neutral-700 p-5 rounded-xl shadow-md">
  <h2 className="text-xl font-semibold text-white mb-4">Resumo de Produtividade</h2>
  <ResumoProdutividade resumo={resumo} />
</section>

<section className="bg-neutral-800 border border-neutral-700 p-5 rounded-xl shadow-md">
  <h2 className="text-xl font-semibold text-white mb-4">Performance Semanal</h2>
  <GraficoPerformance projects={projects} />
  <GraficoAnalytics projects={projects} />
</section>

<section className="bg-neutral-800 border border-neutral-700 p-5 rounded-xl shadow-md">
  <h2 className="text-xl font-semibold text-white mb-4">Últimas Ações</h2>
  <HistoricoAcoes projects={projects} />
</section>

<section className="bg-neutral-800 border border-neutral-700 p-5 rounded-xl shadow-md">
  <h2 className="text-xl font-semibold text-white mb-4">Conquistas</h2>
  <Medalhas conquistas={conquistas} />
</section>
      </div>
    </div>
  );
}  
