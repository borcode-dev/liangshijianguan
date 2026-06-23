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
  Alert,
  ProblemType,
  RiskLevel,
  SpotStatus,
  EventStatus,
  ImageSource,
} from '@/types';

// ============================================================
// 值池
// ============================================================
const NAMES = ['王建国','李志强','张伟','刘洋','陈明','杨磊','赵军','黄勇','周涛','吴斌','徐鹏','孙超','马飞','朱亮','胡杰','郭威','何坤','林峰','罗辉','梁宇'];
const REPORTER_NAMES = ['张秀英','王大明','李红梅','陈志华','刘德才','赵福运','周桂兰','吴学文','徐美玲','孙长青','杨秀芳','马建国','黄丽华','朱文斌','胡庆丰'];
const PHONE_PREFIXES = ['138','139','136','137','155','158','159','182','183','187'];
const RESPONSIBLE_PERSONS = ['张守义','李根宝','王德福','陈有才','刘正发','赵广明','周传家','吴本善','徐立业','孙守正'];
const RESPONSIBLE_UNITS = ['地块经营权人','村委会','乡镇政府','县农业农村局','县自然资源局'];
const MEASURES_POOL = ['复耕复种','调整种植结构','清理违规占用','恢复粮食种植','落实种植计划','加强巡查监管','限期整改到位','追缴相关补贴','约谈责任人','移交执法部门'];
const EFFECTS = ['已恢复粮食种植','已完成复耕复种','违规占用已清理','种植计划已落实','整改效果良好','基本恢复种植条件','已调整种植结构'];
const REVIEW_OPINIONS = ['同意通过','整改到位，予以结案','复核无误，同意结案','整改措施落实到位','问题已妥善解决'];
const REJECT_REASONS = ['整改措施不到位','复耕面积不达标','未提供有效证明材料','整改效果不明显','需进一步核实'];
const PATROL_TYPES = ['日常巡查','专项检查','随机抽查','重点督查','联合巡查'];
const EVENT_DESCRIPTIONS = [
  '发现大面积耕地撂荒，杂草丛生，长期未耕种',
  '耕地出现非粮化种植，改种经济作物',
  '疑似割青毁麦行为，需进一步核查确认',
  '种植计划未按要求落实，未种植指定粮食作物',
  '田间发现焚烧秸秆行为，产生大量烟尘',
  '耕地被违规占用建设，需恢复种植条件',
  '基本农田出现撂荒现象，面积较大',
  '耕地改种苗木花卉，偏离粮食种植方向',
];

// 蚌埠市区县乡镇
const BB_COUNTY_TOWNS: [string, string][] = [
  ['怀远县','龙亢镇'],['怀远县','鲍集镇'],['怀远县','双桥集镇'],['怀远县','万福镇'],
  ['怀远县','淝河镇'],['怀远县','唐集镇'],['怀远县','朱疃镇'],['怀远县','兰桥乡'],
  ['五河县','城关镇'],['五河县','新集镇'],['五河县','沱湖镇'],['五河县','小溪镇'],
  ['五河县','头铺镇'],['五河县','大新镇'],['五河县','朱顶镇'],['五河县','双忠庙镇'],
  ['固镇县','城关镇'],['固镇县','连城镇'],['固镇县','湖沟镇'],['固镇县','任桥镇'],
  ['固镇县','杨庙乡'],['固镇县','石湖乡'],['固镇县','仲兴乡'],['固镇县','刘集镇'],
  ['龙子湖区','李楼乡'],['龙子湖区','曹山街道'],['龙子湖区','解放街道'],
  ['禹会区','马城镇'],['禹会区','长青乡'],['禹会区','大庆街道'],
  ['蚌山区','燕山乡'],['蚌山区','雪华乡'],['蚌山区','黄庄街道'],
  ['淮上区','沫河口镇'],['淮上区','吴小街镇'],['淮上区','小蚌埠镇'],['淮上区','梅桥镇'],
];

// 合肥市区县乡镇
const HF_COUNTY_TOWNS: [string, string][] = [
  ['肥东县','店埠镇'],['肥东县','撮镇'],['肥东县','梁园镇'],['肥东县','桥头集镇'],['肥东县','长临河镇'],
  ['肥东县','石塘镇'],['肥东县','古城镇'],['肥东县','包公镇'],
  ['肥西县','上派镇'],['肥西县','三河镇'],['肥西县','桃花镇'],['肥西县','花岗镇'],
  ['肥西县','紫蓬镇'],['肥西县','严店镇'],['肥西县','山南镇'],['肥西县','丰乐镇'],
  ['长丰县','水湖镇'],['长丰县','双墩镇'],['长丰县','岗集镇'],['长丰县','下塘镇'],
  ['长丰县','吴山镇'],['长丰县','杨庙镇'],['长丰县','朱巷镇'],
  ['庐江县','庐城镇'],['庐江县','汤池镇'],['庐江县','万山镇'],['庐江县','同大镇'],
  ['庐江县','金牛镇'],['庐江县','石头镇'],['庐江县','龙桥镇'],
  ['巢湖市','半汤街道'],['巢湖市','柘皋镇'],['巢湖市','烔炀镇'],['巢湖市','银屏镇'],
  ['巢湖市','黄麓镇'],['巢湖市','散兵镇'],['巢湖市','夏阁镇'],
  ['蜀山区','井岗镇'],['蜀山区','南岗镇'],['蜀山区','小庙镇'],
  ['包河区','大圩镇'],['包河区','义城街道'],
  ['瑶海区','大兴镇'],['瑶海区','磨店乡'],
  ['庐阳区','三十岗乡'],['庐阳区','大杨镇'],
];

// 其他城市数据
const OTHER_CITIES: { city: string; lng: number; lat: number; counties: [string, string][] }[] = [
  { city: '合肥市', lng: 117.27, lat: 31.86, counties: [['肥西县','上派镇'],['肥东县','店埠镇'],['长丰县','水湖镇']] },
  { city: '芜湖市', lng: 118.38, lat: 31.33, counties: [['繁昌区','繁阳镇'],['南陵县','籍山镇']] },
  { city: '淮南市', lng: 116.98, lat: 32.63, counties: [['凤台县','城关镇'],['寿县','寿春镇']] },
  { city: '马鞍山市', lng: 118.51, lat: 31.67, counties: [['当涂县','姑孰镇'],['含山县','环峰镇']] },
  { city: '淮北市', lng: 116.79, lat: 33.97, counties: [['濉溪县','濉溪镇']] },
  { city: '铜陵市', lng: 117.21, lat: 30.76, counties: [['枞阳县','枞阳镇']] },
  { city: '安庆市', lng: 117.05, lat: 30.53, counties: [['怀宁县','高河镇'],['太湖县','晋熙镇']] },
  { city: '黄山市', lng: 118.34, lat: 29.71, counties: [['歙县','徽城镇'],['休宁县','海阳镇']] },
  { city: '滁州市', lng: 118.32, lat: 32.30, counties: [['天长市','天长街道'],['定远县','定城镇']] },
  { city: '阜阳市', lng: 115.81, lat: 32.89, counties: [['临泉县','城关镇'],['太和县','城关镇']] },
  { city: '宿州市', lng: 116.96, lat: 33.65, counties: [['砀山县','砀城镇'],['萧县','龙城镇']] },
  { city: '六安市', lng: 116.52, lat: 31.74, counties: [['霍邱县','城关镇'],['舒城县','城关镇']] },
  { city: '亳州市', lng: 115.78, lat: 33.85, counties: [['涡阳县','城关街道'],['蒙城县','城关街道']] },
  { city: '池州市', lng: 117.49, lat: 30.66, counties: [['东至县','尧渡镇']] },
  { city: '宣城市', lng: 118.76, lat: 30.95, counties: [['郎溪县','建平镇']] },
];

