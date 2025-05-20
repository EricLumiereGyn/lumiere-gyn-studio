import Header from "../componentes/Header";
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Loader2,
  Image as ImageIcon,
  X,
  RefreshCw,
  Sparkles
} from "lucide-react";
import "../index.css";

export default function Projeto() {
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
    brand: "",
    code: ""
  });
  const navigate = useNavigate();
  const [uploadProgressVisible, setUploadProgressVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0)
  const promptOptions = {
    "Fundo Branco": [
      "High-resolution product photo centered on a pure white background, no shadows. Match the shape, colors and proportions exactly as the original image provided. Shot with a Canon EOS R6, 85mm lens, studio lighting setup, soft shadows disabled. Sharp focus, realistic textures, front-facing angle. No reflections, no distractions.",
      "Studio-lit white background with soft shadows. Nikon D850, ISO 100, f/4, product centered.",
      "Pure white background, even lighting. Sony Alpha A6400, realistic product scale and proportions."
    ],
    "Close-Up Detalhe": [
      "Macro shot showcasing texture, finish and small details of the product exactly as shown in the reference image. Natural shadows, subtle highlights. Captured with a Nikon D850 using a macro lens, high dynamic range, background blurred. Use lighting to emphasize depth and material without changing colors or structure.",
      "Close-up of surface material with highlights and reflections. Nikon D850, 85mm lens.",
      "Detail view, natural light, texture visible, no distortion. Sony Alpha A6400 macro lens."
    ],
    "Ambientação": [
      "Realistic interior render with the product integrated naturally in a modern, elegant setting. Maintain 100% the same appearance, size and colors of the product image. Use natural light from windows, with shadows cast realistically. Include real furniture, decor, and objects around like plants, shelves, books, or cups. Taken with Sony Alpha A6400, 35mm lens, golden hour lighting.",
      "Modern kitchen counter with decorative elements. Daylight through windows. Product in foreground.",
      "Realistic home office setting with furniture. Neutral tones, indirect lighting."
    ],
    "Desenho Técnico": [
      "Technical drawing view of the exact same product shape, proportions and structure. Include orthographic front, side and top views with clean lines, neutral background, and measurement annotations. No visual deviations from the source image. Line art style, blueprint precision.",
      "Technical drawing with labeled dimensions and proportions. Black lines on white background.",
      "Flat CAD-style rendering of the product. Same proportions as real photo."
    ]
  };

  const promptOptionLabels = {
    "Fundo Branco": [
      "Branco Iluminado (Canon EOS R6)",
      "Fundo Estúdio (Nikon D850)",
      "Fundo Branco Natural (Sony Alpha A6400)"
    ],
    "Close-Up Detalhe": [
      "Macro realista (Canon EOS M50)",
      "Textura com reflexos (Nikon D850)",
      "Detalhe Natural (Sony Alpha A6400)"
    ],
    "Ambientação": [
      "Sala escandinava natural",
      "Cozinha moderna iluminada",
      "Escritório com decoração realista"
    ],
    "Desenho Técnico": [
      "Projeção Ortográfica Completa",
      "Desenho Cotado com Proporções",
      "Render CAD com Precisão"
    ]
  };  
  
  const [stageComments, setStageComments] = useState([
    promptOptions["Fundo Branco"][0],
    promptOptions["Close-Up Detalhe"][0],
    promptOptions["Ambientação"][0],
    promptOptions["Desenho Técnico"][0],
  ]);  
 
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
    setProductData({ name: "", type: "", materials: "", dimensions: "", lightSource: "", brand: "", code: "" });
    setStageStatus(stageStatus.map(s => ({ ...s, approved: false, loading: false, image: null })));
    setImage(null);
    setOpenModal(false);
  };

  const user = JSON.parse(localStorage.getItem("authUser"));
  const userEmail = user?.email || "anonimo";

