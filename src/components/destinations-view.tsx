"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Search, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for destinations
const initialDestinations = [
  {
    id: 1,
    name: "Bali, Indonesia",
    type: "Beach",
    rating: 4.8,
    popularity: "High",
    image: "/placeholder.svg?height=200&width=300",
    description: "Beautiful beaches, vibrant culture, and stunning landscapes.",
  },
  {
    id: 2,
    name: "Paris, France",
    type: "City",
    rating: 4.7,
    popularity: "High",
    image: "/placeholder.svg?height=200&width=300",
    description:
      "The city of love with iconic landmarks and exquisite cuisine.",
  },
  {
    id: 3,
    name: "Swiss Alps",
    type: "Mountain",
    rating: 4.9,
    popularity: "Medium",
    image: "/placeholder.svg?height=200&width=300",
    description: "Breathtaking mountain views and world-class skiing.",
  },
  {
    id: 4,
    name: "Kyoto, Japan",
    type: "Historical",
    rating: 4.6,
    popularity: "Medium",
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Ancient temples, traditional gardens, and rich cultural heritage.",
  },
  {
    id: 5,
    name: "Santorini, Greece",
    type: "Beach",
    rating: 4.8,
    popularity: "High",
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Stunning white buildings, blue domes, and spectacular sunsets.",
  },
  {
    id: 6,
    name: "Amazon Rainforest",
    type: "Adventure",
    rating: 4.5,
    popularity: "Low",
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Explore the world's largest rainforest and its diverse wildlife.",
  },
];

export default function DestinationsView() {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [popularityFilter, setPopularityFilter] = useState("");

  // Filter destinations based on search term and filters
  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch = destination.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? destination.type === typeFilter : true;
    const matchesPopularity = popularityFilter
      ? destination.popularity === popularityFilter
      : true;

    return matchesSearch && matchesType && matchesPopularity;
  });

  // Render popularity badge with appropriate color
  const renderPopularityBadge = (popularity: string) => {
    switch (popularity) {
      case "High":
        return <Badge className="bg-green-500 hover:bg-green-600">High</Badge>;
      case "Medium":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Medium</Badge>;
      case "Low":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Low</Badge>;
      default:
        return <Badge>{popularity}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Destinations</h1>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search destinations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Beach">Beach</SelectItem>
              <SelectItem value="City">City</SelectItem>
              <SelectItem value="Mountain">Mountain</SelectItem>
              <SelectItem value="Historical">Historical</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
            </SelectContent>
          </Select>

          <Select value={popularityFilter} onValueChange={setPopularityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Popularity</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <img
                src={destination.image || "/placeholder.svg"}
                alt={destination.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute right-2 top-2">
                {renderPopularityBadge(destination.popularity)}
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{destination.name}</CardTitle>
                <div className="flex items-center text-yellow-500">
                  <Star className="mr-1 h-4 w-4 fill-current" />
                  <span>{destination.rating}</span>
                </div>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{destination.type}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{destination.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-500 hover:text-blue-600"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredDestinations.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center rounded-md border border-dashed">
            <p className="text-gray-500">No destinations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
