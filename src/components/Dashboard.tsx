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
import { formatNumber } from "@/lib/utils";

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
    if (scanResults && scanResults.emails && scanResults.emails.length > 0) {
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

      // Group emails by year - fix the date parsing
      scanResults.emails.forEach(email => {
        if (email.date) {
          try {
            // Parse the date string properly
            const emailDate = new Date(email.date);
            if (!isNaN(emailDate.getTime())) {
              const year = emailDate.getFullYear().toString();
              emailsByYearMap.set(year, (emailsByYearMap.get(year) || 0) + 1);
            }
          } catch (error) {
            console.log('Error parsing date:', email.date, error);
          }
        }
      });

      // Convert map to array for chart and sort by year
      const emailsData = Array.from(emailsByYearMap.entries())
        .map(([year, count]) => ({ name: year, count }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Sort numerically by year

      console.log('Emails by year data:', emailsData);
      setEmailsByYear(emailsData);
    } else {
      // Reset if no emails
      setEmailsByYear([]);
      setEmailCategories({ promotional: 0, social: 0, spam: 0 });
    }
  }, [scanResults]);

  if (!scanResults) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Mail className="h-4 w-4 mr-2 text-[#38c39d]" />
              Emails promotionnels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(emailCategories.promotional)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(emailCategories.promotional / scanResults.totalEmails * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-[#38c39d]" />
              Emails réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(emailCategories.social)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(emailCategories.social / scanResults.totalEmails * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Inbox className="h-4 w-4 mr-2 text-[#38c39d]" />
              Emails spam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(emailCategories.spam)}</div>
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
        <CardContent className="p-6">
          {emailsByYear.length > 0 ? (
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  emails: {
                    label: "Emails non lus",
                    color: "#38c39d",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={emailsByYear} 
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent 
                          formatter={(value, name) => [
                            `${formatNumber(Number(value))} emails`,
                            `Année ${emailsByYear.find(item => item.count === value)?.name || ''}`
                          ]}
                        />
                      } 
                    />
                    <Bar 
                      dataKey="count" 
                      name="emails" 
                      fill="currentColor" 
                      className="fill-[var(--color-emails)]" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              <p>Aucune donnée d'email à afficher</p>
            </div>
          )}
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
                <TableCell>{formatNumber(emailCategories.promotional)}</TableCell>
                <TableCell>{formatNumber(emailCategories.promotional * 10)}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Réseaux sociaux</TableCell>
                <TableCell>{formatNumber(emailCategories.social)}</TableCell>
                <TableCell>{formatNumber(emailCategories.social * 10)}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Spam</TableCell>
                <TableCell>{formatNumber(emailCategories.spam)}</TableCell>
                <TableCell>{formatNumber(emailCategories.spam * 10)}g</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell>{formatNumber(scanResults.totalEmails)}</TableCell>
                <TableCell>{formatNumber(scanResults.carbonFootprint)}g</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
