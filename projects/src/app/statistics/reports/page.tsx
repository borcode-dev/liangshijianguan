'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';

// 报表模板类型
interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  frequency: string;
  lastGenerated: string;
  status: string;
}

// 已生成报表类型
interface GeneratedReport {
  id: string;
  templateName: string;
  period: string;
  generatedTime: string;
  generatedBy: string;
  format: string;
  size: string;
  status: string;
}

const STORAGE_KEY_TEMPLATES = 'report-templates';
const STORAGE_KEY_GENERATED = 'generated-reports';

// 初始报表模板
const initialTemplates: ReportTemplate[] = [
  {
    id: 'TPL-001',
    name: '月度监管统计报表',
    category: '统计报表',
    description: '包含图斑数量、处置情况、结案率等月度统计数据',
    frequency: '月报',
    lastGenerated: '2026-06-01',
    status: '已启用',
  },
  {
    id: 'TPL-002',
    name: '各市处置效率对比报表',
    category: '分析报表',
    description: '各市图斑处置效率、平均周期、结案率对比分析',
    frequency: '周报',
    lastGenerated: '2026-06-08',
    status: '已启用',
  },
  {
    id: 'TPL-003',
    name: '问题类型分析报表',
    category: '分析报表',
    description: '撂荒、割青、非粮化等问题类型分布及趋势分析',
    frequency: '月报',
    lastGenerated: '2026-06-01',
    status: '已启用',
  },
  {
    id: 'TPL-004',
    name: '巡查工作汇总报表',
    category: '工作报表',
    description: '省级巡查抽查记录、发现问题、处理情况汇总',
    frequency: '周报',
    lastGenerated: '2026-06-08',
    status: '已启用',
  },
  {
    id: 'TPL-005',
    name: '超期预警统计报表',
    category: '预警报表',
    description: '超期未处置图斑统计、责任单位分析',
    frequency: '日报',
    lastGenerated: '2026-06-09',
    status: '已启用',
  },
];

// 初始已生成报表
const initialGenerated: GeneratedReport[] = [
  {
    id: 'RPT-2026-06-001',
    templateName: '月度监管统计报表',
    period: '2026年5月',
    generatedTime: '2026-06-01 08:00',
    generatedBy: '系统自动',
    format: 'PDF',
    size: '2.3MB',
    status: '已生成',
  },
  {
    id: 'RPT-2026-06-002',
    templateName: '各市处置效率对比报表',
    period: '2026年第23周',
    generatedTime: '2026-06-08 08:00',
    generatedBy: '系统自动',
    format: 'Excel',
    size: '856KB',
    status: '已生成',
  },
  {
    id: 'RPT-2026-06-003',
    templateName: '问题类型分析报表',
    period: '2026年5月',
    generatedTime: '2026-06-01 08:30',
    generatedBy: '系统自动',
    format: 'PDF',
    size: '1.8MB',
    status: '已生成',
  },
];

