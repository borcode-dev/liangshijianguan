'use client';

import { useState, useEffect } from 'react';
import {
  PageHeader,
  ProblemTypeBadge,
  ReviewDetailDialog,
  CloseCaseDialog,
} from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { caseReviews as mockReviews } from '@/lib/data/mock-data';
import { useCityFilter, filterByCityWithCity } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, FileCheck } from 'lucide-react';
import type { InspectionTask, ProblemType } from '@/types';

const STORAGE_KEY = 'closed-loop-review-data';

// 结案审核项类型
interface CaseReviewItem {
  id: string;
  eventNo: string;
  type: ProblemType;
  location: string;
  city?: string;
  completeDate: string;
  effect: string;
  status: '待审核' | '已通过' | '已退回';
  rejectReason?: string;
  reviewOpinion?: string;
}

export default function CaseReviewPage() {
  const userCity = useCityFilter();
  const [reviewList, setReviewList] = useState<CaseReviewItem[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [selectedCase, setSelectedCase] = useState<{ id: string; spotNo: string; type: string; status: string } | null>(null);
  const [selectedReview, setSelectedReview] = useState<CaseReviewItem | null>(null);

  // 审核表单
  const [auditEffect, setAuditEffect] = useState('good');
  const [auditOpinion, setAuditOpinion] = useState('');

  // 初始化数据
  useEffect(() => {
    const stored = getStorageData<CaseReviewItem[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      setReviewList(stored);
    } else {
      setReviewList(filterByCityWithCity(mockReviews as CaseReviewItem[], userCity));
      setStorageData(STORAGE_KEY, filterByCityWithCity(mockReviews as CaseReviewItem[], userCity));
    }
  }, []);

  const pendingReviews = reviewList.filter(r => r.status === '待审核');
  const passedReviews = reviewList.filter(r => r.status === '已通过');
  const rejectedReviews = reviewList.filter(r => r.status === '已退回');

  // 打开审核弹窗
  const handleReview = (item: CaseReviewItem) => {
    setSelectedReview(item);
    setAuditEffect('good');
    setAuditOpinion('');
    setShowAuditDialog(true);
  };

  // 打开审核详情弹窗（使用ReviewDetailDialog）
  const handleReviewDetail = (item: CaseReviewItem) => {
    const task: InspectionTask = {
      id: item.id,
      taskNo: `RW-${item.eventNo}`,
      spotNo: item.eventNo,
      eventNo: item.eventNo,
      type: item.type,
      location: item.location,
      city: item.city || '',
      area: 0,
      deadline: item.completeDate,
      status: '已完成' as const,
      assignTime: item.completeDate,
      inspector: '张三',
      overdue: false,
      overdueDays: 0,
    };
    setSelectedTask(task);
    setShowReviewDialog(true);
  };

  // 打开结案弹窗
  const handleClose = (item: CaseReviewItem) => {
    setSelectedCase({
      id: item.id,
      spotNo: item.eventNo,
      type: item.type,
      status: item.status,
    });
    setShowCloseDialog(true);
  };

  // 审核通过
  const handleApprove = () => {
    if (!selectedReview) return;

    const updatedList = reviewList.map(r => {
      if (r.id === selectedReview.id) {
        return {
          ...r,
          status: '已通过' as const,
          reviewOpinion: auditOpinion || '审核通过',
        };
      }
      return r;
    });

    setReviewList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setShowReviewDialog(false);
    setShowAuditDialog(false);
    toast.success('审核通过', { description: `${selectedReview.eventNo} 已通过审核` });
  };

  // 审核退回
  const handleReject = (reason: string) => {
    if (!selectedReview) return;

    const updatedList = reviewList.map(r => {
      if (r.id === selectedReview.id) {
        return {
          ...r,
          status: '已退回' as const,
          rejectReason: reason,
        };
      }
      return r;
    });

    setReviewList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setShowReviewDialog(false);
    setShowAuditDialog(false);
    toast.success('已退回', { description: `${selectedReview.eventNo} 已退回：${reason}` });
  };

  // 提交审核（通过/退回）
  const handleSubmitAudit = (pass: boolean) => {
    if (!selectedReview) return;

    if (pass) {
      const updatedList = reviewList.map(r => {
        if (r.id === selectedReview.id) {
          return {
            ...r,
            status: '已通过' as const,
            reviewOpinion: auditOpinion || '审核通过',
          };
        }
        return r;
      });
      setReviewList(updatedList);
      setStorageData(STORAGE_KEY, updatedList);
      setShowAuditDialog(false);
      toast.success('审核通过', { description: `${selectedReview.eventNo} 已通过审核` });
    } else {
      if (!auditOpinion) {
        toast.error('请填写退回原因');
        return;
      }
      const updatedList = reviewList.map(r => {
        if (r.id === selectedReview.id) {
          return {
            ...r,
            status: '已退回' as const,
            rejectReason: auditOpinion,
          };
        }
        return r;
      });
      setReviewList(updatedList);
      setStorageData(STORAGE_KEY, updatedList);
      setShowAuditDialog(false);
      toast.success('已退回', { description: `${selectedReview.eventNo} 已退回` });
    }
  };

  // 结案确认
  const handleCloseConfirm = (data: { remark: string }) => {
    if (!selectedCase) return;

    const updatedList = reviewList.map(r => {
      if (r.id === selectedCase.id) {
        return {
          ...r,
          status: '已通过' as const,
          reviewOpinion: data.remark || '结案确认',
        };
      }
      return r;
    });

    setReviewList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setShowCloseDialog(false);
    toast.success('结案成功', { description: `${selectedCase.spotNo} 已完成结案` });
  };

  // 批量通过
  const handleBatchApprove = () => {
    if (pendingReviews.length === 0) {
      toast.error('暂无待审核项');
      return;
    }
    const updatedList = reviewList.map(r => {
      if (r.status === '待审核') {
        return { ...r, status: '已通过' as const, reviewOpinion: '批量审核通过' };
      }
      return r;
    });
    setReviewList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    toast.success('批量审核通过', { description: `已通过 ${pendingReviews.length} 条审核` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="结案审核"
        description="对整改完成的事件进行结案审核，确认整改效果"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBatchApprove}>批量通过</Button>
          </div>
        }
      />

      {/* 状态统计 */}
      <div className="flex gap-4">
        <Badge variant="outline" className="px-4 py-2">
          待审核 <span className="ml-1 font-bold text-warning">{pendingReviews.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 border-success text-success">
          已通过 <span className="ml-1 font-bold">{passedReviews.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 border-destructive text-destructive">
          已退回 <span className="ml-1 font-bold">{rejectedReviews.length}</span>
        </Badge>
      </div>

      {/* 任务列表 */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">待审核 ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="passed">已通过 ({passedReviews.length})</TabsTrigger>
          <TabsTrigger value="rejected">已退回 ({rejectedReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pendingReviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件编号</TableHead>
                      <TableHead>事件类型</TableHead>
                      <TableHead>发生地点</TableHead>
                      <TableHead>整改完成</TableHead>
                      <TableHead>整改效果</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReviews.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={item.type} />
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.completeDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.effect === '良好' ? 'default' :
                              item.effect === '一般' ? 'secondary' : 'destructive'
                            }
                          >
                            {item.effect}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReview(item)}
                          >
                            <FileCheck className="mr-2 h-4 w-4" />
                            审核
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileCheck className="mb-2 h-10 w-10" />
                  <p>暂无待审核项</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passed">
          <Card>
            <CardContent className="pt-6">
              {passedReviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件编号</TableHead>
                      <TableHead>事件类型</TableHead>
                      <TableHead>发生地点</TableHead>
                      <TableHead>审核时间</TableHead>
                      <TableHead>整改效果</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passedReviews.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={item.type} />
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.completeDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-success border-success">
                            {item.effect}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleClose(item)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            结案
                          </Button>
                          <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleReviewDetail(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle className="mb-2 h-10 w-10" />
                  <p>暂无已通过项</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="pt-6">
              {rejectedReviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件编号</TableHead>
                      <TableHead>事件类型</TableHead>
                      <TableHead>发生地点</TableHead>
                      <TableHead>退回时间</TableHead>
                      <TableHead>退回原因</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedReviews.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={item.type} />
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.completeDate}</TableCell>
                        <TableCell className="text-destructive">{item.rejectReason || '整改不到位'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleReviewDetail(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <XCircle className="mb-2 h-10 w-10" />
                  <p>暂无已退回记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 审核弹窗 */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>结案审核</DialogTitle>
            <DialogDescription>审核整改完成情况，确认是否通过</DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6">
              {/* 事件信息 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">事件编号</span>
                  <p className="font-medium">{selectedReview.eventNo}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">问题类型</span>
                  <ProblemTypeBadge type={selectedReview.type} />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">发生地点</span>
                  <p>{selectedReview.location}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">整改完成时间</span>
                  <p>{selectedReview.completeDate}</p>
                </div>
              </div>

              {/* 整改效果评价 */}
              <div className="space-y-4">
                <Label>整改效果评价</Label>
                <RadioGroup value={auditEffect} onValueChange={setAuditEffect} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="audit-good" />
                    <Label htmlFor="audit-good" className="text-success cursor-pointer">良好</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="audit-normal" />
                    <Label htmlFor="audit-normal" className="cursor-pointer">一般</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="audit-poor" />
                    <Label htmlFor="audit-poor" className="text-destructive cursor-pointer">较差</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 审核意见 */}
              <div className="space-y-2">
                <Label>审核意见</Label>
                <Textarea
                  placeholder="请输入审核意见..."
                  rows={3}
                  value={auditOpinion}
                  onChange={(e) => setAuditOpinion(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
              取消
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => handleSubmitAudit(false)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                退回
              </Button>
              <Button
                className="bg-success hover:bg-success/90"
                onClick={() => handleSubmitAudit(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                通过
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审核详情弹窗 */}
      <ReviewDetailDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        task={selectedTask}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* 结案确认弹窗 */}
      <CloseCaseDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        task={selectedCase}
        onClose={handleCloseConfirm}
      />
    </div>
  );
}
