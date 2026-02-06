import OpenAIIntegration from "./OpenAIIntegration";

const IASection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">OpenAI API</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          API OpenAI (GPT-4o, GPT-4o-mini) para os Agentes Inteligentes
        </p>
      </div>
      
      <OpenAIIntegration />
    </div>
  );
};

export default IASection;
