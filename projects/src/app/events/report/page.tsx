'use client';

import { useState, useEffect } from 'react';
import { PageHeader, StatusBadge, ProblemTypeBadge } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { events as mockEvents } from '@/lib/data/mock-data';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';
import { Plus, Eye, Camera, MapPin } from 'lucide-react';
import type { Event, EventStatus } from '@/types';

const STORAGE_KEY = 'events-report-data';
const PAGE_SIZE = 10;

const statusTabs: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '待受理', label: '待受理' },
  { value: '待核查', label: '待核查' },
  { value: '核查中', label: '核查中' },
  { value: '待审核', label: '待审核' },
  { value: '已结案', label: '已结案' },
  { value: '已驳回', label: '已驳回' },
];

export default function EventReportPage() {
  const [eventList, setEventList] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 表单状态
  const [formType, setFormType] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCounty, setFormCounty] = useState('');
  const [formTown, setFormTown] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReporter, setFormReporter] = useState('');
  const [formPhone, setFormPhone] = useState('');

  // 初始化数据
  useEffect(() => {
    const stored = getStorageData<Event[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      setEventList(stored);
    } else {
      setEventList(mockEvents);
      setStorageData(STORAGE_KEY, mockEvents);
    }
  }, []);

  // 过滤事件
  const filteredEvents = eventList.filter(
    (event) => activeTab === 'all' || event.status === activeTab
  );

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 重置表单
  const resetForm = () => {
    setFormType('');
    setFormTime('');
    setFormCity('');
    setFormCounty('');
    setFormTown('');
    setFormAddress('');
    setFormArea('');
    setFormDescription('');
    setFormReporter('');
    setFormPhone('');
  };

  // 提交上报
  const handleSubmit = () => {
    if (!formType || !formTime || !formCity || !formAddress || !formDescription || !formReporter || !formPhone) {
      toast.error('请填写所有必填项');
      return;
    }

    const newEvent: Event = {
      id: generateId(),
      eventNo: generateNo('SJ'),
      eventType: formType as Event['eventType'],
      location: formAddress,
      city: formCity,
      county: formCounty,
      town: formTown,
      reportTime: formTime.replace('T', ' '),
      reporter: formReporter,
      reporterPhone: formPhone,
      area: parseFloat(formArea) || 0,
      description: formDescription,
      status: '待受理',
      photos: [],
      coordinate: { lng: 117.2272, lat: 31.8206 },
    };

    const updatedList = [newEvent, ...eventList];
    setEventList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setIsDialogOpen(false);
    resetForm();
    toast.success('事件上报成功', { description: `事件编号：${newEvent.eventNo}` });
  };

  // 查看详情
  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="事件上报"
        description="支持基层人员通过系统或移动端上报粮食安全违规事件"
        actions={
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            新增上报
          </Button>
        }
      />

      {/* 新增上报弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增事件上报</DialogTitle>
            <DialogDescription>
              填写违规事件信息，提交后将由相关部门进行核查处理
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 事件基本信息 */}
            <div className="space-y-4">
              <h4 className="font-medium">事件基本信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>事件类型 *</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择事件类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="疑似割青">违规割青</SelectItem>
                      <SelectItem value="撂荒">撂荒</SelectItem>
                      <SelectItem value="焚烧秸秆">焚烧秸秆</SelectItem>
                      <SelectItem value="非粮化">非粮化</SelectItem>
                      <SelectItem value="种植计划未落实">种植计划未落实</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>发生时间 *</Label>
                  <Input type="datetime-local" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>市 *</Label>
                  <Select value={formCity} onValueChange={setFormCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择市" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="蚌埠市">蚌埠市</SelectItem>
                      <SelectItem value="阜阳市">阜阳市</SelectItem>
                      <SelectItem value="宿州市">宿州市</SelectItem>
                      <SelectItem value="合肥市">合肥市</SelectItem>
                      <SelectItem value="滁州市">滁州市</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>县</Label>
                  <Select value={formCounty} onValueChange={setFormCounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择县" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="怀远县">怀远县</SelectItem>
                      <SelectItem value="临泉县">临泉县</SelectItem>
                      <SelectItem value="埇桥区">埇桥区</SelectItem>
                      <SelectItem value="肥西县">肥西县</SelectItem>
                      <SelectItem value="定远县">定远县</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>乡镇</Label>
                  <Select value={formTown} onValueChange={setFormTown}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择乡镇" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="龙亢镇">龙亢镇</SelectItem>
                      <SelectItem value="鲖城镇">鲖城镇</SelectItem>
                      <SelectItem value="大店镇">大店镇</SelectItem>
                      <SelectItem value="上派镇">上派镇</SelectItem>
                      <SelectItem value="藕塘镇">藕塘镇</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>详细地址 *</Label>
                <Input
                  placeholder="请输入详细地址"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>涉及面积（亩）</Label>
                <Input
                  type="number"
                  placeholder="请输入涉及面积"
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                />
              </div>
            </div>

            {/* 事件描述 */}
            <div className="space-y-4">
              <h4 className="font-medium">事件描述</h4>
              <Textarea
                placeholder="请详细描述事件情况、涉及地块、作物状态等..."
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            {/* 现场照片 */}
            <div className="space-y-4">
              <h4 className="font-medium">现场照片</h4>
              <div className="grid gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary"
                  >
                    <div className="text-center text-muted-foreground">
                      <Camera className="mx-auto h-6 w-6" />
                      <span className="text-xs">上传照片</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                照片将自动添加时间水印和GPS坐标
              </p>
            </div>

            {/* 上报人信息 */}
            <div className="space-y-4">
              <h4 className="font-medium">上报人信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>上报人 *</Label>
                  <Input
                    placeholder="请输入姓名"
                    value={formReporter}
                    onChange={(e) => setFormReporter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>联系电话 *</Label>
                  <Input
                    type="tel"
                    placeholder="请输入手机号"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  GPS坐标：117.1234°E, 33.4567°N（自动获取）
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>提交上报</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>事件详情</DialogTitle>
            <DialogDescription>查看事件上报的详细信息</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">事件编号</div>
                  <div className="font-medium">{selectedEvent.eventNo}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">事件类型</div>
                  <ProblemTypeBadge type={selectedEvent.eventType} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">当前状态</div>
                  <StatusBadge status={selectedEvent.status as EventStatus} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">涉及面积</div>
                  <div className="font-medium">{selectedEvent.area} 亩</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">发生地点</div>
                <div className="font-medium">{selectedEvent.location}</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">上报时间</div>
                  <div className="font-medium">{selectedEvent.reportTime}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">上报人</div>
                  <div className="font-medium">{selectedEvent.reporter}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">联系电话</div>
                <div className="font-medium">{selectedEvent.reporterPhone}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">事件描述</div>
                <div className="text-sm">{selectedEvent.description}</div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  坐标：{selectedEvent.coordinate.lng}°E, {selectedEvent.coordinate.lat}°N
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 状态标签页 */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {paginatedEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件编号</TableHead>
                      <TableHead>事件类型</TableHead>
                      <TableHead>发生地点</TableHead>
                      <TableHead>上报时间</TableHead>
                      <TableHead>上报人</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={event.eventType} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {event.location}
                        </TableCell>
                        <TableCell>{event.reportTime}</TableCell>
                        <TableCell>{event.reporter}</TableCell>
                        <TableCell>
                          <StatusBadge status={event.status as EventStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleView(event)}>
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
                  <Eye className="mb-2 h-10 w-10" />
                  <p>暂无数据</p>
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="border-t px-4 py-3">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
