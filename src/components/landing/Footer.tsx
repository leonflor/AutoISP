import { Link } from 'react-router-dom';
import { Wifi, Linkedin, Instagram, Youtube, Mail, Phone } from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Planos', href: '#plans' },
    { label: 'Integrações', href: '#features' },
    { label: 'API', href: '#features' },
  ],
  recursos: [
    { label: 'Central de Ajuda', href: '#faq' },
    { label: 'Documentação', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Casos de Sucesso', href: '#testimonials' },
  ],
  empresa: [
    { label: 'Sobre Nós', href: '#' },
    { label: 'Contato', href: '#contact' },
    { label: 'Carreiras', href: '#' },
    { label: 'Parceiros', href: '#' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
    { label: 'LGPD', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export const Footer = () => {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wifi className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoISP</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Automatize seu provedor de internet com inteligência artificial. 
              Atendimento 24/7, integração com ERPs e relatórios inteligentes.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <a 
                href="mailto:contato@autoisp.com.br" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-background transition-colors"
              >
                <Mail className="h-4 w-4" />
                contato@autoisp.com.br
              </a>
              <a 
                href="tel:+5511999999999" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-background transition-colors"
              >
                <Phone className="h-4 w-4" />
                (11) 99999-9999
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-muted-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AutoISP. Todos os direitos reservados.
            <span className="block md:inline md:ml-2">CNPJ: 00.000.000/0001-00</span>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
