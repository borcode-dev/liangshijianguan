import type { 
  Spot, 
  MonitorBatch, 
  Event, 
  InspectionTask, 
  RectificationTask,
  InspectionRecord,
  Statistics,
  CityStatistics,
  GrowthData,
  Alert
} from '@/types';

// 首页统计数据
export const homeStatistics: Statistics = {
  totalSpots: 1256,
  pendingCheck: 356,
  rectifying: 89,
  closedThisMonth: 234,
  newThisMonth: 23,
  avgProcessDays: 12.5,
  overdueCount: 8,
};

// 预警信息
export const alerts: Alert[] = [
  {
    id: '1',
    type: 'danger',
    message: '怀远县3个图斑超期未处置（超期5天以上）',
    time: '2026-06-06 10:30',
    action: '立即处理',
  },
  {
    id: '2',
    type: 'danger',
    message: '临泉县1个疑似违规割青事件待确认',
    time: '2026-06-06 09:15',
    action: '立即处理',
  },
  {
    id: '3',
    type: 'warning',
    message: '蚌埠市待核查图斑超过50个，请加快核查进度',
    time: '2026-06-06 08:00',
    action: '查看详情',
  },
];

// 各市图斑分布数据
export const citySpotDistribution: { city: string; count: number }[] = [
  { city: '蚌埠市', count: 256 },
  { city: '阜阳市', count: 234 },
  { city: '宿州市', count: 198 },
  { city: '滁州市', count: 156 },
  { city: '合肥市', count: 145 },
  { city: '芜湖市', count: 78 },
  { city: '马鞍山市', count: 56 },
];

// 图斑处置进度
export const spotProcessProgress = [
  { name: '已结案', value: 62, color: 'var(--success)' },
  { name: '整改中', value: 10, color: 'var(--warning)' },
  { name: '待核查', value: 28, color: 'var(--info)' },
];

// 监测批次列表
export const monitorBatches: MonitorBatch[] = [
  {
    id: '1',
    batchNo: 'JM-2026-01',
    monitorDate: '2026-05-01',
    imageSource: '卫星遥感',
    region: '全省',
    spotCount: 456,
    suspectedCount: 89,
    resolution: '2米',
    coverage: '14万平方公里',
  },
  {
    id: '2',
    batchNo: 'JM-2026-02',
    monitorDate: '2026-05-15',
    imageSource: '卫星遥感',
    region: '蚌埠市',
    spotCount: 123,
    suspectedCount: 34,
    resolution: '1米',
    coverage: '5959平方公里',
  },
  {
    id: '3',
    batchNo: 'JM-2026-03',
    monitorDate: '2026-06-01',
    imageSource: '无人机',
    region: '阜阳市临泉县',
    spotCount: 78,
    suspectedCount: 23,
    resolution: '0.2米',
    coverage: '1830平方公里',
  },
  {
    id: '4',
    batchNo: 'JM-2025-12',
    monitorDate: '2025-12-01',
    imageSource: '卫星遥感',
    region: '全省',
    spotCount: 389,
    suspectedCount: 67,
    resolution: '2米',
    coverage: '14万平方公里',
  },
];

// 图斑列表
export const spots: Spot[] = [
  {
    id: '1',
    spotNo: 'TB-001',
    problemType: '撂荒',
    area: 5.6,
    riskLevel: 'high',
    location: '蚌埠市怀远县龙亢镇',
    city: '蚌埠市',
    county: '怀远县',
    town: '龙亢镇',
    status: '待核查',
    discoverDate: '2026-05-01',
    batchNo: 'JM-2026-01',
    coordinate: { lng: 117.1234, lat: 33.4567 },
    inspector: '待分配',
    deadline: '2026-06-07',
  },
  {
    id: '2',
    spotNo: 'TB-002',
    problemType: '疑似割青',
    area: 3.2,
    riskLevel: 'high',
    location: '阜阳市临泉县鲖城镇',
    city: '阜阳市',
    county: '临泉县',
    town: '鲖城镇',
    status: '待核查',
    discoverDate: '2026-05-15',
    batchNo: 'JM-2026-02',
    coordinate: { lng: 115.2345, lat: 33.1234 },
    inspector: '待分配',
    deadline: '2026-06-05',
  },
  {
    id: '3',
    spotNo: 'TB-003',
    problemType: '非粮化',
    area: 8.9,
    riskLevel: 'medium',
    location: '宿州市埇桥区大店镇',
    city: '宿州市',
    county: '埇桥区',
    town: '大店镇',
    status: '待下发',
    discoverDate: '2026-06-01',
    batchNo: 'JM-2026-01',
    coordinate: { lng: 117.3456, lat: 33.5678 },
  },
  {
    id: '4',
    spotNo: 'TB-004',
    problemType: '撂荒',
    area: 4.1,
    riskLevel: 'low',
    location: '滁州市定远县藕塘镇',
    city: '滁州市',
    county: '定远县',
    town: '藕塘镇',
    status: '整改中',
    discoverDate: '2026-05-01',
    batchNo: 'JM-2026-01',
    coordinate: { lng: 117.4567, lat: 32.789 },
    inspector: '张三',
  },
  {
    id: '5',
    spotNo: 'TB-005',
    problemType: '种植计划未落实',
    area: 6.3,
    riskLevel: 'medium',
    location: '合肥市肥西县上派镇',
    city: '合肥市',
    county: '肥西县',
    town: '上派镇',
    status: '已结案',
    discoverDate: '2026-04-15',
    batchNo: 'JM-2026-01',
    coordinate: { lng: 117.5678, lat: 31.8901 },
    inspector: '李四',
  },
];

