import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  {/* Botão para ir ao histórico global */}
<button
  onClick={() => navigate("/historico-global")}
  className="bg-[#D3A265] hover:bg-[#b88b52] text-white font-medium px-6 py-2 rounded-xl ml-4"
>
  Ver Histórico Global
</button>

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Bem-vindo ao Gerador de Projeto</h1>
      <button onClick={() => navigate("/produto")}>
        Começar Projeto
      </button>
    </div>
  );
}
