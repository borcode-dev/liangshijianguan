'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';

// 消息类型
interface Message {
  id: string;
  type: string;
  title: string;
  content: string;
  source: string;
  time: string;
  priority?: string;
  read: boolean;
}

// 消息设置类型
interface MessageSettings {
  todoNotify: boolean;
  warningNotify: boolean;
  systemNotify: boolean;
  emailNotify: boolean;
}

const STORAGE_KEY_MESSAGES = 'messages-data';
const STORAGE_KEY_SETTINGS = 'message-settings';

// 初始消息数据
const initialMessages: Message[] = [
  {
    id: 'MSG-001', type: '待办', title: '图斑TB-001待核查',
    content: '怀远县龙亢镇疑似撂荒图斑，面积5.6亩，请在7天内完成核查。',
    source: '系统通知', time: '2026-06-09 10:30', priority: '高', read: false,
  },
  {
    id: 'MSG-002', type: '待办', title: '事件SJ-001待审核',
    content: '临泉县违规割青事件已完成核查，请及时审核。',
    source: '市级审核', time: '2026-06-09 09:15', priority: '中', read: false,
  },
  {
    id: 'MSG-003', type: '待办', title: '整改任务即将到期',
    content: '怀远县TB-004整改任务将于06-12到期，请督促整改落实。',
    source: '系统提醒', time: '2026-06-09 08:00', priority: '高', read: true,
  },
  {
    id: 'MSG-004', type: '预警', title: '图斑TB-015即将超期',
    content: '临泉县疑似割青图斑，剩余1天即将超期，请尽快处理。',
    source: '系统预警', time: '2026-06-09 14:00', priority: '紧急', read: false,
  },
  {
    id: 'MSG-005', type: '预警', title: '蚌埠市待核查图斑超过50个',
    content: '蚌埠市目前有52个待核查图斑，建议加快核查进度。',
    source: '数据预警', time: '2026-06-09 12:00', priority: '高', read: false,
  },
  {
    id: 'MSG-006', type: '通知', title: '巡查记录XC-001已提交',
    content: '省级巡查员A已完成怀远县龙亢镇抽查，发现问题1处。',
    source: '巡查系统', time: '2026-06-09 16:45', read: false,
  },
  {
    id: 'MSG-007', type: '通知', title: '监测批次JM-2026-06分析完成',
    content: '6月上旬全省监测批次已完成AI分析，共发现疑似图斑89个。',
    source: '监测系统', time: '2026-06-09 15:30', read: true,
  },
  {
    id: 'MSG-008', type: '通知', title: '系统维护通知',
    content: '系统将于今晚22:00-23:00进行例行维护，届时部分功能暂停使用。',
    source: '系统管理员', time: '2026-06-09 11:00', read: true,
  },
];

const initialSettings: MessageSettings = {
  todoNotify: true,
  warningNotify: true,
  systemNotify: true,
  emailNotify: false,
};

