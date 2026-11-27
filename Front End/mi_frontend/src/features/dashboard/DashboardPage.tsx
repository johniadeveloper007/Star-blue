import { Icon } from "../../components/Icon";
import { demoCommunications, demoMetrics, demoWeeklyActivity } from "./dashboardData";

interface DashboardPageProps {
  searchTerm: string;
  onAction: (label: string) => void;
}

const quickActions = [
  {
    label: "Consultar proveedores",
    description: "Encuentra información en un solo lugar",
    icon: "users" as const,
  },
  {
    label: "Gestionar plantillas",
    description: "Prepara mensajes con una estructura clara",
    icon: "file" as const,
  },
  {
    label: "Ver seguimiento",
    description: "Consulta el estado de tus comunicaciones",
    icon: "activity" as const,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function formatToday() {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function DashboardPage({ searchTerm, onAction }: DashboardPageProps) {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es");
  const visibleCommunications = demoCommunications.filter((communication) =>
    `${communication.supplier} ${communication.subject}`
      .toLocaleLowerCase("es")
      .includes(normalizedSearch),
  );

  return (
    <main className="dashboard-page" id="inicio">
      <section className="welcome-row" aria-labelledby="welcome-title">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-mark" />
            ESPACIO DE TRABAJO
          </p>
          <h1 id="welcome-title">{getGreeting()}, equipo.</h1>
          <p className="welcome-copy">
            Un lugar más simple para fortalecer cada relación con proveedores.
          </p>
        </div>
        <div className="today-label">
          <span className="today-dot" />
          <time>{formatToday()}</time>
        </div>
      </section>

      <section className="hero-panel" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Icon name="sparkles" size={15} />
            HACEB FUTURE <span className="hero-kicker-divider">/</span> CONEXIONES QUE AVANZAN
          </span>
          <h2 id="hero-title">
            Comunicación fluida.
            <br />
            Relaciones que avanzan.
          </h2>
          <p>
            Coordina conversaciones con proveedores desde un espacio pensado
            para trabajar mejor, juntos.
          </p>
          <div className="hero-actions">
            <button
              className="button-primary"
              type="button"
              onClick={() => onAction("Enviar comunicación")}
            >
              <Icon name="send" size={17} />
              Enviar comunicación
              <Icon name="arrow-up-right" size={16} className="button-arrow" />
            </button>
            <button
              className="button-quiet"
              type="button"
              onClick={() => onAction("Consultar proveedores")}
            >
              Explorar proveedores
              <Icon name="arrow-up-right" size={15} />
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-product-label">
            <span className="product-label-dot" />
            TECNOLOGÍA PARA EL HOGAR
          </div>
          <svg
            className="appliance-illustration"
            viewBox="0 0 420 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fridge-face" x1="140" y1="45" x2="260" y2="255">
                <stop stopColor="#F4F7F1" />
                <stop offset="1" stopColor="#C7D3CC" />
              </linearGradient>
              <linearGradient id="washer-face" x1="275" y1="112" x2="365" y2="246">
                <stop stopColor="#E4ECE6" />
                <stop offset="1" stopColor="#AEBEB5" />
              </linearGradient>
              <radialGradient id="product-glow" cx="0" cy="0" r="1" gradientTransform="matrix(0 136 -178 0 251 151)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#B6F34B" stopOpacity=".25" />
                <stop offset="1" stopColor="#B6F34B" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="248" cy="160" rx="178" ry="136" fill="url(#product-glow)" />
            <path
              d="M89 253h272"
              stroke="#D5F5A0"
              strokeOpacity=".35"
              strokeWidth="1.5"
            />
            <path
              d="M141 55a10 10 0 0 1 10-10h99a10 10 0 0 1 10 10v190H141V55Z"
              fill="url(#fridge-face)"
              stroke="#F5FAF3"
              strokeWidth="2"
            />
            <path d="M141 145h119" stroke="#A3B4AA" strokeWidth="1.5" />
            <path d="M244 83v43" stroke="#789087" strokeWidth="3" strokeLinecap="round" />
            <path d="M244 166v52" stroke="#789087" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M279 119a9 9 0 0 1 9-9h72a9 9 0 0 1 9 9v126H279V119Z"
              fill="url(#washer-face)"
              stroke="#EEF4EF"
              strokeWidth="2"
            />
            <path d="M288 135h72" stroke="#93A69C" strokeWidth="1.5" />
            <circle cx="324" cy="190" r="34" fill="#243831" stroke="#81968A" strokeWidth="3" />
            <circle cx="324" cy="190" r="24" fill="#819D8E" fillOpacity=".42" />
            <path d="M309 192c8-13 22-13 30 0" stroke="#D4E1D8" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round" />
            <circle cx="346" cy="127" r="3" fill="#80958B" />
            <path d="M151 251h98M289 251h82" stroke="#A7B9AE" strokeWidth="2" strokeLinecap="round" />
            <path d="M159 254v5m74-5v5m54-5v5m70-5v5" stroke="#D7E4DA" strokeWidth="2" strokeLinecap="round" />
            <circle cx="117" cy="92" r="2" fill="#C5F279" />
            <circle cx="385" cy="91" r="2" fill="#C5F279" />
            <path d="M103 187h17m-8.5-8.5v17" stroke="#C5F279" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M379 212h15m-7.5-7.5v15" stroke="#C5F279" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="hero-art-caption">
            <span className="art-caption-icon">
              <Icon name="sparkles" size={15} />
            </span>
            <span>
              <strong>Diseñado para conectar</strong>
              <small>Personas · ideas · hogar</small>
            </span>
          </div>
        </div>
      </section>

      <div className="demo-notice" role="note">
        <span className="demo-notice-icon">
          <Icon name="sparkles" size={15} />
        </span>
        <span>
          <strong>Modo demostración</strong>
          <span className="demo-notice-divider">·</span>
          Cifras y comunicaciones de ejemplo; no representan actividad real ni se ha enviado ningún correo.
        </span>
        <span className="demo-label">DEMO</span>
      </div>

      <section className="metrics-section" aria-label="Indicadores de demostración">
        <div className="section-heading">
          <div>
            <p className="section-overline">UNA MIRADA RÁPIDA</p>
            <h2>Tu espacio, en contexto</h2>
          </div>
          <span className="data-tag">DATOS DEMO</span>
        </div>
        <div className="metrics-grid">
          {demoMetrics.map((metric, index) => (
            <article
              className={`metric-card metric-${metric.style}`}
              key={metric.label}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="metric-card-top">
                <span className="metric-icon">
                  <Icon name={metric.icon} size={18} />
                </span>
                <span className="metric-demo">DEMO</span>
              </div>
              <p className="metric-value">{metric.value}</p>
              <h3>{metric.label}</h3>
              <p className="metric-detail">{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="quick-section" aria-labelledby="quick-title">
        <div className="section-heading quick-heading">
          <div>
            <p className="section-overline">A UN PASO</p>
            <h2 id="quick-title">Accesos rápidos</h2>
          </div>
          <span className="section-note">Elige por dónde empezar</span>
        </div>
        <div className="quick-grid">
          {quickActions.map((action) => (
            <button
              className="quick-card"
              type="button"
              key={action.label}
              onClick={() => onAction(action.label)}
            >
              <span className="quick-icon">
                <Icon name={action.icon} size={20} />
              </span>
              <span className="quick-card-copy">
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
              <Icon name="arrow-up-right" size={17} className="quick-arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="lower-grid" aria-label="Actividad reciente de demostración">
        <div className="activity-panel">
          <div className="panel-heading">
            <div>
              <p className="section-overline">LO MÁS RECIENTE</p>
              <h2>Actividad de comunicaciones</h2>
            </div>
            <span className="data-tag">DEMO</span>
          </div>
          <div className="activity-table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th scope="col">PROVEEDOR</th>
                  <th scope="col">ASUNTO</th>
                  <th scope="col">FECHA</th>
                  <th scope="col">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {visibleCommunications.map((communication) => (
                  <tr key={communication.id}>
                    <td>
                      <span className="supplier-initial" aria-hidden="true">
                        {communication.supplier.slice(0, 1)}
                      </span>
                      <span className="supplier-name">{communication.supplier}</span>
                    </td>
                    <td className="subject-cell">{communication.subject}</td>
                    <td className="date-cell">{communication.date}</td>
                    <td>
                      <span className={`activity-status status-${communication.status}`}>
                        <span className="status-dot" />
                        {communication.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
                {visibleCommunications.length === 0 && (
                  <tr>
                    <td className="empty-search" colSpan={4}>
                      No hay coincidencias en los ejemplos de demostración.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="activity-footer">
            <span>
              <span className="footer-demo-dot" />
              Datos ficticios para vista previa
            </span>
            <button
              className="text-button"
              type="button"
              onClick={() => onAction("Seguimiento")}
            >
              Ver seguimiento
              <Icon name="arrow-up-right" size={15} />
            </button>
          </div>
        </div>

        <aside className="pulse-panel">
          <div className="pulse-panel-heading">
            <div>
              <p className="section-overline">RITMO DE LA SEMANA</p>
              <h2>Conversaciones</h2>
            </div>
            <span className="pulse-icon">
              <Icon name="activity" size={18} />
            </span>
          </div>
          <div className="chart-summary">
            <span className="chart-number">07</span>
            <span className="chart-caption">
              <span className="chart-up">
                <Icon name="arrow-up-right" size={13} />
                DEMO
              </span>
              <small>actividad ilustrativa</small>
            </span>
          </div>
          <div className="mini-chart" role="img" aria-label="Gráfico ilustrativo de actividad semanal, datos de demostración">
            {demoWeeklyActivity.map((item, index) => (
              <div className="chart-column" key={item.day}>
                <div className="chart-track">
                  <span
                    className={`chart-bar${index === 3 ? " chart-bar-highlight" : ""}`}
                    style={{ height: `${item.height}%` }}
                  />
                </div>
                <span className="chart-day">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="pulse-panel-foot">
            <span>Vista de ejemplo</span>
            <span className="pulse-foot-line" />
            <span>Últimos 7 días</span>
          </div>
          <div className="pulse-decoration" aria-hidden="true" />
        </aside>
      </section>

      <footer className="dashboard-footer">
        <span>HACEB FUTURE <span className="footer-separator">·</span> Un espacio para conectar mejor</span>
        <span className="footer-demo">ENTORNO DE DEMOSTRACIÓN</span>
      </footer>
    </main>
  );
}
