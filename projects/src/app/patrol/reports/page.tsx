'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { getStorageData, setStorageData } from '@/lib/storage';
import { useCityFilter } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { FileDown, Printer, Search } from 'lucide-react';

// 巡查报告类型
interface PatrolReport {
  id: string;
  date: string;
  inspector: string;
  region: string;
  city: string;
  type: string;
  locations: number;
  issues: number;
  status: string;
  summary: string;
}

// 初始报告数据
const initialReports: PatrolReport[] = [
  {
    id: 'XC-2026-001',
    date: '2026-06-09',
    inspector: '省级巡查员A',
    region: '蚌埠市怀远县',
    city: '蚌埠市',
    type: '随机抽查',
    locations: 5,
    issues: 2,
    status: '已完成',
    summary: '抽查地块5块，发现疑似撂荒问题2处',
  },
  {
    id: 'XC-2026-002',
    date: '2026-06-08',
    inspector: '省级巡查员B',
    region: '阜阳市临泉县',
    city: '阜阳市',
    type: '定点抽查',
    locations: 3,
    issues: 1,
    status: '已完成',
    summary: '抽查地块3块，发现疑似割青问题1处',
  },
  {
    id: 'XC-2026-003',
    date: '2026-06-07',
    inspector: '省级巡查员C',
    region: '宿州市埇桥区',
    city: '宿州市',
    type: '随机抽查',
    locations: 4,
    issues: 0,
    status: '已完成',
    summary: '抽查地块4块，未发现问题',
  },
  {
    id: 'XC-2026-004',
    date: '2026-06-06',
    inspector: '省级巡查员A',
    region: '合肥市肥西县',
    city: '合肥市',
    type: '专项检查',
    locations: 6,
    issues: 3,
    status: '已完成',
    summary: '专项检查高标准农田6块，发现问题3处',
  },
  {
    id: 'XC-2026-005',
    date: '2026-06-05',
    inspector: '省级巡查员D',
    region: '滁州市定远县',
    city: '滁州市',
    type: '随机抽查',
    locations: 4,
    issues: 1,
    status: '已完成',
    summary: '抽查地块4块，发现非粮化问题1处',
  },
  {
    id: 'XC-2026-006',
    date: '2026-06-04',
    inspector: '省级巡查员B',
    region: '蚌埠市固镇县',
    city: '蚌埠市',
    type: '定点抽查',
    locations: 3,
    issues: 0,
    status: '已完成',
    summary: '抽查地块3块，未发现问题',
  },
  {
    id: 'XC-2026-007',
    date: '2026-06-03',
    inspector: '省级巡查员C',
    region: '阜阳市太和县',
    city: '阜阳市',
    type: '随机抽查',
    locations: 5,
    issues: 2,
    status: '已完成',
    summary: '抽查地块5块，发现撂荒问题2处',
  },
];

const STORAGE_KEY = 'patrol-reports';

