// 粮食安全监管系统类型定义

// 图斑类型
export type ProblemType = 
  | '撂荒' 
  | '疑似割青' 
  | '非粮化' 
  | '种植计划未落实' 
  | '焚烧秸秆' 
  | '其他';

// 风险等级
export type RiskLevel = 'high' | 'medium' | 'low';

// 图斑状态
export type SpotStatus = 
  | '待下发' 
  | '待核查' 
  | '核查中' 
  | '待上报' 
  | '待审核' 
  | '整改中' 
  | '待验收' 
  | '已结案' 
  | '需复查';

// 事件状态
export type EventStatus = 
  | '待受理' 
  | '待核查' 
  | '核查中' 
  | '待审核' 
  | '已结案' 
  | '已驳回';

// 影像来源
export type ImageSource = '卫星遥感' | '无人机' | '地面采集';

// 图斑信息
export interface Spot {
  id: string;
  spotNo: string;
  problemType: ProblemType;
  area: number;
  riskLevel: RiskLevel;
  location: string;
  city: string;
  county: string;
  town: string;
  status: SpotStatus;
  discoverDate: string;
  batchNo: string;
  coordinate: {
    lng: number;
    lat: number;
  };
  inspector?: string;
  deadline?: string;
}

// 监测批次
export interface MonitorBatch {
  id: string;
  batchNo: string;
  monitorDate: string;
  imageSource: ImageSource;
  region: string;
  spotCount: number;
  suspectedCount: number;
  resolution?: string;
  coverage?: string;
}

// 事件信息
export interface Event {
  id: string;
  eventNo: string;
  eventType: ProblemType;
  location: string;
  city: string;
  county: string;
  town: string;
  reportTime: string;
  reporter: string;
  reporterPhone: string;
  area: number;
  description: string;
  status: EventStatus;
  photos: string[];
  coordinate: {
    lng: number;
    lat: number;
  };
}

// 核查任务
export interface InspectionTask {
  id: string;
  taskNo: string;
  spotNo?: string;
  eventNo?: string;
  type: ProblemType;
  location: string;
  area: number;
  assignTime: string;
  deadline: string;
  status: '待核查' | '核查中' | '已完成';
  inspector?: string;
  result?: '问题属实' | '问题不属实';
  overdue?: boolean;
  overdueDays?: number;
}

// 整改任务
export interface RectificationTask {
  id: string;
  eventNo: string;
  eventType: ProblemType;
  location: string;
  responsiblePerson: string;
  responsibleUnit: string;
  deadline: string;
  status: '待整改' | '整改中' | '待验收' | '已完成';
  progress: number;
  measures: string[];
}

// 巡查记录
export interface InspectionRecord {
  id: string;
  recordNo: string;
  date: string;
  inspector: string;
  unit: string;
  type: '随机抽查' | '定点抽查';
  location: string;
  result: '发现问题' | '未发现问题';
  problemDescription?: string;
  photos: string[];
}

// 统计数据
export interface Statistics {
  totalSpots: number;
  pendingCheck: number;
  rectifying: number;
  closedThisMonth: number;
  newThisMonth: number;
  avgProcessDays: number;
  overdueCount: number;
}

// 城市统计
export interface CityStatistics {
  city: string;
  spotCount: number;
  closedCount: number;
  closeRate: number;
  avgDays: number;
  rank: number;
}

// 长势数据
export interface GrowthData {
  region: string;
  index: number;
  yoyChange: number;
  avgIndex: number;
  rating: '优秀' | '良好' | '中等' | '偏差';
  rank?: number;
}

// 菜单项
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  path?: string;
}

// 预警信息
export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  time: string;
  action?: string;
}