// 事件列表
export const events: Event[] = [
  {
    id: '1',
    eventNo: 'SJ-001',
    eventType: '疑似割青',
    location: '怀远县龙亢镇汪圩村西侧',
    city: '蚌埠市',
    county: '怀远县',
    town: '龙亢镇',
    reportTime: '2026-06-05 09:30',
    reporter: '张三',
    reporterPhone: '138****5678',
    area: 3.5,
    description: '发现位于龙亢镇汪圩村西侧约3.5亩小麦田疑似被提前收割',
    status: '待受理',
    photos: [],
    coordinate: { lng: 117.1234, lat: 33.4567 },
  },
  {
    id: '2',
    eventNo: 'SJ-002',
    eventType: '撂荒',
    location: '临泉县鲖城镇',
    city: '阜阳市',
    county: '临泉县',
    town: '鲖城镇',
    reportTime: '2026-06-04 14:20',
    reporter: '李四',
    reporterPhone: '139****1234',
    area: 2.8,
    description: '发现疑似撂荒地块',
    status: '待核查',
    photos: [],
    coordinate: { lng: 115.2345, lat: 33.1234 },
  },
  {
    id: '3',
    eventNo: 'SJ-003',
    eventType: '焚烧秸秆',
    location: '埇桥区大店镇',
    city: '宿州市',
    county: '埇桥区',
    town: '大店镇',
    reportTime: '2026-06-03 16:45',
    reporter: '王五',
    reporterPhone: '137****9876',
    area: 1.2,
    description: '发现露天焚烧秸秆',
    status: '已结案',
    photos: [],
    coordinate: { lng: 117.3456, lat: 33.5678 },
  },
];

// 核查任务列表
export const inspectionTasks: InspectionTask[] = [
  {
    id: '1',
    taskNo: 'RW-001',
    spotNo: 'TB-003',
    type: '非粮化',
    location: '宿州市埇桥区',
    area: 8.9,
    assignTime: '2026-06-02',
    deadline: '2026-06-09',
    status: '待核查',
    inspector: '李核查员',
  },
  {
    id: '2',
    taskNo: 'RW-002',
    spotNo: 'TB-004',
    type: '撂荒',
    location: '滁州市定远县',
    area: 4.1,
    assignTime: '2026-06-02',
    deadline: '2026-06-09',
    status: '核查中',
    inspector: '张核查员',
  },
  {
    id: '3',
    taskNo: 'RW-003',
    eventNo: 'SJ-001',
    type: '疑似割青',
    location: '怀远县龙亢镇',
    area: 3.5,
    assignTime: '2026-06-05',
    deadline: '2026-06-07',
    status: '待核查',
    inspector: '李核查员',
    overdue: true,
    overdueDays: 5,
  },
  {
    id: '4',
    taskNo: 'RW-004',
    spotNo: 'TB-002',
    type: '疑似割青',
    location: '临泉县鲖城镇',
    area: 3.2,
    assignTime: '2026-06-03',
    deadline: '2026-06-06',
    status: '待核查',
    inspector: '王核查员',
    overdue: true,
    overdueDays: 3,
  },
];

// 整改任务列表
export const rectificationTasks: RectificationTask[] = [
  {
    id: '1',
    eventNo: 'SJ-001',
    eventType: '疑似割青',
    location: '怀远县龙亢镇',
    responsiblePerson: '张三种粮大户',
    responsibleUnit: '怀远县农业农村局',
    deadline: '2026-06-20',
    status: '整改中',
    progress: 60,
    measures: ['立即清理地块残留物', '土地翻耕', '大豆补种'],
  },
  {
    id: '2',
    eventNo: 'SJ-002',
    eventType: '撂荒',
    location: '临泉县鲖城镇',
    responsiblePerson: '李四种粮大户',
    responsibleUnit: '临泉县农业农村局',
    deadline: '2026-06-25',
    status: '整改中',
    progress: 30,
    measures: ['清理杂草', '土地翻耕', '播种'],
  },
  {
    id: '3',
    eventNo: 'SJ-003',
    eventType: '非粮化',
    location: '定远县',
    responsiblePerson: '王五种粮大户',
    responsibleUnit: '定远县农业农村局',
    deadline: '2026-06-30',
    status: '待整改',
    progress: 0,
    measures: ['清理非粮作物', '恢复粮食种植'],
  },
];

