import { Icon, type IconName } from "./Icon";

interface SidebarProps {
  onNavigate: (label: string) => void;
  currentPath?: string;
}

const navigationItems: { label: string; icon: IconName }[] = [
  { label: "Inicio", icon: "home" },
  { label: "Proveedores", icon: "users" },
  { label: "Enviar comunicación", icon: "send" },
  { label: "Plantillas", icon: "file" },
  { label: "Seguimiento", icon: "activity" },
];

export function Sidebar({ onNavigate, currentPath = "/" }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#inicio"
        aria-label="HACEB FUTURE, ir al inicio"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("Inicio");
        }}
      >
        <span className="brand-wordmark">
          <span className="brand-name">HACEB</span>
          <span className="brand-edition">FUTURE</span>
        </span>
      </a>

      <div className="sidebar-caption">CENTRO DE PROVEEDORES</div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {navigationItems.map((item) => {
          const isActive =
            (item.label === "Inicio" && currentPath === "/") ||
            (item.label === "Proveedores" && currentPath.startsWith("/proveedores")) ||
            (item.label === "Enviar comunicación" && currentPath.startsWith("/comunicaciones")) ||
            (item.label === "Plantillas" && currentPath.startsWith("/plantillas")) ||
            (item.label === "Seguimiento" && currentPath.startsWith("/seguimiento"));
          return (
            <button
              className={`nav-item${isActive ? " is-active" : ""}`}
              type="button"
              key={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(item.label)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Enviar comunicación" && (
                <span className="nav-shortcut" aria-hidden="true">
                  ↗
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-separator" />

      <button
        className="nav-item settings-link"
        type="button"
        onClick={() => onNavigate("Configuración")}
      >
        <Icon name="settings" size={19} />
        <span>Configuración</span>
        <span className="provisional-tag">PRONTO</span>
      </button>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span className="status-light" />
          <span>Entorno de demostración</span>
        </div>
        <div className="sidebar-bottom-line">
          <span>HACEB FUTURE</span>
          <span>v0.1</span>
        </div>
      </div>
    </aside>
  );
}
