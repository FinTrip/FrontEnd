"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/page/components/ui/card";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Wallet, ArrowRight, Banknote, CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface RechargeFormProps {
  onSuccess: (amount: number) => void;
}

const PRESET_AMOUNTS = [
  { value: 50000, label: "50.000đ" },
  { value: 100000, label: "100.000đ" },
  { value: 500000, label: "500.000đ" },
];

export default function RechargeForm({ onSuccess }: RechargeFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<string>("preset_50000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra đăng nhập
    if (!token) {
      setError("Vui lòng đăng nhập để nạp tiền");
      return;
    }

    // Xác định số tiền cần nạp
    let amountToRecharge = 0;
    if (selectedAmount === "custom") {
      // Xử lý số tiền tùy chọn
      const parsedAmount = parseInt(customAmount.replace(/\D/g, ""), 10);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Vui lòng nhập số tiền hợp lệ");
        return;
      }
      if (parsedAmount < 10000) {
        setError("Số tiền nạp tối thiểu là 10.000đ");
        return;
      }
      if (parsedAmount > 50000000) {
        setError("Số tiền nạp tối đa là 50.000.000đ");
        return;
      }
      amountToRecharge = parsedAmount;
    } else {
      // Xử lý số tiền cố định
      const presetValue = selectedAmount.split("_")[1];
      amountToRecharge = parseInt(presetValue, 10);
    }

    setIsSubmitting(true);

    try {
      // Gọi API để tạo giao dịch nạp tiền
      const response = await fetch("http://localhost:8081/indentity/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amountToRecharge,
          description: "Nạp tiền vào ví",
          returnUrl: "http://localhost:3000/wallet",
          cancelUrl: "http://localhost:3000/wallet"
        })
      });
      
      const data = await response.json();
      if (response.ok && data.code === 200) {
        // Nếu thành công, gọi hàm onSuccess với số tiền
        onSuccess(amountToRecharge);
        
        // Chuyển hướng đến URL thanh toán
        if (data.result?.checkoutUrl) {
          console.log("Redirecting to checkout URL:", data.result.checkoutUrl);
          window.location.href = data.result.checkoutUrl;
        } else {
          toast.error("Không nhận được URL thanh toán từ máy chủ");
        }
      } else {
        // Hiển thị lỗi từ server
        setError(data.message || "Có lỗi xảy ra khi nạp tiền");
      }

      // Tạm thời để demo nếu API chưa sẵn sàng
      if (process.env.NODE_ENV === 'development' && !data.result?.checkoutUrl) {
        setTimeout(() => {
          onSuccess(amountToRecharge);
          toast("Chức năng thanh toán đang được phát triển. Đây là bản demo.");
        }, 1000);
      }

    } catch (error) {
      console.error("Lỗi khi nạp tiền:", error);
      setError("Đã xảy ra lỗi khi xử lý giao dịch. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Định dạng số tiền khi nhập
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value) {
      const formattedValue = parseInt(value, 10).toLocaleString("vi-VN");
      setCustomAmount(formattedValue);
    } else {
      setCustomAmount("");
    }
    // Tự động chọn "Số tiền khác" khi người dùng nhập
    setSelectedAmount("custom");
  };

  // Xử lý chọn mức tiền
  const handleSelectAmount = (value: string) => {
    setSelectedAmount(value);
  };

  // If not authenticated, show a message
  if (!token) {
    return (
      <Card className="bg-white/90 shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] text-white">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Nạp tiền vào ví
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <Wallet className="h-10 w-10 text-[#00B4DB]" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Vui lòng đăng nhập</h3>
            <p className="text-gray-600 mb-4">Đăng nhập để nạp tiền vào ví FinTrip của bạn</p>
            <Button 
              className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:opacity-90 text-white"
              onClick={() => router.push("/page/auth/login")}
            >
              Đăng nhập ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#00B4DB] to-[#0083B0] text-white">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Nạp tiền vào ví
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          <div className="text-center mb-2">
            <div className="inline-block p-3 bg-[#f0f9ff] rounded-full mb-3">
              <Banknote className="h-6 w-6 text-[#00B4DB]" />
            </div>
            <h3 className="font-medium text-gray-800 text-lg">Chọn số tiền nạp</h3>
            <p className="text-gray-500 text-sm">Chọn số tiền hoặc nhập số tiền tùy chỉnh</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <div 
                key={amount.value}
                className={`relative cursor-pointer rounded-lg ${
                  selectedAmount === `preset_${amount.value}` 
                    ? 'bg-[#e0f2fe] border-[#00B4DB] border-2' 
                    : 'bg-gray-50 border border-gray-200 hover:border-[#00B4DB]/50'
                }`}
                onClick={() => handleSelectAmount(`preset_${amount.value}`)}
              >
                <input
                  type="radio"
                  id={`preset_${amount.value}`}
                  name="amount"
                  className="sr-only"
                  checked={selectedAmount === `preset_${amount.value}`}
                  onChange={() => handleSelectAmount(`preset_${amount.value}`)}
                />
                <label 
                  htmlFor={`preset_${amount.value}`}
                  className="flex flex-col items-center p-4 cursor-pointer"
                >
                  <span className={`text-lg font-medium ${selectedAmount === `preset_${amount.value}` ? 'text-[#00B4DB]' : 'text-gray-700'}`}>
                    {amount.label}
                  </span>
                </label>
                {selectedAmount === `preset_${amount.value}` && (
                  <div className="absolute -top-2 -right-2 bg-[#00B4DB] text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div 
            className={`relative cursor-pointer rounded-lg ${
              selectedAmount === "custom" 
                ? 'bg-[#e0f2fe] border-[#00B4DB] border-2 p-4' 
                : 'bg-gray-50 border border-gray-200 hover:border-[#00B4DB]/50 p-4'
            }`}
            onClick={() => handleSelectAmount("custom")}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="custom"
                name="amount"
                className="h-4 w-4 text-[#00B4DB] focus:ring-[#00B4DB] mr-2"
                checked={selectedAmount === "custom"}
                onChange={() => handleSelectAmount("custom")}
              />
              <Label 
                htmlFor="custom"
                className={`font-medium cursor-pointer ${selectedAmount === "custom" ? 'text-[#00B4DB]' : 'text-gray-700'}`}
              >
                Số tiền khác
              </Label>
            </div>
            <div className="relative">
              <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                id="customAmount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Nhập số tiền VND"
                className={`pl-10 ${selectedAmount === "custom" ? 'border-[#00B4DB] focus:ring-[#00B4DB]/30' : 'border-gray-200'}`}
                disabled={selectedAmount !== "custom"}
                autoFocus={selectedAmount === "custom"}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Số tiền nạp tối thiểu: 10.000đ - tối đa: 50.000.000đ
            </p>
          </div>

          <div className="bg-[#f0f9ff] p-4 rounded-lg border border-[#e0f2fe]">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-[#00B4DB]" />
              Phương thức thanh toán
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="banking"
                name="paymentMethod"
                className="h-4 w-4 text-[#00B4DB] focus:ring-[#00B4DB]"
                checked={true}
                readOnly
              />
              <Label htmlFor="banking" className="font-normal cursor-pointer">
                Ngân hàng / Ví điện tử
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Bạn sẽ được chuyển đến cổng thanh toán an toàn sau khi xác nhận
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t p-4">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:opacity-90 text-white py-6 rounded-xl shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Đang xử lý giao dịch</span>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              </>
            ) : (
              <>
                <span className="mr-2">Xác nhận nạp tiền</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 