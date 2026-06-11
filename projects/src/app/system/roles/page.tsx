'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';

// 权限模块定义
const permissionModules = [
  {
    name: '监测管理',
    permissions: ['查看监测数据', '导出监测数据', '管理监测批次', '配置监测参数'],
  },
  {
    name: '图斑管理',
    permissions: ['查看图斑列表', '核查图斑', '审核图斑', '删除图斑'],
  },
  {
    name: '事件管理',
    permissions: ['查看事件列表', '创建事件', '审核事件', '删除事件'],
  },
  {
    name: '巡查管理',
    permissions: ['查看巡查记录', '新增巡查', '导出巡查记录'],
  },
  {
    name: '统计分析',
    permissions: ['查看统计报表', '导出报表', '定制报表'],
  },
  {
    name: '系统管理',
    permissions: ['用户管理', '角色管理', '单位管理', '参数配置'],
  },
];

// 角色类型
interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: string;
}

const STORAGE_KEY = 'system-roles';

// 初始角色数据
const initialRoles: Role[] = [
  {
    id: 'ROLE-001',
    name: '省级管理员',
    description: '省级农业农村厅管理员，拥有所有权限',
    userCount: 2,
    permissions: permissionModules.flatMap((m) => m.permissions),
    status: '启用',
  },
  {
    id: 'ROLE-002',
    name: '市级管理员',
    description: '市级农业农村局管理员，管理本市数据',
    userCount: 3,
    permissions: ['查看监测数据', '导出监测数据', '查看图斑列表', '核查图斑', '审核图斑', '查看事件列表', '创建事件', '审核事件', '查看巡查记录', '新增巡查', '查看统计报表', '导出报表'],
    status: '启用',
  },
  {
    id: 'ROLE-003',
    name: '县级管理员',
    description: '县级农业农村局管理员，管理本县数据',
    userCount: 5,
    permissions: ['查看监测数据', '查看图斑列表', '核查图斑', '查看事件列表', '创建事件', '查看巡查记录', '新增巡查', '查看统计报表'],
    status: '启用',
  },
  {
    id: 'ROLE-004',
    name: '省级巡查员',
    description: '省级巡查人员，仅可录入巡查记录',
    userCount: 4,
    permissions: ['查看监测数据', '查看图斑列表', '查看巡查记录', '新增巡查'],
    status: '启用',
  },
  {
    id: 'ROLE-005',
    name: '数据查看员',
    description: '仅可查看数据，无编辑权限',
    userCount: 8,
    permissions: ['查看监测数据', '查看图斑列表', '查看事件列表', '查看巡查记录', '查看统计报表'],
    status: '启用',
  },
];

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  // 新增角色弹窗
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // 从localStorage初始化
  useEffect(() => {
    setRoles(getStorageData<Role[]>(STORAGE_KEY, initialRoles));
  }, []);

  // 选中角色
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setEditingPermissions([...role.permissions]);
  };

  // 切换权限
  const togglePermission = (permission: string) => {
    setEditingPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  // 切换模块全选
  const toggleModule = (moduleName: string) => {
    const module = permissionModules.find((m) => m.name === moduleName);
    if (!module) return;
    const allSelected = module.permissions.every((p) => editingPermissions.includes(p));
    if (allSelected) {
      setEditingPermissions((prev) => prev.filter((p) => !module.permissions.includes(p)));
    } else {
      setEditingPermissions((prev) => [...new Set([...prev, ...module.permissions])]);
    }
  };

  // 保存权限配置
  const handleSavePermissions = () => {
    if (!selectedRole) return;
    const updated = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: editingPermissions } : r
    );
    setRoles(updated);
    setStorageData(STORAGE_KEY, updated);
    setSelectedRole({ ...selectedRole, permissions: editingPermissions });
    toast.success('权限配置已保存', { description: `角色 ${selectedRole.name} 的权限已更新` });
  };

  // 新增角色
  const handleAddRole = () => {
    if (!newRoleName) {
      toast.error('请填写角色名称');
      return;
    }
    const newRole: Role = {
      id: generateNo('ROLE'),
      name: newRoleName,
      description: newRoleDesc,
      userCount: 0,
      permissions: [],
      status: '启用',
    };
    const updated = [...roles, newRole];
    setRoles(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('角色创建成功', { description: `角色 ${newRoleName} 已添加` });
    setShowAddDialog(false);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  // 复制角色
  const handleCopyRole = (role: Role) => {
    const copied: Role = {
      id: generateNo('ROLE'),
      name: `${role.name}(副本)`,
      description: role.description,
      userCount: 0,
      permissions: [...role.permissions],
      status: '启用',
    };
    const updated = [...roles, copied];
    setRoles(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('角色已复制', { description: `已创建角色 ${copied.name}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="角色权限管理"
        description="管理系统角色和权限配置"
        actions={
          <Button onClick={() => setShowAddDialog(true)}>新增角色</Button>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* 角色列表 */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">角色列表</CardTitle>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">暂无角色</div>
              ) : (
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                        selectedRole?.id === role.id ? 'border-[#1A5C9A] bg-[#1A5C9A]/5' : ''
                      }`}
                      onClick={() => handleSelectRole(role)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                        <Badge variant="outline">{role.userCount}人</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 权限配置 */}
        <div className="col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {selectedRole ? `${selectedRole.name} - 权限配置` : '请选择角色'}
              </CardTitle>
              {selectedRole && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyRole(selectedRole)}>
                    复制角色
                  </Button>
                  <Button size="sm" onClick={handleSavePermissions}>
                    保存配置
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedRole ? (
                <div className="text-center text-muted-foreground py-10">
                  请从左侧选择一个角色来配置权限
                </div>
              ) : (
                <div className="space-y-4">
                  {permissionModules.map((module) => {
                    const allSelected = module.permissions.every((p) => editingPermissions.includes(p));
                    const someSelected = module.permissions.some((p) => editingPermissions.includes(p));
                    return (
                      <div key={module.name} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Checkbox
                            checked={allSelected}
                            ref={(el) => {
                              if (el) {
                                (el as unknown as HTMLInputElement).indeterminate = someSelected && !allSelected;
                              }
                            }}
                            onCheckedChange={() => toggleModule(module.name)}
                          />
                          <span className="font-medium">{module.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {editingPermissions.filter((p) => module.permissions.includes(p)).length}/{module.permissions.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 ml-6">
                          {module.permissions.map((permission) => (
                            <div key={permission} className="flex items-center gap-2">
                              <Checkbox
                                checked={editingPermissions.includes(permission)}
                                onCheckedChange={() => togglePermission(permission)}
                              />
                              <span className="text-sm">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
