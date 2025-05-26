"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import RechargeForm from "./components/RechargeForm";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Wallet, ArrowRight, CreditCard, PiggyBank, Clock, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/app/page/components/ui/badge";

// Định nghĩa kiểu dữ liệu cho giao dịch
interface TransactionApiItem {
  createdAt: string;
  status: string;
  amount: number;
  description: string;
  payosOrderId: string;
}

interface RecentTransaction {
  id: string;
  type: "deposit" | "payment";
  amount: number;
  date: string;
  description: string;
  status: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [quickActions] = useState([
    { 
      title: "Nạp tiền", 
      icon: <PiggyBank className="h-5 w-5 text-emerald-500" />,
      description: "Thêm tiền vào tài khoản",
      action: () => {} // Handled by the form
    },
    { 
      title: "Lịch sử giao dịch", 
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      description: "Xem các giao dịch đã thực hiện",
      action: () => router.push('/wallet/history')
    },
    { 
      title: "Thanh toán", 
      icon: <CreditCard className="h-5 w-5 text-violet-500" />,
      description: "Thanh toán dịch vụ du lịch",
      action: () => router.push('/bookings')
    }
  ]);

  // Tách hàm fetchBalance để có thể gọi lại khi cần
  const fetchBalance = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8081/indentity/api/wallet/balance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
        setBalance(data.result || 0);
      } else {
        toast.error("Không thể lấy thông tin số dư");
      }
    } catch (error) {
      console.error("Lỗi khi lấy số dư:", error);
      toast.error("Đã xảy ra lỗi khi tải thông tin tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch số dư tài khoản khi component mount và khi token thay đổi
    fetchBalance();
    
    // Fetch recent transactions
    if (token) {
      fetchRecentTransactions();
    }
  }, [token]);

  // Xử lý khi nạp tiền thành công
  const handleRechargeSuccess = (amount: number) => {
    // Thông báo thành công
    toast.success(`Đã xác nhận yêu cầu nạp ${amount.toLocaleString('vi-VN')}đ`);
    
    // Refresh số dư sau khi giao dịch được tạo
    // Lưu ý: Số dư thực tế sẽ cập nhật sau khi thanh toán hoàn tất
    setTimeout(() => {
      fetchBalance();
      fetchRecentTransactions();
    }, 2000);
  };

  // Fetch lịch sử giao dịch gần đây
  const fetchRecentTransactions = async () => {
    setTransactionsLoading(true);
    try {
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
        // Lấy 3 giao dịch gần nhất
        const formattedTransactions = data.result
          .slice(0, 3)
          .map((item: TransactionApiItem) => ({
            id: item.payosOrderId,
            type: item.description.toLowerCase().includes("nạp tiền") ? "deposit" : "payment",
            amount: item.amount,
            date: new Date(item.createdAt).toLocaleDateString("vi-VN"),
            description: item.description,
            status: item.status
          }));
        
        setRecentTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Lỗi khi lấy giao dịch gần đây:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Hiển thị badge cho trạng thái giao dịch
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500 hover:bg-green-600">Thành công</Badge>;
      case "PENDING":
        return <Badge className="bg-red-500 hover:bg-red-600">Giao dịch bị huỷ</Badge>;
      default:
        return <Badge className="bg-red-500 hover:bg-red-600">Thất bại</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e6f7ff] to-[#e0f2fe] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-white rounded-full shadow-md mb-4">
            <Wallet className="h-8 w-8 text-[#00B4DB]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ví FinTrip</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Quản lý tài chính du lịch của bạn một cách đơn giản và hiệu quả
          </p>
        </div>

        {!token ? (
          <Card className="bg-white/90 shadow-lg border-0 overflow-hidden p-6 text-center max-w-md mx-auto">
            <CardHeader>
              <div className="mx-auto bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <Wallet className="h-8 w-8 text-[#00B4DB]" />
              </div>
              <CardTitle className="text-2xl">Vui lòng đăng nhập</CardTitle>
              <CardDescription className="text-base">
                Đăng nhập để truy cập và quản lý ví FinTrip của bạn
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button 
                className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl shadow-md transform hover:scale-105 transition-all"
                onClick={() => router.push("/page/auth/login")}
              >
                Đăng nhập ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Card thông tin số dư */}
              <Card className="bg-white/90 shadow-lg border-0 overflow-hidden">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00B4DB] to-[#0083B0] opacity-90"></div>
                  <div className="relative p-6 md:p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-xl font-medium text-white/90">Số dư ví FinTrip</h2>
                        <p className="text-white/70">Cập nhật mới nhất</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                        <DollarSign className="h-4 w-4 text-white" />
                        <span className="text-sm text-white">VND</span>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="h-16 flex items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-end">
                          {balance.toLocaleString('vi-VN')}
                          <span className="text-xl text-white/80 ml-1">đ</span>
                        </h1>
                        <div className="flex items-center text-white/80">
                          <TrendingUp className="h-4 w-4 mr-1.5" />
                          <span className="text-sm">Hoạt động bình thường</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  {quickActions.map((action, index) => (
                    <div 
                      key={index}
                      className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      onClick={action.action}
                    >
                      <div className="bg-gray-50 p-2 rounded-full mb-2">
                        {action.icon}
                      </div>
                      <h3 className="font-medium text-gray-800">{action.title}</h3>
                      <p className="text-xs text-gray-500 text-center mt-1">{action.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Giao dịch gần đây */}
              <Card className="bg-white/90 shadow-lg border-0 overflow-hidden">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle>Giao dịch gần đây</CardTitle>
                    <Button 
                      variant="outline" 
                      className="text-[#00B4DB] border-[#00B4DB] hover:bg-[#00B4DB]/10"
                      onClick={() => router.push('/wallet/history')}
                    >
                      Xem tất cả
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {transactionsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00B4DB]"></div>
                      </div>
                    ) : recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'deposit' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{transaction.description}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500">{transaction.date}</p>
                                {getStatusBadge(transaction.status)}
                              </div>
                            </div>
                          </div>
                          <span className={`font-medium ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Chưa có giao dịch nào
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form nạp tiền */}
            <div>
              <RechargeForm onSuccess={handleRechargeSuccess} />
              
              {/* Tips and help section */}
              <Card className="bg-white/90 shadow-md border-0 overflow-hidden mt-6">
                <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-400 text-white">
                  <CardTitle className="text-lg">Mẹo sử dụng ví FinTrip</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="bg-amber-100 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      Nạp tiền trước chuyến đi để được hưởng ưu đãi đặc biệt
                    </li>
                    <li className="flex items-start">
                      <span className="bg-amber-100 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      Thanh toán qua ví FinTrip để tích điểm và đổi quà
                    </li>
                    <li className="flex items-start">
                      <span className="bg-amber-100 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      Kiểm tra lịch sử giao dịch thường xuyên để quản lý chi tiêu
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 