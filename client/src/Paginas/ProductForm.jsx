import React, { useState } from "react";

export default function ProductForm() {
  const [arquivo, setArquivo] = useState(null);

  const handleUpload = async () => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    const formData = new FormData();

    formData.append("file", arquivo); // exemplo para 1 arquivo apenas
    formData.append("user", authUser?.email || "anônimo");
    formData.append("marca", "exemploMarca"); // substitua pelo valor real
    formData.append("codigo", "12345");        // substitua pelo valor real

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const resultado = await res.json();
      console.log("Upload realizado com sucesso:", resultado);
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Cadastro do Produto</h2>

      <input
        type="file"
        onChange={(e) => setArquivo(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar Produto
      </button>
    </div>
  );
}