// 优先级颜色
const priorityColors: Record<string, string> = {
  '紧急': 'bg-[#F56C6C]',
  '高': 'bg-[#E6A23C]',
  '中': 'bg-[#409EFF]',
  '低': 'bg-[#909399]',
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<MessageSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // 从localStorage初始化
  useEffect(() => {
    setMessages(getStorageData<Message[]>(STORAGE_KEY_MESSAGES, initialMessages));
    setSettings(getStorageData<MessageSettings>(STORAGE_KEY_SETTINGS, initialSettings));
  }, []);

  // 未读数
  const unreadCount = messages.filter((m) => !m.read).length;

  // 按类型筛选
  const getDisplayMessages = () => {
    switch (activeTab) {
      case 'todo': return messages.filter((m) => m.type === '待办');
      case 'warning': return messages.filter((m) => m.type === '预警');
      case 'notification': return messages.filter((m) => m.type === '通知');
      default: return messages;
    }
  };

  const displayMessages = getDisplayMessages();

  // 切换消息选中
  const toggleMessageSelection = (id: string) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 全部已读
  const handleMarkAllRead = () => {
    const updated = messages.map((m) => ({ ...m, read: true }));
    setMessages(updated);
    setStorageData(STORAGE_KEY_MESSAGES, updated);
    toast.success('已全部标记为已读', { description: `${unreadCount}条消息已标记为已读` });
  };

  // 删除选中
  const handleDeleteSelected = () => {
    if (selectedMessages.length === 0) return;
    const updated = messages.filter((m) => !selectedMessages.includes(m.id));
    setMessages(updated);
    setStorageData(STORAGE_KEY_MESSAGES, updated);
    toast.success('删除成功', { description: `已删除${selectedMessages.length}条消息` });
    setSelectedMessages([]);
  };

  // 查看详情
  const handleViewDetail = (msg: Message) => {
    // 标记为已读
    if (!msg.read) {
      const updated = messages.map((m) =>
        m.id === msg.id ? { ...m, read: true } : m
      );
      setMessages(updated);
      setStorageData(STORAGE_KEY_MESSAGES, updated);
    }
    setSelectedMsg(msg);
    setDetailOpen(true);
  };

  // 更新设置
  const handleSettingChange = (key: keyof MessageSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setStorageData(STORAGE_KEY_SETTINGS, updated);
    toast.success('设置已保存');
  };

  // 统计
  const todoCount = messages.filter((m) => m.type === '待办').length;
  const warningCount = messages.filter((m) => m.type === '预警').length;
  const notificationCount = messages.filter((m) => m.type === '通知').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="消息中心"
        description="查看系统消息、待办任务和预警通知"
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-[#1A5C9A]" onClick={() => setActiveTab('all')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{messages.length}</div>
            <div className="text-sm text-muted-foreground">全部消息</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-[#1A5C9A]" onClick={() => setActiveTab('todo')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#409EFF]">{todoCount}</div>
            <div className="text-sm text-muted-foreground">待办任务</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-[#1A5C9A]" onClick={() => setActiveTab('warning')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#F56C6C]">{warningCount}</div>
            <div className="text-sm text-muted-foreground">预警消息</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-[#1A5C9A]" onClick={() => setActiveTab('notification')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#67C23A]">{notificationCount}</div>
            <div className="text-sm text-muted-foreground">系统通知</div>
          </CardContent>
        </Card>
      </div>

      {/* 消息列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            消息列表
            {unreadCount > 0 && (
              <Badge className="bg-[#F56C6C]">{unreadCount}条未读</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              全部已读
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedMessages.length === 0}
              onClick={handleDeleteSelected}
            >
              删除选中
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="todo">待办 ({todoCount})</TabsTrigger>
              <TabsTrigger value="warning">预警 ({warningCount})</TabsTrigger>
              <TabsTrigger value="notification">通知 ({notificationCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {displayMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  暂无消息
                </div>
              ) : (
                <div className="space-y-2">
                  {displayMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                        !msg.read ? 'bg-blue-50/50 border-l-4 border-l-[#409EFF]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedMessages.includes(msg.id)}
                          onCheckedChange={() => toggleMessageSelection(msg.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{msg.title}</span>
                            {msg.priority && (
                              <Badge className={priorityColors[msg.priority] || ''}>
                                {msg.priority}
                              </Badge>
                            )}
                            {!msg.read && (
                              <Badge className="bg-[#409EFF]">未读</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{msg.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>来源：{msg.source}</span>
                            <span>时间：{msg.time}</span>
                          </div>
                        </div>
                        <Button variant="link" size="sm" onClick={() => handleViewDetail(msg)}>
                          查看详情
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 消息详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>消息详情</DialogTitle>
            <DialogDescription>查看消息的完整内容</DialogDescription>
          </DialogHeader>
          {selectedMsg && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedMsg.type}</Badge>
                {selectedMsg.priority && (
                  <Badge className={priorityColors[selectedMsg.priority] || ''}>
                    {selectedMsg.priority}
                  </Badge>
                )}
                {!selectedMsg.read && <Badge className="bg-[#409EFF]">未读</Badge>}
              </div>
              <div className="text-lg font-medium">{selectedMsg.title}</div>
              <div className="p-4 bg-muted rounded-lg text-sm">{selectedMsg.content}</div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>来源：{selectedMsg.source}</span>
                <span>时间：{selectedMsg.time}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 消息设置 */}
      <Card>
        <CardHeader>
          <CardTitle>消息设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">待办任务提醒</div>
                <div className="text-sm text-muted-foreground">接收新的待办任务时提醒</div>
              </div>
              <Switch
                checked={settings.todoNotify}
                onCheckedChange={(v) => handleSettingChange('todoNotify', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">超期预警提醒</div>
                <div className="text-sm text-muted-foreground">任务即将超期或已超期时提醒</div>
              </div>
              <Switch
                checked={settings.warningNotify}
                onCheckedChange={(v) => handleSettingChange('warningNotify', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">系统通知</div>
                <div className="text-sm text-muted-foreground">系统维护、更新等通知</div>
              </div>
              <Switch
                checked={settings.systemNotify}
                onCheckedChange={(v) => handleSettingChange('systemNotify', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">邮件通知</div>
                <div className="text-sm text-muted-foreground">重要消息同时发送邮件</div>
              </div>
              <Switch
                checked={settings.emailNotify}
                onCheckedChange={(v) => handleSettingChange('emailNotify', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
