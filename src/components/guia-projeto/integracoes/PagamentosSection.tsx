import AsaasIntegration from "./AsaasIntegration";

const PagamentosSection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de Pagamentos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gateways de pagamento para cobranças recorrentes e avulsas
        </p>
      </div>
      
      <AsaasIntegration />
    </div>
  );
};

export default PagamentosSection;
