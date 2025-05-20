import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Projeto from "./Paginas/Projeto";
import Login from "./Paginas/Login";
import PrivateRoute from "./Componentes/PrivateRoute";
import Historico from "./Paginas/Historico";
import HistoricoGlobal from "./Paginas/HistoricoGlobal";
import Perfil from "./Paginas/Perfil";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/historico-global" element={<HistoricoGlobal />} />
        <Route
  path="/perfil"
  element={
    <PrivateRoute>
      <Perfil />
    </PrivateRoute>
  }
/>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Projeto />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
