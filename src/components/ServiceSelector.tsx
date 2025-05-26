
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trash, Mail, List } from "lucide-react";

export type ServiceType = "delete-old" | "block-spam" | "sort-important";

interface ServiceSelectorProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

const ServiceSelector = ({ selectedService, onServiceChange }: ServiceSelectorProps) => {
  const services = [
    {
      id: "delete-old" as ServiceType,
      title: "Suppression intelligente des vieux emails non lus",
      description: "Identifie et supprime automatiquement les anciens emails non lus pour libérer de l'espace",
      icon: Trash,
      color: "text-red-600"
    },
    {
      id: "block-spam" as ServiceType,
      title: "Bloquez les spams et les adresses mails indésirables",
      description: "Détecte et bloque les expéditeurs de spam et emails indésirables",
      icon: Mail,
      color: "text-orange-600"
    },
    {
      id: "sort-important" as ServiceType,
      title: "Tri intelligent des emails importants",
      description: "Classe vos emails par ordre d'importance et organise votre boîte de réception",
      icon: List,
      color: "text-green-600"
    }
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Choisissez votre type de service</CardTitle>
        <CardDescription>
          Sélectionnez le type d'analyse que vous souhaitez effectuer sur votre boîte mail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedService} onValueChange={onServiceChange}>
          <div className="space-y-4">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <div key={service.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                  <div className="flex-1 cursor-pointer" onClick={() => onServiceChange(service.id)}>
                    <Label htmlFor={service.id} className="cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <IconComponent className={`h-6 w-6 mt-1 ${service.color}`} />
                        <div>
                          <h3 className="font-medium text-sm">{service.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ServiceSelector;
