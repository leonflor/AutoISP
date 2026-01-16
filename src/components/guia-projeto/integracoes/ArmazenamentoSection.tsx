import SupabaseStorageIntegration from "./SupabaseStorageIntegration";

const ArmazenamentoSection = () => {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de Armazenamento</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Serviços de armazenamento de arquivos, imagens e documentos
        </p>
      </div>

      <SupabaseStorageIntegration />
    </div>
  );
};

export default ArmazenamentoSection;