// 巡查记录
export const inspectionRecords: InspectionRecord[] = [
  {
    id: '1',
    recordNo: 'XC-001',
    date: '2026-06-05',
    inspector: '省级巡查员A',
    unit: '安徽省农业农村厅',
    type: '随机抽查',
    location: '怀远县龙亢镇',
    result: '发现问题',
    problemDescription: '发现疑似撂荒地块',
    photos: [],
  },
  {
    id: '2',
    recordNo: 'XC-002',
    date: '2026-06-04',
    inspector: '省级巡查员B',
    unit: '安徽省农业农村厅',
    type: '定点抽查',
    location: '阜阳市临泉县',
    result: '未发现问题',
    photos: [],
  },
  {
    id: '3',
    recordNo: 'XC-003',
    date: '2026-06-03',
    inspector: '省级巡查员A',
    unit: '安徽省农业农村厅',
    type: '随机抽查',
    location: '宿州市埇桥区',
    result: '发现问题',
    problemDescription: '发现疑似非粮化种植',
    photos: [],
  },
];

// 城市统计排行
export const cityRankings: CityStatistics[] = [
  { city: '芜湖市', spotCount: 78, closedCount: 75, closeRate: 96, avgDays: 8.2, rank: 1 },
  { city: '马鞍山市', spotCount: 56, closedCount: 53, closeRate: 95, avgDays: 9.5, rank: 2 },
  { city: '滁州市', spotCount: 89, closedCount: 82, closeRate: 92, avgDays: 10.3, rank: 3 },
  { city: '蚌埠市', spotCount: 156, closedCount: 140, closeRate: 90, avgDays: 12.5, rank: 4 },
  { city: '合肥市', spotCount: 145, closedCount: 125, closeRate: 86, avgDays: 13.2, rank: 5 },
  { city: '阜阳市', spotCount: 198, closedCount: 165, closeRate: 83, avgDays: 15.8, rank: 6 },
  { city: '宿州市', spotCount: 234, closedCount: 189, closeRate: 81, avgDays: 18.2, rank: 7 },
];

// 长势分析数据
export const growthData: GrowthData[] = [
  { region: '芜湖市', index: 0.89, yoyChange: 8.5, avgIndex: 0.78, rating: '优秀', rank: 1 },
  { region: '滁州市', index: 0.87, yoyChange: 6.2, avgIndex: 0.78, rating: '良好', rank: 2 },
  { region: '马鞍山市', index: 0.85, yoyChange: 4.8, avgIndex: 0.78, rating: '良好', rank: 3 },
  { region: '蚌埠市', index: 0.82, yoyChange: 5.3, avgIndex: 0.78, rating: '良好', rank: 4 },
  { region: '合肥市', index: 0.79, yoyChange: 2.1, avgIndex: 0.78, rating: '中等', rank: 5 },
  { region: '阜阳市', index: 0.75, yoyChange: -2.1, avgIndex: 0.78, rating: '偏差', rank: 6 },
  { region: '宿州市', index: 0.71, yoyChange: -4.5, avgIndex: 0.78, rating: '偏差', rank: 7 },
];

// 月度趋势数据
export const monthlyTrend = [
  { month: '1月', newSpots: 156, closedSpots: 120 },
  { month: '2月', newSpots: 123, closedSpots: 100 },
  { month: '3月', newSpots: 89, closedSpots: 95 },
  { month: '4月', newSpots: 67, closedSpots: 78 },
  { month: '5月', newSpots: 45, closedSpots: 56 },
  { month: '6月', newSpots: 23, closedSpots: 34 },
];

// 问题类型分布
export const problemTypeDistribution = [
  { name: '撂荒', value: 34, color: 'var(--chart-1)' },
  { name: '非粮化', value: 15, color: 'var(--chart-2)' },
  { name: '疑似割青', value: 10, color: 'var(--chart-3)' },
  { name: '计划未落实', value: 21, color: 'var(--chart-4)' },
  { name: '其他', value: 20, color: 'var(--chart-5)' },
];

