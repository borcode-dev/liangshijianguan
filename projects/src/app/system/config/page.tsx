'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';

// 系统配置类型
interface SystemConfig {
  // 监测参数
  monitoringFrequency: string;
  aiConfidenceThreshold: number;
  autoAssignEnabled: boolean;
  assignDeadlineDays: number;
  // 预警参数
  overDueDays: number;
  warningDaysBefore: number;
  autoWarningEnabled: boolean;
  // 通知参数
  emailNotifyEnabled: boolean;
  smsNotifyEnabled: boolean;
  systemNotifyEnabled: boolean;
  // 数据参数
  dataRetentionDays: number;
  autoBackupEnabled: boolean;
  backupFrequency: string;
  backupRetentionCount: number;
  // 系统参数
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  logRetentionDays: number;
}

const STORAGE_KEY = 'system-config';

// 默认配置
const defaultConfig: SystemConfig = {
  monitoringFrequency: '半月',
  aiConfidenceThreshold: 80,
  autoAssignEnabled: true,
  assignDeadlineDays: 7,
  overDueDays: 15,
  warningDaysBefore: 3,
  autoWarningEnabled: true,
  emailNotifyEnabled: false,
  smsNotifyEnabled: false,
  systemNotifyEnabled: true,
  dataRetentionDays: 365,
  autoBackupEnabled: true,
  backupFrequency: '每日',
  backupRetentionCount: 30,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  logRetentionDays: 180,
};

export default function ConfigPage() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [lastBackupTime, setLastBackupTime] = useState('2026-06-09 02:00');

  // 从localStorage初始化
  useEffect(() => {
    setConfig(getStorageData<SystemConfig>(STORAGE_KEY, defaultConfig));
  }, []);

  // 更新配置字段
  const updateConfig = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // 保存配置
  const handleSave = () => {
    setStorageData(STORAGE_KEY, config);
    toast.success('配置已保存', { description: '系统参数配置已成功保存' });
  };

  // 重置默认
  const handleReset = () => {
    setConfig(defaultConfig);
    setStorageData(STORAGE_KEY, defaultConfig);
    toast.success('已重置为默认配置', { description: '所有参数已恢复为系统默认值' });
  };

  // 立即备份
  const handleBackup = () => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastBackupTime(timeStr);
    toast.success('备份已启动', { description: '数据备份正在进行中，预计5分钟内完成' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="参数配置"
        description="配置系统运行参数和业务规则"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>重置默认</Button>
            <Button onClick={handleSave}>保存配置</Button>
          </div>
        }
      />

      {/* 监测参数 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🛰️ 监测参数
            <Badge variant="outline">核心配置</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>监测频率</Label>
              <Select value={config.monitoringFrequency} onValueChange={(v) => updateConfig('monitoringFrequency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="每周">每周</SelectItem>
                  <SelectItem value="半月">半月</SelectItem>
                  <SelectItem value="每月">每月</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">卫星遥感数据获取频率</p>
            </div>
            <div className="space-y-2">
              <Label>AI识别置信度阈值 (%)</Label>
              <Input
                type="number"
                min={50}
                max={100}
                value={config.aiConfidenceThreshold}
                onChange={(e) => updateConfig('aiConfidenceThreshold', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">低于此阈值的识别结果将标记为待确认</p>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">自动下发核查</div>
                <div className="text-sm text-muted-foreground">AI识别后自动下发至对应单位</div>
              </div>
              <Switch
                checked={config.autoAssignEnabled}
                onCheckedChange={(v) => updateConfig('autoAssignEnabled', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>核查期限 (天)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={config.assignDeadlineDays}
                onChange={(e) => updateConfig('assignDeadlineDays', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">下发核查后的完成期限</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预警参数 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            ⚠️ 预警参数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>超期天数</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={config.overDueDays}
                onChange={(e) => updateConfig('overDueDays', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">超过核查期限多少天标记为超期</p>
            </div>
            <div className="space-y-2">
              <Label>提前预警天数</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={config.warningDaysBefore}
                onChange={(e) => updateConfig('warningDaysBefore', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">到期前多少天发送预警通知</p>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg md:col-span-2">
              <div>
                <div className="font-medium">自动预警</div>
                <div className="text-sm text-muted-foreground">系统自动检测并发送超期预警</div>
              </div>
              <Switch
                checked={config.autoWarningEnabled}
                onCheckedChange={(v) => updateConfig('autoWarningEnabled', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知参数 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🔔 通知参数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">邮件通知</div>
                <div className="text-sm text-muted-foreground">通过邮件发送重要通知</div>
              </div>
              <Switch
                checked={config.emailNotifyEnabled}
                onCheckedChange={(v) => updateConfig('emailNotifyEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">短信通知</div>
                <div className="text-sm text-muted-foreground">通过短信发送紧急通知</div>
              </div>
              <Switch
                checked={config.smsNotifyEnabled}
                onCheckedChange={(v) => updateConfig('smsNotifyEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">系统通知</div>
                <div className="text-sm text-muted-foreground">通过系统消息中心发送通知</div>
              </div>
              <Switch
                checked={config.systemNotifyEnabled}
                onCheckedChange={(v) => updateConfig('systemNotifyEnabled', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据与备份 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            💾 数据与备份
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>数据保留天数</Label>
              <Input
                type="number"
                min={30}
                max={3650}
                value={config.dataRetentionDays}
                onChange={(e) => updateConfig('dataRetentionDays', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">超过保留期的历史数据将自动归档</p>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">自动备份</div>
                <div className="text-sm text-muted-foreground">按设定频率自动备份数据</div>
              </div>
              <Switch
                checked={config.autoBackupEnabled}
                onCheckedChange={(v) => updateConfig('autoBackupEnabled', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>备份频率</Label>
              <Select value={config.backupFrequency} onValueChange={(v) => updateConfig('backupFrequency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="每日">每日</SelectItem>
                  <SelectItem value="每周">每周</SelectItem>
                  <SelectItem value="每月">每月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>备份保留份数</Label>
              <Input
                type="number"
                min={5}
                max={100}
                value={config.backupRetentionCount}
                onChange={(e) => updateConfig('backupRetentionCount', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">超过此数量的旧备份将自动删除</p>
            </div>
            <div className="md:col-span-2 flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div>
                <div className="font-medium">上次备份时间</div>
                <div className="text-sm text-muted-foreground">{lastBackupTime}</div>
              </div>
              <Button variant="outline" onClick={handleBackup}>立即备份</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统安全 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🔒 系统安全
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>会话超时 (分钟)</Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={config.sessionTimeout}
                onChange={(e) => updateConfig('sessionTimeout', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">无操作超过此时间后自动退出</p>
            </div>
            <div className="space-y-2">
              <Label>最大登录尝试次数</Label>
              <Input
                type="number"
                min={3}
                max={10}
                value={config.maxLoginAttempts}
                onChange={(e) => updateConfig('maxLoginAttempts', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">超过此次数后锁定账户</p>
            </div>
            <div className="space-y-2">
              <Label>密码最小长度</Label>
              <Input
                type="number"
                min={6}
                max={20}
                value={config.passwordMinLength}
                onChange={(e) => updateConfig('passwordMinLength', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>日志保留天数</Label>
              <Input
                type="number"
                min={30}
                max={365}
                value={config.logRetentionDays}
                onChange={(e) => updateConfig('logRetentionDays', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