const generateImage = async (index) => {
  const updated = [...stageStatus];
  updated[index].loading = true;
  updated[index].approved = false;
  setStageStatus(updated);

  try {
    const response = await fetch(image);
    const arrayBuffer = await response.arrayBuffer();
    const file = new File([arrayBuffer], "referencia.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("image", file);
    formData.append("prompt", stageComments[index]);

    const res = await fetch("http://localhost:3001/generate-gpt4o-image", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Erro ao gerar imagem");

    const imageBlob = await res.blob();
    const imageURL = URL.createObjectURL(imageBlob);
    updated[index].image = imageURL;
    toast.success("Imagem gerada com sucesso!");
  } catch (err) {
    console.error("Erro:", err);
    toast.error("Erro ao gerar imagem.");
  }

  updated[index].loading = false;
  setStageStatus([...updated]);
};

  const approveStage = (index) => {
    const updated = [...stageStatus];
    updated[index].approved = true;
    setStageStatus(updated);
  };

  const handleSaveProject = async () => {
    try {
      const formData = new FormData();
      formData.append("marca", productData.brand);
      formData.append("codigo", productData.code);
      formData.append("user", userEmail);
      formData.append("nome", productData.name);
      formData.append("tipo", productData.type);
      formData.append("materials", productData.materials);
      formData.append("dimensions", productData.dimensions);
      formData.append("lightSource", productData.lightSource);

      const nomesCampos = ["FundoBranco", "CloseUp", "Ambientado", "DesenhoTecnico"];
      for (let i = 0; i < stageStatus.length; i++) {
        const imagemUrl = stageStatus[i]?.image;
        if (imagemUrl) {
          const blob = await fetch(imagemUrl).then(r => r.blob());
          formData.append(nomesCampos[i], blob, `${nomesCampos[i]}.png`);
        }
      }

      const descricaoBlob = new Blob([finalDescription], { type: "text/plain" });
      formData.append("DescricaoText", descricaoBlob, "descricao.txt");
      formData.append("Descricao", descricaoBlob, "descricao.txt");

      setUploadProgressVisible(true);
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:3001/upload");

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast.success("Projeto salvo com sucesso! 🚀");
          setUploadProgress(0);
          resetProject();
          setTimeout(() => setUploadProgressVisible(false), 2000);
        } else {
          alert("Erro ao salvar projeto. Verifique o servidor.");
          setUploadProgress(0);
        }
      };

      xhr.onerror = () => {
        console.error("Erro de rede no upload.");
        alert("Erro de rede ao salvar projeto.");
        setUploadProgress(0);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Erro no handleSaveProject:", error);
      alert("Erro inesperado ao salvar projeto.");
    }
  };

  const generateDescription = async () => {
    setLoadingDescription(true);
    try {
      const response = await fetch("http://localhost:3001/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const canGenerateDescription = stageStatus.every((s) => s.approved);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans flex flex-col relative z-0 overflow-visible`}>
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
  <motion.div
    className="mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    <h2 className="text-xl font-semibold text-white">
    Bem-vindo, {user?.name || "usuário"}!
    </h2>
    <p className="text-sm text-gray-400 mt-1">
      Comece seu novo projeto agora mesmo.
    </p>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.3 }}
  >
    <div className="flex items-center gap-4 mb-6">
      <img
        src="/logo-lumiere.png"
        alt="Logo Lumiere"
        className="h-14 sm:h-20"
      />
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light">
        Lumiere Gyn Studio
      </h1>
    </div>

    {!start && !loadingInterface && (
      <button
        onClick={() => setOpenModal(true)}
        className={`${theme.button} px-6 py-3 rounded-xl text-base`}
      >
        Começar Projeto
      </button>
    )}
  </motion.div>
</main>

      {/* MODAL INICIAL */}
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
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
              <button onClick={() => setOpenModal(false)} className="text-sm text-gray-400 hover:underline">Cancelar</button>
              <button onClick={handleStart} className={`${theme.button} px-5 py-2 rounded-xl`}>
                Iniciar Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA PRINCIPAL */}
      {start && (
        <section className="w-full px-4 flex flex-col items-center py-12">
          <div className="mb-6">
            <button
              onClick={() => setStart(false)}
              className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition shadow"
            >
              ← Voltar para edição
            </button>
          </div>

          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
              {stageStatus.map((stage, index) => (
                <div key={index} className={`p-6 rounded-xl border shadow-md ${theme.card}`}>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3">{stage.label}</h3>

{/* Painel lateral com imagem original */}
{image && (
  <div className="fixed top-24 right-4 z-40 w-36 sm:w-44 border border-gray-700 bg-neutral-900 rounded-xl shadow-lg p-2 flex flex-col items-center gap-2">
    <h4 className="text-xs text-gray-400">Imagem de Referência</h4>
    <img
      src={image}
      alt="Imagem original"
      className="w-full h-auto object-contain rounded-md"
    />
  </div>
)}

{stage.loading ? (
  <div className="w-full h-64 flex items-center justify-center bg-neutral-800 rounded-xl border border-gray-700">
    <Loader2 className="animate-spin text-gray-400" size={32} />
  </div>
) : stage.image ? (
  <img src={stage.image} alt="preview" className="w-full rounded-xl mb-4 border object-contain" />
) : (
  <div className="w-full h-64 bg-neutral-700 rounded-xl flex flex-col items-center justify-center text-sm text-gray-400 border border-dashed">
    <ImageIcon size={32} className="opacity-40 mb-2" />
    Aguardando geração
  </div>
)}

{/* Campo de comentário para a IA */}
<textarea
  value={stageComments[index]}
  onChange={(e) => {
    const updated = [...stageComments];
    updated[index] = e.target.value;
    setStageComments(updated);
  }}
  placeholder="Escreva um prompt ou deixe vazio para usar o padrão"
  className="w-full mt-3 p-3 rounded-xl bg-neutral-800 text-white border border-gray-600 text-sm placeholder:text-gray-400 resize-none"
/>

{/* Sugestões de prompt com select */}
<select
  value={stageComments[index]}
  onChange={(e) => {
    const updated = [...stageComments];
    updated[index] = e.target.value;
    setStageComments(updated);
  }}
  className="w-full mt-2 p-2 rounded-lg bg-neutral-800 text-white border border-gray-600 text-sm"
>
  {promptOptions[stage.label].map((option, i) => (
    <option key={i} value={option}>
    {promptOptionLabels[stage.label][i]}
    </option>
  ))}
</select>

<button
  onClick={() => {
    const updated = [...stageComments];
    updated[index] = promptOptions[stage.label][0]; // volta ao prompt 1 padrão
    setStageComments(updated);
  }}
  className="mt-2 text-sm text-blue-400 hover:underline"
>
  Restaurar padrão
</button>

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
            </div>
          </div>

          {/* Geração da descrição */}
          {canGenerateDescription && !finalDescription && (
            <div className="text-center mt-10">
              <button
                onClick={generateDescription}
                className={`${theme.button} px-6 py-3 rounded-xl text-lg inline-flex items-center gap-2`}
              >
                <Sparkles size={18} /> Gerar Descrição Final
              </button>
            </div>
          )}

          {loadingDescription && (
            <div className="text-center text-sm text-gray-400 flex items-center justify-center gap-2 mt-4">
              <Loader2 className="animate-spin" size={16} /> Gerando descrição final...
            </div>
          )}

          {finalDescription && (
            <div className={`${theme.card} p-6 rounded-xl shadow-lg mt-10 w-full max-w-4xl`}>
              <h3 className="text-xl font-semibold mb-4">Descrição Final</h3>
              <pre className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed tracking-wide sm:tracking-normal">
                {finalDescription}
              </pre>

              <div className="text-center mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleSaveProject}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl"
                >
                  Salvar Projeto
                </button>

                <button
                  onClick={resetProject}
                  className="bg-[#D3A265] hover:bg-[#b88b52] text-white font-medium px-6 py-3 rounded-xl"
                >
                  Começar novo projeto
                </button>
              </div>

              {uploadProgressVisible && (
                <div className="w-full max-w-3xl mx-auto mt-6">
                  <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-400 mt-2">{uploadProgress}% enviado</p>
                </div>
              )}
            </div>
          )}
        </section>
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
  );
}