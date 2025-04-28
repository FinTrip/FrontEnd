"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartArea,
  ChartLine,
  ChartBar,
} from "@/components/ui/chart";
import { CampaignVisitors } from "@/components/Charts/campaign-visitors";
import { UsedDevices } from "@/components/Charts/used-devices";

// Mock data for travel trends
const travelTrendsData = [
  { month: "Jan", domestic: 65, international: 28 },
  { month: "Feb", domestic: 59, international: 30 },
  { month: "Mar", domestic: 80, international: 42 },
  { month: "Apr", domestic: 81, international: 40 },
  { month: "May", domestic: 90, international: 50 },
  { month: "Jun", domestic: 125, international: 70 },
  { month: "Jul", domestic: 150, international: 90 },
  { month: "Aug", domestic: 145, international: 85 },
  { month: "Sep", domestic: 110, international: 60 },
  { month: "Oct", domestic: 95, international: 55 },
  { month: "Nov", domestic: 75, international: 45 },
  { month: "Dec", domestic: 100, international: 65 },
];

// Mock data for popular destinations
const popularDestinationsData = [
  { name: "Beach", visitors: 4000 },
  { name: "Mountain", visitors: 3000 },
  { name: "City", visitors: 2800 },
  { name: "Countryside", visitors: 1500 },
  { name: "Historical", visitors: 2300 },
  { name: "Adventure", visitors: 1800 },
];

// Mock data for user growth
const userGrowthData = [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 600 },
  { month: "Mar", users: 800 },
  { month: "Apr", users: 1000 },
  { month: "May", users: 1200 },
  { month: "Jun", users: 1500 },
  { month: "Jul", users: 1800 },
  { month: "Aug", users: 2100 },
  { month: "Sep", users: 2400 },
  { month: "Oct", users: 2700 },
  { month: "Nov", users: 3000 },
  { month: "Dec", users: 3500 },
];

export default function StatisticsView() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Statistics</h1>
        <p className="text-gray-500">
          View travel trends and platform analytics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Active users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,542</div>
            <p className="text-sm text-green-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Destinations</CardTitle>
            <CardDescription>Available travel destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">256</div>
            <p className="text-sm text-green-500">+8 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Trips Planned</CardTitle>
            <CardDescription>Total trips planned this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,287</div>
            <p className="text-sm text-green-500">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="travel-trends">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="travel-trends">Travel Trends</TabsTrigger>
          <TabsTrigger value="popular-destinations">
            Popular Destinations
          </TabsTrigger>
          <TabsTrigger value="user-growth">User Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="travel-trends">
          <Card>
            <CardHeader>
              <CardTitle>Travel Trends</CardTitle>
              <CardDescription>
                Monthly domestic vs international travel trends
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Chart>
                <ChartContainer data={travelTrendsData}>
                  <ChartTooltip>
                    <ChartTooltipContent />
                  </ChartTooltip>
                  <ChartLegend>
                    <ChartLegendItem name="domestic" color="#4f46e5" />
                    <ChartLegendItem name="international" color="#06b6d4" />
                  </ChartLegend>
                  <ChartGrid />
                  <ChartXAxis dataKey="month" />
                  <ChartYAxis />
                  <ChartArea
                    dataKey="domestic"
                    fill="#4f46e5"
                    fillOpacity={0.2}
                    stroke="#4f46e5"
                  />
                  <ChartArea
                    dataKey="international"
                    fill="#06b6d4"
                    fillOpacity={0.2}
                    stroke="#06b6d4"
                  />
                </ChartContainer>
              </Chart>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular-destinations">
          <Card>
            <CardHeader>
              <CardTitle>Popular Destinations</CardTitle>
              <CardDescription>Most visited destination types</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Chart>
                <ChartContainer data={popularDestinationsData}>
                  <ChartTooltip>
                    <ChartTooltipContent />
                  </ChartTooltip>
                  <ChartGrid />
                  <ChartXAxis dataKey="name" />
                  <ChartYAxis />
                  <ChartBar dataKey="visitors" fill="#3b82f6" />
                </ChartContainer>
              </Chart>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-growth">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                Monthly user growth over the past year
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Chart>
                <ChartContainer data={userGrowthData}>
                  <ChartTooltip>
                    <ChartTooltipContent />
                  </ChartTooltip>
                  <ChartGrid />
                  <ChartXAxis dataKey="month" />
                  <ChartYAxis />
                  <ChartLine dataKey="users" stroke="#10b981" strokeWidth={2} />
                </ChartContainer>
              </Chart>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Thêm các biểu đồ mới từ page.tsx */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Used Devices</CardTitle>
            <CardDescription>Devices used to access the platform</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <UsedDevices timeFrame="monthly" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Visitors</CardTitle>
            <CardDescription>Visitors from marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <CampaignVisitors />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}