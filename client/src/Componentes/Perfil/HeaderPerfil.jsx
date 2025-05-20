import React, { useState } from "react";
import { UserCircle2 } from "lucide-react";

export default function HeaderPerfil({ user: initialUser }) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(initialUser?.name || "Usuário");
  const [user, setUser] = useState(initialUser);

  const handleSave = () => {
    const updatedUser = { ...user, name: nameInput };
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    window.location.reload(); // Atualiza o nome em outras partes (como menu superior)
  };

  return (
    <div className="flex items-center justify-between bg-neutral-800 p-4 rounded-xl shadow">
      <div className="flex items-center gap-4">
        <UserCircle2 size={48} />
        <div>
          {editing ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="p-2 rounded bg-neutral-900 border border-gray-700 text-white"
            />
          ) : (
            <h2 className="text-xl font-semibold">
              {user?.name || user?.displayName || "Usuário"}
            </h2>
          )}
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </div>

      {editing ? (
        <button
          onClick={handleSave}
          className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Salvar
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Editar Perfil
        </button>
      )}
    </div>
  );
}
