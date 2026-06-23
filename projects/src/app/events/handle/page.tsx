'use client';

import { useState, useEffect } from 'react';
import { PageHeader, StatusBadge, ProblemTypeBadge, ProgressBar } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { rectificationTasks as mockTasks } from '@/lib/data/mock-data';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';
import { Plus, Eye, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { RectificationTask, ProblemType } from '@/types';

const STORAGE_KEY = 'events-handle-data';

export default function EventHandlePage() {
  const [taskList, setTaskList] = useState<RectificationTask[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RectificationTask | null>(null);

  // 处置表单状态
  const [formPerson, setFormPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formMeasures, setFormMeasures] = useState<string[]>([]);
  const [formDeadline, setFormDeadline] = useState('');
  const [formRemark, setFormRemark] = useState('');

  // 新增处置表单
  const [newEventNo, setNewEventNo] = useState('');
  const [newType, setNewType] = useState<ProblemType>('撂荒');
  const [newLocation, setNewLocation] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMeasures, setNewMeasures] = useState('');

  // 初始化数据
  useEffect(() => {
    const stored = getStorageData<RectificationTask[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      setTaskList(stored);
    } else {
      setTaskList(mockTasks);
      setStorageData(STORAGE_KEY, mockTasks);
    }
  }, []);

  // 统计
  const pendingTasks = taskList.filter(t => t.status === '待整改');
  const inProgressTasks = taskList.filter(t => t.status === '整改中');
  const waitingTasks = taskList.filter(t => t.status === '待验收');
  const completedTasks = taskList.filter(t => t.status === '已完成');

  const measureOptions = ['立即清理地块残留物', '土地翻耕', '大豆补种', '加强日常巡查监管', '清理杂草', '播种', '清理非粮作物', '恢复粮食种植'];

  // 打开处置弹窗
  const handleOpenDispose = (task: RectificationTask) => {
    setSelectedTask(task);
    setFormPerson(task.responsiblePerson);
    setFormPhone('');
    setFormUnit(task.responsibleUnit);
    setFormMeasures(task.measures);
    setFormDeadline(task.deadline);
    setFormRemark('');
    setIsDialogOpen(true);
  };

  // 提交处置
  const handleSubmitDispose = () => {
    if (!formPerson || !formUnit || !formDeadline || formMeasures.length === 0) {
      toast.error('请填写所有必填项');
      return;
    }

    const updatedList = taskList.map(t => {
      if (t.id === selectedTask?.id) {
        return {
          ...t,
          status: '整改中' as const,
          responsiblePerson: formPerson,
          responsibleUnit: formUnit,
          deadline: formDeadline,
          measures: formMeasures,
          progress: 10,
        };
      }
      return t;
    });

    setTaskList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setIsDialogOpen(false);
    toast.success('处置提交成功', { description: `${selectedTask?.eventNo} 已进入整改阶段` });
  };

  // 新增处置
  const handleNewDispose = () => {
    if (!newEventNo || !newLocation || !newPerson || !newUnit || !newDeadline || !newMeasures) {
      toast.error('请填写所有必填项');
      return;
    }

    const newTask: RectificationTask = {
      id: generateId(),
      eventNo: newEventNo,
      eventType: newType,
      location: newLocation,
      city: '',
      responsiblePerson: newPerson,
      responsibleUnit: newUnit,
      deadline: newDeadline,
      status: '整改中',
      progress: 0,
      measures: newMeasures.split('，').filter(Boolean),
    };

    const updatedList = [...taskList, newTask];
    setTaskList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setIsNewDialogOpen(false);
    toast.success('新增处置成功', { description: `事件编号：${newTask.eventNo}` });
  };

  // 更新进度
  const handleUpdateProgress = (taskId: string, newProgress: number) => {
    const updatedList = taskList.map(t => {
      if (t.id === taskId) {
        const newStatus = newProgress >= 100 ? '待验收' as const : '整改中' as const;
        return { ...t, progress: newProgress, status: newStatus };
      }
      return t;
    });
    setTaskList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    toast.success('进度已更新', { description: `当前进度：${newProgress}%` });
  };

  // 切换措施选中
  const toggleMeasure = (measure: string) => {
    setFormMeasures(prev =>
      prev.includes(measure)
        ? prev.filter(m => m !== measure)
        : [...prev, measure]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="事件处置"
        description="对确认违规的事件进行整改处置，记录整改措施、时限和完成情况"
        actions={
          <Button onClick={() => {
            setNewEventNo(generateNo('SJ'));
            setNewType('撂荒');
            setNewLocation('');
            setNewPerson('');
            setNewUnit('');
            setNewDeadline('');
            setNewMeasures('');
            setIsNewDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            新增处置
          </Button>
        }
      />

      {/* 状态统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待处置</p>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">处置中</p>
                <p className="text-2xl font-bold text-warning">{inProgressTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待验收</p>
                <p className="text-2xl font-bold text-info">{waitingTasks.length}</p>
              </div>
              <Eye className="h-8 w-8 text-info/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold text-success">{completedTasks.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 待处置事件 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">待处置事件</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>事件编号</TableHead>
                  <TableHead>事件类型</TableHead>
                  <TableHead>发生地点</TableHead>
                  <TableHead>责任人</TableHead>
                  <TableHead>整改时限</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.eventNo}</TableCell>
                    <TableCell>
                      <ProblemTypeBadge type={task.eventType} />
                    </TableCell>
                    <TableCell>{task.location}</TableCell>
                    <TableCell>{task.responsiblePerson}</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenDispose(task)}
                      >
                        处置
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle2 className="mb-2 h-8 w-8" />
              <p>暂无待处置事件</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 整改中任务 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">整改中任务</CardTitle>
        </CardHeader>
        <CardContent>
          {inProgressTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>事件编号</TableHead>
                  <TableHead>整改内容</TableHead>
                  <TableHead>责任人</TableHead>
                  <TableHead>整改时限</TableHead>
                  <TableHead>完成进度</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inProgressTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.eventNo}</TableCell>
                    <TableCell>{task.measures[0]}</TableCell>
                    <TableCell>{task.responsiblePerson}</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={task.progress} showLabel />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="w-16 h-7 text-xs"
                          value={task.progress}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            handleUpdateProgress(task.id, val);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDispose(task)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="mb-2 h-8 w-8" />
              <p>暂无整改中任务</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 处置弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>事件处置</DialogTitle>
            <DialogDescription>
              设置整改责任人、整改措施和整改时限
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 事件信息 */}
            {selectedTask && (
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">事件编号：</span>
                    <span className="font-medium">{selectedTask.eventNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">事件类型：</span>
                    <ProblemTypeBadge type={selectedTask.eventType} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">当前状态：</span>
                    <StatusBadge status={selectedTask.status} />
                  </div>
                </div>
              </div>
            )}

            {/* 整改信息 */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>整改责任人 *</Label>
                  <Input
                    placeholder="请输入责任人姓名"
                    value={formPerson}
                    onChange={(e) => setFormPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>联系电话</Label>
                  <Input
                    type="tel"
                    placeholder="请输入联系电话"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>责任单位 *</Label>
                <Select value={formUnit} onValueChange={setFormUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择责任单位" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="怀远县农业农村局">怀远县农业农村局</SelectItem>
                    <SelectItem value="临泉县农业农村局">临泉县农业农村局</SelectItem>
                    <SelectItem value="定远县农业农村局">定远县农业农村局</SelectItem>
                    <SelectItem value="埇桥区农业农村局">埇桥区农业农村局</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>整改措施 *</Label>
                <div className="space-y-2">
                  {measureOptions.map((measure) => (
                    <div key={measure} className="flex items-center space-x-2">
                      <Checkbox
                        id={measure}
                        checked={formMeasures.includes(measure)}
                        onCheckedChange={() => toggleMeasure(measure)}
                      />
                      <label htmlFor={measure} className="text-sm cursor-pointer">
                        {measure}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>整改时限 *</Label>
                <Input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>整改要求说明</Label>
                <Textarea
                  placeholder="请输入整改要求..."
                  rows={3}
                  value={formRemark}
                  onChange={(e) => setFormRemark(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitDispose}>确认处置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增处置弹窗 */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增处置</DialogTitle>
            <DialogDescription>
              创建新的整改处置任务
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>事件编号 *</Label>
                <Input
                  placeholder="事件编号"
                  value={newEventNo}
                  onChange={(e) => setNewEventNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>事件类型 *</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as ProblemType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="撂荒">撂荒</SelectItem>
                    <SelectItem value="疑似割青">违规割青</SelectItem>
                    <SelectItem value="非粮化">非粮化</SelectItem>
                    <SelectItem value="焚烧秸秆">焚烧秸秆</SelectItem>
                    <SelectItem value="种植计划未落实">种植计划未落实</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>发生地点 *</Label>
              <Input
                placeholder="请输入发生地点"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>责任人 *</Label>
                <Input
                  placeholder="责任人姓名"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>责任单位 *</Label>
                <Select value={newUnit} onValueChange={setNewUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择责任单位" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="怀远县农业农村局">怀远县农业农村局</SelectItem>
                    <SelectItem value="临泉县农业农村局">临泉县农业农村局</SelectItem>
                    <SelectItem value="定远县农业农村局">定远县农业农村局</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>整改时限 *</Label>
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>整改措施 *</Label>
              <Textarea
                placeholder="请输入整改措施，多个措施用逗号分隔"
                rows={3}
                value={newMeasures}
                onChange={(e) => setNewMeasures(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleNewDispose}>确认创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
