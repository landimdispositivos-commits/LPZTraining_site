import Link from "next/link";

// Links de seção da landing usam "/#..." para funcionar também a partir das
// páginas internas.
const linksSecoes = [
  { href: "/#cronograma", label: "Cronograma" },
  { href: "/#professores", label: "Professores" },
  { href: "/#ingressos", label: "Ingressos" },
];

const linksAreas = [
  { href: "/congressistas", label: "Congressistas" },
  { href: "/profissionais", label: "Profissionais" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/administradores", label: "Administradores" },
];

const classeLink = "text-mist/80 hover:text-gold-300";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-petrol-950/85 backdrop-blur">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"
      >
        <Link href="/" className="font-display text-sm tracking-[0.25em] text-gold-metal">
          LPZ TRAINING
        </Link>

        <ul className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {linksSecoes.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={classeLink}>{link.label}</Link>
            </li>
          ))}
          <li aria-hidden="true" className="h-4 w-px bg-white/20" />
          {linksAreas.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={classeLink}>{link.label}</Link>
            </li>
          ))}
        </ul>

        {/* Menu mobile sem JavaScript: <details> abre/fecha nativamente. */}
        <details className="group relative lg:hidden">
          {/* Ícone hambúrguer; vira "X" quando aberto. Área de toque de 44px. */}
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg text-gold-300 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300 [&::-webkit-details-marker]:hidden">
            <span className="sr-only group-open:hidden">Abrir menu</span>
            <span className="sr-only hidden group-open:inline">Fechar menu</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden h-6 w-6 group-open:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-3 w-56 rounded-lg border border-white/10 bg-petrol-950 p-2 shadow-xl">
            <ul className="text-sm font-medium">
              {linksSecoes.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`block rounded px-3 py-2.5 hover:bg-petrol-800 ${classeLink}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <hr className="my-2 border-white/10" />
            <ul className="text-sm font-medium">
              {linksAreas.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`block rounded px-3 py-2.5 hover:bg-petrol-800 ${classeLink}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </nav>
    </header>
  );
}
