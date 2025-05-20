import React from "react";
import { Trophy } from "lucide-react";

export default function Medalhas({ conquistas }) {
  return (
    <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 p-6 rounded-xl shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={20} className="text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Conquistas</h2>
      </div>

      {conquistas.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
          {conquistas.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">
          Nenhuma conquista ainda. Continue produzindo!
        </p>
      )}
    </div>
  );
}
