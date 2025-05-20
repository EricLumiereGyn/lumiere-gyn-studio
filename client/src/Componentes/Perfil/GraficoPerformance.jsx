import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid
} from "recharts";

export default function GraficoPerformance({ projects }) {
  const dadosSemanais = {};

  projects.forEach(p => {
    if (p.status === "aprovado" && p.data) {
      const data = new Date(p.data);
      const semana = `${data.getFullYear()}-W${Math.ceil(data.getDate() / 7)}`;
      dadosSemanais[semana] = (dadosSemanais[semana] || 0) + 1;
    }
  });

  const dadosGrafico = Object.entries(dadosSemanais).map(([semana, total]) => ({
    semana,
    projetos: total
  }));

  return (
    <div className="bg-neutral-800 p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-white">Performance Semanal</h2>
      {dadosGrafico.length === 0 ? (
        <div className="text-center text-gray-400 p-10 border border-dashed border-neutral-600 rounded-xl bg-neutral-900">
        📉 Sem dados suficientes para gerar gráfico.
      </div>      
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="semana" stroke="#ccc" />
            <YAxis allowDecimals={false} stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="projetos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
