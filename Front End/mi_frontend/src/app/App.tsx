import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { SuppliersPage } from "../features/suppliers/SuppliersPage";
import { SupplierDetailPage } from "../features/suppliers/SupplierDetailPage";
import { ComposePage } from "../features/compose/ComposePage";
import { TemplatesPage } from "../features/templates/TemplatesPage";
import { TrackingPage } from "../features/tracking/TrackingPage";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [notice, setNotice] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!notice) return;

    const timeoutId = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const handleNavigate = (label: string) => {
    const routes: Record<string, string> = {
      Inicio: "/",
      Proveedores: "/proveedores",
      "Consultar proveedores": "/proveedores",
      "Enviar comunicación": "/comunicaciones/nueva",
      Plantillas: "/plantillas",
      "Gestionar plantillas": "/plantillas",
      Seguimiento: "/seguimiento",
      Configuración: "/",
    };
    const destination = routes[label];
    if (destination && destination !== "/") {
      navigate(destination);
      return;
    }
    if (destination === "/") {
      navigate(destination);
    }
    setNotice(`${label}: el módulo está en preparación para una etapa futura.`);
  };

  const contextCurrent =
    location.pathname.startsWith("/proveedores")
      ? "PROVEEDORES"
      : location.pathname.startsWith("/comunicaciones")
        ? "COMUNICACIÓN"
        : location.pathname.startsWith("/plantillas")
          ? "PLANTILLAS"
          : location.pathname.startsWith("/seguimiento")
            ? "SEGUIMIENTO"
          : "INICIO";

  return (
    <div className="app-shell">
      <Sidebar
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
      <div className="app-main">
        <TopBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          contextCurrent={contextCurrent}
          onNotifications={() =>
            setNotice("Notificaciones de demostración; no hay actividad real conectada.")
          }
        />
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                searchTerm={searchTerm}
                onAction={handleNavigate}
              />
            }
          />
          <Route
            path="/proveedores"
            element={
              <SuppliersPage
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            }
          />
          <Route
            path="/proveedores/:supplierId"
            element={<SupplierDetailPage />}
          />
          <Route
            path="/comunicaciones/nueva"
            element={<ComposePage />}
          />
          <Route
            path="/plantillas"
            element={<TemplatesPage />}
          />
          <Route
            path="/seguimiento"
            element={<TrackingPage />}
          />
          <Route
            path="/seguimiento/:communicationId"
            element={<TrackingPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {notice && (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-indicator" aria-hidden="true" />
          <p>{notice}</p>
          <button
            className="toast-close"
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
