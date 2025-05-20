import React from "react";
import { getAuth, signInWithPopup, signOut } from "firebase/auth";
import { app, provider } from "../firebase";

export default function Login() {
  const auth = getAuth(app);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🛡️ Verifica domínio
      const allowedDomains = ["@lumieregyn.com.br"];
      const isAuthorized = allowedDomains.some(domain =>
        user.email.endsWith(domain)
      );

      if (!isAuthorized) {
        alert("Acesso restrito a usuários da empresa.");
        await signOut(auth);
        return;
      }

      // ✅ Usuário autorizado
 localStorage.setItem("authUser", JSON.stringify({
  name: user.displayName || "Eric Barbosa", // <---- pode até testar com fixo agora
  email: user.email,
  avatar: user.photoURL || "/avatar-default.png"
}));


      window.location.href = "/"; // Redireciona para a aplicação principal
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Falha ao fazer login.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-neutral-900 text-white">
      <h1 className="text-3xl mb-6 font-light">Acesso Restrito</h1>
      <button
        onClick={handleLogin}
        className="bg-[#D3A265] hover:bg-[#b88b52] text-white font-medium px-6 py-3 rounded-xl"
      >
        Entrar com conta Google @lumiere
      </button>
    </div>
  );
}