export default function PatrolReportsPage() {
  const userCity = useCityFilter();
  const [reports, setReports] = useState<PatrolReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState<PatrolReport | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 从localStorage初始化数据
  useEffect(() => {
    const stored = getStorageData<PatrolReport[]>(STORAGE_KEY, initialReports);
    setReports(stored);
  }, []);

  // 按城市过滤
  const cityFilteredReports = userCity ? reports.filter(r => r.city === userCity) : reports;

  // 筛选
  const filteredReports = cityFilteredReports.filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.region.includes(searchTerm) ||
      report.inspector.includes(searchTerm);
    const matchesRegion = filterRegion === 'all' || report.region.includes(filterRegion);
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesRegion && matchesType;
  });

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置筛选
  const handleReset = () => {
    setSearchTerm('');
    setFilterRegion('all');
    setFilterType('all');
    setCurrentPage(1);
  };

  // 导出报告
  const handleExport = () => {
    toast.success('导出成功', { description: `已导出${filteredReports.length}条巡查报告` });
  };

  // 打印
  const handlePrint = () => {
    toast.success('打印任务已发送', { description: '请在打印机处查收' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="巡查报告查询"
        description="查询和导出省级巡查报告"
      />

      {/* 筛选条件 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索报告编号、区域、巡查员..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={filterRegion} onValueChange={(v) => { setFilterRegion(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择地区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部地区</SelectItem>
                <SelectItem value="合肥市">合肥市</SelectItem>
                <SelectItem value="芜湖市">芜湖市</SelectItem>
                <SelectItem value="蚌埠市">蚌埠市</SelectItem>
                <SelectItem value="淮南市">淮南市</SelectItem>
                <SelectItem value="马鞍山市">马鞍山市</SelectItem>
                <SelectItem value="淮北市">淮北市</SelectItem>
                <SelectItem value="铜陵市">铜陵市</SelectItem>
                <SelectItem value="安庆市">安庆市</SelectItem>
                <SelectItem value="黄山市">黄山市</SelectItem>
                <SelectItem value="滁州市">滁州市</SelectItem>
                <SelectItem value="阜阳市">阜阳市</SelectItem>
                <SelectItem value="宿州市">宿州市</SelectItem>
                <SelectItem value="六安市">六安市</SelectItem>
                <SelectItem value="亳州市">亳州市</SelectItem>
                <SelectItem value="池州市">池州市</SelectItem>
                <SelectItem value="宣城市">宣城市</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="抽查类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="随机抽查">随机抽查</SelectItem>
                <SelectItem value="定点抽查">定点抽查</SelectItem>
                <SelectItem value="专项检查">专项检查</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{cityFilteredReports.length}</div>
            <div className="text-sm text-muted-foreground">报告总数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {cityFilteredReports.reduce((sum, r) => sum + r.locations, 0)}
            </div>
            <div className="text-sm text-muted-foreground">抽查地块数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#F56C6C]">
              {cityFilteredReports.reduce((sum, r) => sum + r.issues, 0)}
            </div>
            <div className="text-sm text-muted-foreground">发现问题数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#67C23A]">
              {cityFilteredReports.filter((r) => r.issues === 0).length}
            </div>
            <div className="text-sm text-muted-foreground">无问题报告数</div>
          </CardContent>
        </Card>
      </div>

      {/* 报告列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>巡查报告列表</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              导出报告
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              打印
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedReports.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              暂无匹配的巡查报告
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>报告编号</TableHead>
                    <TableHead>巡查日期</TableHead>
                    <TableHead>巡查员</TableHead>
                    <TableHead>巡查区域</TableHead>
                    <TableHead>抽查类型</TableHead>
                    <TableHead>抽查地块</TableHead>
                    <TableHead>发现问题</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.inspector}</TableCell>
                      <TableCell>{report.region}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{report.locations}块</TableCell>
                      <TableCell>
                        {report.issues > 0 ? (
                          <Badge className="bg-[#F56C6C]">{report.issues}个</Badge>
                        ) : (
                          <Badge className="bg-[#67C23A]">无</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#67C23A]">{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" onClick={() => setSelectedReport(report)}>
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 报告详情弹窗 */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>巡查报告详情 - {selectedReport?.id}</DialogTitle>
            <DialogDescription>查看巡查报告的详细信息</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查日期</div>
                  <div className="font-medium">{selectedReport.date}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查人员</div>
                  <div className="font-medium">{selectedReport.inspector}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查区域</div>
                  <div className="font-medium">{selectedReport.region}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">抽查类型</div>
                  <div className="font-medium">{selectedReport.type}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">巡查摘要</div>
                <div className="p-3 bg-muted rounded-lg">{selectedReport.summary}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold">{selectedReport.locations}</div>
                    <div className="text-sm text-muted-foreground">抽查地块</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-[#F56C6C]">{selectedReport.issues}</div>
                    <div className="text-sm text-muted-foreground">发现问题</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-[#67C23A]">
                      {selectedReport.locations - selectedReport.issues}
                    </div>
                    <div className="text-sm text-muted-foreground">正常地块</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
