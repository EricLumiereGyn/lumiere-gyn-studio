import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { Menu } from "@headlessui/react";
import { ChevronDown, LogOut, User, User2 } from "lucide-react";


export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("authUser"));

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="w-full bg-neutral-900 border-b border-neutral-700 px-6 py-2 flex items-center justify-between shadow-sm relative z-50 overflow-visible">
      {/* Avatar com Menu */}
      <Menu as="div" className="relative inline-block text-left text-white">
        <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
          <span className="text-sm">{user?.displayName?.split(" ")[0]}</span>
          <ChevronDown size={16} />
        </Menu.Button>

        <Menu.Items className="absolute mt-2 left-0 w-72 origin-top-left rounded-2xl bg-neutral-900 text-white shadow-xl border border-neutral-700 focus:outline-none z-50 overflow-hidden transition-all duration-200">
  {/* Cabeçalho com avatar + info */}
  <div className="px-5 py-4 border-b border-neutral-700 flex items-center gap-4">
    {user?.photoURL ? (
      <img
        src={user.photoURL}
        alt="avatar"
        className="h-12 w-12 rounded-full object-cover border border-gray-600"
      />
    ) : (
      <div className="h-12 w-12 rounded-full bg-neutral-700 flex items-center justify-center border border-gray-600">
        <User size={20} className="text-gray-300" />
      </div>
    )}
<div className="flex flex-col">
  <p className="text-sm font-semibold text-white leading-tight">
    {user?.name || "Usuário"}
  </p>
  <p className="text-xs text-gray-400 break-all leading-tight">
    {user?.email}
  </p>
</div>

  </div>

  {/* Ações */}
  <div className="py-2">
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={() => navigate("/perfil")}
          className={`${
            active ? "bg-neutral-800" : ""
          } w-full text-left px-5 py-2 text-sm text-gray-300 hover:text-white transition`}
        >
          <User2 size={14} className="inline mr-2" /> Perfil
        </button>
      )}
    </Menu.Item>

    <Menu.Item>
      {({ active }) => (
        <button
          onClick={handleLogout}
          className={`${
            active ? "bg-neutral-800 text-red-500" : "text-red-400"
          } w-full text-left px-5 py-2 text-sm hover:text-red-500 transition`}
        >
          <LogOut size={14} className="inline mr-2" /> Sair
        </button>
      )}
    </Menu.Item>
  </div>
</Menu.Items>
      </Menu>

      {/* Botões padrão */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/historico-global")}
          className="bg-[#D3A265] hover:bg-[#b88b52] text-white font-medium px-6 py-2 rounded-xl"
        >
          Ver Histórico Global
        </button>

        <button
          onClick={() => navigate("/historico")}
          className="bg-[#D3A265] hover:bg-[#b88b52] text-white font-medium px-6 py-2 rounded-xl"
        >
          Ver Histórico
        </button>
      </div>
    </header>
  );
}
