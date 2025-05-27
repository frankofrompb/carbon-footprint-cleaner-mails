
import { Car, Plane, Smartphone } from "lucide-react";

interface CarbonFootprintVisualProps {
  carbonGrams: number;
}

const CarbonFootprintVisual = ({ carbonGrams }: CarbonFootprintVisualProps) => {
  // Calculer des équivalences écologiques approximatives
  const kmVoiture = (carbonGrams / 120).toFixed(1); // 120g CO2/km pour une voiture moyenne
  const kmAvion = (carbonGrams / 250).toFixed(1); // 250g CO2/km pour un avion
  const heuresSmartphone = (carbonGrams / 15).toFixed(1); // 15g CO2/heure pour un smartphone

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-eco-brand" />
        <h3 className="font-medium">Impact environnemental</h3>
      </div>
      
      <div className="space-y-4">
        {/* Bloc Voiture */}
        <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center space-x-4">
          <div className="bg-eco-blue/10 p-3 rounded-full">
            <Car className="w-6 h-6 text-eco-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Équivalent en km de voiture</p>
            <p className="text-xl font-bold text-eco-blue">{kmVoiture} km</p>
          </div>
        </div>

        {/* Bloc Avion */}
        <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center space-x-4">
          <div className="bg-eco-green/10 p-3 rounded-full">
            <Plane className="w-6 h-6 text-eco-green" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Équivalent en km d'avion</p>
            <p className="text-xl font-bold text-eco-green">{kmAvion} km</p>
          </div>
        </div>

        {/* Bloc Smartphone */}
        <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center space-x-4">
          <div className="bg-eco-brand/10 p-3 rounded-full">
            <Smartphone className="w-6 h-6 text-eco-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Équivalent en utilisation smartphone</p>
            <p className="text-xl font-bold text-eco-brand">{heuresSmartphone} heures</p>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        En supprimant ces emails, vous réduisez votre empreinte carbone numérique et contribuez à la lutte contre le réchauffement climatique.
      </p>
    </div>
  );
};

export default CarbonFootprintVisual;