const ALL_CITIES = ['合肥市','芜湖市','蚌埠市','淮南市','马鞍山市','淮北市','铜陵市','安庆市','黄山市','滁州市','阜阳市','宿州市','六安市','亳州市','池州市','宣城市'];

// ============================================================
// 辅助函数
// ============================================================
function pad(n: number, w: number): string { return String(n).padStart(w, '0'); }

function daysBefore(daysBack: number): string {
  const d = new Date(2026, 5, 20 - daysBack);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
}

function problemTypeForIdx(i: number): ProblemType {
  const r = i % 20;
  if (r < 7) return '撂荒';
  if (r < 12) return '非粮化';
  if (r < 15) return '疑似割青';
  if (r < 18) return '种植计划未落实';
  return '焚烧秸秆';
}

function riskLevelForIdx(i: number): RiskLevel {
  const r = i % 20;
  if (r < 6) return 'high';
  if (r < 14) return 'medium';
  return 'low';
}

function areaForIdx(i: number): number {
  return +(1.23 + ((i * 7.31 + 3.47) % 27.33)).toFixed(2);
}

function phoneForIdx(i: number): string {
  return PHONE_PREFIXES[i % PHONE_PREFIXES.length] + String(10000000 + ((i * 13579 + 24680) % 89999999)).slice(0, 8);
}

function spreadDays(i: number, count: number, minBack: number, maxBack: number): number {
  return minBack + Math.round(i * (maxBack - minBack) / (count - 1));
}

// ============================================================
// 生成图斑 spots
// ============================================================
function generateSpots(): Spot[] {
  const result: Spot[] = [];
  let id = 0;

  const statuses: SpotStatus[] = ['待下发','待核查','核查中','待上报','待审核','整改中','待验收','已结案','需复查'];
  const dateRanges: [number, number][] = [[0,2],[1,5],[2,8],[4,10],[5,12],[6,19],[10,26],[15,41],[19,46]];

  // 蚌埠市：9 个状态 × 20 条 = 180 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 20; i++) {
      id++;
      const daysBack = spreadDays(i, 20, minBack, maxBack);
      const ct = BB_COUNTY_TOWNS[(si * 20 + i) % BB_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i);
      const rl = riskLevelForIdx(i);
      const area = areaForIdx(si * 20 + i);
      const discoverDate = daysBefore(daysBack);
      const hasInspector = status !== '待下发';
      result.push({
        id: String(id),
        spotNo: `TB-2026-${pad(id, 3)}`,
        problemType: pt,
        area,
        riskLevel: rl,
        location: `蚌埠市${ct[0]}${ct[1]}`,
        city: '蚌埠市',
        county: ct[0],
        town: ct[1],
        status,
        discoverDate,
        batchNo: `JM-2026-${pad(Math.ceil(id / 30), 2)}`,
        coordinate: { lng: +(117.20 + id * 0.004).toFixed(4), lat: +(32.80 + id * 0.003).toFixed(4) },
        inspector: hasInspector ? NAMES[(si * 20 + i) % NAMES.length] : undefined,
        deadline: hasInspector ? daysBefore(daysBack - 7) : undefined,
      });
    }
  }

  // 合肥市：9 个状态 × 10 条 = 90 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 10; i++) {
      id++;
      const daysBack = spreadDays(i, 10, minBack, maxBack);
      const ct = HF_COUNTY_TOWNS[(si * 10 + i) % HF_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i + 3);
      const rl = riskLevelForIdx(i + 2);
      const area = areaForIdx(500 + si * 10 + i);
      const discoverDate = daysBefore(daysBack);
      const hasInspector = status !== '待下发';
      result.push({
        id: String(id),
        spotNo: `TB-2026-${pad(id, 3)}`,
        problemType: pt,
        area,
        riskLevel: rl,
        location: `合肥市${ct[0]}${ct[1]}`,
        city: '合肥市',
        county: ct[0],
        town: ct[1],
        status,
        discoverDate,
        batchNo: `JM-2026-${pad(Math.ceil(id / 30), 2)}`,
        coordinate: { lng: +(117.27 + id * 0.003).toFixed(4), lat: +(31.86 + id * 0.002).toFixed(4) },
        inspector: hasInspector ? NAMES[(si * 10 + i + 5) % NAMES.length] : undefined,
        deadline: hasInspector ? daysBefore(daysBack - 7) : undefined,
      });
    }
  }

  // 其他城市：约 40 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const count = ci < 5 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      id++;
      const ct = cd.counties[i % cd.counties.length];
      const status = statuses[(ci * 3 + i) % statuses.length];
      const daysBack = 5 + ci * 2 + i;
      const hasInspector = status !== '待下发';
      result.push({
        id: String(id),
        spotNo: `TB-2026-${pad(id, 3)}`,
        problemType: problemTypeForIdx(ci * 3 + i + 5),
        area: areaForIdx(100 + ci * 3 + i),
        riskLevel: riskLevelForIdx(ci * 3 + i + 3),
        location: `${cd.city}${ct[0]}${ct[1]}`,
        city: cd.city,
        county: ct[0],
        town: ct[1],
        status,
        discoverDate: daysBefore(daysBack),
        batchNo: `JM-2026-${pad(Math.ceil(id / 30), 2)}`,
        coordinate: { lng: +(cd.lng + i * 0.02).toFixed(4), lat: +(cd.lat + i * 0.015).toFixed(4) },
        inspector: hasInspector ? NAMES[(ci + i) % NAMES.length] : undefined,
        deadline: hasInspector ? daysBefore(daysBack - 7) : undefined,
      });
    }
  }

  return result;
}

export const spots: Spot[] = generateSpots();

