'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { patrols as mockPatrols } from '@/lib/data/mock-data';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';
import {
  Download,
  Plus,
  Eye,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Camera,
} from 'lucide-react';

// 巡查记录类型
interface PatrolRecord {
  id: string;
  patrolNo: string;
  date: string;
  location: string;
  type: string;
  hasProblem: boolean;
  inspector?: string;
  unit?: string;
  detailLocation?: string;
  problemDescription?: string;
  needAssign?: boolean;
  assignUnit?: string;
}

const STORAGE_KEY = 'system-patrol-records';

// 初始数据：从mock数据转换
const initialPatrols: PatrolRecord[] = mockPatrols.map((p) => ({
  id: p.id,
  patrolNo: p.patrolNo,
  date: p.date,
  location: p.location,
  type: p.type,
  hasProblem: p.hasProblem,
  inspector: '省级巡查员A',
  unit: '安徽省农业农村厅',
}));

export default function PatrolPage() {
  const [patrolList, setPatrolList] = useState<PatrolRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPatrol, setSelectedPatrol] = useState<PatrolRecord | null>(null);

  // 新增巡查表单状态
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formInspector, setFormInspector] = useState('');
  const [formType, setFormType] = useState('随机抽查');
  const [formCity, setFormCity] = useState('');
  const [formCounty, setFormCounty] = useState('');
  const [formDetailLocation, setFormDetailLocation] = useState('');
  const [formHasProblem, setFormHasProblem] = useState(true);
  const [formProblemDesc, setFormProblemDesc] = useState('');
  const [formNeedAssign, setFormNeedAssign] = useState(true);
  const [formAssignUnit, setFormAssignUnit] = useState('');

  // 从localStorage初始化
  useEffect(() => {
    const stored = getStorageData<PatrolRecord[]>(STORAGE_KEY, initialPatrols);
    setPatrolList(stored);
  }, []);

  // 重置表单
  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormInspector('');
    setFormType('随机抽查');
    setFormCity('');
    setFormCounty('');
    setFormDetailLocation('');
    setFormHasProblem(true);
    setFormProblemDesc('');
    setFormNeedAssign(true);
    setFormAssignUnit('');
  };

  // 提交新增巡查
  const handleSubmit = () => {
    if (!formInspector) {
      toast.error('请填写巡查人员');
      return;
    }
    if (!formCity) {
      toast.error('请选择巡查区域');
      return;
    }

    const location = formCounty
      ? `${formCity}${formCounty}`
      : formCity;

    const newPatrol: PatrolRecord = {
      id: generateId(),
      patrolNo: generateNo('XC'),
      date: formDate,
      location: formDetailLocation ? `${location}${formDetailLocation}` : location,
      type: formType,
      hasProblem: formHasProblem,
      inspector: formInspector,
      unit: '安徽省农业农村厅',
      detailLocation: formDetailLocation,
      problemDescription: formHasProblem ? formProblemDesc : undefined,
      needAssign: formHasProblem && formNeedAssign,
      assignUnit: formNeedAssign ? formAssignUnit : undefined,
    };

    const updated = [newPatrol, ...patrolList];
    setPatrolList(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('巡查记录已提交', { description: `巡查编号：${newPatrol.patrolNo}` });
    setOpen(false);
    resetForm();
  };

  // 查看详情
  const handleViewDetail = (patrol: PatrolRecord) => {
    setSelectedPatrol(patrol);
    setDetailOpen(true);
  };

  // 导出
  const handleExport = () => {
    toast.success('导出成功', { description: `已导出${patrolList.length}条巡查记录` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="省级巡查抽查"
        description="省级人员随机选择地块或图斑进行现场抽查，直接录入抽查记录"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button onClick={() => { resetForm(); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              新增巡查
            </Button>
          </div>
        }
      />

      {/* 巡查任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">巡查任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          {patrolList.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              暂无巡查记录，点击"新增巡查"开始录入
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>巡查编号</TableHead>
                  <TableHead>巡查日期</TableHead>
                  <TableHead>巡查地点</TableHead>
                  <TableHead>抽查类型</TableHead>
                  <TableHead>检查结果</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrolList.map((patrol) => (
                  <TableRow key={patrol.id}>
                    <TableCell className="font-medium">{patrol.patrolNo}</TableCell>
                    <TableCell>{patrol.date}</TableCell>
                    <TableCell>{patrol.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patrol.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {patrol.hasProblem ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          发现问题
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 bg-success">
                          <CheckCircle2 className="h-3 w-3" />
                          未发现问题
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(patrol)}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新增巡查弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增巡查记录</DialogTitle>
            <DialogDescription>填写巡查信息并提交记录</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* 巡查基本信息 */}
            <div className="space-y-4">
              <h4 className="font-medium">巡查基本信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>巡查编号</Label>
                  <Input value="自动生成" disabled />
                  <p className="text-xs text-muted-foreground">提交时自动生成</p>
                </div>
                <div className="space-y-2">
                  <Label>巡查日期 *</Label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>巡查人员 *</Label>
                  <Input
                    placeholder="请输入巡查人员"
                    value={formInspector}
                    onChange={(e) => setFormInspector(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>所属单位</Label>
                  <Input value="安徽省农业农村厅" disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>巡查方式 *</Label>
                  <RadioGroup value={formType} onValueChange={setFormType} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="随机抽查" id="random" />
                      <Label htmlFor="random">随机抽查</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="定点抽查" id="targeted" />
                      <Label htmlFor="targeted">定点抽查</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* 巡查地点 */}
            <div className="space-y-4">
              <h4 className="font-medium">巡查地点</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>巡查区域 *</Label>
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
                  <Label>县区</Label>
                  <Select value={formCounty} onValueChange={setFormCounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择县区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="怀远县">怀远县</SelectItem>
                      <SelectItem value="固镇县">固镇县</SelectItem>
                      <SelectItem value="五河县">五河县</SelectItem>
                      <SelectItem value="临泉县">临泉县</SelectItem>
                      <SelectItem value="太和县">太和县</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>详细地点</Label>
                  <Input
                    placeholder="请输入详细地点..."
                    value={formDetailLocation}
                    onChange={(e) => setFormDetailLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 巡查发现问题 */}
            <div className="space-y-4">
              <h4 className="font-medium">巡查发现问题</h4>
              <div className="space-y-2">
                <Label>是否发现问题</Label>
                <RadioGroup
                  value={formHasProblem ? 'yes' : 'no'}
                  onValueChange={(v) => setFormHasProblem(v === 'yes')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-problem" />
                    <Label htmlFor="no-problem">无</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="has-problem" />
                    <Label htmlFor="has-problem">有</Label>
                  </div>
                </RadioGroup>
              </div>
              {formHasProblem && (
                <>
                  <div className="space-y-2">
                    <Label>问题描述 *</Label>
                    <Textarea
                      placeholder="请描述发现问题..."
                      rows={3}
                      value={formProblemDesc}
                      onChange={(e) => setFormProblemDesc(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>是否下发核查</Label>
                      <RadioGroup
                        value={formNeedAssign ? 'yes' : 'no'}
                        onValueChange={(v) => setFormNeedAssign(v === 'yes')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-assign" />
                          <Label htmlFor="no-assign">否</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes-assign" />
                          <Label htmlFor="yes-assign">是</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {formNeedAssign && (
                      <div className="space-y-2">
                        <Label>下发单位</Label>
                        <Select value={formAssignUnit} onValueChange={setFormAssignUnit}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择下发单位" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="怀远县农业农村局">怀远县农业农村局</SelectItem>
                            <SelectItem value="固镇县农业农村局">固镇县农业农村局</SelectItem>
                            <SelectItem value="临泉县农业农村局">临泉县农业农村局</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 现场照片 */}
            <div className="space-y-4">
              <h4 className="font-medium">现场照片</h4>
              <div className="flex gap-4">
                <Button variant="outline" className="flex h-24 w-24 flex-col items-center justify-center" type="button">
                  <Camera className="mb-2 h-6 w-6" />
                  <span className="text-xs">上传照片</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>提交记录</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 巡查详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>巡查记录详情</DialogTitle>
            <DialogDescription>查看巡查记录的详细信息</DialogDescription>
          </DialogHeader>
          {selectedPatrol && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查编号</div>
                  <div className="font-medium">{selectedPatrol.patrolNo}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查日期</div>
                  <div className="font-medium">{selectedPatrol.date}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查人员</div>
                  <div className="font-medium">{selectedPatrol.inspector || '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">所属单位</div>
                  <div className="font-medium">{selectedPatrol.unit || '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">巡查方式</div>
                  <div className="font-medium">
                    <Badge variant="outline">{selectedPatrol.type}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">检查结果</div>
                  <div className="font-medium">
                    {selectedPatrol.hasProblem ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        发现问题
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-success">
                        <CheckCircle2 className="h-3 w-3" />
                        未发现问题
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">巡查地点</div>
                <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedPatrol.location}
                </div>
              </div>

              {selectedPatrol.hasProblem && selectedPatrol.problemDescription && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">问题描述</div>
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedPatrol.problemDescription}
                  </div>
                </div>
              )}

              {selectedPatrol.needAssign && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">下发核查</div>
                  <div className="p-3 bg-muted rounded-lg">
                    已下发至 {selectedPatrol.assignUnit || '对应单位'}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
