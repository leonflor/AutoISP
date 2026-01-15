import LandingFeatures from "./modules/LandingFeatures";

const FeaturesLandingSection = () => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Features — Landing Page</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Funcionalidades documentadas por módulo da landing page
        </p>
      </div>
      <div className="p-6">
        <LandingFeatures />
      </div>
    </div>
  );
};

export default FeaturesLandingSection;
