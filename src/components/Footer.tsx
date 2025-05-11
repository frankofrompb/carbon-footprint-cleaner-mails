
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-4">
      <Separator className="mb-6" />
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          &copy; {new Date().getFullYear()} EcoMailCleaner - Réduisez votre empreinte carbone numérique
        </p>
        <div className="text-xs text-muted-foreground">
          <p>Estimation : 10g de CO₂ par email non lu conservé pendant un an</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
