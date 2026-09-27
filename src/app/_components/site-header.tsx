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
          <summary className="cursor-pointer list-none rounded-full border border-gold-500/50 px-4 py-1.5 text-sm font-medium text-gold-300 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Fechar</span>
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
