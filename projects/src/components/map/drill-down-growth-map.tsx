'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 天地图API Key
const TDT_KEY = '685821b861c26919e7194de5f2e0f876';

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

// 根据长势评级获取颜色
function getGrowthColor(rating: GrowthRating): string {
  switch (rating) {
    case 'excellent': return '#1B5E20';
    case 'good': return '#4CAF50';
    case 'medium': return '#FFC107';
    case 'poor': return '#FF9800';
    case 'bad': return '#F44336';
    default: return '#9E9E9E';
  }
}

// 天地图行政区划API - 获取行政区划GeoJSON
async function fetchAdminBoundary(code: string): Promise<any> {
  const url = `https://api.tianditu.gov.cn/administrative?postStr=${encodeURIComponent(JSON.stringify({
    searchWord: code,
    searchType: '1',
    needSubInfo: 'true',
    needAll: 'true',
    needPolygon: 'true',
    needPre: 'true'
  }))}&tk=${TDT_KEY}`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.data && data.data.lnt) {
      // 天地图返回的边界点数据，转换为GeoJSON
      const boundaryData = data.data;

      // 如果有子区域
      if (boundaryData.child && boundaryData.child.length > 0) {
        const features = boundaryData.child.map((child: any) => {
          const polygon = parseTdtPolygon(child.lnt, child.lat);
          return {
            type: 'Feature',
            properties: {
              name: child.name,
              code: child.code || child.id,
              level: child.level,
            },
            geometry: polygon,
          };
        });
        return {
          type: 'FeatureCollection',
          features,
        };
      }

      // 如果只有自身边界
      if (boundaryData.lnt && boundaryData.lat) {
        const polygon = parseTdtPolygon(boundaryData.lnt, boundaryData.lat);
        return {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {
              name: boundaryData.name,
              code: boundaryData.code || code,
            },
            geometry: polygon,
          }],
        };
      }
    }
    return null;
  } catch (err) {
    console.warn('天地图API请求失败:', err);
    return null;
  }
}

// 解析天地图返回的边界坐标字符串
function parseTdtPolygon(lntStr: string, latStr: string): any {
  if (!lntStr || !latStr) return { type: 'Polygon', coordinates: [] };

  const lngs = lntStr.split(';').map(Number).filter(n => !isNaN(n));
  const lats = latStr.split(';').map(Number).filter(n => !isNaN(n));

  if (lngs.length < 3 || lats.length < 3) return { type: 'Polygon', coordinates: [] };

  const coords: [number, number][] = [];
  for (let i = 0; i < Math.min(lngs.length, lats.length); i++) {
    coords.push([lngs[i], lats[i]]);
  }
  // 闭合
  if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
    coords.push(coords[0]);
  }

  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

