"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Calendar, Wallet, Filter, CreditCard, TrendingUp, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/page/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/page/components/ui/select";
import { Badge } from "@/app/page/components/ui/badge";
import { Input } from "@/app/page/components/ui/input";

// Định nghĩa kiểu dữ liệu cho giao dịch
interface Transaction {
  id: number;
  amount: number;
  type: "deposit" | "withdraw" | "payment";
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
}

// Định nghĩa kiểu dữ liệu cho response API
interface TransactionApiItem {
  createdAt: string;
  status: string;
  amount: number;
  description: string;
  payosOrderId: string;
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch lịch sử giao dịch nếu đã đăng nhập
    if (token) {
      fetchTransactions();
    } else {
      setIsLoading(false);
    }
  }, [token, currentPage, filter, dateRange]);

  // Fetch lịch sử giao dịch
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Gọi API thực từ backend
      const response = await fetch("http://localhost:8081/indentity/api/payment/history", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200) {
        // Chuyển đổi dữ liệu API thành định dạng mà giao diện cần
        const formattedTransactions: Transaction[] = data.result.map((item: TransactionApiItem, index: number) => ({
          id: item.payosOrderId || index + 1,
          amount: item.amount,
          type: item.description.toLowerCase().includes("nạp tiền") ? "deposit" : "payment",
          status: item.status === "SUCCESS" ? "completed" : "failed",
          description: item.description,
          createdAt: item.createdAt
        }));
        
        // Lọc theo loại giao dịch nếu cần
        let filteredTransactions = formattedTransactions;
        if (filter !== "all") {
          filteredTransactions = formattedTransactions.filter(t => t.type === filter);
        }

        // Lọc theo tìm kiếm
        if (searchTerm) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.id.toString().includes(searchTerm)
          );
        }
        
        setTransactions(filteredTransactions);
        setTotalPages(Math.ceil(formattedTransactions.length / 10) || 1); // Giả sử mỗi trang 10 giao dịch
        
      } else {
        toast.error("Không thể lấy lịch sử giao dịch");
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử giao dịch:", error);
      toast.error("Đã xảy ra lỗi khi tải lịch sử giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị badge cho trạng thái giao dịch
  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Thành công</Badge>;
      case "pending":
        return <Badge className="bg-red-500 hover:bg-red-600">Giao dịch bị huỷ</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">Thất bại</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Hiển thị loại giao dịch
  const getTransactionType = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return (
          <div className="flex items-center">
            <span className="w-8 h-8 mr-3 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </span>
            <span>Nạp tiền</span>
          </div>
        );
      case "withdraw":
        return (
          <div className="flex items-center">
            <span className="w-8 h-8 mr-3 rounded-full bg-amber-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-amber-600" />
            </span>
            <span>Rút tiền</span>
          </div>
        );
      case "payment":
        return (
          <div className="flex items-center">
            <span className="w-8 h-8 mr-3 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </span>
            <span>Thanh toán</span>
          </div>
        );
      default:
        return type;
    }
  };

  // Định dạng số tiền
  const formatAmount = (amount: number, type: Transaction["type"]) => {
    return (
      <span className={`font-medium ${
        type === "deposit" ? "text-green-600" : type === "withdraw" || type === "payment" ? "text-red-600" : ""
      }`}>
        {type === "deposit" ? "+" : "-"}{amount.toLocaleString("vi-VN")}đ
      </span>
    );
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  // Tính tổng tiền nạp và thanh toán
  const getTransactionSummary = () => {
    let totalDeposit = 0;
    let totalPayment = 0;

    transactions.forEach(t => {
      if (t.status === "completed") {
        if (t.type === "deposit") totalDeposit += t.amount;
        else if (t.type === "payment" || t.type === "withdraw") totalPayment += t.amount;
      }
    });

    return { totalDeposit, totalPayment };
  };

  const { totalDeposit, totalPayment } = getTransactionSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e6f7ff] to-[#e0f2fe] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 text-[#00B4DB] hover:bg-[#00B4DB]/10 -ml-2 flex items-center"
            onClick={() => router.push('/wallet')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại ví
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Lịch sử giao dịch</h1>
              <p className="text-gray-600">Xem và quản lý các giao dịch của bạn</p>
            </div>
            {token && (
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center gap-2 bg-white">
                  <Download className="h-4 w-4" />
                  Xuất PDF
                </Button>
                <Button className="bg-[#00B4DB] hover:bg-[#0083B0] text-white">
                  Nạp tiền mới
                </Button>
              </div>
            )}
          </div>
        </div>

        {token && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Tổng tiền nạp</h3>
                  <TrendingUp className="h-6 w-6 text-white/80" />
                </div>
                <p className="text-3xl font-bold mt-2">{totalDeposit.toLocaleString('vi-VN')}đ</p>
                <p className="text-white/80 mt-1 text-sm">Tổng tiền đã nạp thành công</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Tổng chi tiêu</h3>
                  <CreditCard className="h-6 w-6 text-white/80" />
                </div>
                <p className="text-3xl font-bold mt-2">{totalPayment.toLocaleString('vi-VN')}đ</p>
                <p className="text-white/80 mt-1 text-sm">Tổng thanh toán & rút tiền</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Số dư khả dụng</h3>
                  <Wallet className="h-6 w-6 text-white/80" />
                </div>
                <p className="text-3xl font-bold mt-2">{(totalDeposit - totalPayment).toLocaleString('vi-VN')}đ</p>
                <p className="text-white/80 mt-1 text-sm">Số tiền có thể sử dụng</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-white/90 shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Danh sách giao dịch</CardTitle>
              {token && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Tìm kiếm giao dịch..." 
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60 w-full sm:w-auto"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white w-full sm:w-[150px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Loại giao dịch" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả giao dịch</SelectItem>
                        <SelectItem value="deposit">Nạp tiền</SelectItem>
                        <SelectItem value="withdraw">Rút tiền</SelectItem>
                        <SelectItem value="payment">Thanh toán</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white w-full sm:w-[150px]">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Thời gian" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả thời gian</SelectItem>
                        <SelectItem value="today">Hôm nay</SelectItem>
                        <SelectItem value="week">Tuần này</SelectItem>
                        <SelectItem value="month">Tháng này</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!token ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                  <Wallet className="h-12 w-12 text-[#00B4DB]" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Vui lòng đăng nhập</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  Đăng nhập để xem lịch sử giao dịch và quản lý tài khoản ví FinTrip của bạn
                </p>
                <Button 
                  className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl shadow-md transform hover:scale-105 transition-all"
                  onClick={() => router.push("/page/auth/login")}
                >
                  Đăng nhập ngay
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B4DB]"></div>
                  <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-50 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-4">
                  <CreditCard className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Chưa có giao dịch nào</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Bạn chưa thực hiện giao dịch nào hoặc không tìm thấy giao dịch phù hợp với bộ lọc đã chọn
                </p>
                <Button 
                  className="bg-[#00B4DB] hover:bg-[#0083B0] text-white"
                  onClick={() => router.push('/wallet')}
                >
                  Nạp tiền ngay
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[100px]">Mã GD</TableHead>
                        <TableHead className="w-[180px]">Thời gian</TableHead>
                        <TableHead>Loại giao dịch</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">#{transaction.id}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>{getTransactionType(transaction.type)}</TableCell>
                          <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                          <TableCell className="text-right">{formatAmount(transaction.amount, transaction.type)}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Phân trang */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium text-gray-900">{transactions.length}</span> giao dịch
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage <= 1}
                      className="h-9 px-4"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    <div className="flex items-center justify-center px-4 h-9 bg-gray-50 border rounded-md min-w-[80px]">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                      className="h-9 px-4"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 