"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTrash,
  FaTimes,
  FaGlobe,
  FaSuitcaseRolling,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Plan {
  schedule_id: number;
  schedule_name: string;
  province: string;
  start_date: string;
  end_date: string;
  activity_count: number;
  img_origin?: string;
}

interface User {
  id: string | number;
}

interface AuthContext {
  user: User | null;
  token: string | null;
}

const SavedPlans: React.FC = () => {
  const { user, token } = useAuth() as AuthContext;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/recommend/saved-schedules/?user_id=${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setPlans(response.data);
      } else {
        throw new Error("Không thể tải danh sách kế hoạch.");
      }
    } catch (err: unknown) {
      toast.error("Lỗi khi tải danh sách kế hoạch.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend/login-user/",
        { email, password },
        { withCredentials: true }
      );
      if (response.data.message === "Đăng nhập thành công") {
        setShowLoginModal(false);
        setLoginError(null);
        toast.success("Đăng nhập thành công!");
        fetchPlans();
      } else {
        setLoginError("Đăng nhập thất bại");
      }
    } catch (err: unknown) {
      setLoginError("Lỗi khi đăng nhập");
      toast.error("Lỗi khi đăng nhập");
    }
  };

  const handleDeletePlan = async (schedule_id: number) => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    try {
      await axios.post(
        "http://127.0.0.1:8000/recommend/delete-schedule/",
        { user_id: user?.id, schedule_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setPlans(plans.filter((plan) => plan.schedule_id !== schedule_id));
      toast.success("Xóa kế hoạch thành công!");
    } catch (err: unknown) {
      toast.error("Lỗi khi xóa kế hoạch.");
      console.error(err);
    } finally {
      setDeletePlanId(null);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#fef9f3] flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
              scale: {
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              },
            }}
            className="inline-block text-6xl text-[#d62828] mb-6"
          >
            <FaGlobe />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Đang tải kế hoạch
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="h-1 bg-[#1a936f] rounded-full max-w-xs mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fef9f3]">
      <Toaster />
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Đăng nhập</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a936f]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a936f]"
                  />
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <Button
                  onClick={handleLogin}
                  className="w-full bg-[#1a936f] hover:bg-[#114b5f] text-white"
                >
                  Đăng nhập
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deletePlanId !== null && (
          <AlertDialog open={true} onOpenChange={() => setDeletePlanId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Kế hoạch sẽ bị xóa vĩnh
                  viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeletePlan(deletePlanId)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-[#d62828] transition-colors"
            >
              <IoArrowBackOutline size={24} />
              <span>Quay lại</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Kế Hoạch Đã Lưu
              </h1>
            </div>
            <div className="invisible">
              <IoArrowBackOutline size={24} />
            </div>
          </div>
        </header>
        {!token ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
            <FaSuitcaseRolling className="text-5xl text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-600">
              Vui lòng đăng nhập để xem kế hoạch đã lưu
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="mt-4 bg-[#1a936f] hover:bg-[#114b5f] text-white"
            >
              Đăng nhập
            </Button>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.schedule_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              >
                <div className="relative h-40 w-full mb-4">
                  <Image
                    src={plan.img_origin || "/placeholder.svg"}
                    alt={plan.schedule_name}
                    fill
                    className="object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">{plan.schedule_name}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                  <FaMapMarkerAlt className="text-[#d62828]" />
                  <span>{plan.province}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <FaCalendarAlt className="text-[#d62828]" />
                  <span>{`${plan.start_date} - ${plan.end_date}`}</span>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  {plan.activity_count} hoạt động
                </div>
                <div className="flex justify-between gap-2">
                  <Link href={`/plan/${plan.schedule_id}`}>
                    <Button
                      variant="outline"
                      className="border-[#1a936f] text-[#1a936f] hover:bg-[#1a936f] hover:text-white"
                    >
                      Xem chi tiết
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => setDeletePlanId(plan.schedule_id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <FaTrash size={12} className="mr-1" />
                    Xóa
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
            <FaSuitcaseRolling className="text-5xl text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-600">
              Chưa có kế hoạch nào được lưu
            </p>
            <p className="text-gray-500 mt-2">
              Hãy tạo và lưu kế hoạch du lịch của bạn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPlans;
