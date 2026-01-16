import ResendIntegration from "./ResendIntegration";

const EmailSection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de Email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Serviços para envio de emails transacionais, notificações e comunicação
        </p>
      </div>

      <ResendIntegration />
    </div>
  );
};

export default EmailSection;
