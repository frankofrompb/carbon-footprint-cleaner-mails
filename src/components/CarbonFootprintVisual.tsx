
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Car, Plane, Smartphone } from "lucide-react";

interface CarbonFootprintVisualProps {
  carbonGrams: number;
}

const CarbonFootprintVisual = ({ carbonGrams }: CarbonFootprintVisualProps) => {
  // Calculer des équivalences écologiques approximatives
  const kmVoiture = (carbonGrams / 120).toFixed(1); // 120g CO2/km pour une voiture moyenne
  const kmAvion = (carbonGrams / 250).toFixed(1); // 250g CO2/km pour un avion
  const heuresSmartphone = (carbonGrams / 15).toFixed(1); // 15g CO2/heure pour un smartphone

  // Données pour le graphique
  const data = [
    { name: 'Vos emails', value: carbonGrams },
    { name: 'Référence: Smartphone 24h', value: 360 }, // Environ 360g pour 24h d'utilisation d'un smartphone
  ];

  const COLORS = ['#2D8B61', '#3DA5D9'];

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Impact environnemental</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted rounded-lg p-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8CC084"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}g de CO₂`} />
            </PieChart>
          </ResponsiveContainer>
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
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        En supprimant ces emails, vous réduisez votre empreinte carbone numérique et contribuez à la lutte contre le réchauffement climatique.
      </p>
    </div>
  );
};

export default CarbonFootprintVisual;
