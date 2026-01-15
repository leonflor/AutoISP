import OpenAIIntegration from "./OpenAIIntegration";

const IASection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de IA</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          OpenAI e modelos de linguagem para os Agentes Inteligentes
        </p>
      </div>
      
      <OpenAIIntegration />
    </div>
  );
};

export default IASection;
