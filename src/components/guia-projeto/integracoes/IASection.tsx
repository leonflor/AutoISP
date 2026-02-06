import OpenAIIntegration from "./OpenAIIntegration";

const IASection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Lovable AI Gateway</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gateway multi-modelo (GPT-4o, Gemini, etc.) para os Agentes Inteligentes
        </p>
      </div>
      
      <OpenAIIntegration />
    </div>
  );
};

export default IASection;
