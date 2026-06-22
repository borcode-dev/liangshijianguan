'use client';

import { useState } from 'react';
import { useAuth, PRESET_ACCOUNTS, ANHUI_CITIES, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Building2, User, Lock, ArrowRight, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('province');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (selectedRole === 'city' && !selectedCity) {
      toast.error('请选择所属城市');
      return;
    }

    setLoading(true);

    // 模拟登录延迟
    setTimeout(() => {
      if (selectedRole === 'province') {
        login({
          id: 'province-admin',
          name: username || '省级管理员',
          role: 'province',
        });
        toast.success('省级管理员登录成功');
        window.location.href = '/liangshijianguan/';
      } else {
        const city = ANHUI_CITIES.find(c => c.code === selectedCity);
        login({
          id: `city-${selectedCity}`,
          name: username || `${city?.name || ''}管理员`,
          role: 'city',
          city: city?.name,
          cityCode: city?.code,
        });
        toast.success(`${city?.name}管理员登录成功`);
        window.location.href = '/liangshijianguan/';
      }
      setLoading(false);
    }, 500);
  };

  // 快速切换账号
  const handleQuickLogin = (account: typeof PRESET_ACCOUNTS[0]) => {
    setLoading(true);
    setTimeout(() => {
      login({
        id: account.id,
        name: account.name,
        role: account.role,
        city: account.city,
        cityCode: account.cityCode,
      });
      toast.success(`${account.name}登录成功`);
      window.location.href = '/liangshijianguan/';
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A3A6B] via-[#1A5C9A] to-[#0A3A6B] p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex gap-8">
        {/* 左侧：系统介绍 */}
        <div className="hidden lg:flex flex-col justify-center text-white flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.5 3.75L12 11.68 4.5 7.93 12 4.18zM4 9.08l7 3.5v7.42l-7-3.5V9.08zm16 0v7.42l-7 3.5v-7.42l7-3.5z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">粮食安全监管系统</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            安徽省粮食安全<br />监测监管信息平台
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            面向省、市两级农业执法人员，实现粮食安全事件的智能发现、核查处置和闭环监管，保障粮食安全。
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Shield className="h-4 w-4" />
              </div>
              <span>省级全局监管 · 市级属地管理</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Building2 className="h-4 w-4" />
              </div>
              <span>覆盖安徽省16个地级市</span>
            </div>
          </div>
        </div>

        {/* 右侧：登录表单 */}
        <div className="w-full lg:w-[440px]">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">系统登录</CardTitle>
              <CardDescription>请选择登录角色并输入账号信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 角色选择 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">登录角色</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedRole('province')}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                      selectedRole === 'province'
                        ? 'border-[#1A5C9A] bg-[#1A5C9A]/5 text-[#1A5C9A]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      selectedRole === 'province' ? 'bg-[#1A5C9A] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">省级用户</div>
                      <div className="text-xs opacity-70">全局监管</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedRole('city')}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                      selectedRole === 'city'
                        ? 'border-[#1A5C9A] bg-[#1A5C9A]/5 text-[#1A5C9A]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      selectedRole === 'city' ? 'bg-[#1A5C9A] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">市级用户</div>
                      <div className="text-xs opacity-70">属地管理</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 市级用户选择城市 */}
              {selectedRole === 'city' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label className="text-sm font-medium">所属城市</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择所属城市" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANHUI_CITIES.map(city => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 账号密码 */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">账号</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={selectedRole === 'province' ? '请输入省级账号' : '请输入市级账号'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* 登录按钮 */}
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-11 text-base bg-[#1A5C9A] hover:bg-[#0A3A6B]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    登录中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    登录系统
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <Separator />

              {/* 快速切换账号 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">快速切换账号（演示）</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {PRESET_ACCOUNTS.map(account => (
                    <button
                      key={account.id}
                      onClick={() => handleQuickLogin(account)}
                      disabled={loading}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-all hover:border-[#1A5C9A] hover:bg-[#1A5C9A]/5 ${
                        account.role === 'province' ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      {account.role === 'province' ? (
                        <Shield className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{account.name}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
