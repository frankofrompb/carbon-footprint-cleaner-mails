
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanResults } from "@/types";
import { Mail, Users, Inbox } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DashboardProps {
  scanResults: ScanResults;
}

const Dashboard = ({ scanResults }: DashboardProps) => {
  const [emailsByYear, setEmailsByYear] = useState<{ name: string; count: number }[]>([]);
  const [emailCategories, setEmailCategories] = useState({
    promotional: 0,
    social: 0,
    spam: 0
  });

  useEffect(() => {
    if (scanResults && scanResults.emails) {
      // Process emails by year
      const emailsByYearMap = new Map<string, number>();
      
      // Process categories (simulated for demo)
      let promoCount = Math.floor(scanResults.totalEmails * 0.45); // 45% promotional
      let socialCount = Math.floor(scanResults.totalEmails * 0.30); // 30% social
      let spamCount = Math.floor(scanResults.totalEmails * 0.25); // 25% spam
      
      setEmailCategories({
        promotional: promoCount,
        social: socialCount,
        spam: spamCount
      });

      // Group emails by year
      scanResults.emails.forEach(email => {
        const year = new Date(email.date).getFullYear().toString();
        emailsByYearMap.set(year, (emailsByYearMap.get(year) || 0) + 1);
      });

      // Convert map to array for chart
      const emailsData = Array.from(emailsByYearMap.entries())
        .map(([year, count]) => ({ name: year, count }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setEmailsByYear(emailsData);
    }
  }, [scanResults]);

  if (!scanResults) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Mail className="h-4 w-4 mr-2 text-eco-blue" />
              Emails promotionnels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCategories.promotional}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(emailCategories.promotional / scanResults.totalEmails * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-eco-blue" />
              Emails réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCategories.social}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(emailCategories.social / scanResults.totalEmails * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Inbox className="h-4 w-4 mr-2 text-eco-blue" />
              Emails spam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCategories.spam}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(emailCategories.spam / scanResults.totalEmails * 100)}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emails non lus par année</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                emails: {
                  label: "Emails non lus",
                  color: "#1EAEDB",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailsByYear}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => [`${value} emails`, "Quantité"]}
                      />
                    } 
                  />
                  <Bar dataKey="count" name="emails" fill="currentColor" className="fill-[var(--color-emails)]" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé de l'empreinte carbone</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Emails</TableHead>
                <TableHead>Empreinte CO₂</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Promotions</TableCell>
                <TableCell>{emailCategories.promotional}</TableCell>
                <TableCell>{emailCategories.promotional * 10}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Réseaux sociaux</TableCell>
                <TableCell>{emailCategories.social}</TableCell>
                <TableCell>{emailCategories.social * 10}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Spam</TableCell>
                <TableCell>{emailCategories.spam}</TableCell>
                <TableCell>{emailCategories.spam * 10}g</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell>{scanResults.totalEmails}</TableCell>
                <TableCell>{scanResults.carbonFootprint}g</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