// ============================================================
// 生成监测批次 monitorBatches
// ============================================================
function generateMonitorBatches(): MonitorBatch[] {
  const sources: ImageSource[] = ['卫星遥感','无人机','地面采集'];
  const regions = ['全省','蚌埠市','阜阳市','全省','宿州市','六安市','合肥市肥东县','全省','亳州市','滁州市','安庆市','淮南市凤台县','全省','淮北市','芜湖市','宣城市','全省','马鞍山市','池州市','全省'];
  const result: MonitorBatch[] = [];
  for (let i = 0; i < 20; i++) {
    const daysBack = i * 5 + (i % 3);
    result.push({
      id: String(i + 1),
      batchNo: `JM-2026-${pad(20 - i, 2)}`,
      monitorDate: daysBefore(daysBack),
      imageSource: sources[i % 3],
      region: regions[i],
      spotCount: 350 + ((i * 37 + 13) % 150),
      suspectedCount: 50 + ((i * 23 + 7) % 60),
      resolution: sources[i % 3] === '地面采集' ? '0.1米' : sources[i % 3] === '无人机' ? '0.5米' : '2米',
      coverage: regions[i] === '全省' ? '14万平方公里' : `${1000 + ((i * 543) % 14000)}平方公里`,
    });
  }
  return result;
}

export const monitorBatches: MonitorBatch[] = generateMonitorBatches();

