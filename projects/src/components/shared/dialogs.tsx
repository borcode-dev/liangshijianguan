'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProblemTypeBadge, RiskBadge, StatusBadge } from './status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, User, FileText, AlertTriangle, CheckCircle2, Clock, Camera, Download } from 'lucide-react';
import Link from 'next/link';
import type { Spot, InspectionTask, MonitorBatch } from '@/types';

// ==================== 任务下发确认弹窗 ====================
interface TaskAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spots: Spot[];
  onConfirm: (data: { unit: string; deadline: number; remark: string }) => void;
}

export function TaskAssignDialog({ open, onOpenChange, spots, onConfirm }: TaskAssignDialogProps) {
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('7');
  const [remark, setRemark] = useState('');

  const handleConfirm = () => {
    onConfirm({ unit, deadline: parseInt(deadline), remark });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            任务下发确认
          </DialogTitle>
          <DialogDescription>
            确认将以下图斑下发到下级单位进行核查处置
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 已选图斑列表 */}
          <div className="max-h-40 space-y-2 overflow-auto rounded-lg border p-3">
            {spots.map((spot) => (
              <div key={spot.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{spot.spotNo}</span>
                  <ProblemTypeBadge type={spot.problemType} />
                </div>
                <div className="flex items-center gap-2">
                  <span>{spot.area}亩</span>
                  <RiskBadge level={spot.riskLevel} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            共选择 <span className="font-medium text-foreground">{spots.length}</span> 个图斑
          </div>

          <Separator />

          {/* 下发设置 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">下发至 *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="选择接收单位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bengbu">蚌埠市农业农村局</SelectItem>
                  <SelectItem value="fuyang">阜阳市农业农村局</SelectItem>
                  <SelectItem value="suzhou">宿州市农业农村局</SelectItem>
                  <SelectItem value="huaibei">淮北市农业农村局</SelectItem>
                  <SelectItem value="huainan">淮南市农业农村局</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">核查时限 *</Label>
              <Select value={deadline} onValueChange={setDeadline}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3天</SelectItem>
                  <SelectItem value="5">5天</SelectItem>
                  <SelectItem value="7">7天</SelectItem>
                  <SelectItem value="10">10天</SelectItem>
                  <SelectItem value="15">15天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">下发说明</Label>
            <Textarea
              id="remark"
              placeholder="请输入下发说明（选填）"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!unit}>
            确认下发
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 任务分配弹窗 ====================
interface TaskDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: InspectionTask | null;
  onConfirm: (data: { inspector: string; deadline: string; remark: string }) => void;
}

export function TaskDispatchDialog({ open, onOpenChange, task, onConfirm }: TaskDispatchDialogProps) {
  const [inspector, setInspector] = useState('');
  const [deadline, setDeadline] = useState('');
  const [remark, setRemark] = useState('');

  const handleConfirm = () => {
    onConfirm({ inspector, deadline, remark });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            任务分配
          </DialogTitle>
          <DialogDescription>将核查任务分配给具体核查人员</DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            {/* 任务信息 */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{task.spotNo || task.eventNo}</span>
                <ProblemTypeBadge type={task.type} />
              </div>
              <div className="mt-1 text-muted-foreground">{task.location}</div>
            </div>

            {/* 分配设置 */}
            <div className="space-y-2">
              <Label htmlFor="inspector">核查人员 *</Label>
              <Select value={inspector} onValueChange={setInspector}>
                <SelectTrigger>
                  <SelectValue placeholder="选择核查人员" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zhangsan">张三（农业执法大队）</SelectItem>
                  <SelectItem value="lisi">李四（农业执法大队）</SelectItem>
                  <SelectItem value="wangwu">王五（农业执法大队）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">完成期限 *</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">分配说明</Label>
              <Textarea
                id="remark"
                placeholder="请输入分配说明（选填）"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!inspector || !deadline}>
            确认分配
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 现场核查弹窗 ====================
interface FieldInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: Spot | null;
  onSubmit: (data: FieldInspectionData) => void;
}

export interface FieldInspectionData {
  result: 'confirmed' | 'false_alarm' | 'pending_review';
  problemType: string;
  area: number;
  description: string;
  photos: string[];
  location: string;
}

export function FieldInspectionDialog({ open, onOpenChange, spot, onSubmit }: FieldInspectionDialogProps) {
  const [result, setResult] = useState<'confirmed' | 'false_alarm' | 'pending_review'>('confirmed');
  const [problemType, setProblemType] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    onSubmit({
      result,
      problemType,
      area: parseFloat(area) || 0,
      description,
      photos: [],
      location,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            现场核查上报
          </DialogTitle>
          <DialogDescription>填写现场核查结果并上报</DialogDescription>
        </DialogHeader>

        {spot && (
          <div className="space-y-4">
            {/* 图斑信息 */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{spot.spotNo}</span>
                <ProblemTypeBadge type={spot.problemType} />
              </div>
              <div className="mt-1 flex items-center gap-4 text-muted-foreground">
                <span>{spot.location}</span>
                <span>{spot.area}亩</span>
              </div>
            </div>

            {/* 核查结果 */}
            <div className="space-y-2">
              <Label>核查结果 *</Label>
              <RadioGroup
                value={result}
                onValueChange={(v) => setResult(v as 'confirmed' | 'false_alarm' | 'pending_review')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confirmed" id="confirmed" />
                  <Label htmlFor="confirmed" className="cursor-pointer">
                    确认问题存在
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false_alarm" id="false_alarm" />
                  <Label htmlFor="false_alarm" className="cursor-pointer">
                    误报/已恢复
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending_review" id="pending_review" />
                  <Label htmlFor="pending_review" className="cursor-pointer">
                    需上级复核
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {result === 'confirmed' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>核实后问题类型</Label>
                    <Select value={problemType} onValueChange={setProblemType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择问题类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="撂荒">撂荒</SelectItem>
                        <SelectItem value="违规割青">违规割青</SelectItem>
                        <SelectItem value="非粮化">非粮化</SelectItem>
                        <SelectItem value="种植计划未落实">种植计划未落实</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>核实面积（亩）</Label>
                    <Input
                      type="number"
                      placeholder="输入核实面积"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>现场位置</Label>
                  <Input
                    placeholder="输入详细位置"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>核查说明 *</Label>
              <Textarea
                placeholder="请详细描述现场核查情况"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>现场照片</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary cursor-pointer">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary cursor-pointer">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary cursor-pointer">
                  <Camera className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">最多上传9张照片，支持jpg、png格式</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!description}>
            提交上报
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 整改任务创建弹窗 ====================
interface RectificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: Spot | null;
  onCreate: (data: RectificationData) => void;
}

export interface RectificationData {
  responsible: string;
  deadline: string;
  measures: string;
  target: string;
}

export function RectificationDialog({ open, onOpenChange, spot, onCreate }: RectificationDialogProps) {
  const [responsible, setResponsible] = useState('');
  const [deadline, setDeadline] = useState('');
  const [measures, setMeasures] = useState('');
  const [target, setTarget] = useState('');

  const handleCreate = () => {
    onCreate({ responsible, deadline, measures, target });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            创建整改任务
          </DialogTitle>
          <DialogDescription>为确认问题的图斑创建整改任务</DialogDescription>
        </DialogHeader>

        {spot && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{spot.spotNo}</span>
                <ProblemTypeBadge type={spot.problemType} />
              </div>
              <div className="mt-1 text-muted-foreground">{spot.location}</div>
            </div>

            <div className="space-y-2">
              <Label>整改责任人 *</Label>
              <Select value={responsible} onValueChange={setResponsible}>
                <SelectTrigger>
                  <SelectValue placeholder="选择责任人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">地块经营权人</SelectItem>
                  <SelectItem value="village">村委会</SelectItem>
                  <SelectItem value="town">乡镇政府</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>整改期限 *</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>整改目标</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="选择整改目标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restore">恢复种植</SelectItem>
                  <SelectItem value="reclaim">复耕复种</SelectItem>
                  <SelectItem value="plan">落实种植计划</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>整改措施 *</Label>
              <Textarea
                placeholder="请输入具体整改措施"
                value={measures}
                onChange={(e) => setMeasures(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={!responsible || !deadline || !measures}>
            创建任务
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 验收弹窗 ====================
interface AcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: { id: string; spotNo: string; type: string } | null;
  onAccept: (data: { passed: boolean; score: number; remark: string }) => void;
}

export function AcceptanceDialog({ open, onOpenChange, task, onAccept }: AcceptanceDialogProps) {
  const [passed, setPassed] = useState<boolean | null>(null);
  const [score, setScore] = useState('100');
  const [remark, setRemark] = useState('');

  const handleAccept = () => {
    if (passed !== null) {
      onAccept({ passed, score: parseInt(score), remark });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            整改验收
          </DialogTitle>
          <DialogDescription>对整改完成情况进行验收确认</DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="font-medium">{task.spotNo}</div>
              <div className="mt-1 text-muted-foreground">{task.type}</div>
            </div>

            <div className="space-y-2">
              <Label>验收结果 *</Label>
              <RadioGroup
                value={passed === null ? '' : passed ? 'pass' : 'fail'}
                onValueChange={(v) => setPassed(v === 'pass')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pass" id="pass" />
                  <Label htmlFor="pass" className="cursor-pointer text-success">
                    验收通过
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fail" id="fail" />
                  <Label htmlFor="fail" className="cursor-pointer text-destructive">
                    验收不通过
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {passed && (
              <div className="space-y-2">
                <Label>整改质量评分</Label>
                <Select value={score} onValueChange={setScore}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100分 - 优秀</SelectItem>
                    <SelectItem value="90">90分 - 良好</SelectItem>
                    <SelectItem value="80">80分 - 合格</SelectItem>
                    <SelectItem value="70">70分 - 基本合格</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>验收意见</Label>
              <Textarea
                placeholder="请输入验收意见"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleAccept} disabled={passed === null}>
            确认验收
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 结案确认弹窗 ====================
interface CloseCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: { id: string; spotNo: string; type: string; status: string } | null;
  onClose: (data: { remark: string }) => void;
}

export function CloseCaseDialog({ open, onOpenChange, task, onClose }: CloseCaseDialogProps) {
  const [remark, setRemark] = useState('');

  const handleClose = () => {
    onClose({ remark });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            结案确认
          </DialogTitle>
          <DialogDescription>确认该案件已完成全流程处理，予以结案</DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{task.spotNo}</span>
                <Badge variant="outline">{task.status}</Badge>
              </div>
              <div className="mt-1 text-muted-foreground">{task.type}</div>
            </div>

            <div className="rounded-lg border border-success/50 bg-success/5 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                <div className="text-sm">
                  <div className="font-medium text-success">流程已完成</div>
                  <div className="mt-1 text-muted-foreground">
                    该图斑已完成核查、整改、验收全流程，符合结案条件
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>结案备注</Label>
              <Textarea
                placeholder="请输入结案备注（选填）"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleClose} className="bg-success hover:bg-success/90">
            确认结案
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 审核详情弹窗 ====================
interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: InspectionTask | null;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ReviewDetailDialog({ open, onOpenChange, task, onApprove, onReject }: ReviewDetailDialogProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (rejectReason) {
      onReject(rejectReason);
      onOpenChange(false);
      setShowRejectInput(false);
      setRejectReason('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            核查审核详情
          </DialogTitle>
          <DialogDescription>查看核查结果并进行审核</DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">任务编号</div>
                <div className="font-medium">{task.taskNo}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">图斑编号</div>
                <div className="font-medium">{task.spotNo || task.eventNo}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">问题类型</div>
                <ProblemTypeBadge type={task.type} />
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">行政区划</div>
                <div className="font-medium">{task.location}</div>
              </div>
            </div>

            <Separator />

            {/* 核查结果 */}
            <div className="space-y-2">
              <div className="text-sm font-medium">核查结果</div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-medium">确认问题存在</span>
                  </div>
                  <Badge variant="destructive">高风险</Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  核实面积：12.5亩 | 核查人：张三 | 核查时间：2026-06-05
                </div>
              </div>
            </div>

            {/* 核查说明 */}
            <div className="space-y-2">
              <div className="text-sm font-medium">核查说明</div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                经现场核查，该地块确实存在撂荒现象，面积约12.5亩。地块位于村庄东侧，原种植小麦，因劳动力外出务工导致撂荒超过一年。建议尽快协调恢复耕种。
              </div>
            </div>

            {/* 现场照片 */}
            <div className="space-y-2">
              <div className="text-sm font-medium">现场照片</div>
              <div className="flex gap-2">
                <div className="h-20 w-20 rounded-lg bg-muted"></div>
                <div className="h-20 w-20 rounded-lg bg-muted"></div>
                <div className="h-20 w-20 rounded-lg bg-muted"></div>
              </div>
            </div>

            {/* 打回重核 */}
            {showRejectInput && (
              <div className="space-y-2">
                <Label>打回原因 *</Label>
                <Textarea
                  placeholder="请输入打回原因"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {showRejectInput ? (
              <>
                <Button variant="outline" onClick={() => setShowRejectInput(false)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
                  确认打回
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowRejectInput(true)}>
                打回重核
              </Button>
            )}
          </div>
          <Button onClick={() => { onApprove(); onOpenChange(false); }}>
            审核通过
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 新增监测批次弹窗 ====================
interface NewBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; period: string; satellite: string; description: string }) => void;
}

export function NewBatchDialog({ open, onOpenChange, onCreate }: NewBatchDialogProps) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [satellite, setSatellite] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    onCreate({ name, period, satellite, description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            新增监测批次
          </DialogTitle>
          <DialogDescription>创建新的卫星遥感监测批次</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">批次名称 *</Label>
            <Input
              id="name"
              placeholder="如：2026年第二季度监测"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">监测时段 *</Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="satellite">数据源 *</Label>
              <Select value={satellite} onValueChange={setSatellite}>
                <SelectTrigger>
                  <SelectValue placeholder="选择卫星" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentinel2">哨兵2号</SelectItem>
                  <SelectItem value="gaofen1">高分一号</SelectItem>
                  <SelectItem value="gaofen6">高分六号</SelectItem>
                  <SelectItem value="landsat8">Landsat 8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">批次说明</Label>
            <Textarea
              id="description"
              placeholder="请输入批次说明（选填）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={!name || !period || !satellite}>
            创建批次
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 预警详情弹窗 ====================
interface AlertDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: { id: string; type: string; level: string; message: string; time: string; location: string } | null;
}

export function AlertDetailDialog({ open, onOpenChange, alert }: AlertDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            预警详情
          </DialogTitle>
        </DialogHeader>

        {alert && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={alert.level === 'high' ? 'destructive' : 'outline'}>
                {alert.level === 'high' ? '高风险' : '中风险'}
              </Badge>
              <span className="text-sm text-muted-foreground">{alert.time}</span>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="font-medium">{alert.type}</div>
              <div className="mt-2 text-sm">{alert.message}</div>
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {alert.location}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                查看详情
              </Button>
              <Button className="flex-1">
                立即处理
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ==================== 事件上报弹窗 ====================
interface EventReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventReportData) => void;
}

export interface EventReportData {
  type: string;
  location: string;
  area: string;
  description: string;
  reporter: string;
  contact: string;
}

export function EventReportDialog({ open, onOpenChange, onSubmit }: EventReportDialogProps) {
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = () => {
    onSubmit({ type, location, area, description, reporter, contact });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            新增事件上报
          </DialogTitle>
          <DialogDescription>上报发现的粮食安全问题事件</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>问题类型 *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="选择问题类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="撂荒">撂荒</SelectItem>
                <SelectItem value="违规割青">违规割青</SelectItem>
                <SelectItem value="非粮化">非粮化</SelectItem>
                <SelectItem value="种植计划未落实">种植计划未落实</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>发生地点 *</Label>
            <Input
              placeholder="输入详细地址"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>涉及面积（亩）</Label>
            <Input
              type="number"
              placeholder="输入面积"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>事件描述 *</Label>
            <Textarea
              placeholder="请详细描述事件情况"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>上报人</Label>
              <Input
                placeholder="姓名"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input
                placeholder="电话"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!type || !location || !description}>
            提交上报
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 图斑详情弹窗（含真实地图和卫星影像） ====================
interface SpotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: Spot | null;
}

// 动态导入地图组件，避免SSR问题
import dynamic from 'next/dynamic';

const SpotDetailMapDynamic = dynamic(
  () => import('@/components/map/spot-detail-map').then(mod => ({ default: mod.SpotDetailMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full rounded-lg bg-muted/50 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">地图加载中...</div>
      </div>
    )
  }
);

const SatelliteCompareDynamic = dynamic(
  () => import('@/components/map/spot-detail-map').then(mod => ({ default: mod.SatelliteCompare })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full rounded-lg bg-muted/50 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">卫星影像加载中...</div>
      </div>
    )
  }
);

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 安徽省各市模拟坐标
const cityCoordinates: Record<string, [number, number]> = {
  '合肥市': [31.8206, 117.2272],
  '芜湖市': [31.3526, 118.3762],
  '蚌埠市': [32.9397, 117.3889],
  '淮南市': [32.6269, 116.9969],
  '马鞍山市': [31.6709, 118.5069],
  '淮北市': [33.9717, 116.7947],
  '铜陵市': [30.9299, 117.8121],
  '安庆市': [30.5433, 117.0636],
  '黄山市': [29.7151, 118.3376],
  '滁州市': [32.3173, 118.3162],
  '阜阳市': [32.9897, 115.8147],
  '宿州市': [33.6461, 116.9641],
  '六安市': [31.7529, 116.5078],
  '亳州市': [33.8712, 115.7783],
  '池州市': [30.6666, 117.4915],
  '宣城市': [30.9456, 118.7589],
};

// 根据位置获取坐标
function getCoordinatesFromLocation(location: string): [number, number] {
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (location.includes(city.replace('市', ''))) {
      // 在城市中心附近随机偏移
      const offset = 0.05;
      return [
        coords[0] + (Math.random() - 0.5) * offset,
        coords[1] + (Math.random() - 0.5) * offset
      ];
    }
  }
  // 默认返回安徽省中心
  return [31.8206 + (Math.random() - 0.5) * 0.1, 117.2272 + (Math.random() - 0.5) * 0.1];
}

export function SpotDetailDialog({ open, onOpenChange, spot }: SpotDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('info');
  
  // 根据图斑位置生成坐标
  const coordinates: [number, number] = spot ? getCoordinatesFromLocation(spot.location) : [31.8206, 117.2272];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            图斑详情
          </DialogTitle>
        </DialogHeader>

        {spot && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">图斑编号</div>
                <div className="font-medium">{spot.spotNo}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">面积</div>
                <div className="font-medium">{spot.area} 亩</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">风险等级</div>
                <RiskBadge level={spot.riskLevel} />
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">发现时间</div>
                <div className="font-medium text-sm">{spot.discoverDate || '2026-05-15'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">问题类型</div>
                <ProblemTypeBadge type={spot.problemType} />
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">当前状态</div>
                <StatusBadge status={spot.status} />
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">所属批次</div>
                <div className="font-medium text-sm">{spot.batchNo || '2026年第3期'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">位置信息</div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div>{spot.location}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      坐标: {coordinates[0].toFixed(4)}°N, {coordinates[1].toFixed(4)}°E
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 地图和影像标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="map">地块位置</TabsTrigger>
                <TabsTrigger value="satellite">卫星影像</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                {/* 流程信息 */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">处理流程</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      已下发
                    </div>
                    <div className="h-px flex-1 bg-border"></div>
                    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      <Clock className="h-3 w-3" />
                      核查中
                    </div>
                    <div className="h-px flex-1 bg-border"></div>
                    <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      待整改
                    </div>
                  </div>
                  
                  {/* 时间线 */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-success mt-1.5"></div>
                      <div>
                        <div className="text-sm font-medium">任务下发</div>
                        <div className="text-xs text-muted-foreground">2026-05-16 09:30 | 下发至合肥市农业农村局</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
                      <div>
                        <div className="text-sm font-medium">核查进行中</div>
                        <div className="text-xs text-muted-foreground">2026-05-17 14:20 | 核查人：张三</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30 mt-1.5"></div>
                      <div>
                        <div className="text-sm text-muted-foreground">待整改验收</div>
                        <div className="text-xs text-muted-foreground">等待核查结果</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="map" className="mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">地块位置地图</div>
                  <SpotDetailMapDynamic 
                    coordinates={coordinates}
                    area={spot.area}
                    spotNo={spot.spotNo}
                    height="350px"
                    showBoundary={true}
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    点击地图可拖拽和缩放查看详细位置，红色区域为问题图斑范围
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="satellite" className="mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">卫星遥感影像对比</div>
                  <SatelliteCompareDynamic
                    beforeCoordinates={coordinates}
                    afterCoordinates={coordinates}
                    beforeDate="2025-10-15"
                    afterDate="2026-05-10"
                    height="300px"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    左图为变化前影像，右图为变化后影像，对比可发现问题区域
                  </div>
                  
                  {/* 影像信息 */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">变化前影像</div>
                      <div className="text-sm mt-1">拍摄日期：2025-10-15</div>
                      <div className="text-xs text-muted-foreground mt-1">卫星：高分二号 | 分辨率：0.8米</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">变化后影像</div>
                      <div className="text-sm mt-1">拍摄日期：2026-05-10</div>
                      <div className="text-xs text-muted-foreground mt-1">卫星：高分六号 | 分辨率：2米</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              导出报告
            </Button>
            <Button>
              处理图斑
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== 监测批次详情弹窗 ====================
interface MonitorBatchDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: MonitorBatch | null;
}

export function MonitorBatchDetailDialog({ open, onOpenChange, batch }: MonitorBatchDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            监测批次详情
          </DialogTitle>
          <DialogDescription>
            查看监测批次的详细信息和图斑分布情况
          </DialogDescription>
        </DialogHeader>

        {batch && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">批次编号</div>
                <div className="font-medium">{batch.batchNo}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">监测日期</div>
                <div className="font-medium">{batch.monitorDate}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">影像来源</div>
                <div className="font-medium">
                  <Badge variant="outline">{batch.imageSource}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">监测区域</div>
                <div className="font-medium">{batch.region}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">分辨率</div>
                <div className="font-medium">{batch.resolution}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">覆盖范围</div>
                <div className="font-medium">{batch.coverage}</div>
              </div>
            </div>

            <Separator />

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-primary">{batch.spotCount}</div>
                <div className="text-sm text-muted-foreground">图斑总数</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-warning">{batch.suspectedCount}</div>
                <div className="text-sm text-muted-foreground">疑似问题</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-success">{batch.spotCount - batch.suspectedCount}</div>
                <div className="text-sm text-muted-foreground">正常图斑</div>
              </div>
            </div>

            <Separator />

            {/* 图斑类型分布 */}
            <div className="space-y-2">
              <div className="text-sm font-medium">问题类型分布</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">撂荒</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-8 rounded-full bg-destructive"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">12个</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">非粮化</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-12 rounded-full bg-warning"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">18个</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">违规割青</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-6 rounded-full bg-info"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">8个</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">焚烧秸秆</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-4 rounded-full bg-success"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">5个</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 处理进度 */}
            <div className="space-y-2">
              <div className="text-sm font-medium">处置进度</div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="rounded-lg bg-blue-50 p-2">
                  <div className="font-medium text-blue-600">待核查</div>
                  <div className="text-xs text-muted-foreground">28个</div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-2">
                  <div className="font-medium text-yellow-600">核查中</div>
                  <div className="text-xs text-muted-foreground">15个</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-2">
                  <div className="font-medium text-orange-600">整改中</div>
                  <div className="text-xs text-muted-foreground">10个</div>
                </div>
                <div className="rounded-lg bg-green-50 p-2">
                  <div className="font-medium text-green-600">已结案</div>
                  <div className="text-xs text-muted-foreground">36个</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出报告
            </Button>
            <Button asChild>
              <Link href={`/monitor/spots?batch=${batch?.id}`}>
                查看图斑列表
              </Link>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
