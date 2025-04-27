"use client";

import { useEffect, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { toast as sonnerToast } from "sonner";

interface PostReport {
  id: number;
  reason: string;
  createdAt: string;
  status: string;
  adminNote?: string;
  reporter: {
    id: number;
    fullName: string | null;
    email: string;
  };
  reportedPost: {
    id: number;
    title: string;
    author: {
      id: number;
      fullName: string | null;
      email: string;
    };
  };
  processedBy?: {
    id: number;
    fullName: string | null;
    email: string;
  };
}

interface UserReport {
  id: number;
  reason: string;
  createdAt: string;
  status: string;
  adminNote?: string;
  reporter: {
    id: number;
    fullName: string | null;
    email: string;
  };
  reportedUser: {
    id: number;
    fullName: string | null;
    email: string;
    status: string;
  };
  processedBy?: {
    id: number;
    fullName: string | null;
    email: string;
  };
}

export default function ReportPage() {
  const [tab, setTab] = useState("post");
  const [postReports, setPostReports] = useState<PostReport[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const [processingId, setProcessingId] = useState<number|null>(null);
  const [processStatus, setProcessStatus] = useState<'APPROVED'|'REJECTED'>('APPROVED');
  const [processNote, setProcessNote] = useState("");
  const [processTakeAction, setProcessTakeAction] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const processInputRef = useRef<HTMLInputElement>(null);
  // Popup xem chi tiết lý do
  const [showReason, setShowReason] = useState<{open: boolean, content: string}>({open: false, content: ""});
  // Modal xử lý report
  const [processModal, setProcessModal] = useState<{open: boolean, id: number|null, type: 'post'|'user'}>({open: false, id: null, type: 'post'});
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    setError("");
    const fetchReports = async () => {
      try {
        const postRes = await fetch("http://localhost:8081/indentity/api/reports/admin/post-reports", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const postData = await postRes.json();
        if (postData.code === 200) setPostReports(postData.result);
        else setError(postData.message || "Không thể tải danh sách report");
        // Fetch user reports
        const userRes = await fetch("http://localhost:8081/indentity/api/reports/admin/user-reports", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        if (userData.code === 200) setUserReports(userData.result);
        else setError(userData.message || "Không thể tải danh sách report user");
      } catch {
        setError("Không thể tải danh sách report");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReports();
  }, [token]);

  // Xử lý report
  const handleProcessReport = async (reportId: number, type: 'post'|'user') => {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:8081/indentity/api/reports/admin/process/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: processStatus,
          adminNote: processNote,
          takeAction: processTakeAction,
        }),
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        toast.success("Xử lý thành công!");
        setProcessingId(null);
        setProcessNote("");
        setProcessTakeAction(true);
        // Reload lại danh sách
        if (token) {
          setLoading(true);
          setError("");
          const postRes = await fetch("http://localhost:8081/indentity/api/reports/admin/post-reports", {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          const postData = await postRes.json();
          if (postData.code === 200) setPostReports(postData.result);
          const userRes = await fetch("http://localhost:8081/indentity/api/reports/admin/user-reports", {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          const userData = await userRes.json();
          if (userData.code === 200) setUserReports(userData.result);
          setLoading(false);
        }
      } else {
        toast.error(data.message || "Không thể xử lý report");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xử lý report");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">List Report</h1>
      <Card className="p-4 shadow border border-gray-200 rounded-xl bg-white/95">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex gap-2 p-2 bg-gray-50 rounded-t-xl border-b border-gray-200 justify-start">
            <TabsTrigger value="post" className="px-4 py-2 rounded font-semibold data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Report Posts</TabsTrigger>
            <TabsTrigger value="user" className="px-4 py-2 rounded font-semibold data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Report Users</TabsTrigger>
          </TabsList>
          <TabsContent value="post">
            <div className="mb-4">
              <label className="font-medium text-gray-700 mr-2">Lọc trạng thái:</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã xử lý</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-center font-bold text-gray-700">ID</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Reporter</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Post</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Author</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Reason</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Day</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Đang tải...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-red-500 bg-red-50 py-8">{error}</TableCell></TableRow>
                ) : postReports.filter(r => statusFilter === 'ALL' || r.status === statusFilter).length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Không có report nào</TableCell></TableRow>
                ) : (
                  postReports.filter(r => statusFilter === 'ALL' || r.status === statusFilter).map((r) => (
                    <TableRow key={r.id} className="hover:bg-blue-50 transition-colors">
                      <TableCell className="text-center font-semibold text-gray-700">{r.id}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/forum/user/${r.reporter?.id}`} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                          {r.reporter?.fullName || r.reporter?.email}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center truncate max-w-[180px]">
                        <Link href={`/forum/posts/${r.reportedPost?.id}`} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                          {r.reportedPost?.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/forum/user/${r.reportedPost?.author?.id}`} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                          {r.reportedPost?.author?.fullName || r.reportedPost?.author?.email}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center text-gray-600 truncate max-w-[140px] cursor-pointer hover:underline" title={r.reason}
                        onClick={() => setShowReason({open: true, content: r.reason})}
                      >
                        {r.reason}
                      </TableCell>
                      <TableCell className="text-center text-gray-500">{new Date(r.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {r.status === 'PENDING' && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">Chờ duyệt</span>}
                        {r.status === 'APPROVED' && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">Đã xử lý</span>}
                        {r.status === 'REJECTED' && <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-bold">Từ chối</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.status === 'PENDING' && (
                          <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600" onClick={() => { setProcessModal({open: true, id: r.id, type: 'post'}); setProcessStatus('APPROVED'); setProcessNote(""); setProcessTakeAction(true); }}>Xử lý</button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="user">
            <div className="mb-4">
              <label className="font-medium text-gray-700 mr-2">Lọc trạng thái:</label>
              <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="border rounded px-2 py-1">
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã xử lý</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-center font-bold text-gray-700">ID</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Reporter</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Victim</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Status User</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Reason</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Day</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Đang tải...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-red-500 bg-red-50 py-8">{error}</TableCell></TableRow>
                ) : userReports.filter(r => userStatusFilter === 'ALL' || r.status === userStatusFilter).length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Không có report nào</TableCell></TableRow>
                ) : (
                  userReports.filter(r => userStatusFilter === 'ALL' || r.status === userStatusFilter).map((r) => (
                    <TableRow key={r.id} className="hover:bg-blue-50 transition-colors">
                      <TableCell className="text-center font-semibold text-gray-700">{r.id}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/forum/user/${r.reporter?.id}`} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                          {r.reporter?.fullName || r.reporter?.email}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/forum/user/${r.reportedUser?.id}`} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                          {r.reportedUser?.fullName || r.reportedUser?.email}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        {r.reportedUser?.status === 'active' && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">Hoạt động</span>}
                        {r.reportedUser?.status === 'banned' && <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-bold">Đã khóa</span>}
                        {r.reportedUser?.status === 'inactive' && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">Tạm ngưng</span>}
                      </TableCell>
                      <TableCell className="text-center text-gray-600 truncate max-w-[140px] cursor-pointer hover:underline" title={r.reason}
                        onClick={() => setShowReason({open: true, content: r.reason})}
                      >
                        {r.reason}
                      </TableCell>
                      <TableCell className="text-center text-gray-500">{new Date(r.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {r.status === 'PENDING' && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">Chờ duyệt</span>}
                        {r.status === 'APPROVED' && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">Đã xử lý</span>}
                        {r.status === 'REJECTED' && <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-bold">Từ chối</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.status === 'PENDING' && (
                          <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600" onClick={() => { setProcessModal({open: true, id: r.id, type: 'user'}); setProcessStatus('APPROVED'); setProcessNote(""); setProcessTakeAction(true); }}>Xử lý</button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
      {/* Popup xem chi tiết lý do */}
      {showReason.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Nội dung report</h2>
            <div className="text-gray-700 whitespace-pre-line break-words mb-4">{showReason.content}</div>
            <button className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600" onClick={() => setShowReason({open: false, content: ""})}>Đóng</button>
          </div>
        </div>
      )}
      {/* Modal xử lý report */}
      {processModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Xử lý report {processModal.type === 'post' ? 'bài viết' : 'người dùng'}</h2>
              <button className="text-gray-500 hover:text-red-500 text-xl font-bold" onClick={() => setProcessModal({open: false, id: null, type: 'post'})}>×</button>
            </div>
            <div className="mb-3">
              <label className="font-medium mr-2">Trạng thái:</label>
              <select value={processStatus} onChange={e => setProcessStatus(e.target.value as 'APPROVED'|'REJECTED')} className="border rounded px-2 py-1">
                <option value="APPROVED">Xác nhận</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="font-medium mr-2">Ghi chú:</label>
              <input ref={processInputRef} value={processNote} onChange={e => setProcessNote(e.target.value)} className="border rounded px-2 py-1 w-full" placeholder="Nhập ghi chú admin..." />
            </div>
            <div className="mb-3 flex items-center gap-2">
              <input type="checkbox" id="takeActionModal" checked={processTakeAction} onChange={e => setProcessTakeAction(e.target.checked)} />
              <label htmlFor="takeActionModal">Thực hiện hành động ({processModal.type === 'post' ? 'xóa bài viết' : 'ban user'})</label>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100" onClick={() => setProcessModal({open: false, id: null, type: 'post'})} disabled={isProcessing}>Hủy</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700" onClick={() => { if(processModal.id) handleProcessReport(processModal.id, processModal.type); setProcessModal({open: false, id: null, type: 'post'}); }} disabled={isProcessing}>{isProcessing ? 'Đang xử lý...' : 'Xác nhận'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 