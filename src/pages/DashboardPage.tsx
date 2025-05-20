
import React, { useState, useEffect } from "react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  // Define sample data for the charts
  const [salesData, setSalesData] = useState([
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 1800 },
    { name: "Mar", total: 2200 },
    { name: "Apr", total: 1500 },
    { name: "May", total: 2800 },
    { name: "Jun", total: 3100 }
  ]);
  
  const [comparisonData, setComparisonData] = useState([
    { name: "Q1", value: 4000 },
    { name: "Q2", value: 3000 },
    { name: "Q3", value: 2000 },
    { name: "Q4", value: 2780 }
  ]);
  
  // Return the dashboard layout
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ sales: { color: "#2563eb" } }}
            >
              <RechartsPrimitive.AreaChart data={salesData || []}>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                <RechartsPrimitive.XAxis dataKey="name" />
                <RechartsPrimitive.YAxis />
                <RechartsPrimitive.Tooltip />
                <RechartsPrimitive.Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#2563eb" 
                  fill="#2563eb" 
                  fillOpacity={0.2} 
                />
              </RechartsPrimitive.AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ 
                customers: { color: "#f59e0b" },
                products: { color: "#4ade80" }
              }}
            >
              <RechartsPrimitive.BarChart data={comparisonData || []}>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                <RechartsPrimitive.XAxis dataKey="name" />
                <RechartsPrimitive.YAxis />
                <RechartsPrimitive.Tooltip />
                <RechartsPrimitive.Legend />
                <RechartsPrimitive.Bar dataKey="value" fill="#f59e0b" />
              </RechartsPrimitive.BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