// ============================================================
// 生成事件 events
// ============================================================
function generateEvents(): Event[] {
  const result: Event[] = [];
  let id = 0;

  const statuses: EventStatus[] = ['待受理','待核查','核查中','待审核','已结案','已驳回'];
  const dateRanges: [number, number][] = [[0,2],[1,5],[2,8],[5,12],[15,41],[10,36]];

  // 蚌埠市：6 个状态 × 20 条 = 120 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 20; i++) {
      id++;
      const daysBack = spreadDays(i, 20, minBack, maxBack);
      const ct = BB_COUNTY_TOWNS[(si * 20 + i) % BB_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i);
      const area = areaForIdx(si * 20 + i + 10);
      const reportDate = daysBefore(daysBack);
      const hour = 8 + (i % 12);
      const minute = (i * 7) % 60;
      const photoCount = 1 + (i % 3);
      const photos = Array.from({ length: photoCount }, (_, pi) => `/uploads/sj${pad(id, 3)}-${pi + 1}.jpg`);
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(id, 3)}`,
        eventType: pt,
        location: `蚌埠市${ct[0]}${ct[1]}${['村东','村西','村南','村北','组东侧','组西侧','南侧','北侧'][i % 8]}地块`,
        city: '蚌埠市',
        county: ct[0],
        town: ct[1],
        reportTime: `${reportDate} ${pad(hour, 2)}:${pad(minute, 2)}`,
        reporter: REPORTER_NAMES[(si * 20 + i) % REPORTER_NAMES.length],
        reporterPhone: phoneForIdx(si * 20 + i),
        area,
        description: `${ct[0]}${ct[1]}${['村东','村西','村南','村北','组东侧','组西侧','南侧','北侧'][i % 8]}地块约${area}亩${pt === '撂荒' ? '耕地长期闲置撂荒，杂草丛生' : pt === '非粮化' ? '耕地被改种非粮作物，违反耕地用途管制' : pt === '疑似割青' ? '小麦田疑似被提前收割作青贮，需核查确认' : pt === '种植计划未落实' ? '未按种植计划落实粮食作物种植' : '田间发现焚烧秸秆行为，产生大量烟尘'}`,
        status,
        photos,
        coordinate: { lng: +(117.22 + id * 0.003).toFixed(4), lat: +(32.82 + id * 0.002).toFixed(4) },
      });
    }
  }

  // 合肥市：6 个状态 × 10 条 = 60 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 10; i++) {
      id++;
      const daysBack = spreadDays(i, 10, minBack, maxBack);
      const ct = HF_COUNTY_TOWNS[(si * 10 + i) % HF_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i + 2);
      const area = areaForIdx(600 + si * 10 + i);
      const reportDate = daysBefore(daysBack);
      const hour = 8 + (i % 12);
      const minute = (i * 7) % 60;
      const photoCount = 1 + (i % 3);
      const photos = Array.from({ length: photoCount }, (_, pi) => `/uploads/sj${pad(id, 3)}-${pi + 1}.jpg`);
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(id, 3)}`,
        eventType: pt,
        location: `合肥市${ct[0]}${ct[1]}${['村东','村西','村南','村北','组东侧','组西侧','南侧','北侧'][i % 8]}地块`,
        city: '合肥市',
        county: ct[0],
        town: ct[1],
        reportTime: `${reportDate} ${pad(hour, 2)}:${pad(minute, 2)}`,
        reporter: REPORTER_NAMES[(si * 10 + i + 3) % REPORTER_NAMES.length],
        reporterPhone: phoneForIdx(si * 10 + i + 30),
        area,
        description: `${ct[0]}${ct[1]}${['村东','村西','村南','村北','组东侧','组西侧','南侧','北侧'][i % 8]}地块约${area}亩${pt === '撂荒' ? '耕地长期闲置撂荒，杂草丛生' : pt === '非粮化' ? '耕地被改种非粮作物，违反耕地用途管制' : pt === '疑似割青' ? '小麦田疑似被提前收割作青贮，需核查确认' : pt === '种植计划未落实' ? '未按种植计划落实粮食作物种植' : '田间发现焚烧秸秆行为，产生大量烟尘'}`,
        status,
        photos,
        coordinate: { lng: +(117.29 + id * 0.002).toFixed(4), lat: +(31.88 + id * 0.0015).toFixed(4) },
      });
    }
  }

  // 其他城市：约 20 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const count = ci < 5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      id++;
      const ct = cd.counties[i % cd.counties.length];
      const status = statuses[(ci + i) % statuses.length];
      const daysBack = 8 + ci * 3 + i;
      const pt = problemTypeForIdx(ci + i + 3);
      const area = areaForIdx(200 + ci * 2 + i);
      const reportDate = daysBefore(daysBack);
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(id, 3)}`,
        eventType: pt,
        location: `${cd.city}${ct[0]}${ct[1]}地块`,
        city: cd.city,
        county: ct[0],
        town: ct[1],
        reportTime: `${reportDate} ${pad(9 + (ci % 10), 2)}:${pad((ci * 11) % 60, 2)}`,
        reporter: REPORTER_NAMES[(ci + i) % REPORTER_NAMES.length],
        reporterPhone: phoneForIdx(ci * 2 + i + 50),
        area,
        description: EVENT_DESCRIPTIONS[(ci + i) % EVENT_DESCRIPTIONS.length],
        status,
        photos: [`/uploads/sj${pad(id, 3)}-1.jpg`],
        coordinate: { lng: +(cd.lng + i * 0.015).toFixed(4), lat: +(cd.lat + i * 0.01).toFixed(4) },
      });
    }
  }

  return result;
}

export const events: Event[] = generateEvents();

// ============================================================
// 生成核查任务 inspectionTasks
// ============================================================
function generateInspectionTasks(): InspectionTask[] {
  const result: InspectionTask[] = [];
  let id = 0;

  const statuses: ('待核查' | '核查中' | '已完成')[] = ['待核查','核查中','已完成'];
  const dateRanges: [number, number][] = [[0,5],[2,10],[5,19]];

  // 蚌埠市：3 个状态 × 20 条 = 60 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 20; i++) {
      id++;
      const daysBack = spreadDays(i, 20, minBack, maxBack);
      const ct = BB_COUNTY_TOWNS[(si * 20 + i) % BB_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i);
      const area = areaForIdx(si * 20 + i + 30);
      const assignTime = daysBefore(daysBack);
      const deadlineDays = daysBack - 10;
      const isCompleted = status === '已完成';
      const isOverdue = isCompleted ? (i % 5 === 0) : (daysBack > 7);
      result.push({
        id: String(id),
        taskNo: `HC-2026-${pad(id, 3)}`,
        spotNo: i % 2 === 0 ? `TB-2026-${pad(si * 20 + i + 1, 3)}` : undefined,
        eventNo: i % 2 === 1 ? `SJ-2026-${pad(si * 20 + i + 1, 3)}` : undefined,
        type: pt,
        location: `蚌埠市${ct[0]}${ct[1]}`,
        city: '蚌埠市',
        area,
        assignTime,
        deadline: daysBefore(deadlineDays),
        status,
        inspector: NAMES[(si * 20 + i) % NAMES.length],
        result: isCompleted ? (i % 4 === 0 ? '问题不属实' : '问题属实') : undefined,
        overdue: isOverdue ? true : undefined,
        overdueDays: isOverdue ? (1 + (i % 7)) : undefined,
      });
    }
  }

  // 合肥市：3 个状态 × 10 条 = 30 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 10; i++) {
      id++;
      const daysBack = spreadDays(i, 10, minBack, maxBack);
      const ct = HF_COUNTY_TOWNS[(si * 10 + i) % HF_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i + 4);
      const area = areaForIdx(700 + si * 10 + i);
      const assignTime = daysBefore(daysBack);
      const deadlineDays = daysBack - 10;
      const isCompleted = status === '已完成';
      const isOverdue = isCompleted ? (i % 5 === 0) : (daysBack > 7);
      result.push({
        id: String(id),
        taskNo: `HC-2026-${pad(id, 3)}`,
        spotNo: i % 2 === 0 ? `TB-2026-${pad(si * 10 + i + 181, 3)}` : undefined,
        eventNo: i % 2 === 1 ? `SJ-2026-${pad(si * 10 + i + 121, 3)}` : undefined,
        type: pt,
        location: `合肥市${ct[0]}${ct[1]}`,
        city: '合肥市',
        area,
        assignTime,
        deadline: daysBefore(deadlineDays),
        status,
        inspector: NAMES[(si * 10 + i + 8) % NAMES.length],
        result: isCompleted ? (i % 4 === 0 ? '问题不属实' : '问题属实') : undefined,
        overdue: isOverdue ? true : undefined,
        overdueDays: isOverdue ? (1 + (i % 5)) : undefined,
      });
    }
  }

  // 其他城市：约 20 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const count = ci < 5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      id++;
      const ct = cd.counties[i % cd.counties.length];
      const status = statuses[(ci + i) % statuses.length];
      const daysBack = 6 + ci * 2 + i;
      const pt = problemTypeForIdx(ci + i + 7);
      const isCompleted = status === '已完成';
      result.push({
        id: String(id),
        taskNo: `HC-2026-${pad(id, 3)}`,
        spotNo: i % 2 === 0 ? `TB-2026-${pad(180 + ci * 3 + i + 1, 3)}` : undefined,
        eventNo: i % 2 === 1 ? `SJ-2026-${pad(120 + ci * 2 + i + 1, 3)}` : undefined,
        type: pt,
        location: `${cd.city}${ct[0]}${ct[1]}`,
        city: cd.city,
        area: areaForIdx(300 + ci * 2 + i),
        assignTime: daysBefore(daysBack),
        deadline: daysBefore(daysBack - 10),
        status,
        inspector: NAMES[(ci + i) % NAMES.length],
        result: isCompleted ? (i % 3 === 0 ? '问题不属实' : '问题属实') : undefined,
        overdue: isCompleted && i % 4 === 0 ? true : undefined,
        overdueDays: isCompleted && i % 4 === 0 ? 2 + (ci % 5) : undefined,
      });
    }
  }

  return result;
}

export const inspectionTasks: InspectionTask[] = generateInspectionTasks();

// ============================================================
// 生成整改任务 rectificationTasks
// ============================================================
function generateRectificationTasks(): RectificationTask[] {
  const result: RectificationTask[] = [];
  let id = 0;

  const statuses: ('待整改' | '整改中' | '待验收' | '已完成')[] = ['待整改','整改中','待验收','已完成'];
  const dateRanges: [number, number][] = [[0,10],[5,19],[10,31],[15,41]];
  const progressMap: Record<string, number> = { '待整改': 0, '整改中': -1, '待验收': 100, '已完成': 100 };

  // 蚌埠市：4 个状态 × 20 条 = 80 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 20; i++) {
      id++;
      const daysBack = spreadDays(i, 20, minBack, maxBack);
      const ct = BB_COUNTY_TOWNS[(si * 20 + i) % BB_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i);
      const eventIdx = si * 20 + i + 1;
      const progress = status === '整改中' ? 15 + ((i * 17) % 76) : progressMap[status];
      const mStart = (si * 20 + i) % MEASURES_POOL.length;
      const mCount = 2 + (i % 3);
      const measures = Array.from({ length: mCount }, (_, mi) => MEASURES_POOL[(mStart + mi) % MEASURES_POOL.length]);
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(eventIdx, 3)}`,
        eventType: pt,
        location: `蚌埠市${ct[0]}${ct[1]}`,
        city: '蚌埠市',
        responsiblePerson: RESPONSIBLE_PERSONS[(si * 20 + i) % RESPONSIBLE_PERSONS.length],
        responsibleUnit: RESPONSIBLE_UNITS[(si * 20 + i) % RESPONSIBLE_UNITS.length],
        deadline: daysBefore(daysBack - 14),
        status,
        progress,
        measures,
      });
    }
  }

  // 合肥市：4 个状态 × 10 条 = 40 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 10; i++) {
      id++;
      const daysBack = spreadDays(i, 10, minBack, maxBack);
      const ct = HF_COUNTY_TOWNS[(si * 10 + i) % HF_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i + 1);
      const progressMap: Record<string, number> = { '待整改': 0, '整改中': 15 + (i * 8) % 60, '待验收': 90 + (i % 10), '已完成': 100 };
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(si * 10 + i + 121, 3)}`,
        eventType: pt,
        location: `合肥市${ct[0]}${ct[1]}`,
        city: '合肥市',
        responsiblePerson: RESPONSIBLE_PERSONS[(si * 10 + i + 3) % RESPONSIBLE_PERSONS.length],
        responsibleUnit: RESPONSIBLE_UNITS[(si * 10 + i) % RESPONSIBLE_UNITS.length],
        deadline: daysBefore(daysBack - 14),
        status,
        progress: progressMap[status],
        measures: [MEASURES_POOL[(si * 10 + i) % MEASURES_POOL.length], MEASURES_POOL[(si * 10 + i + 3) % MEASURES_POOL.length]],
      });
    }
  }

  // 其他城市：约 20 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const count = ci < 5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      id++;
      const ct = cd.counties[i % cd.counties.length];
      const status = statuses[(ci + i) % statuses.length];
      const daysBack = 8 + ci * 3 + i;
      const pt = problemTypeForIdx(ci + i + 9);
      const progress = status === '整改中' ? 20 + ((ci * 13) % 60) : status === '待整改' ? 0 : 100;
      const mStart = (ci + i) % MEASURES_POOL.length;
      const measures = [MEASURES_POOL[mStart], MEASURES_POOL[(mStart + 1) % MEASURES_POOL.length]];
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(120 + ci * 2 + i + 1, 3)}`,
        eventType: pt,
        location: `${cd.city}${ct[0]}${ct[1]}`,
        city: cd.city,
        responsiblePerson: RESPONSIBLE_PERSONS[(ci + i) % RESPONSIBLE_PERSONS.length],
        responsibleUnit: RESPONSIBLE_UNITS[(ci + i) % RESPONSIBLE_UNITS.length],
        deadline: daysBefore(daysBack - 14),
        status,
        progress,
        measures,
      });
    }
  }

  return result;
}

