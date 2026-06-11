// 地图层级类型
type MapLevel = 'province' | 'city' | 'county';

// 长势评级
type GrowthRating = 'excellent' | 'good' | 'medium' | 'poor' | 'bad';

// 区域长势数据
export interface AreaGrowth {
  code: string;
  name: string;
  level: MapLevel;
  index: number;
  rating: GrowthRating;
  yoyChange: number;
  area: number;
  parentId?: string;
}

// 安徽省各市长势数据
export const cityGrowthData: AreaGrowth[] = [
  { code: '340100', name: '合肥市', level: 'city', index: 0.85, rating: 'good', yoyChange: 6.2, area: 285000 },
  { code: '340200', name: '芜湖市', level: 'city', index: 0.82, rating: 'good', yoyChange: 5.8, area: 198000 },
  { code: '340300', name: '蚌埠市', level: 'city', index: 0.78, rating: 'medium', yoyChange: 3.2, area: 245000 },
  { code: '340400', name: '淮南市', level: 'city', index: 0.76, rating: 'medium', yoyChange: 2.8, area: 187000 },
  { code: '340500', name: '马鞍山市', level: 'city', index: 0.84, rating: 'good', yoyChange: 5.5, area: 142000 },
  { code: '340600', name: '淮北市', level: 'city', index: 0.72, rating: 'medium', yoyChange: 1.5, area: 98000 },
  { code: '340700', name: '铜陵市', level: 'city', index: 0.79, rating: 'medium', yoyChange: 3.5, area: 85000 },
  { code: '340800', name: '安庆市', level: 'city', index: 0.75, rating: 'medium', yoyChange: 2.2, area: 356000 },
  { code: '341000', name: '黄山市', level: 'city', index: 0.68, rating: 'poor', yoyChange: -1.2, area: 98000 },
  { code: '341100', name: '滁州市', level: 'city', index: 0.83, rating: 'good', yoyChange: 5.2, area: 298000 },
  { code: '341200', name: '阜阳市', level: 'city', index: 0.65, rating: 'poor', yoyChange: -2.5, area: 385000 },
  { code: '341300', name: '宿州市', level: 'city', index: 0.70, rating: 'poor', yoyChange: -0.8, area: 278000 },
  { code: '341500', name: '六安市', level: 'city', index: 0.77, rating: 'medium', yoyChange: 2.5, area: 312000 },
  { code: '341600', name: '亳州市', level: 'city', index: 0.73, rating: 'medium', yoyChange: 1.8, area: 256000 },
  { code: '341700', name: '池州市', level: 'city', index: 0.81, rating: 'good', yoyChange: 4.8, area: 142000 },
  { code: '341800', name: '宣城市', level: 'city', index: 0.80, rating: 'good', yoyChange: 4.2, area: 254000 },
];
