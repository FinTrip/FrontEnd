"use client";

import { useState, useEffect } from "react";
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

// Define the type for destinations based on API response
type Destination = {
  name: string;
  province: string;
  location_rating: number;
  image: string;
  description: string;
};

export default function DestinationsView() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 destinations per page

  // Fetch hotel data from API when component mounts
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:8000/recommend/get-all-hotels/");
        const data = await response.json();
        const transformedHotels = data.hotels.map((hotel: any) => ({
          name: hotel.name,
          province: hotel.province,
          location_rating: parseFloat(hotel.location_rating),
          image: hotel.img_origin.split(",")[0].trim(),
          description: hotel.description,
        }));
        setDestinations(transformedHotels);
        setError(null);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setError("Failed to load destinations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Get unique provinces for filter options
  const uniqueProvinces = [...new Set(destinations.map((d) => d.province))];

  // Filter destinations based on search term and province
  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch = destination.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesProvince = provinceFilter && provinceFilter !== "all"
      ? destination.province === provinceFilter
      : true;
    return matchesSearch && matchesProvince;
  });

  // Calculate current destinations for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDestinations = filteredDestinations.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);

  // Handle delete action
  const handleDelete = async (name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${name} không?`)) {
      try {
        const response = await fetch("http://127.0.0.1:8000/recommend/delete-hotel/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
        if (response.ok) {
          // Cập nhật danh sách destinations sau khi xóa
          const newDestinations = destinations.filter((dest) => dest.name !== name);
          setDestinations(newDestinations);

          // Tính lại danh sách lọc và số trang
          const newFiltered = newDestinations.filter((destination) => {
            const matchesSearch = destination.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
            const matchesProvince = provinceFilter && provinceFilter !== "all"
              ? destination.province === provinceFilter
              : true;
            return matchesSearch && matchesProvince;
          });
          const newTotalPages = Math.ceil(newFiltered.length / itemsPerPage);

          // Điều chỉnh trang hiện tại nếu cần
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          } else if (newTotalPages === 0) {
            setCurrentPage(1);
          }
        } else {
          alert("Xóa hotel thất bại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa hotel:", error);
        alert("Đã xảy ra lỗi khi xóa hotel.");
      }
    }
  };

  // Show loading or error states
  if (isLoading) return <p>Đang tải danh sách điểm đến...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Destinations</h1>
        {/* <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button> */}
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm điểm đến..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo Tỉnh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các Tỉnh</SelectItem>
              {uniqueProvinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentDestinations.map((destination) => (
          <Card key={`${destination.name}-${destination.province}`} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <img
                src={destination.image || "/placeholder.svg"}
                alt={destination.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{destination.name}</CardTitle>
                <div className="flex items-center text-yellow-500">
                  <Star className="mr-1 h-4 w-4 fill-current" />
                  <span>{destination.location_rating}</span>
                </div>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{destination.province}</span>
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
                onClick={() => handleDelete(destination.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}

        {currentDestinations.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center rounded-md border border-dashed">
            <p className="text-gray-500">Không tìm thấy điểm đến nào.</p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {filteredDestinations.length > 0 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <span>Trang {currentPage} / {totalPages}</span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Tiếp
          </Button>
        </div>
      )}
    </div>
  );
}