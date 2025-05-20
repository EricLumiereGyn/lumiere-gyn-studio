import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function HistoricoGlobal() {
  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [marcaSelecionada, setMarcaSelecionada] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [mostrarLixeira, setMostrarLixeira] = useState(false);
  const navigate = useNavigate();

  const [resumo, setResumo] = useState({
    totalProjetos: 0,
    topUsuario: "-",
    topSemana: "-"
  });

  function getWeek(date) {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + days) / 7);
  }

  useEffect(() => {
    async function carregarHistoricoGlobal() {
      try {
        const response = await fetch("http://localhost:3001/historico-global");
        const json = await response.json();
        const historico = json.historico || [];

        setDados(historico.sort((a, b) => new Date(b.data) - new Date(a.data)));

        const totalProjetos = historico.length;
        const porUsuario = {};
        const porSemana = {};

        historico.forEach((item) => {
          const user = item.criadoPor || "desconhecido";
          const data = new Date(item.data);
          const semana = `W${getWeek(data)}-${data.getFullYear()}`;

          porUsuario[user] = (porUsuario[user] || 0) + 1;
          porSemana[semana] = (porSemana[semana] || 0) + 1;
        });

        const topUsuario = Object.entries(porUsuario).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
        const topSemana = Object.entries(porSemana).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

        setResumo({ totalProjetos, topUsuario, topSemana });
      } catch (error) {
        console.error("Erro ao buscar histórico global:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarHistoricoGlobal();
  }, []);

  async function enviarParaLixeira(codigo) {
    if (!window.confirm("Tem certeza que deseja enviar este item para a lixeira?")) return;
    try {
      await fetch(`http://localhost:3001/historico-global/lixeira/${codigo}`, { method: "PATCH" });
      setDados(prev => prev.map(p => p.codigo === codigo ? { ...p, excluido: true } : p));
    } catch (err) {
      alert("Erro ao enviar para a lixeira.");
    }
  }

  async function restaurarItem(codigo) {
    try {
      await fetch(`http://localhost:3001/historico-global/restaurar/${codigo}`, { method: "PATCH" });
      setDados(prev => prev.map(p => p.codigo === codigo ? { ...p, excluido: false } : p));
    } catch (err) {
      alert("Erro ao restaurar item.");
    }
  }

  async function excluirPermanentemente(codigo) {
    if (!window.confirm("Apagar permanentemente? Esta ação não pode ser desfeita.")) return;
    try {
      await fetch(`http://localhost:3001/historico-global/${codigo}`, { method: "DELETE" });
      setDados(prev => prev.filter(p => p.codigo !== codigo));
    } catch (err) {
      alert("Erro ao apagar permanentemente.");
    }
  }

  const dadosFiltrados = useMemo(() => {
    return dados
      .filter(item => mostrarLixeira ? item.excluido : !item.excluido)
      .filter((item) =>
        item.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        item.codigo?.toLowerCase().includes(filtro.toLowerCase())
      )
      .filter((item) =>
        marcaSelecionada ? item.marca === marcaSelecionada : true
      )
      .filter((item) => {
        if (!dataSelecionada) return true;
        const dataItem = new Date(item.data).toISOString().split("T")[0];
        return dataItem === dataSelecionada;
      });
  }, [dados, filtro, marcaSelecionada, dataSelecionada, mostrarLixeira]);

  if (loading) return <p className="text-center mt-10">Carregando histórico global...</p>;

  return (
    <div className="min-h-screen py-10 px-6 sm:px-10 bg-neutral-900 text-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Histórico Global de Produtos</h1>

        <div className="bg-neutral-800 border border-gray-700 rounded-xl p-4 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-300 max-w-4xl mx-auto">
          <div>
            <span className="block text-lg font-semibold text-white">📦 {resumo.totalProjetos}</span>
            <span>Total de projetos</span>
          </div>
          <div>
            <span className="block text-lg font-semibold text-white">🧑‍💻 {resumo.topUsuario}</span>
            <span>Mais ativo da semana</span>
          </div>
          <div>
            <span className="block text-lg font-semibold text-white">📆 {resumo.topSemana}</span>
            <span>Semana mais produtiva</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="text-sm text-gray-400 flex items-center gap-2 mb-2">
          <a href="/" className="hover:underline text-white">🏠 Início</a>
          <span>/</span>
          <span className="text-gray-300">🌐 {mostrarLixeira ? "Lixeira" : "Histórico Global"}</span>
        </div>

        <button
          onClick={() => window.history.back()}
          className="bg-white text-black text-sm px-5 py-1.5 rounded-xl hover:bg-gray-200 transition"
        >
          ← Voltar
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 mx-auto justify-center max-w-5xl">
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded bg-neutral-800 text-white border border-neutral-700 placeholder-gray-400"
        />

        <select
          value={marcaSelecionada}
          onChange={(e) => setMarcaSelecionada(e.target.value)}
          className="p-2 rounded bg-neutral-800 text-white border border-neutral-700"
        >
          <option value="">Todas as marcas</option>
          {[...new Set(dados.map(item => item.marca))].map((marca, idx) => (
            <option key={idx} value={marca}>{marca}</option>
          ))}
        </select>

        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          className="p-2 rounded bg-neutral-800 text-white border border-neutral-700"
        />

        <button
          onClick={() => setMostrarLixeira(!mostrarLixeira)}
          className="px-4 py-2 bg-yellow-600 text-sm text-white rounded hover:bg-yellow-500"
        >
          {mostrarLixeira ? "Voltar ao Histórico" : "Ver Lixeira"}
        </button>

        <button
          onClick={() => {
            setFiltro("");
            setMarcaSelecionada("");
            setDataSelecionada("");
          }}
          className="text-sm text-yellow-400 hover:underline"
        >
          Limpar filtros
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4 text-center">
        Exibindo {dadosFiltrados.length} de {dados.length} produto{dados.length !== 1 ? "s" : ""}
      </p>

      {dadosFiltrados.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        dadosFiltrados.map((item, index) => {
          const edicoes = item.historicoAlteracoes?.filter(a => a.acao === "edição") || [];

          return (
            <div
              key={index}
              className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 p-5 rounded-xl shadow-md mb-6 space-y-3"
            >
              <div className="flex items-center justify-between mb-4 text-white">
                <h2 className="text-xl font-bold">
                  {item.nome || "Produto sem nome"} <span className="text-sm text-gray-400">{item.codigo}</span>
                </h2>
                {mostrarLixeira ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => restaurarItem(item.codigo)}
                      className="text-blue-400 hover:underline text-sm"
                    >🔄 Restaurar</button>
                    <button
                      onClick={() => excluirPermanentemente(item.codigo)}
                      className="text-red-500 hover:underline text-sm"
                    >❌ Apagar de vez</button>
                  </div>
                ) : (
                  <button
                    onClick={() => enviarParaLixeira(item.codigo)}
                    className="text-red-400 hover:underline text-sm"
                  >🗑️ Enviar para Lixeira</button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {item.imagemCapaBase64 && (
                  <img
                    src={item.imagemCapaBase64}
                    alt={`Capa ${item.nome}`}
                    className="w-full max-w-xs rounded-xl border border-neutral-700 shadow"
                  />
                )}
                <ul className="flex-1 space-y-1 text-sm text-white">
                  <li><strong>Marca:</strong> {item.marca || "--"}</li>
                  <li><strong>Tipo:</strong> {item.type || "--"}</li>
                  <li><strong>Materiais:</strong> {item.materials || "--"}</li>
                  <li><strong>Dimensões:</strong> {item.dimensions || "--"}</li>
                  <li><strong>Fonte de Luz:</strong> {item.lightSource || "--"}</li>
                </ul>
              </div>

              {item.descricao && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-400 hover:underline">Ver descrição</summary>
                  <pre className="bg-neutral-700 p-4 mt-2 rounded text-sm whitespace-pre-wrap text-white">
                    {item.descricao}
                  </pre>
                </details>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
