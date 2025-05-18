
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

const GoogleCloudGuide = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <span className="text-[#38c39d] mr-2">Configuration de Google Cloud</span>
        </CardTitle>
        <CardDescription>
          Suivez ces étapes pour configurer votre projet Google Cloud et activer l'API Gmail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Étape 1: Créer un projet Google Cloud</h3>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>Accédez à la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#38c39d] underline">Google Cloud Console</a></li>
            <li>Cliquez sur "Sélecteur de projet" en haut de la page</li>
            <li>Cliquez sur "Nouveau projet"</li>
            <li>Donnez un nom à votre projet (ex: "EcoInBox")</li>
            <li>Cliquez sur "Créer"</li>
          </ol>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Étape 2: Activer l'API Gmail</h3>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>Dans le menu de navigation, cliquez sur "APIs et services" &gt; "Bibliothèque"</li>
            <li>Recherchez "Gmail API" et cliquez dessus</li>
            <li>Cliquez sur le bouton "Activer"</li>
          </ol>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Étape 3: Configurer l'écran de consentement OAuth</h3>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>Dans le menu "APIs et services", cliquez sur "Écran de consentement OAuth"</li>
            <li>Sélectionnez "Externe" et cliquez sur "Créer"</li>
            <li>Remplissez les informations requises:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Nom de l'application: "EcoInBox"</li>
                <li>Email de support: votre email</li>
                <li>Logo: téléchargez votre logo (optionnel)</li>
                <li>Domaines autorisés: ajoutez l'URL de votre application déployée</li>
              </ul>
            </li>
            <li>Cliquez sur "Enregistrer et continuer"</li>
            <li>Sur l'écran "Étendue", ajoutez les étendues suivantes:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>https://www.googleapis.com/auth/gmail.readonly</li>
                <li>https://www.googleapis.com/auth/gmail.modify</li>
              </ul>
            </li>
            <li>Cliquez sur "Enregistrer et continuer"</li>
            <li>Ajoutez les utilisateurs de test (votre email) et cliquez sur "Enregistrer et continuer"</li>
            <li>Vérifiez les informations et cliquez sur "Retour au tableau de bord"</li>
          </ol>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Étape 4: Créer des identifiants OAuth 2.0</h3>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>Dans le menu "APIs et services", cliquez sur "Identifiants"</li>
            <li>Cliquez sur le bouton "Créer des identifiants" puis "ID client OAuth"</li>
            <li>Sélectionnez "Application Web"</li>
            <li>Donnez un nom à votre application</li>
            <li>Dans "URI de redirection autorisés", ajoutez les URLs suivantes:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>L'URL de votre application déployée (ex: https://ecoinbox.lovable.app)</li>
                <li>L'URL de votre application en développement (ex: http://localhost:5173)</li>
                <li>Ajoutez "/auth/callback" à chaque URL (ex: https://ecoinbox.lovable.app/auth/callback)</li>
              </ul>
            </li>
            <li>Cliquez sur "Créer"</li>
            <li>Une fenêtre apparaîtra avec votre <strong>Client ID</strong> et votre <strong>Client Secret</strong></li>
            <li className="font-medium">Notez soigneusement ces informations, vous en aurez besoin pour configurer l'application</li>
          </ol>
        </div>
        
        <Separator />
        
        <div className="bg-muted p-4 rounded-md">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-5 w-5 text-[#38c39d] mt-0.5" />
            <div>
              <p className="font-medium">Dernière étape:</p>
              <p>Remplacez la variable <code>GMAIL_CLIENT_ID</code> dans le fichier <code>src/hooks/useAuth.tsx</code> par votre Client ID réel.</p>
              <p className="mt-2">Pour implémenter complètement la fonctionnalité, vous devrez également configurer Supabase pour gérer les tokens d'accès en toute sécurité.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCloudGuide;