export default function ReportsManagementPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'generated'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // 生成报表弹窗
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [generatePeriod, setGeneratePeriod] = useState('month');
  const [generateFormat, setGenerateFormat] = useState('pdf');

  // 新建模板弹窗
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateFrequency, setNewTemplateFrequency] = useState('月报');

  // 从localStorage初始化
  useEffect(() => {
    setTemplates(getStorageData<ReportTemplate[]>(STORAGE_KEY_TEMPLATES, initialTemplates));
    setGeneratedReports(getStorageData<GeneratedReport[]>(STORAGE_KEY_GENERATED, initialGenerated));
  }, []);

  // 打开生成报表弹窗
  const handleOpenGenerate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setGenerateOpen(true);
  };

  // 确认生成报表
  const handleConfirmGenerate = () => {
    if (!selectedTemplate) return;

    const periodMap: Record<string, string> = {
      day: '今日',
      week: '本周',
      month: '本月',
    };
    const formatMap: Record<string, string> = {
      pdf: 'PDF',
      excel: 'Excel',
      word: 'Word',
    };

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReport: GeneratedReport = {
      id: generateNo('RPT'),
      templateName: selectedTemplate.name,
      period: periodMap[generatePeriod] || '本月',
      generatedTime: timeStr,
      generatedBy: '手动生成',
      format: formatMap[generateFormat] || 'PDF',
      size: `${(Math.random() * 3 + 0.5).toFixed(1)}MB`,
      status: '已生成',
    };

    const updated = [newReport, ...generatedReports];
    setGeneratedReports(updated);
    setStorageData(STORAGE_KEY_GENERATED, updated);

    // 更新模板的lastGenerated
    const updatedTemplates = templates.map((t) =>
      t.id === selectedTemplate.id ? { ...t, lastGenerated: now.toISOString().split('T')[0] } : t
    );
    setTemplates(updatedTemplates);
    setStorageData(STORAGE_KEY_TEMPLATES, updatedTemplates);

    toast.success('报表生成成功', { description: `${selectedTemplate.name}已生成` });
    setGenerateOpen(false);
  };

  // 新建模板
  const handleCreateTemplate = () => {
    if (!newTemplateName || !newTemplateCategory) {
      toast.error('请填写模板名称和分类');
      return;
    }

    const newTemplate: ReportTemplate = {
      id: generateNo('TPL'),
      name: newTemplateName,
      category: newTemplateCategory,
      description: newTemplateDesc,
      frequency: newTemplateFrequency,
      lastGenerated: '-',
      status: '已启用',
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    setStorageData(STORAGE_KEY_TEMPLATES, updated);
    toast.success('模板创建成功', { description: `${newTemplateName}已添加` });
    setNewTemplateOpen(false);
    // 重置表单
    setNewTemplateName('');
    setNewTemplateCategory('');
    setNewTemplateDesc('');
    setNewTemplateFrequency('月报');
  };

  // 下载报表
  const handleDownload = (report: GeneratedReport) => {
    toast.success('开始下载', { description: `${report.templateName} (${report.format}) 正在下载...` });
  };

  // 预览报表
  const handlePreview = (report: GeneratedReport) => {
    toast.info('预览加载中', { description: `${report.templateName} 预览窗口即将打开` });
  };

  // 筛选模板
  const filteredTemplates = templates.filter(
    (t) => t.name.includes(searchTerm) || t.category.includes(searchTerm)
  );

  // 筛选已生成报表
  const filteredGenerated = generatedReports.filter((r) => {
    if (filterPeriod === 'all') return true;
    if (filterPeriod === 'today') return r.generatedTime.includes(new Date().toISOString().split('T')[0]);
    if (filterPeriod === 'week') return true; // 简化处理
    if (filterPeriod === 'month') return true;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="报表管理"
        description="管理报表模板和已生成报表"
      />

      {/* 快捷操作 */}
      <div className="grid grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {
            if (templates.length > 0) {
              handleOpenGenerate(templates[0]);
            }
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <div className="font-medium">生成报表</div>
                <div className="text-sm text-muted-foreground">按模板生成新报表</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setNewTemplateOpen(true)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl">📝</span>
              </div>
              <div>
                <div className="font-medium">新建模板</div>
                <div className="text-sm text-muted-foreground">创建自定义报表模板</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏰</span>
              </div>
              <div>
                <div className="font-medium">定时任务</div>
                <div className="text-sm text-muted-foreground">设置报表自动生成</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toast.success('批量导出', { description: `已导出${generatedReports.length}份报表` })}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">📤</span>
              </div>
              <div>
                <div className="font-medium">批量导出</div>
                <div className="text-sm text-muted-foreground">导出多份报表</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-4 border-b">
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-[#1A5C9A] text-[#1A5C9A]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          报表模板
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'generated'
              ? 'border-[#1A5C9A] text-[#1A5C9A]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('generated')}
        >
          已生成报表
        </button>
      </div>

      {/* 报表模板列表 */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>报表模板 ({filteredTemplates.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="搜索模板..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
              <Button onClick={() => setNewTemplateOpen(true)}>新建模板</Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTemplates.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                暂无匹配的报表模板
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#1A5C9A]/10 flex items-center justify-center">
                        <span className="text-[#1A5C9A] text-xl">📄</span>
                      </div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="outline">{template.frequency}</Badge>
                          <span className="text-xs text-muted-foreground">
                            上次生成: {template.lastGenerated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#67C23A]">{template.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleOpenGenerate(template)}>
                        生成报表
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 已生成报表列表 */}
      {activeTab === 'generated' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>已生成报表 ({filteredGenerated.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="选择时间段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="week">本周</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => toast.success('批量下载', { description: `已下载${filteredGenerated.length}份报表` })}>
                批量下载
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredGenerated.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                暂无已生成的报表
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGenerated.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        {report.format === 'PDF' ? '📕' : '📗'}
                      </div>
                      <div>
                        <div className="font-medium">{report.templateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.period} · {report.size} · {report.generatedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.format}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                        下载
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePreview(report)}>
                        预览
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 生成报表弹窗 */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>生成报表</DialogTitle>
            <DialogDescription>选择参数并生成报表</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">报表名称</div>
                <div className="font-medium">{selectedTemplate.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">报表描述</div>
                <div className="font-medium">{selectedTemplate.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>统计周期</Label>
                  <Select value={generatePeriod} onValueChange={setGeneratePeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">日报</SelectItem>
                      <SelectItem value="week">周报</SelectItem>
                      <SelectItem value="month">月报</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>导出格式</Label>
                  <Select value={generateFormat} onValueChange={setGenerateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>取消</Button>
            <Button onClick={handleConfirmGenerate}>确认生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建模板弹窗 */}
      <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建报表模板</DialogTitle>
            <DialogDescription>创建自定义报表模板</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>模板名称 *</Label>
              <Input
                placeholder="请输入模板名称"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>模板分类 *</Label>
              <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="统计报表">统计报表</SelectItem>
                  <SelectItem value="分析报表">分析报表</SelectItem>
                  <SelectItem value="工作报表">工作报表</SelectItem>
                  <SelectItem value="预警报表">预警报表</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>生成频率</Label>
              <Select value={newTemplateFrequency} onValueChange={setNewTemplateFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="日报">日报</SelectItem>
                  <SelectItem value="周报">周报</SelectItem>
                  <SelectItem value="月报">月报</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>模板描述</Label>
              <Input
                placeholder="请输入模板描述"
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplateOpen(false)}>取消</Button>
            <Button onClick={handleCreateTemplate}>确认创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
