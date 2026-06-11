'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  Info,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'todo' | 'warning' | 'notice';
  title: string;
  content: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'todo',
    title: '图斑TB-001待核查',
    content: '怀远县龙亢镇疑似撂荒图斑，请尽快完成现场核查',
    time: '2026-06-06 10:30',
    read: false,
    actionUrl: '/closed-loop/inspect',
  },
  {
    id: '2',
    type: 'warning',
    title: '图斑TB-003即将超期',
    content: '宿州埇桥区非粮化图斑剩余1天，请加快处理',
    time: '2026-06-06 09:15',
    read: false,
    actionUrl: '/closed-loop/rectify',
  },
  {
    id: '3',
    type: 'warning',
    title: '阜阳市待核查图斑超过50个',
    content: '阜阳市当前待核查图斑数量较多，请加快核查进度',
    time: '2026-06-06 08:00',
    read: true,
  },
  {
    id: '4',
    type: 'notice',
    title: '巡查记录XC-001已提交',
    content: '怀远县龙亢镇巡查记录已提交完成',
    time: '2026-06-05 16:45',
    read: true,
    actionUrl: '/system/patrol',
  },
  {
    id: '5',
    type: 'todo',
    title: '图斑TB-005待核查',
    content: '合肥肥西县计划未落实图斑，请完成现场核查',
    time: '2026-06-05 14:20',
    read: true,
    actionUrl: '/closed-loop/inspect',
  },
  {
    id: '6',
    type: 'notice',
    title: '整改任务SJ-002已完成',
    content: '临泉县鲖城镇撂荒图斑整改完成，待验收',
    time: '2026-06-05 11:30',
    read: true,
    actionUrl: '/closed-loop/review',
  },
];

const typeConfig = {
  todo: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    label: '待办',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    label: '预警',
  },
  notice: {
    icon: <Info className="h-4 w-4" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    label: '通知',
  },
};

interface MessageCenterProps {
  className?: string;
}

export function MessageCenter({ className }: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [open, setOpen] = useState(false);

  const unreadCount = messages.filter(m => !m.read).length;
  const todoCount = messages.filter(m => m.type === 'todo' && !m.read).length;
  const warningCount = messages.filter(m => m.type === 'warning' && !m.read).length;

  const markAsRead = (id: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, read: true } : m))
    );
  };

  const markAllAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const filterByType = (type: string | 'all') => {
    if (type === 'all') return messages;
    return messages.filter(m => m.type === type);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">消息中心</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}条未读</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              全部已读
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <div className="border-b px-2">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                全部
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {messages.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="todo"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                待办
                {todoCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {todoCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="warning"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                预警
                {warningCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {warningCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="notice"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                通知
              </TabsTrigger>
            </TabsList>
          </div>

          {['all', 'todo', 'warning', 'notice'].map(tab => (
            <TabsContent key={tab} value={tab} className="m-0">
              <ScrollArea className="h-80">
                {filterByType(tab === 'all' ? 'all' : tab).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p>暂无消息</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filterByType(tab === 'all' ? 'all' : tab).map(message => (
                      <div
                        key={message.id}
                        className={cn(
                          'p-3 hover:bg-muted/50 transition-colors',
                          !message.read && 'bg-blue-50/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'mt-0.5 rounded-full p-1',
                              typeConfig[message.type].bgColor
                            )}
                          >
                            <span className={typeConfig[message.type].color}>
                              {typeConfig[message.type].icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                !message.read && 'text-primary'
                              )}>
                                {message.title}
                              </p>
                              {!message.read && (
                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {message.time}
                              </span>
                              <div className="flex items-center gap-1">
                                {!message.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => markAsRead(message.id)}
                                  >
                                    标记已读
                                  </Button>
                                )}
                                {message.actionUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setOpen(false)}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    查看
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full" size="sm">
            查看全部消息
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
