import { Icon } from "./Icon";

interface TopBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNotifications: () => void;
  contextCurrent?: string;
}

export function TopBar({
  searchTerm,
  onSearchChange,
  onNotifications,
  contextCurrent = "INICIO",
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-context">
        <span>PORTAL DE PROVEEDORES</span>
        <span className="context-divider">/</span>
        <span className="context-current">{contextCurrent}</span>
      </div>

      <div className="topbar-tools">
        <label className="global-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar actividad demo..."
            aria-label="Buscar en la actividad de demostración"
          />
          <span className="search-hint" aria-hidden="true">
            DEMO
          </span>
        </label>

        <button
          className="notification-button"
          type="button"
          aria-label="Ver notificaciones de demostración"
          onClick={onNotifications}
        >
          <Icon name="bell" size={19} />
          <span className="notification-dot" aria-hidden="true" />
        </button>

        <div className="profile-chip" aria-label="Perfil de demostración">
          <span className="profile-avatar" aria-hidden="true">
            HF
          </span>
          <span className="profile-copy">
            <strong>Equipo de compras</strong>
            <small>Sesión de demostración</small>
          </span>
          <Icon name="chevron-down" size={16} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}
