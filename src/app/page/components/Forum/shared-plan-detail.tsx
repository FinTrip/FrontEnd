"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Button } from "@/app/page/components/ui/button";
import { Badge } from "@/app/page/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Bookmark, Copy } from "lucide-react";

const mockSharedPlan = {
  id: "1",
  title: "Weekend in Da Nang",
  destination: "Da Nang, Vietnam",
  startDate: "2023-12-15",
  endDate: "2023-12-17",
  status: "upcoming",
  participants: 2,
  description: "A relaxing weekend getaway to explore the beaches of Da Nang and visit the Golden Bridge.",
  itinerary: [
    {
      day: 1,
      date: "2023-12-15",
      activities: [
        { time: "08:00", description: "Arrive at Da Nang International Airport" },
        { time: "10:00", description: "Check-in at hotel in My Khe Beach area" },
        { time: "12:00", description: "Lunch at a local seafood restaurant" },
        { time: "14:00", description: "Relax at My Khe Beach" },
        { time: "18:00", description: "Dinner and explore Han River Bridge area" },
      ],
    },
    {
      day: 2,
      date: "2023-12-16",
      activities: [
        { time: "07:00", description: "Breakfast at hotel" },
        { time: "08:30", description: "Depart for Ba Na Hills" },
        { time: "10:00", description: "Explore Golden Bridge and Ba Na Hills attractions" },
        { time: "13:00", description: "Lunch at Ba Na Hills" },
        { time: "16:00", description: "Return to Da Nang city" },
        { time: "18:30", description: "Dinner at a local restaurant" },
        { time: "20:00", description: "Visit Dragon Bridge (watch fire show if it's weekend)" },
      ],
    },
    {
      day: 3,
      date: "2023-12-17",
      activities: [
        { time: "07:30", description: "Breakfast at hotel" },
        { time: "09:00", description: "Visit Marble Mountains" },
        { time: "12:00", description: "Lunch near Marble Mountains" },
        { time: "14:00", description: "Souvenir shopping at Con Market" },
        { time: "16:00", description: "Check-out and transfer to airport" },
        { time: "18:30", description: "Departure flight" },
      ],
    },
  ],
};

export default function SharedPlanDetail() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "planning":
        return <Badge variant="outline">Planning</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Shared Travel Plan</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{mockSharedPlan.title}</CardTitle>
              <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{mockSharedPlan.destination}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>
                    {new Date(mockSharedPlan.startDate).toLocaleDateString()} -{" "}
                    {new Date(mockSharedPlan.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {Math.ceil(
                      (new Date(mockSharedPlan.endDate).getTime() - new Date(mockSharedPlan.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>
                    {mockSharedPlan.participants} {mockSharedPlan.participants === 1 ? "person" : "people"}
                  </span>
                </div>
              </div>
            </div>
            {getStatusBadge(mockSharedPlan.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">About this trip</h3>
            <p className="text-muted-foreground">{mockSharedPlan.description}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Detailed Itinerary</h3>
            {mockSharedPlan.itinerary.map((day) => (
              <div key={day.day} className="space-y-2">
                <h4 className="font-medium text-md">
                  Day {day.day} -{" "}
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
                <div className="space-y-3 border-l-2 border-muted pl-4">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex">
                      <div className="w-16 font-medium">{activity.time}</div>
                      <div>{activity.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              This is a view-only travel plan shared with you. You cannot edit this plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 