// 安徽省各市简化边界GeoJSON（作为天地图API失败的备用数据）
const anhuiCityBoundaries: Record<string, any> = {
  '340100': { type: 'Feature', properties: { name: '合肥市', code: '340100' }, geometry: { type: 'Polygon', coordinates: [[[117.03,31.47],[117.27,31.45],[117.52,31.52],[117.72,31.75],[117.88,31.95],[117.82,32.18],[117.58,32.35],[117.28,32.48],[116.95,32.42],[116.68,32.15],[116.72,31.88],[116.88,31.62],[117.03,31.47]]] } },
  '340200': { type: 'Feature', properties: { name: '芜湖市', code: '340200' }, geometry: { type: 'Polygon', coordinates: [[[118.02,31.08],[118.38,31.05],[118.68,31.18],[118.85,31.42],[118.75,31.68],[118.52,31.85],[118.18,31.82],[117.95,31.65],[117.88,31.38],[118.02,31.08]]] } },
  '340300': { type: 'Feature', properties: { name: '蚌埠市', code: '340300' }, geometry: { type: 'Polygon', coordinates: [[[117.05,32.72],[117.42,32.68],[117.82,32.85],[118.12,33.12],[118.05,33.45],[117.68,33.62],[117.22,33.58],[116.92,33.28],[116.85,32.92],[117.05,32.72]]] } },
  '340400': { type: 'Feature', properties: { name: '淮南市', code: '340400' }, geometry: { type: 'Polygon', coordinates: [[[116.58,32.42],[116.92,32.38],[117.28,32.52],[117.42,32.78],[117.28,33.02],[116.92,33.12],[116.55,33.02],[116.42,32.72],[116.58,32.42]]] } },
  '340500': { type: 'Feature', properties: { name: '马鞍山市', code: '340500' }, geometry: { type: 'Polygon', coordinates: [[[118.22,31.42],[118.48,31.38],[118.78,31.52],[118.92,31.78],[118.82,32.02],[118.52,32.15],[118.18,32.08],[118.02,31.82],[118.12,31.55],[118.22,31.42]]] } },
  '340600': { type: 'Feature', properties: { name: '淮北市', code: '340600' }, geometry: { type: 'Polygon', coordinates: [[[116.42,33.62],[116.68,33.58],[117.02,33.72],[117.18,33.98],[117.02,34.22],[116.62,34.28],[116.32,34.12],[116.28,33.85],[116.42,33.62]]] } },
  '340700': { type: 'Feature', properties: { name: '铜陵市', code: '340700' }, geometry: { type: 'Polygon', coordinates: [[[117.52,30.72],[117.82,30.68],[118.12,30.82],[118.18,31.08],[118.02,31.32],[117.68,31.38],[117.38,31.28],[117.32,31.02],[117.52,30.72]]] } },
  '340800': { type: 'Feature', properties: { name: '安庆市', code: '340800' }, geometry: { type: 'Polygon', coordinates: [[[115.82,30.12],[116.28,30.08],[116.78,30.22],[117.18,30.52],[117.28,30.88],[117.08,31.22],[116.62,31.35],[116.18,31.28],[115.78,30.98],[115.62,30.58],[115.82,30.12]]] } },
  '341000': { type: 'Feature', properties: { name: '黄山市', code: '341000' }, geometry: { type: 'Polygon', coordinates: [[[117.78,29.42],[118.22,29.38],[118.68,29.52],[119.02,29.88],[119.08,30.28],[118.82,30.58],[118.38,30.72],[117.92,30.62],[117.58,30.32],[117.48,29.88],[117.78,29.42]]] } },
  '341100': { type: 'Feature', properties: { name: '滁州市', code: '341100' }, geometry: { type: 'Polygon', coordinates: [[[117.82,31.88],[118.28,31.82],[118.78,32.02],[119.18,32.38],[119.22,32.82],[118.92,33.18],[118.42,33.28],[117.92,33.12],[117.58,32.78],[117.48,32.38],[117.68,32.08],[117.82,31.88]]] } },
  '341200': { type: 'Feature', properties: { name: '阜阳市', code: '341200' }, geometry: { type: 'Polygon', coordinates: [[[114.82,32.52],[115.28,32.48],[115.78,32.62],[116.18,32.88],[116.28,33.28],[116.08,33.62],[115.58,33.72],[115.08,33.58],[114.72,33.28],[114.62,32.88],[114.82,32.52]]] } },
  '341300': { type: 'Feature', properties: { name: '宿州市', code: '341300' }, geometry: { type: 'Polygon', coordinates: [[[116.42,33.28],[116.88,33.22],[117.38,33.38],[117.62,33.72],[117.52,34.12],[117.12,34.35],[116.58,34.32],[116.18,34.08],[116.08,33.68],[116.22,33.42],[116.42,33.28]]] } },
  '341500': { type: 'Feature', properties: { name: '六安市', code: '341500' }, geometry: { type: 'Polygon', coordinates: [[[115.72,31.22],[116.18,31.18],[116.68,31.38],[117.02,31.72],[117.08,32.18],[116.82,32.58],[116.38,32.78],[115.88,32.72],[115.48,32.42],[115.38,31.98],[115.52,31.58],[115.72,31.22]]] } },
  '341600': { type: 'Feature', properties: { name: '亳州市', code: '341600' }, geometry: { type: 'Polygon', coordinates: [[[115.32,33.38],[115.78,33.32],[116.22,33.48],[116.42,33.82],[116.32,34.22],[115.88,34.42],[115.38,34.38],[115.02,34.12],[114.98,33.72],[115.12,33.48],[115.32,33.38]]] } },
  '341700': { type: 'Feature', properties: { name: '池州市', code: '341700' }, geometry: { type: 'Polygon', coordinates: [[[117.02,29.98],[117.42,29.92],[117.88,30.08],[118.12,30.38],[118.05,30.72],[117.72,30.88],[117.28,30.82],[116.92,30.62],[116.78,30.28],[116.88,30.08],[117.02,29.98]]] } },
  '341800': { type: 'Feature', properties: { name: '宣城市', code: '341800' }, geometry: { type: 'Polygon', coordinates: [[[118.02,30.32],[118.48,30.28],[118.98,30.42],[119.35,30.72],[119.48,31.12],[119.32,31.52],[118.92,31.72],[118.42,31.68],[118.02,31.48],[117.82,31.12],[117.88,30.72],[118.02,30.32]]] } },
};

