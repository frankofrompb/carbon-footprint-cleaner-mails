
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface CarbonFootprintVisualProps {
  carbonGrams: number;
}

const CarbonFootprintVisual = ({ carbonGrams }: CarbonFootprintVisualProps) => {
  // Calculer des équivalences écologiques approximatives
  const kmVoiture = (carbonGrams / 120).toFixed(1); // 120g CO2/km pour une voiture moyenne
  const minutesSmartphone = (carbonGrams / 0.25).toFixed(0); // 0.25g CO2/min pour un smartphone

  // Données pour le graphique
  const data = [
    { name: 'Vos emails', value: carbonGrams },
    { name: 'Référence: Smartphone 24h', value: 360 }, // Environ 360g pour 24h d'utilisation d'un smartphone
  ];

  const COLORS = ['#2D8B61', '#3DA5D9'];

  return (
    <div className="space-y-4">
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
        
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Équivalent en km de voiture</p>
            <p className="text-2xl font-bold">{kmVoiture} km</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Équivalent en utilisation de smartphone</p>
            <p className="text-2xl font-bold">{minutesSmartphone} minutes</p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            En supprimant ces emails, vous réduisez votre empreinte carbone numérique et contribuez à la lutte contre le réchauffement climatique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintVisual;
