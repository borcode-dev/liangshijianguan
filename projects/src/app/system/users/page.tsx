'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';

// 用户类型
interface User {
  id: string;
  username: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  email: string;
  status: string;
  lastLogin: string;
}

const STORAGE_KEY = 'system-users';

// 初始用户数据
const initialUsers: User[] = [
  { id: 'USR-001', username: 'zhangsan', name: '张三', department: '省农业农村厅', role: '省级管理员', phone: '138****1234', email: 'zhangsan@agri.ah.cn', status: '启用', lastLogin: '2026-06-09 18:30' },
  { id: 'USR-002', username: 'lisi', name: '李四', department: '蚌埠市农业农村局', role: '市级管理员', phone: '139****5678', email: 'lisi@agri.bengbu.cn', status: '启用', lastLogin: '2026-06-09 17:45' },
  { id: 'USR-003', username: 'wangwu', name: '王五', department: '怀远县农业农村局', role: '县级管理员', phone: '137****9012', email: 'wangwu@agri.huaiyuan.cn', status: '启用', lastLogin: '2026-06-09 16:20' },
  { id: 'USR-004', username: 'zhaoliu', name: '赵六', department: '省农业农村厅', role: '省级巡查员', phone: '136****3456', email: 'zhaoliu@agri.ah.cn', status: '启用', lastLogin: '2026-06-09 14:00' },
  { id: 'USR-005', username: 'qianqi', name: '钱七', department: '阜阳市农业农村局', role: '市级管理员', phone: '135****7890', email: 'qianqi@agri.fuyang.cn', status: '禁用', lastLogin: '2026-05-20 10:30' },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // 新增用户弹窗
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', name: '', department: '', role: '', phone: '', email: '' });

  // 编辑用户弹窗
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: '', name: '', department: '', role: '', phone: '', email: '', status: '' });

  // 重置密码确认
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // 从localStorage初始化
  useEffect(() => {
    setUsers(getStorageData<User[]>(STORAGE_KEY, initialUsers));
  }, []);

  // 筛选
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.includes(searchTerm) || user.username.includes(searchTerm) || user.department.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // 新增用户
  const handleAddUser = () => {
    if (!addForm.username || !addForm.name || !addForm.department || !addForm.role) {
      toast.error('请填写必填字段');
      return;
    }
    const newUser: User = {
      id: generateNo('USR'),
      username: addForm.username,
      name: addForm.name,
      department: addForm.department,
      role: addForm.role,
      phone: addForm.phone || '-',
      email: addForm.email || '-',
      status: '启用',
      lastLogin: '-',
    };
    const updated = [...users, newUser];
    setUsers(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('用户添加成功', { description: `用户 ${addForm.name} 已创建` });
    setShowAddDialog(false);
    setAddForm({ username: '', name: '', department: '', role: '', phone: '', email: '' });
  };

  // 打开编辑弹窗
  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      name: user.name,
      department: user.department,
      role: user.role,
      phone: user.phone,
      email: user.email,
      status: user.status,
    });
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editUser) return;
    if (!editForm.name || !editForm.department || !editForm.role) {
      toast.error('请填写必填字段');
      return;
    }
    const updated = users.map((u) =>
      u.id === editUser.id ? { ...u, ...editForm } : u
    );
    setUsers(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('用户信息已更新', { description: `用户 ${editForm.name} 的信息已保存` });
    setEditUser(null);
  };

  // 重置密码
  const handleResetPassword = () => {
    if (!resetTarget) return;
    toast.success('密码已重置', { description: `用户 ${resetTarget.name} 的密码已重置为默认密码` });
    setResetTarget(null);
  };

  // 删除用户
  const handleDeleteUser = () => {
    if (!deleteTarget) return;
    const updated = users.filter((u) => u.id !== deleteTarget.id);
    setUsers(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('用户已删除', { description: `用户 ${deleteTarget.name} 已被删除` });
    setDeleteTarget(null);
  };

  // 重置筛选
  const handleResetFilter = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="用户管理" description="管理系统用户账户和权限" />

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">用户总数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#67C23A]">{users.filter((u) => u.status === '启用').length}</div>
            <div className="text-sm text-muted-foreground">启用用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#F56C6C]">{users.filter((u) => u.status === '禁用').length}</div>
            <div className="text-sm text-muted-foreground">禁用用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{new Set(users.map((u) => u.role)).size}</div>
            <div className="text-sm text-muted-foreground">角色类型</div>
          </CardContent>
        </Card>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户列表</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>新增用户</Button>
        </CardHeader>
        <CardContent>
          {/* 筛选条件 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索用户名、姓名、部门..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="省级管理员">省级管理员</SelectItem>
                <SelectItem value="市级管理员">市级管理员</SelectItem>
                <SelectItem value="县级管理员">县级管理员</SelectItem>
                <SelectItem value="省级巡查员">省级巡查员</SelectItem>
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
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">暂无匹配的用户</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户编号</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>所属单位</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>联系电话</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge className={user.status === '启用' ? 'bg-[#67C23A]' : 'bg-[#F56C6C]'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="link" size="sm" onClick={() => handleOpenEdit(user)}>编辑</Button>
                        <Button variant="link" size="sm" onClick={() => setResetTarget(user)}>重置密码</Button>
                        <Button variant="link" size="sm" className="text-destructive" onClick={() => setDeleteTarget(user)}>删除</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新增用户弹窗 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增用户</DialogTitle>
            <DialogDescription>创建新的系统用户</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>用户名 *</Label>
              <Input placeholder="请输入用户名" value={addForm.username} onChange={(e) => setAddForm({ ...addForm, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>姓名 *</Label>
              <Input placeholder="请输入姓名" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>所属单位 *</Label>
              <Select value={addForm.department} onValueChange={(v) => setAddForm({ ...addForm, department: v })}>
                <SelectTrigger><SelectValue placeholder="请选择所属单位" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="省农业农村厅">省农业农村厅</SelectItem>
                  <SelectItem value="蚌埠市农业农村局">蚌埠市农业农村局</SelectItem>
                  <SelectItem value="阜阳市农业农村局">阜阳市农业农村局</SelectItem>
                  <SelectItem value="怀远县农业农村局">怀远县农业农村局</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>角色 *</Label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v })}>
                <SelectTrigger><SelectValue placeholder="请选择角色" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="省级管理员">省级管理员</SelectItem>
                  <SelectItem value="市级管理员">市级管理员</SelectItem>
                  <SelectItem value="县级管理员">县级管理员</SelectItem>
                  <SelectItem value="省级巡查员">省级巡查员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input placeholder="请输入联系电话" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input placeholder="请输入邮箱" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={handleAddUser}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户弹窗 */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>用户名</Label>
              <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>所属单位</Label>
              <Select value={editForm.department} onValueChange={(v) => setEditForm({ ...editForm, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="省农业农村厅">省农业农村厅</SelectItem>
                  <SelectItem value="蚌埠市农业农村局">蚌埠市农业农村局</SelectItem>
                  <SelectItem value="阜阳市农业农村局">阜阳市农业农村局</SelectItem>
                  <SelectItem value="怀远县农业农村局">怀远县农业农村局</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="省级管理员">省级管理员</SelectItem>
                  <SelectItem value="市级管理员">市级管理员</SelectItem>
                  <SelectItem value="县级管理员">县级管理员</SelectItem>
                  <SelectItem value="省级巡查员">省级巡查员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="启用">启用</SelectItem>
                  <SelectItem value="禁用">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>取消</Button>
            <Button onClick={handleSaveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码确认 */}
      <AlertDialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置密码</AlertDialogTitle>
            <AlertDialogDescription>
              确定要重置用户 {resetTarget?.name} 的密码吗？密码将被重置为默认密码。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>确认重置</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 {deleteTarget?.name} 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
