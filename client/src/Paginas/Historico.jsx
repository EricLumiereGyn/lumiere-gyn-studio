import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Historico() {
  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [marcaSelecionada, setMarcaSelecionada] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const navigate = useNavigate();
  const email = JSON.parse(localStorage.getItem("authUser"))?.email;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  useEffect(() => {
    async function carregarHistorico() {
      try {
        const response = await fetch(`http://localhost:3001/historico/${email}`);
        const json = await response.json();
        setDados((json.historico || []).reverse());
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarHistorico();
  }, [email]);

  const dadosFiltrados = useMemo(() => {
    return dados
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
  }, [dados, filtro, marcaSelecionada, dataSelecionada]);

  if (loading) return <p className="text-center mt-10">Carregando histórico...</p>;

  async function handleSalvarEdicao() {
    try {
      const response = await fetch(`http://localhost:3001/produto/${produtoEditando.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...produtoEditando, user: email })
      });
  
      if (!response.ok) throw new Error("Erro ao salvar");
  
      const novoHistorico = [...dados];
      const idx = novoHistorico.findIndex(p => p.codigo === produtoEditando.codigo);
      if (idx !== -1) {
        novoHistorico[idx] = produtoEditando;
        setDados(novoHistorico);
      }
  
      setIsEditModalOpen(false);
      setProdutoEditando(null);
    } catch (error) {
      console.error("Falha ao editar produto:", error);
    }
  }

  return (
    <div className="min-h-screen py-10 px-6 sm:px-10 bg-neutral-900 text-white">

<h1 className="text-3xl font-bold text-center mb-6">Histórico de Produtos</h1>

      <div className="flex flex-col items-center justify-center mb-6">
  <div className="text-sm text-gray-400 flex items-center gap-2 mb-2">
    <a href="/" className="hover:underline text-white">🏠 Início</a>
    <span>/</span>
    <a href="/perfil" className="hover:underline text-white">👤 Perfil</a>
    <span>/</span>
    <span className="text-gray-300">📦 Histórico</span>
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

        <div className="flex items-center gap-2 text-white">
          <select
            id="marcaSelect"
            value={marcaSelecionada}
            onChange={(e) => setMarcaSelecionada(e.target.value)}
            className="p-2 rounded bg-neutral-800 text-white border border-neutral-700"
          >
            <option value="">Todas as marcas</option>
            {[...new Set(dados.map(item => item.marca))].map((marca, idx) => (
              <option key={idx} value={marca}>{marca}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-white">
          <input
            id="dataSelect"
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="p-2 rounded bg-neutral-800 text-white border border-neutral-700"
          />
        </div>

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
                  {item.nome || "Produto sem nome"}{" "}
                  <span className="text-sm text-gray-400">{item.codigo}</span>
                </h2>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm text-gray-400">
                  <button
                    onClick={() => {
                      setProdutoEditando(item);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-sm text-orange-400 hover:text-blue-500 hover:underline transition"
                    title="Editar este produto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8-3-3-8 8v3z" />
                    </svg>
                    Editar
                  </button>

                  <div className="text-right">
                    <div>
                      Criado em: {new Date(item.data).toLocaleString()}<br />
                      Por: <span className="text-blue-400">{item.criadoPor || "Desconhecido"}</span>
                    </div>
                    <div>
                      Última edição:{" "}
                      {edicoes.length > 0
                        ? `${new Date(edicoes.at(-1).em).toLocaleString()} por ${edicoes.at(-1).por}`
                        : "Sem edições"}
                    </div>
                  </div>
                </div>
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
              {!item.enviadoParaTiny && (
                <button
  onClick={async () => {
    try {
      const response = await fetch(`http://localhost:3001/produto/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enviadoParaTiny: true,
          user: email,
        }),
      });

      if (response.ok) {
        const novos = dados.map((p) =>
          p.codigo === item.codigo ? { ...p, enviadoParaTiny: true } : p
        );
        setDados(novos);
      }
    } catch (e) {
      console.error("Erro ao marcar como enviado:", e);
    }
  }}
  className="mt-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
>
  Marcar como enviado para a Tiny
</button>

)}

{item.enviadoParaTiny && (
  <p className="text-green-400 text-sm mt-2 font-medium">✅ Já enviado para a Tiny</p>
)}
            </div>
          );
        })
      )}

      {isEditModalOpen && produtoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-xl max-w-xl w-full text-white shadow-xl space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Editar Produto</h2>
            {["nome", "type", "materials", "dimensions", "lightSource", "marca"].map((campo) => (
              <div key={campo}>
                <label className="block text-sm capitalize mb-1">{campo}:</label>
                <input
                  type="text"
                  value={produtoEditando[campo] || ""}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, [campo]: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                />
              </div>
            ))}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