export const rectificationTasks: RectificationTask[] = generateRectificationTasks();

// ============================================================
// 生成结案审核 caseReviews
// ============================================================
function generateCaseReviews() {
  type CaseReviewStatus = '待审核' | '已通过' | '已退回';
  interface CaseReview {
    id: string;
    eventNo: string;
    type: ProblemType;
    location: string;
    city: string;
    completeDate: string;
    effect: string;
    status: CaseReviewStatus;
    rejectReason?: string;
    reviewOpinion?: string;
  }

  const result: CaseReview[] = [];
  let id = 0;

  const statuses: CaseReviewStatus[] = ['待审核','已通过','已退回'];
  const dateRanges: [number, number][] = [[0,10],[10,36],[15,41]];

  // 蚌埠市：3 个状态 × 20 条 = 60 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 20; i++) {
      id++;
      const daysBack = spreadDays(i, 20, minBack, maxBack);
      const ct = BB_COUNTY_TOWNS[(si * 20 + i) % BB_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i);
      const eventIdx = (si === 0 ? 60 : si === 1 ? 40 : 80) + i + 1;
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(eventIdx, 3)}`,
        type: pt,
        location: `蚌埠市${ct[0]}${ct[1]}`,
        city: '蚌埠市',
        completeDate: daysBefore(daysBack),
        effect: status === '已退回' ? '较差' : i % 3 === 0 ? '一般' : '良好',
        status,
        rejectReason: status === '已退回' ? REJECT_REASONS[i % REJECT_REASONS.length] : undefined,
        reviewOpinion: status === '已通过' ? REVIEW_OPINIONS[i % REVIEW_OPINIONS.length] : status === '待审核' ? REVIEW_OPINIONS[i % REVIEW_OPINIONS.length] : undefined,
      });
    }
  }

  // 合肥市：3 个状态 × 10 条 = 30 条
  for (let si = 0; si < statuses.length; si++) {
    const status = statuses[si];
    const [minBack, maxBack] = dateRanges[si];
    for (let i = 0; i < 10; i++) {
      id++;
      const daysBack = spreadDays(i, 10, minBack, maxBack);
      const ct = HF_COUNTY_TOWNS[(si * 10 + i) % HF_COUNTY_TOWNS.length];
      const pt = problemTypeForIdx(i + 5);
      const effectIdx = (si * 10 + i) % EFFECTS.length;
      result.push({
        id: String(id),
        eventNo: `SJ-2026-${pad(si * 10 + i + 121, 3)}`,
        type: pt,
        location: `合肥市${ct[0]}${ct[1]}`,
        city: '合肥市',
        completeDate: daysBefore(daysBack),
        effect: EFFECTS[effectIdx],
        status,
        rejectReason: status === '已退回' ? REJECT_REASONS[i % REJECT_REASONS.length] : undefined,
        reviewOpinion: status === '已通过' ? REVIEW_OPINIONS[i % REVIEW_OPINIONS.length] : undefined,
      });
    }
  }

  // 其他城市：约 15 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const ct = cd.counties[0];
    id++;
    const status = statuses[ci % statuses.length];
    const daysBack = 10 + ci * 2;
    result.push({
      id: String(id),
      eventNo: `SJ-2026-${pad(120 + ci + 1, 3)}`,
      type: problemTypeForIdx(ci + 2),
      location: `${cd.city}${ct[0]}${ct[1]}`,
      city: cd.city,
      completeDate: daysBefore(daysBack),
      effect: status === '已退回' ? '较差' : '良好',
      status,
      rejectReason: status === '已退回' ? REJECT_REASONS[ci % REJECT_REASONS.length] : undefined,
      reviewOpinion: status === '已通过' ? REVIEW_OPINIONS[ci % REVIEW_OPINIONS.length] : undefined,
    });
  }

  return result;
}

export const caseReviews = generateCaseReviews();

// ============================================================
// 生成巡查记录 inspectionRecords
// ============================================================
function generateInspectionRecords(): InspectionRecord[] {
  const result: InspectionRecord[] = [];
  let id = 0;

  // 蚌埠市：20 条
  for (let i = 0; i < 20; i++) {
    id++;
    const ct = BB_COUNTY_TOWNS[i % BB_COUNTY_TOWNS.length];
    const daysBack = i;
    const hasProblem = i % 3 !== 2;
    result.push({
      id: String(id),
      recordNo: `XC-2026-${pad(id, 3)}`,
      date: daysBefore(daysBack),
      inspector: NAMES[i % NAMES.length],
      unit: '蚌埠市农业农村局',
      type: i % 2 === 0 ? '随机抽查' : '定点抽查',
      location: `蚌埠市${ct[0]}${ct[1]}`,
      city: '蚌埠市',
      result: hasProblem ? '发现问题' : '未发现问题',
      problemDescription: hasProblem ? `${ct[0]}${ct[1]}${['发现耕地撂荒','发现非粮化种植','发现疑似割青行为','发现种植计划未落实','发现焚烧秸秆行为'][i % 5]}` : undefined,
      photos: hasProblem ? [`/uploads/xc${pad(id, 3)}-1.jpg`] : [],
    });
  }

  // 合肥市：10 条
  for (let i = 0; i < 10; i++) {
    id++;
    const daysBack = i * 2 + 1;
    const ct = HF_COUNTY_TOWNS[i % HF_COUNTY_TOWNS.length];
    const hasProblem = i % 3 !== 2;
    result.push({
      id: String(id),
      recordNo: `XC-2026-${pad(id, 3)}`,
      date: daysBefore(daysBack),
      inspector: NAMES[(i + 6) % NAMES.length],
      unit: `${ct[0]}农业农村局`,
      type: i % 2 === 0 ? '随机抽查' : '定点抽查',
      location: `合肥市${ct[0]}${ct[1]}`,
      city: '合肥市',
      result: hasProblem ? '发现问题' : '未发现问题',
      problemDescription: hasProblem ? `${ct[0]}${ct[1]}发现${problemTypeForIdx(i)}问题，面积约${areaForIdx(800 + i)}亩` : undefined,
      photos: hasProblem ? [`/uploads/xc${pad(id, 3)}-1.jpg`] : [],
    });
  }

  // 其他城市：约 15 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const ct = cd.counties[0];
    id++;
    const daysBack = 5 + ci;
    const hasProblem = ci % 3 !== 1;
    result.push({
      id: String(id),
      recordNo: `XC-2026-${pad(id, 3)}`,
      date: daysBefore(daysBack),
      inspector: NAMES[ci % NAMES.length],
      unit: `${cd.city}农业农村局`,
      type: ci % 2 === 0 ? '随机抽查' : '定点抽查',
      location: `${cd.city}${ct[0]}${ct[1]}`,
      city: cd.city,
      result: hasProblem ? '发现问题' : '未发现问题',
      problemDescription: hasProblem ? `${ct[0]}${ct[1]}${['发现耕地撂荒','发现非粮化种植','发现疑似割青行为'][ci % 3]}` : undefined,
      photos: hasProblem ? [`/uploads/xc${pad(id, 3)}-1.jpg`] : [],
    });
  }

  return result;
}

export const inspectionRecords: InspectionRecord[] = generateInspectionRecords();

// ============================================================
// 生成巡查 patrols
// ============================================================
function generatePatrols() {
  interface Patrol {
    id: string;
    patrolNo: string;
    date: string;
    location: string;
    city: string;
    type: string;
    hasProblem: boolean;
  }

  const result: Patrol[] = [];
  let id = 0;

  // 蚌埠市：20 条
  for (let i = 0; i < 20; i++) {
    id++;
    const ct = BB_COUNTY_TOWNS[i % BB_COUNTY_TOWNS.length];
    const daysBack = i;
    result.push({
      id: String(id),
      patrolNo: `XL-2026-${pad(id, 3)}`,
      date: daysBefore(daysBack),
      location: `蚌埠市${ct[0]}${ct[1]}`,
      city: '蚌埠市',
      type: PATROL_TYPES[i % PATROL_TYPES.length],
      hasProblem: i % 3 !== 2,
    });
  }

  // 合肥市：10 条
  for (let i = 0; i < 10; i++) {
    id++;
    const daysBack = i * 2 + 1;
    const ct = HF_COUNTY_TOWNS[i % HF_COUNTY_TOWNS.length];
    result.push({
      id: String(id),
      patrolNo: `XC-2026-${pad(id + 50, 3)}`,
      date: daysBefore(daysBack),
      location: `合肥市${ct[0]}${ct[1]}`,
      city: '合肥市',
      type: PATROL_TYPES[i % PATROL_TYPES.length],
      hasProblem: i % 3 !== 2,
    });
  }

  // 其他城市：约 15 条
  for (let ci = 0; ci < OTHER_CITIES.length; ci++) {
    const cd = OTHER_CITIES[ci];
    const ct = cd.counties[0];
    id++;
    const daysBack = 3 + ci;
    result.push({
      id: String(id),
      patrolNo: `XL-2026-${pad(id, 3)}`,
      date: daysBefore(daysBack),
      location: `${cd.city}${ct[0]}${ct[1]}`,
      city: cd.city,
      type: PATROL_TYPES[ci % PATROL_TYPES.length],
      hasProblem: ci % 3 !== 1,
    });
  }

  return result;
}

export const patrols = generatePatrols();

// ============================================================
// 生成预警 alerts
// ============================================================
function generateAlerts(): Alert[] {
  const result: Alert[] = [];
  const alertData: [Alert['type'], string, number, string?, string?][] = [
    ['danger','蚌埠市怀远县3个图斑超期未处置，超期已达7天以上',0,'蚌埠市','立即处理'],
    ['danger','蚌埠市固镇县非粮化问题持续恶化，整改逾期未完成',0,'蚌埠市','立即处理'],
    ['danger','阜阳市临泉县疑似违规割青事件待确认，涉及面积5.67亩',1,'阜阳市','立即处理'],
    ['danger','宿州市砀山县非粮化问题持续恶化，整改逾期未完成',1,'宿州市','立即处理'],
    ['danger','六安市霍邱县撂荒面积持续扩大，本月新增4处',2,'六安市','立即处理'],
    ['danger','合肥市肥东县秸秆焚烧火点被卫星监测到，需紧急核查',2,'合肥市','立即处理'],
    ['warning','蚌埠市待核查图斑超过50个，请加快核查进度',0,'蚌埠市','查看详情'],
    ['warning','蚌埠市五河县2个整改任务即将到期，请及时跟进',1,'蚌埠市','查看详情'],
    ['warning','合肥市肥西县2个整改任务即将到期，请及时跟进',2,'合肥市','查看详情'],
    ['warning','合肥市肥东县撂荒图斑核查完成率低于全省平均水平',3,'合肥市','查看详情'],
    ['warning','滁州市定远县3个核查任务即将超期，剩余2天',3,'滁州市','查看详情'],
    ['warning','合肥市长丰县非粮化整改进度缓慢，当前仅完成35%',4,'合肥市','查看详情'],
    ['warning','宿州市萧县本月新增图斑数量较多，需加强巡查力度',5,'宿州市','查看详情'],
    ['warning','合肥市庐江县撂荒复耕率未达标，需加大推进力度',5,'合肥市','查看详情'],
    ['info','芜湖市鸠江区本月图斑处置率达到95%，表现优秀',0,'芜湖市','查看详情'],
    ['info','马鞍山市当涂县种植计划落实情况良好，已全部完成',1,'马鞍山市','查看详情'],
    ['info','合肥市巢湖市整改完成率位居全市前列',2,'合肥市','查看详情'],
    ['info','黄山市歙县本月无新增图斑，粮食安全态势良好',3,'黄山市','查看详情'],
    ['info','铜陵市枞阳县整改完成率位居全省前列',4,'铜陵市','查看详情'],
    ['info','池州市东至县完成秋季种植计划核查，结果正常',5,'池州市','查看详情'],
  ];

  for (let i = 0; i < alertData.length; i++) {
    const [type, message, daysBack, city, action] = alertData[i];
    const d = new Date(2026, 5, 20 - daysBack);
    const hour = 7 + (i * 3) % 14;
    const minute = (i * 17) % 60;
    result.push({
      id: String(i + 1),
      type,
      message,
      time: `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)} ${pad(hour, 2)}:${pad(minute, 2)}`,
      city,
      action,
    });
  }

  return result;
}

export const alerts: Alert[] = generateAlerts();

// ============================================================
// 首页统计数据
// ============================================================
export const homeStatistics: Statistics = {
  totalSpots: 2156,
  pendingCheck: 456,
  rectifying: 189,
  closedThisMonth: 334,
  newThisMonth: 67,
  avgProcessDays: 14.36,
  overdueCount: 18,
};

// ============================================================
// 各市图斑分布数据（16市）
// ============================================================
export const citySpotDistribution: { city: string; count: number }[] = [
  { city: '蚌埠市', count: 312 },
  { city: '阜阳市', count: 287 },
  { city: '宿州市', count: 256 },
  { city: '亳州市', count: 213 },
  { city: '六安市', count: 198 },
  { city: '滁州市', count: 176 },
  { city: '合肥市', count: 165 },
  { city: '安庆市', count: 154 },
  { city: '淮南市', count: 132 },
  { city: '淮北市', count: 98 },
  { city: '芜湖市', count: 86 },
  { city: '宣城市', count: 75 },
  { city: '马鞍山市', count: 62 },
  { city: '池州市', count: 54 },
  { city: '铜陵市', count: 43 },
  { city: '黄山市', count: 28 },
];

// ============================================================
// 图斑处置进度（饼图）
// ============================================================
export const spotProcessProgress = [
  { name: '已结案', value: 856, color: 'var(--success)' },
  { name: '整改中', value: 342, color: 'var(--warning)' },
  { name: '待核查', value: 267, color: 'var(--info)' },
];

// ============================================================
// 城市统计排行（16市）
// ============================================================
export const cityRankings: CityStatistics[] = [
  { city: '芜湖市', spotCount: 86, closedCount: 83, closeRate: 96.51, avgDays: 8.23, rank: 1 },
  { city: '马鞍山市', spotCount: 62, closedCount: 59, closeRate: 95.16, avgDays: 9.15, rank: 2 },
  { city: '铜陵市', spotCount: 43, closedCount: 40, closeRate: 93.02, avgDays: 10.47, rank: 3 },
  { city: '黄山市', spotCount: 28, closedCount: 26, closeRate: 92.86, avgDays: 9.82, rank: 4 },
  { city: '池州市', spotCount: 54, closedCount: 49, closeRate: 90.74, avgDays: 11.35, rank: 5 },
  { city: '宣城市', spotCount: 75, closedCount: 67, closeRate: 89.33, avgDays: 12.18, rank: 6 },
  { city: '滁州市', spotCount: 176, closedCount: 155, closeRate: 88.07, avgDays: 13.56, rank: 7 },
  { city: '合肥市', spotCount: 165, closedCount: 143, closeRate: 86.67, avgDays: 14.23, rank: 8 },
  { city: '蚌埠市', spotCount: 312, closedCount: 268, closeRate: 85.90, avgDays: 15.78, rank: 9 },
  { city: '安庆市', spotCount: 154, closedCount: 131, closeRate: 85.06, avgDays: 16.45, rank: 10 },
  { city: '淮南市', spotCount: 132, closedCount: 110, closeRate: 83.33, avgDays: 17.89, rank: 11 },
  { city: '六安市', spotCount: 198, closedCount: 162, closeRate: 81.82, avgDays: 18.34, rank: 12 },
  { city: '阜阳市', spotCount: 287, closedCount: 231, closeRate: 80.49, avgDays: 19.67, rank: 13 },
  { city: '亳州市', spotCount: 213, closedCount: 169, closeRate: 79.34, avgDays: 20.15, rank: 14 },
  { city: '淮北市', spotCount: 98, closedCount: 76, closeRate: 77.55, avgDays: 21.43, rank: 15 },
  { city: '宿州市', spotCount: 256, closedCount: 196, closeRate: 76.56, avgDays: 22.18, rank: 16 },
];

// ============================================================
// 长势分析数据（16市）
// ============================================================
export const growthData: GrowthData[] = [
  { region: '芜湖市', index: 0.91, yoyChange: 9.20, avgIndex: 0.78, rating: '优秀', rank: 1 },
  { region: '滁州市', index: 0.89, yoyChange: 7.80, avgIndex: 0.78, rating: '优秀', rank: 2 },
  { region: '马鞍山市', index: 0.87, yoyChange: 6.50, avgIndex: 0.78, rating: '优秀', rank: 3 },
  { region: '蚌埠市', index: 0.84, yoyChange: 5.30, avgIndex: 0.78, rating: '良好', rank: 4 },
  { region: '合肥市', index: 0.82, yoyChange: 4.10, avgIndex: 0.78, rating: '良好', rank: 5 },
  { region: '铜陵市', index: 0.80, yoyChange: 3.20, avgIndex: 0.78, rating: '良好', rank: 6 },
  { region: '安庆市', index: 0.79, yoyChange: 2.40, avgIndex: 0.78, rating: '良好', rank: 7 },
  { region: '宣城市', index: 0.78, yoyChange: 1.50, avgIndex: 0.78, rating: '良好', rank: 8 },
  { region: '池州市', index: 0.76, yoyChange: -1.20, avgIndex: 0.78, rating: '中等', rank: 9 },
  { region: '黄山市', index: 0.74, yoyChange: -2.30, avgIndex: 0.78, rating: '中等', rank: 10 },
  { region: '淮南市', index: 0.72, yoyChange: -3.40, avgIndex: 0.78, rating: '中等', rank: 11 },
  { region: '六安市', index: 0.70, yoyChange: -4.10, avgIndex: 0.78, rating: '中等', rank: 12 },
  { region: '淮北市', index: 0.68, yoyChange: -4.80, avgIndex: 0.78, rating: '中等', rank: 13 },
  { region: '阜阳市', index: 0.66, yoyChange: -5.50, avgIndex: 0.78, rating: '偏差', rank: 14 },
  { region: '亳州市', index: 0.64, yoyChange: -5.20, avgIndex: 0.78, rating: '偏差', rank: 15 },
  { region: '宿州市', index: 0.62, yoyChange: -4.90, avgIndex: 0.78, rating: '偏差', rank: 16 },
];

// ============================================================
// 月度趋势数据（6个月）
// ============================================================
export const monthlyTrend = [
  { month: '1月', newSpots: 156, closedSpots: 134 },
  { month: '2月', newSpots: 123, closedSpots: 112 },
  { month: '3月', newSpots: 89, closedSpots: 95 },
  { month: '4月', newSpots: 67, closedSpots: 78 },
  { month: '5月', newSpots: 45, closedSpots: 56 },
  { month: '6月', newSpots: 23, closedSpots: 34 },
];

// ============================================================
// 问题类型分布（5类）
// ============================================================
export const problemTypeDistribution = [
  { name: '撂荒', value: 456, color: 'var(--chart-1)' },
  { name: '非粮化', value: 312, color: 'var(--chart-2)' },
  { name: '疑似割青', value: 178, color: 'var(--chart-3)' },
  { name: '种植计划未落实', value: 134, color: 'var(--chart-4)' },
  { name: '焚烧秸秆', value: 89, color: 'var(--chart-5)' },
];

// ============================================================
// 安徽省各市地图数据（16市）
// ============================================================
export const cityMapData = [
  { name: '合肥市', value: 165, pendingCheck: 34, rectifying: 12, closed: 119 },
  { name: '芜湖市', value: 86, pendingCheck: 8, rectifying: 5, closed: 73 },
  { name: '蚌埠市', value: 312, pendingCheck: 56, rectifying: 23, closed: 233 },
  { name: '淮南市', value: 132, pendingCheck: 28, rectifying: 11, closed: 93 },
  { name: '马鞍山市', value: 62, pendingCheck: 5, rectifying: 3, closed: 54 },
  { name: '淮北市', value: 98, pendingCheck: 20, rectifying: 8, closed: 70 },
  { name: '铜陵市', value: 43, pendingCheck: 4, rectifying: 2, closed: 37 },
  { name: '安庆市', value: 154, pendingCheck: 32, rectifying: 14, closed: 108 },
  { name: '黄山市', value: 28, pendingCheck: 3, rectifying: 1, closed: 24 },
  { name: '滁州市', value: 176, pendingCheck: 30, rectifying: 13, closed: 133 },
  { name: '阜阳市', value: 287, pendingCheck: 68, rectifying: 25, closed: 194 },
  { name: '宿州市', value: 256, pendingCheck: 72, rectifying: 28, closed: 156 },
  { name: '六安市', value: 198, pendingCheck: 42, rectifying: 18, closed: 138 },
  { name: '亳州市', value: 213, pendingCheck: 48, rectifying: 20, closed: 145 },
  { name: '池州市', value: 54, pendingCheck: 7, rectifying: 3, closed: 44 },
  { name: '宣城市', value: 75, pendingCheck: 10, rectifying: 5, closed: 60 },
];

// ============================================================
// 地图图斑列表
// ============================================================
export const mapSpots = spots.map(spot => ({
  ...spot,
  lng: spot.coordinate.lng,
  lat: spot.coordinate.lat,
}));

// ============================================================
// 一张图城市统计数据（16市）
// ============================================================
export const cityStats = [
  { city: '合肥市', pending: 34, rectifying: 12, closed: 143, growthDeviation: 8 },
  { city: '芜湖市', pending: 8, rectifying: 5, closed: 83, growthDeviation: 3 },
  { city: '蚌埠市', pending: 56, rectifying: 23, closed: 268, growthDeviation: 15 },
  { city: '淮南市', pending: 28, rectifying: 11, closed: 110, growthDeviation: 12 },
  { city: '马鞍山市', pending: 5, rectifying: 3, closed: 59, growthDeviation: 4 },
  { city: '淮北市', pending: 20, rectifying: 8, closed: 76, growthDeviation: 10 },
  { city: '铜陵市', pending: 4, rectifying: 2, closed: 40, growthDeviation: 5 },
  { city: '安庆市', pending: 32, rectifying: 14, closed: 131, growthDeviation: 11 },
  { city: '黄山市', pending: 3, rectifying: 1, closed: 26, growthDeviation: 2 },
  { city: '滁州市', pending: 30, rectifying: 13, closed: 155, growthDeviation: 9 },
  { city: '阜阳市', pending: 68, rectifying: 25, closed: 231, growthDeviation: 18 },
  { city: '宿州市', pending: 72, rectifying: 28, closed: 196, growthDeviation: 16 },
  { city: '六安市', pending: 42, rectifying: 18, closed: 162, growthDeviation: 14 },
  { city: '亳州市', pending: 48, rectifying: 20, closed: 169, growthDeviation: 13 },
  { city: '池州市', pending: 7, rectifying: 3, closed: 49, growthDeviation: 6 },
  { city: '宣城市', pending: 10, rectifying: 5, closed: 67, growthDeviation: 7 },
];

// ============================================================
// 长势分析数据（16市，用于苗情监测页面）
// ============================================================
export const growthAnalysis = [
  { city: '芜湖市', index: 0.91, trend: 9.20, rating: '优秀' },
  { city: '滁州市', index: 0.89, trend: 7.80, rating: '优秀' },
  { city: '马鞍山市', index: 0.87, trend: 6.50, rating: '优秀' },
  { city: '蚌埠市', index: 0.84, trend: 5.30, rating: '良好' },
  { city: '合肥市', index: 0.82, trend: 4.10, rating: '良好' },
  { city: '铜陵市', index: 0.80, trend: 3.20, rating: '良好' },
  { city: '安庆市', index: 0.79, trend: 2.40, rating: '良好' },
  { city: '宣城市', index: 0.78, trend: 1.50, rating: '良好' },
  { city: '池州市', index: 0.76, trend: -1.20, rating: '中等' },
  { city: '黄山市', index: 0.74, trend: -2.30, rating: '中等' },
  { city: '淮南市', index: 0.72, trend: -3.40, rating: '中等' },
  { city: '六安市', index: 0.70, trend: -4.10, rating: '中等' },
  { city: '淮北市', index: 0.68, trend: -4.80, rating: '中等' },
  { city: '阜阳市', index: 0.66, trend: -5.50, rating: '偏差' },
  { city: '亳州市', index: 0.64, trend: -5.20, rating: '偏差' },
  { city: '宿州市', index: 0.62, trend: -4.90, rating: '偏差' },
];
