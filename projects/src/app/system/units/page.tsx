'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';

// 单位类型
interface Unit {
  id: string;
  name: string;
  level: string;
  parentUnit: string;
  region: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
  userCount: number;
}

const STORAGE_KEY = 'system-units';

// 初始单位数据
const initialUnits: Unit[] = [
  { id: 'UNIT-001', name: '安徽省农业农村厅', level: '省级', parentUnit: '-', region: '安徽省', contactPerson: '张主任', contactPhone: '0551-12345678', status: '启用', userCount: 12 },
  { id: 'UNIT-002', name: '蚌埠市农业农村局', level: '市级', parentUnit: '安徽省农业农村厅', region: '蚌埠市', contactPerson: '李局长', contactPhone: '0552-23456789', status: '启用', userCount: 8 },
  { id: 'UNIT-003', name: '阜阳市农业农村局', level: '市级', parentUnit: '安徽省农业农村厅', region: '阜阳市', contactPerson: '王局长', contactPhone: '0558-34567890', status: '启用', userCount: 7 },
  { id: 'UNIT-004', name: '宿州市农业农村局', level: '市级', parentUnit: '安徽省农业农村厅', region: '宿州市', contactPerson: '赵局长', contactPhone: '0557-45678901', status: '启用', userCount: 6 },
  { id: 'UNIT-005', name: '怀远县农业农村局', level: '县级', parentUnit: '蚌埠市农业农村局', region: '蚌埠市怀远县', contactPerson: '钱局长', contactPhone: '0552-56789012', status: '启用', userCount: 5 },
  { id: 'UNIT-006', name: '临泉县农业农村局', level: '县级', parentUnit: '阜阳市农业农村局', region: '阜阳市临泉县', contactPerson: '孙局长', contactPhone: '0558-67890123', status: '启用', userCount: 4 },
  { id: 'UNIT-007', name: '合肥市农业农村局', level: '市级', parentUnit: '安徽省农业农村厅', region: '合肥市', contactPerson: '周局长', contactPhone: '0551-78901234', status: '启用', userCount: 9 },
  { id: 'UNIT-008', name: '滁州市农业农村局', level: '市级', parentUnit: '安徽省农业农村厅', region: '滁州市', contactPerson: '吴局长', contactPhone: '0550-89012345', status: '禁用', userCount: 0 },
];

export default function UnitsManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // 新增/编辑弹窗
  const [showDialog, setShowDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [form, setForm] = useState({
    name: '',
    level: '',
    parentUnit: '',
    region: '',
    contactPerson: '',
    contactPhone: '',
    status: '启用',
  });

  // 从localStorage初始化
  useEffect(() => {
    setUnits(getStorageData<Unit[]>(STORAGE_KEY, initialUnits));
  }, []);

  // 筛选
  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.name.includes(searchTerm) || unit.region.includes(searchTerm);
    const matchesLevel = filterLevel === 'all' || unit.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // 打开新增弹窗
  const handleOpenAdd = () => {
    setEditingUnit(null);
    setForm({ name: '', level: '', parentUnit: '', region: '', contactPerson: '', contactPhone: '', status: '启用' });
    setShowDialog(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setForm({
      name: unit.name,
      level: unit.level,
      parentUnit: unit.parentUnit,
      region: unit.region,
      contactPerson: unit.contactPerson,
      contactPhone: unit.contactPhone,
      status: unit.status,
    });
    setShowDialog(true);
  };

  // 保存（新增或编辑）
  const handleSave = () => {
    if (!form.name || !form.level) {
      toast.error('请填写必填字段');
      return;
    }

    if (editingUnit) {
      // 编辑
      const updated = units.map((u) =>
        u.id === editingUnit.id ? { ...u, ...form } : u
      );
      setUnits(updated);
      setStorageData(STORAGE_KEY, updated);
      toast.success('单位信息已更新', { description: `${form.name} 的信息已保存` });
    } else {
      // 新增
      const newUnit: Unit = {
        id: generateNo('UNIT'),
        name: form.name,
        level: form.level,
        parentUnit: form.parentUnit || '-',
        region: form.region,
        contactPerson: form.contactPerson || '-',
        contactPhone: form.contactPhone || '-',
        status: form.status,
        userCount: 0,
      };
      const updated = [...units, newUnit];
      setUnits(updated);
      setStorageData(STORAGE_KEY, updated);
      toast.success('单位添加成功', { description: `${form.name} 已添加` });
    }
    setShowDialog(false);
  };

  // 重置筛选
  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterLevel('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="单位管理"
        description="管理系统中各级农业农村部门单位信息"
        actions={
          <Button onClick={handleOpenAdd}>新增单位</Button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{units.length}</div>
            <div className="text-sm text-muted-foreground">单位总数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#1A5C9A]">{units.filter((u) => u.level === '省级').length}</div>
            <div className="text-sm text-muted-foreground">省级单位</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#409EFF]">{units.filter((u) => u.level === '市级').length}</div>
            <div className="text-sm text-muted-foreground">市级单位</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#67C23A]">{units.filter((u) => u.level === '县级').length}</div>
            <div className="text-sm text-muted-foreground">县级单位</div>
          </CardContent>
        </Card>
      </div>

      {/* 单位列表 */}
      <Card>
        <CardHeader>
          <CardTitle>单位列表</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 筛选条件 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索单位名称、区域..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                <SelectItem value="省级">省级</SelectItem>
                <SelectItem value="市级">市级</SelectItem>
                <SelectItem value="县级">县级</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="启用">启用</SelectItem>
                <SelectItem value="禁用">禁用</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleResetFilter}>重置</Button>
          </div>

          {/* 表格 */}
          {filteredUnits.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">暂无匹配的单位</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>单位编号</TableHead>
                  <TableHead>单位名称</TableHead>
                  <TableHead>级别</TableHead>
                  <TableHead>上级单位</TableHead>
                  <TableHead>所属区域</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>联系电话</TableHead>
                  <TableHead>用户数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.id}</TableCell>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{unit.parentUnit}</TableCell>
                    <TableCell>{unit.region}</TableCell>
                    <TableCell>{unit.contactPerson}</TableCell>
                    <TableCell>{unit.contactPhone}</TableCell>
                    <TableCell>{unit.userCount}</TableCell>
                    <TableCell>
                      <Badge className={unit.status === '启用' ? 'bg-[#67C23A]' : 'bg-[#F56C6C]'}>
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" onClick={() => handleOpenEdit(unit)}>编辑</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUnit ? '编辑单位' : '新增单位'}</DialogTitle>
            <DialogDescription>{editingUnit ? '修改单位信息' : '添加新的管理单位'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>单位名称 *</Label>
              <Input placeholder="请输入单位名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>单位级别 *</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger><SelectValue placeholder="请选择级别" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="省级">省级</SelectItem>
                  <SelectItem value="市级">市级</SelectItem>
                  <SelectItem value="县级">县级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>上级单位</Label>
              <Select value={form.parentUnit} onValueChange={(v) => setForm({ ...form, parentUnit: v })}>
                <SelectTrigger><SelectValue placeholder="请选择上级单位" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">无（顶级单位）</SelectItem>
                  {units.filter((u) => u.level !== '县级').map((u) => (
                    <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>所属区域</Label>
              <Input placeholder="请输入所属区域" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input placeholder="请输入联系人" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input placeholder="请输入联系电话" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
            {editingUnit && (
              <div className="space-y-2">
                <Label>状态</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="启用">启用</SelectItem>
                    <SelectItem value="禁用">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={handleSave}>{editingUnit ? '保存' : '确认添加'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
