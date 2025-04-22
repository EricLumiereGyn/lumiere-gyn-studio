import React, { useState } from "react";
import {
  Check,
  Loader2,
  Image as ImageIcon,
  X,
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function App() {
  const [openModal, setOpenModal] = useState(false);
  const [start, setStart] = useState(false);
  const [loadingInterface, setLoadingInterface] = useState(false);
  const [image, setImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const [themeDark] = useState(true);
  const [productData, setProductData] = useState({
    name: "",
    type: "",
    materials: "",
    dimensions: "",
    lightSource: "",
    brand: ""
  });

  const [stageStatus, setStageStatus] = useState([
    { label: "Fundo Branco", approved: false, loading: false, image: null },
    { label: "Close-Up Detalhe", approved: false, loading: false, image: null },
    { label: "Ambientação", approved: false, loading: false, image: null },
    { label: "Desenho Técnico", approved: false, loading: false, image: null }
  ]);

  const [finalDescription, setFinalDescription] = useState(null);
  const [loadingDescription, setLoadingDescription] = useState(false);

  const theme = {
    bg: themeDark ? "bg-neutral-900" : "bg-white",
    text: themeDark ? "text-white" : "text-gray-900",
    card: themeDark ? "bg-neutral-800 border border-gray-700" : "bg-white border border-gray-300",
    border: themeDark ? "border-gray-700" : "border-gray-300",
    input: themeDark ? "bg-neutral-900 text-white" : "bg-white text-black",
    button: "bg-[#D3A265] text-white hover:bg-[#b88b52]",
    muted: themeDark ? "text-gray-400" : "text-gray-600"
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const removeImage = () => setImage(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStart = () => {
    const missing = Object.entries(productData)
      .filter(([_, val]) => !val.trim())
      .map(([key]) => key);

    if (missing.length > 0 || !image) {
      setMissingFields(missing);
      setErrorMessage("Preencha todos os campos e envie uma imagem.");
      return;
    }

    setMissingFields([]);
    setErrorMessage("");
    setLoadingInterface(true);

    setTimeout(() => {
      setStart(true);
      setLoadingInterface(false);
      setOpenModal(false);
    }, 800);
  };

  const resetProject = () => {
    setStart(false);
    setFinalDescription(null);
    setProductData({ name: "", type: "", materials: "", dimensions: "", lightSource: "", brand: "" });
    setStageStatus(stageStatus.map(s => ({ ...s, approved: false, loading: false, image: null })));
    setImage(null);
    setOpenModal(false);
  };

  const generateImage = (index) => {
    const updated = [...stageStatus];
    updated[index].loading = true;
    updated[index].approved = false;
    setStageStatus(updated);

    setTimeout(() => {
      updated[index].image = `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(updated[index].label)}`;
      updated[index].loading = false;
      setStageStatus([...updated]);
    }, 1000);
  };

  const approveStage = (index) => {
    const updated = [...stageStatus];
    updated[index].approved = true;
    setStageStatus(updated);
  };

  const canGenerateDescription = stageStatus.every((s) => s.approved);

  const generateDescription = async () => {
    setLoadingDescription(true);
    try {
      const response = await fetch("http://localhost:3001/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      setFinalDescription(data.description || "Erro ao gerar descrição.");
    } catch (error) {
      console.error("Erro ao chamar a API:", error);
      setFinalDescription("Erro ao gerar descrição.");
    } finally {
      setLoadingDescription(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} py-10 px-4 font-sans flex flex-col items-center justify-start`}>
      <div className="w-full max-w-6xl text-center">
        <h1 className="text-4xl font-light mb-6">Lumiere Gyn Studio</h1>
        {!start && !loadingInterface && (
          <button onClick={() => setOpenModal(true)} className={`${theme.button} px-6 py-2 rounded-xl`}>
            Começar Projeto
          </button>
        )}

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-2xl w-full max-w-xl shadow-xl ${theme.card}`}>
              <h2 className="text-2xl font-semibold mb-6 text-center">Novo Projeto</h2>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4 w-full" />
              {image && (
                <div className="relative mb-4">
                  <img
                    src={image}
                    alt="Pré-visualização"
                    onClick={() => setShowImageModal(true)}
                    className="rounded-xl border max-h-48 object-contain cursor-pointer mx-auto"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1"
                    title="Remover imagem"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.keys(productData).map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field}
                    value={productData[field]}
                    onChange={handleInputChange}
                    className={`p-3 rounded-lg border ${theme.input} ${missingFields.includes(field) ? "border-red-500" : theme.border}`}
                  />
                ))}
              </div>

              {errorMessage && <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>}
              <div className="flex justify-center gap-4">
                <button onClick={() => setOpenModal(false)} className="text-sm text-gray-400 hover:underline">
                  Cancelar
                </button>
                <button onClick={handleStart} className={`${theme.button} px-5 py-2 rounded-xl`}>
                  Iniciar Projeto
                </button>
              </div>
            </div>
          </div>
        )}

        {start && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {stageStatus.map((stage, index) => (
              <div key={index} className={`p-6 rounded-xl border shadow-md ${theme.card}`}>
                <h3 className="text-lg font-semibold mb-3">{stage.label}</h3>
                {stage.image ? (
                  <img src={stage.image} alt="preview" className="w-full rounded-xl mb-4 border object-contain" />
                ) : (
                  <div className="w-full h-64 bg-neutral-700 rounded-xl flex flex-col items-center justify-center text-sm text-gray-400 border border-dashed">
                    <ImageIcon size={32} className="opacity-40 mb-2" />
                    Aguardando geração
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => generateImage(index)}
                    className={`${theme.button} px-4 py-2 rounded-xl text-sm flex items-center gap-2`}
                  >
                    <RefreshCw size={14} /> {stage.image ? "Gerar Novamente" : "Gerar"}
                  </button>
                  {stage.image && !stage.approved && (
                    <button
                      onClick={() => approveStage(index)}
                      className="px-4 py-2 rounded-xl text-sm flex items-center gap-2 bg-green-600 text-white"
                    >
                      <Check size={14} /> Aprovar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {canGenerateDescription && !finalDescription && (
              <div className="text-center md:col-span-2 mt-4">
                <button
                  onClick={generateDescription}
                  className={`${theme.button} px-6 py-3 rounded-xl text-lg inline-flex items-center gap-2`}
                >
                  <Sparkles size={18} /> Gerar Descrição Final
                </button>
              </div>
            )}

            {loadingDescription && (
              <div className="text-center text-sm text-gray-400 flex items-center justify-center gap-2 md:col-span-2">
                <Loader2 className="animate-spin" size={16} /> Gerando descrição final...
              </div>
            )}

            {finalDescription && (
              <div className={`${theme.card} p-6 rounded-xl md:col-span-2 shadow-lg mt-6`}>
                <h3 className="text-xl font-semibold mb-4">Descrição Final</h3>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed tracking-wide">{finalDescription}</pre>
                <div className="text-center mt-6">
                  <button onClick={resetProject} className={`${theme.button} px-6 py-2 rounded-xl`}>
                    Começar novo projeto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="relative">
              <img src={image} alt="Zoom" className="max-w-3xl max-h-[90vh] rounded-xl shadow-lg" />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
