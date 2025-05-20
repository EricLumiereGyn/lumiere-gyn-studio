import { useState } from "react";

export function DescriptionForm() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    materials: "",
    dimensions: "",
    lightSource: "",
    brand: ""
  });

  const [description, setDescription] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setDescription(data.description || "Erro ao gerar descrição.");
    } catch (error) {
      console.error("Erro ao conectar:", error);
      setDescription("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Gerador de Descrição de Produto</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="text" name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input type="text" name="type" placeholder="Tipo" value={form.type} onChange={handleChange} required />
        <input type="text" name="materials" placeholder="Materiais" value={form.materials} onChange={handleChange} required />
        <input type="text" name="dimensions" placeholder="Dimensões" value={form.dimensions} onChange={handleChange} required />
        <input type="text" name="lightSource" placeholder="Fonte de luz" value={form.lightSource} onChange={handleChange} required />
        <input type="text" name="brand" placeholder="Marca" value={form.brand} onChange={handleChange} required />
        <button type="submit" style={{ padding: "10px", fontWeight: "bold" }}>Gerar Descrição</button>
      </form>

      {description && (
        <div style={{ marginTop: 30 }}>
          <h2>Descrição Gerada:</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}
