import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Bot, Shield, Lightbulb, Users, Target, Briefcase, Heart } from "lucide-react";

const BrandingSection = () => {
  const valores = [
    { label: "Eficiência", icon: Zap, description: "Processos otimizados e resultados rápidos" },
    { label: "Automação", icon: Bot, description: "IA e automação em todas as etapas" },
    { label: "Confiabilidade", icon: Shield, description: "Sistema estável e seguro" },
    { label: "Inovação", icon: Lightbulb, description: "Tecnologia de ponta para ISPs" },
  ];

  const personalidade = [
    { label: "Profissional", description: "Comunicação clara e objetiva" },
    { label: "Tech", description: "Visual moderno e tecnológico" },
    { label: "Moderno", description: "Design atualizado e clean" },
    { label: "Confiável", description: "Transmite segurança e estabilidade" },
  ];

  const publicoAlvo = [
    { label: "Gestores de ISP", icon: Briefcase, description: "Tomadores de decisão que buscam eficiência" },
    { label: "Equipe Técnica", icon: Users, description: "Profissionais que operam o dia a dia" },
    { label: "Atendimento", icon: Heart, description: "Time de suporte ao cliente" },
  ];

  return (
    <div className="space-y-6">
      {/* Identidade Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Identidade da Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-3xl font-bold text-foreground">AutoISP</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Slogan</p>
              <p className="text-xl font-medium text-primary">"Automação inteligente para ISPs"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valores */}
      <Card>
        <CardHeader>
          <CardTitle>Valores da Marca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valores.map((valor) => {
              const Icon = valor.icon;
              return (
                <div
                  key={valor.label}
                  className="flex flex-col items-center rounded-lg border border-border bg-muted/30 p-4 text-center"
                >
                  <div className="mb-3 rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{valor.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{valor.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personalidade */}
      <Card>
        <CardHeader>
          <CardTitle>Personalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {personalidade.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-card p-4"
              >
                <Badge variant="secondary" className="mb-2">
                  {item.label}
                </Badge>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Público-alvo */}
      <Card>
        <CardHeader>
          <CardTitle>Público-Alvo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {publicoAlvo.map((publico) => {
              const Icon = publico.icon;
              return (
                <div
                  key={publico.label}
                  className="flex items-start gap-3 rounded-lg border border-border p-4"
                >
                  <div className="rounded-lg bg-secondary p-2">
                    <Icon className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{publico.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{publico.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingSection;
