import ERPIntegration from "./ERPIntegration";

const ERPSection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de ERP</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sincronização com sistemas de gestão de ISPs (SGP, IXC Soft, MK Solutions, Hubsoft)
        </p>
      </div>

      <ERPIntegration />
    </div>
  );
};

export default ERPSection;
