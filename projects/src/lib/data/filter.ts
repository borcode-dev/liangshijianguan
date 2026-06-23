import { useAuth } from '@/lib/auth';

/**
 * 根据当前用户角色过滤数据
 * 省级用户：返回全部数据
 * 市级用户：只返回该市数据
 */
export function filterByCity<T extends { city?: string }>(data: T[]): T[] {
  // 此函数在组件外无法使用 hook，需要在组件内调用
  // 使用 filterByCityWithCity 代替
  return data;
}

/**
 * 根据城市名过滤数据
 * city 为 undefined 或 '安徽省' 时返回全部数据
 */
export function filterByCityWithCity<T extends { city?: string }>(
  data: T[],
  userCity?: string
): T[] {
  if (!userCity) return data;
  return data.filter((item) => item.city === userCity);
}

/**
 * 根据城市名过滤数据（region 字段版本，用于 MonitorBatch 等）
 */
export function filterByRegion<T extends { region?: string }>(
  data: T[],
  userCity?: string
): T[] {
  if (!userCity) return data;
  return data.filter(
    (item) =>
      item.region === userCity ||
      item.region?.includes(userCity) ||
      item.region === '全省'
  );
}

/**
 * 获取当前用户的城市过滤条件
 * 返回 undefined 表示省级（看全部），返回城市名表示市级
 */
export function useCityFilter(): string | undefined {
  const { user } = useAuth();
  if (user?.role === 'city' && user.city) {
    return user.city;
  }
  return undefined;
}