// 安徽省各市数据（用于地图）
export const cityMapData = [
  { name: '合肥市', value: 145, pendingCheck: 45, rectifying: 12, closed: 88 },
  { name: '芜湖市', value: 78, pendingCheck: 12, rectifying: 5, closed: 61 },
  { name: '蚌埠市', value: 256, pendingCheck: 78, rectifying: 23, closed: 155 },
  { name: '阜阳市', value: 234, pendingCheck: 89, rectifying: 34, closed: 111 },
  { name: '淮南市', value: 123, pendingCheck: 34, rectifying: 12, closed: 77 },
  { name: '淮北市', value: 89, pendingCheck: 23, rectifying: 8, closed: 58 },
  { name: '铜陵市', value: 45, pendingCheck: 12, rectifying: 4, closed: 29 },
  { name: '安庆市', value: 167, pendingCheck: 45, rectifying: 15, closed: 107 },
  { name: '黄山市', value: 34, pendingCheck: 8, rectifying: 2, closed: 24 },
  { name: '滁州市', value: 156, pendingCheck: 34, rectifying: 12, closed: 110 },
  { name: '阜阳市', value: 198, pendingCheck: 56, rectifying: 18, closed: 124 },
  { name: '宿州市', value: 234, pendingCheck: 78, rectifying: 23, closed: 133 },
  { name: '六安市', value: 145, pendingCheck: 34, rectifying: 11, closed: 100 },
  { name: '亳州市', value: 178, pendingCheck: 45, rectifying: 15, closed: 118 },
  { name: '池州市', value: 56, pendingCheck: 12, rectifying: 4, closed: 40 },
  { name: '宣城市', value: 78, pendingCheck: 18, rectifying: 6, closed: 54 },
  { name: '马鞍山市', value: 56, pendingCheck: 12, rectifying: 4, closed: 40 },
];

// 地图图斑列表
export const mapSpots = spots.map(spot => ({
  ...spot,
  lng: spot.coordinate.lng,
  lat: spot.coordinate.lat,
}));

// 一张图城市统计数据
export const cityStats = [
  { city: '蚌埠市', pending: 45, rectifying: 23, closed: 188, growthDeviation: 12 },
  { city: '阜阳市', pending: 89, rectifying: 34, closed: 111, growthDeviation: 18 },
  { city: '宿州市', pending: 78, rectifying: 28, closed: 128, growthDeviation: 15 },
  { city: '合肥市', pending: 34, rectifying: 12, closed: 99, growthDeviation: 8 },
];

// 结案审核列表
export const caseReviews = [
  {
    id: '1',
    eventNo: 'SJ-003',
    type: '撂荒' as const,
    location: '怀远县龙亢镇',
    completeDate: '2026-06-08',
    effect: '良好',
    status: '待审核',
  },
  {
    id: '2',
    eventNo: 'SJ-004',
    type: '焚烧秸秆' as const,
    location: '埇桥区大店镇',
    completeDate: '2026-06-05',
    effect: '良好',
    status: '待审核',
  },
  {
    id: '3',
    eventNo: 'SJ-005',
    type: '非粮化' as const,
    location: '定远县',
    completeDate: '2026-06-10',
    effect: '一般',
    status: '待审核',
  },
  {
    id: '4',
    eventNo: 'SJ-006',
    type: '撂荒' as const,
    location: '临泉县',
    completeDate: '2026-06-08',
    effect: '良好',
    status: '已通过',
  },
];

// 巡查记录列表
export const patrols = [
  {
    id: '1',
    patrolNo: 'XC-001',
    date: '2026-06-05',
    location: '怀远县龙亢镇',
    type: '随机抽查',
    hasProblem: true,
  },
  {
    id: '2',
    patrolNo: 'XC-002',
    date: '2026-06-04',
    location: '阜阳市临泉县',
    type: '定点抽查',
    hasProblem: false,
  },
  {
    id: '3',
    patrolNo: 'XC-003',
    date: '2026-06-03',
    location: '宿州市埇桥区',
    type: '随机抽查',
    hasProblem: true,
  },
  {
    id: '4',
    patrolNo: 'XC-004',
    date: '2026-06-02',
    location: '蚌埠市固镇县',
    type: '定点抽查',
    hasProblem: false,
  },
];

// 长势分析数据（用于苗情监测页面）
export const growthAnalysis = [
  { city: '芜湖市', index: 0.89, trend: 8.5, rating: '优秀' },
  { city: '滁州市', index: 0.87, trend: 6.2, rating: '良好' },
  { city: '马鞍山市', index: 0.85, trend: 4.8, rating: '良好' },
  { city: '蚌埠市', index: 0.82, trend: 5.3, rating: '良好' },
  { city: '合肥市', index: 0.79, trend: 2.1, rating: '中等' },
  { city: '阜阳市', index: 0.75, trend: -2.1, rating: '偏差' },
];