// 城市中心坐标
const cityCenters: Record<string, [number, number]> = {
  '340100': [31.82, 117.27],
  '340200': [31.35, 118.38],
  '340300': [32.92, 117.36],
  '340400': [32.63, 116.98],
  '340500': [31.70, 118.50],
  '340600': [33.97, 116.80],
  '340700': [30.93, 117.81],
  '340800': [30.53, 117.03],
  '341000': [29.72, 118.33],
  '341100': [32.30, 118.32],
  '341200': [32.89, 115.81],
  '341300': [33.64, 116.98],
  '341500': [31.73, 116.50],
  '341600': [33.87, 115.78],
  '341700': [30.67, 117.49],
  '341800': [30.93, 118.76],
};

// 地图控制组件
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.5 });
  }, [center, zoom, map]);
  return null;
}

// 地图点击事件处理
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

// GeoJSON图层组件
function GeoJSONLayer({
  areas,
  geoJsonData,
  onAreaClick,
  isClickable = true,
}: {
  areas: AreaGrowth[];
  geoJsonData: any;
  onAreaClick?: (area: AreaGrowth) => void;
  isClickable?: boolean;
}) {
  const style = (feature: any): L.PathOptions => {
    const areaCode = feature?.properties?.code;
    const areaData = areas.find(a => a.code === String(areaCode));
    return {
      fillColor: areaData ? getGrowthColor(areaData.rating) : '#9E9E9E',
      weight: 2,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const areaCode = feature.properties?.code || '';
    const areaName = feature.properties?.name || '';
    const areaData = areas.find(a => a.code === String(areaCode));

    if (areaData) {
      const ratingLabel = { excellent: '优秀', good: '良好', medium: '中等', poor: '较差', bad: '差' }[areaData.rating];
      const tooltipContent = `
        <div style="font-size:13px;line-height:1.6">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${areaData.name}</div>
          <div>长势指数：<b>${areaData.index.toFixed(2)}</b></div>
          <div>长势评级：<b style="color:${getGrowthColor(areaData.rating)}">${ratingLabel}</b></div>
          <div>同比变化：<span style="color:${areaData.yoyChange >= 0 ? '#16a34a' : '#dc2626'}">${areaData.yoyChange >= 0 ? '+' : ''}${areaData.yoyChange}%</span></div>
          <div>监测面积：<b>${(areaData.area / 10000).toFixed(1)}万亩</b></div>
          ${isClickable ? '<div style="margin-top:4px;color:#1A5C9A;font-size:11px">点击下钻查看详情</div>' : ''}
        </div>
      `;
      layer.bindTooltip(tooltipContent, { permanent: false, direction: 'top', className: 'growth-tooltip' });

      if (isClickable && onAreaClick) {
        layer.on({
          click: () => onAreaClick(areaData),
          mouseover: (e: any) => {
            e.target.setStyle({ weight: 3, color: '#1A5C9A', fillOpacity: 0.85 });
          },
          mouseout: (e: any) => {
            e.target.setStyle(style(feature));
          },
        });
      }
    } else {
      layer.bindTooltip(areaName, { permanent: false, direction: 'top' });
    }
  };

  return (
    <GeoJSON
      key={JSON.stringify(geoJsonData).slice(0, 200)}
      data={geoJsonData}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

// 区域标签组件
function AreaLabels({ areas, geoJsonData }: { areas: AreaGrowth[]; geoJsonData: any }) {
  const map = useMap();

  useEffect(() => {
    const labels: L.Marker[] = [];
    const features = geoJsonData?.features || [];

    features.forEach((feature: any) => {
      const code = feature.properties?.code;
      const area = areas.find(a => a.code === String(code));
      if (!area) return;

      // 计算边界中心
      let center: [number, number] | null = null;
      if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates?.[0]) {
        const coords = feature.geometry.coordinates[0];
        const lats = coords.map((c: number[]) => c[1]);
        const lngs = coords.map((c: number[]) => c[0]);
        center = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
      } else if (feature.geometry?.type === 'MultiPolygon') {
        // 取最大多边形的中心
        let maxLen = 0;
        let bestCoords: number[][] = [];
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          if (polygon[0] && polygon[0].length > maxLen) {
            maxLen = polygon[0].length;
            bestCoords = polygon[0];
          }
        });
        if (bestCoords.length > 0) {
          const lats = bestCoords.map(c => c[1]);
          const lngs = bestCoords.map(c => c[0]);
          center = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
        }
      }

      if (!center) {
        // 使用预定义中心
        center = cityCenters[code] || null;
      }

      if (center) {
        const icon = L.divIcon({
          className: 'area-label',
          html: `<div style="background:rgba(255,255,255,0.92);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:500;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);color:${getGrowthColor(area.rating)};border:1px solid ${getGrowthColor(area.rating)}">${area.name.replace('市', '').replace('区', '').replace('县', '')}</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        const marker = L.marker([center[0], center[1]], { icon, interactive: false }).addTo(map);
        labels.push(marker);
      }
    });

    return () => {
      labels.forEach(label => map.removeLayer(label));
    };
  }, [map, areas, geoJsonData]);

  return null;
}

// 面包屑导航
function Breadcrumb({ items, onItemClick }: { items: { name: string; code: string }[]; onItemClick: (index: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-sm bg-white/95 px-4 py-2 rounded-lg shadow-sm">
      {items.map((item, index) => (
        <div key={item.code} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => onItemClick(index)}
            className={`hover:text-[#1A5C9A] transition-colors ${index === items.length - 1 ? 'text-[#1A5C9A] font-medium' : 'text-gray-600'}`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
}

// 图例组件
function Legend() {
  const legendItems = [
    { color: '#1B5E20', label: '优秀 (≥0.90)' },
    { color: '#4CAF50', label: '良好 (0.80-0.90)' },
    { color: '#FFC107', label: '中等 (0.70-0.80)' },
    { color: '#FF9800', label: '较差 (0.60-0.70)' },
    { color: '#F44336', label: '差 (<0.60)' },
  ];

  return (
    <div className="absolute bottom-4 right-4 bg-white/95 px-4 py-3 rounded-lg shadow-lg z-[1000]">
      <div className="text-sm font-medium text-gray-700 mb-2">长势等级图例</div>
      <div className="space-y-1">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 主组件Props
interface DrillDownGrowthMapProps {
  height?: string;
  onAreaSelect?: (area: AreaGrowth) => void;
}

// 主组件
export function DrillDownGrowthMap({ height = '500px', onAreaSelect }: DrillDownGrowthMapProps) {
  const [currentLevel, setCurrentLevel] = useState<MapLevel>('province');
  const [currentCity, setCurrentCity] = useState<AreaGrowth | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.3, 117.2]);
  const [mapZoom, setMapZoom] = useState(7);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('加载中...');

  // 获取省级GeoJSON（安徽省各市边界）
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function loadProvinceData() {
      // 尝试从天地图API获取
      try {
        const tdtData = await fetchAdminBoundary('340000');
        if (!cancelled && tdtData && tdtData.features && tdtData.features.length > 0) {
          setGeoJsonData(tdtData);
          setDataSource('天地图真实边界');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('天地图API获取省级边界失败，使用备用数据', e);
      }

      // 使用备用数据
      if (!cancelled) {
        const fallbackFeatures = Object.values(anhuiCityBoundaries);
        setGeoJsonData({ type: 'FeatureCollection', features: fallbackFeatures });
        setDataSource('备用边界数据');
        setLoading(false);
      }
    }

    loadProvinceData();
    return () => { cancelled = true; };
  }, []);

  // 获取市级GeoJSON（下钻到区县边界）
  useEffect(() => {
    if (currentLevel !== 'city' || !currentCity) return;

    const city = currentCity;
    let cancelled = false;
    setLoading(true);

    async function loadCityData() {
      try {
        const tdtData = await fetchAdminBoundary(city.code);
        if (!cancelled && tdtData && tdtData.features && tdtData.features.length > 0) {
          setGeoJsonData(tdtData);
          setDataSource('天地图真实边界');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('天地图API获取市级边界失败', e);
      }

      // 备用：生成简单的区县边界
      if (!cancelled) {
        const countyNames: Record<string, string[]> = {
          '合肥市': ['瑶海区', '庐阳区', '蜀山区', '包河区', '长丰县', '肥东县', '肥西县', '庐江县', '巢湖市'],
          '芜湖市': ['镜湖区', '弋江区', '鸠江区', '三山区', '芜湖县', '繁昌区', '南陵县', '无为市'],
          '蚌埠市': ['龙子湖区', '蚌山区', '禹会区', '淮上区', '怀远县', '五河县', '固镇县'],
          '淮南市': ['大通区', '田家庵区', '谢家集区', '八公山区', '潘集区', '凤台县', '寿县'],
          '马鞍山市': ['花山区', '雨山区', '博望区', '当涂县', '含山县', '和县'],
          '淮北市': ['杜集区', '相山区', '烈山区', '濉溪县'],
          '铜陵市': ['铜官区', '义安区', '郊区', '枞阳县'],
          '安庆市': ['迎江区', '大观区', '宜秀区', '怀宁县', '太湖县', '宿松县', '望江县', '岳西县', '桐城市', '潜山市'],
          '黄山市': ['屯溪区', '黄山区', '徽州区', '歙县', '休宁县', '黟县', '祁门县'],
          '滁州市': ['琅琊区', '南谯区', '来安县', '全椒县', '定远县', '凤阳县', '天长市', '明光市'],
          '阜阳市': ['颍州区', '颍东区', '颍泉区', '临泉县', '太和县', '阜南县', '颍上县', '界首市'],
          '宿州市': ['埇桥区', '砀山县', '萧县', '灵璧县', '泗县'],
          '六安市': ['金安区', '裕安区', '叶集区', '霍邱县', '舒城县', '金寨县', '霍山县'],
          '亳州市': ['谯城区', '涡阳县', '蒙城县', '利辛县'],
          '池州市': ['贵池区', '东至县', '石台县', '青阳县'],
          '宣城市': ['宣州区', '郎溪县', '泾县', '绩溪县', '旌德县', '宁国市', '广德市'],
        };

        const names = countyNames[city.name] || ['区县A', '区县B', '区县C'];
        const center = cityCenters[city.code] || [31.8, 117.2];
        const baseIndex = city.index;

        const features = names.map((name, i) => {
          // 在市中心周围生成简化的区县边界
          const angle = (2 * Math.PI * i) / names.length;
          const r = 0.15 + Math.random() * 0.1;
          const cx = center[1] + r * Math.cos(angle);
          const cy = center[0] + r * Math.sin(angle);
          const size = 0.08 + Math.random() * 0.06;

          const countyIndex = Math.max(0.5, baseIndex + (Math.random() - 0.5) * 0.15);
          const rating = countyIndex >= 0.9 ? 'excellent' : countyIndex >= 0.8 ? 'good' : countyIndex >= 0.7 ? 'medium' : countyIndex >= 0.6 ? 'poor' : 'bad';

          return {
            type: 'Feature',
            properties: {
              name,
              code: `${city.code}${String(i + 1).padStart(2, '0')}`,
              level: 'county',
              index: countyIndex,
              rating,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [cx - size, cy - size],
                [cx + size, cy - size],
                [cx + size, cy + size],
                [cx - size, cy + size],
                [cx - size, cy - size],
              ]],
            },
          };
        });

        setGeoJsonData({ type: 'FeatureCollection', features });
        setDataSource('备用边界数据');
        setLoading(false);
      }
    }

    loadCityData();
    return () => { cancelled = true; };
  }, [currentLevel, currentCity]);

  // 处理区域点击
  const handleAreaClick = useCallback((area: AreaGrowth) => {
    onAreaSelect?.(area);

    if (area.level === 'city' && currentLevel === 'province') {
      setCurrentCity(area);
      setCurrentLevel('city');
      const center = cityCenters[area.code] || [31.8, 117.2];
      setMapCenter(center);
      setMapZoom(9);
    }
  }, [currentLevel, onAreaSelect]);

  // 返回上一级
  const handleGoBack = useCallback((index: number) => {
    if (index === 0) {
      setCurrentLevel('province');
      setCurrentCity(null);
      setMapCenter([31.3, 117.2]);
      setMapZoom(7);
    }
  }, []);

  // 构建面包屑数据
  const breadcrumbItems = [{ name: '安徽省', code: '340000' }];
  if (currentCity) {
    breadcrumbItems.push({ name: currentCity.name, code: currentCity.code });
  }

  // 当前区域的长势数据
  const currentAreas = currentLevel === 'province' ? cityGrowthData : [];

  return (
    <div className="relative" style={{ height }}>
      {/* 面包屑导航 */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Breadcrumb items={breadcrumbItems} onItemClick={handleGoBack} />
      </div>

      {/* 数据来源标识 */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 px-3 py-1 rounded text-xs text-muted-foreground">
        底图：天地图 | 边界：{dataSource}
      </div>

      {/* 图例 */}
      <Legend />

      {/* 地图容器 */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        zoomControl={true}
        attributionControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* 天地图影像底图 */}
        <TileLayer
          url={`https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_KEY}`}
          subdomains={['0', '1', '2', '3', '4', '5', '6', '7']}
          maxZoom={18}
          minZoom={3}
        />

        {/* 天地图影像注记 */}
        <TileLayer
          url={`https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_KEY}`}
          subdomains={['0', '1', '2', '3', '4', '5', '6', '7']}
          maxZoom={18}
          minZoom={3}
        />

        {/* GeoJSON图层 */}
        {!loading && geoJsonData && (
          <>
            <GeoJSONLayer
              areas={currentAreas}
              geoJsonData={geoJsonData}
              onAreaClick={handleAreaClick}
              isClickable={currentLevel === 'province'}
            />
            <AreaLabels areas={currentAreas} geoJsonData={geoJsonData} />
          </>
        )}

        <MapClickHandler onMapClick={() => {}} />
      </MapContainer>

      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[1001] rounded-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-sm text-muted-foreground">正在加载天地图边界数据...</div>
          </div>
        </div>
      )}

      {/* 操作提示 */}
      <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-2 rounded-lg shadow-sm text-xs text-gray-500 z-[1000]">
        点击区域可下钻查看详细长势数据
      </div>
    </div>
  );
}

export default DrillDownGrowthMap;
