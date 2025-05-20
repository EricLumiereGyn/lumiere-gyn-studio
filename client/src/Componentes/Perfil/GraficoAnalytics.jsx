import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const cores = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#d36b9a", "#a569bd"];

export default function GraficoAnalytics({ projects }) {
  if (!projects || projects.length === 0) return null;

  // Agrupar por semana
  const porSemana = {};
  const porMarca = {};

  projects.forEach(p => {
    if (!p.data) return;

    const data = new Date(p.data);
    const semana = `${data.getFullYear()}-W${Math.ceil(data.getDate() / 7)}`;

    porSemana[semana] = (porSemana[semana] || 0) + 1;

    if (p.marca) {
      porMarca[p.marca] = (porMarca[p.marca] || 0) + 1;
    }
  });

  const dadosSemana = Object.entries(porSemana).map(([semana, count]) => ({ semana, count }));
  const dadosMarca = Object.entries(porMarca).map(([marca, count]) => ({ name: marca, value: count }));

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-6">
      <div className="bg-neutral-800 p-5 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-white mb-4">📅 Produtividade por Semana</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosSemana}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" stroke="#ccc" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-neutral-800 p-5 rounded-xl shadow-md">
  <h3 className="text-lg font-semibold text-white mb-4">🏷️ Marcas Mais Frequentes</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={
          (() => {
            const sorted = [...dadosMarca].sort((a, b) => b.value - a.value);
            const topMarcas = sorted.slice(0, 8);
            const outros = sorted.slice(8);
            const totalOutros = outros.reduce((acc, curr) => acc + curr.value, 0);
            return totalOutros > 0
              ? [...topMarcas, { name: "Outros", value: totalOutros }]
              : topMarcas;
          })()
        }
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={90}
        fill="#8884d8"
        label
      >
        {dadosMarca.map((_, index) => (
          <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>
    </div>
  );
}
