export function calcularResumo(projects) {
  const totalProjetos = projects.length;

  const enviadosParaTiny = projects.filter(p => p.enviadoParaTiny).length;

  const pendentes = projects.filter(p => !p.enviadoParaTiny).length;

  const ultimaAtividade = (() => {
    if (!projects.length) return "nenhuma";
    const datas = projects.map((p) => new Date(p.data));
    const maisRecente = new Date(Math.max(...datas));
    const agora = new Date();
    const diffHoras = Math.floor((agora - maisRecente) / (1000 * 60 * 60));
    return diffHoras === 0 ? "agora" : `há ${diffHoras} hora(s)`;
  })();

  return {
    totalProjetos,
    enviadosParaTiny,
    pendentes,
    ultimaAtividade
  };
}
  
  export function calcularConquistas(projects) {
    const conquistas = [];
  
    if (projects.some(p => p.status === "aprovado")) {
      conquistas.push("🏅 Primeiro projeto aprovado");
    }
  
    const projetosPorSemana = {};
    projects.forEach(p => {
      if (!p.data) return;
      const data = new Date(p.data);
      const semana = `${data.getFullYear()}-W${Math.ceil(data.getDate() / 7)}`;
      projetosPorSemana[semana] = (projetosPorSemana[semana] || 0) + 1;
    });
    if (Object.values(projetosPorSemana).some(total => total >= 5)) {
      conquistas.push("🚀 Semana com 5 projetos!");
    }
  
    const ultimos5 = [...projects].slice(0, 5);
    const semErros = ultimos5.every(p => ["aprovado", "enviado"].includes(p.status));
    if (ultimos5.length === 5 && semErros) {
      conquistas.push("🔒 Sem erros nos últimos 5 projetos");
    }
  
    return conquistas;
  }
  