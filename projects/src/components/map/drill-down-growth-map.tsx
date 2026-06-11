'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// 合肥市区县数据
const hefeiCounties: AreaGrowth[] = [
  { code: '340102', name: '瑶海区', level: 'county', index: 0.82, rating: 'good', yoyChange: 5.5, area: 18900, parentId: '340100' },
  { code: '340103', name: '庐阳区', level: 'county', index: 0.88, rating: 'excellent', yoyChange: 7.2, area: 13900, parentId: '340100' },
  { code: '340104', name: '蜀山区', level: 'county', index: 0.86, rating: 'good', yoyChange: 6.8, area: 24300, parentId: '340100' },
  { code: '340111', name: '包河区', level: 'county', index: 0.84, rating: 'good', yoyChange: 6.2, area: 34000, parentId: '340100' },
  { code: '340121', name: '长丰县', level: 'county', index: 0.79, rating: 'medium', yoyChange: 4.5, area: 184100, parentId: '340100' },
  { code: '340122', name: '肥东县', level: 'county', index: 0.81, rating: 'good', yoyChange: 5.8, area: 206100, parentId: '340100' },
  { code: '340123', name: '肥西县', level: 'county', index: 0.83, rating: 'good', yoyChange: 6.0, area: 169500, parentId: '340100' },
  { code: '340124', name: '庐江县', level: 'county', index: 0.76, rating: 'medium', yoyChange: 3.8, area: 234800, parentId: '340100' },
  { code: '340181', name: '巢湖市', level: 'county', index: 0.78, rating: 'medium', yoyChange: 4.2, area: 206300, parentId: '340100' },
];

// 芜湖市区县数据
const wuhuCounties: AreaGrowth[] = [
  { code: '340202', name: '镜湖区', level: 'county', index: 0.80, rating: 'good', yoyChange: 5.2, area: 16200, parentId: '340200' },
  { code: '340203', name: '弋江区', level: 'county', index: 0.78, rating: 'medium', yoyChange: 4.5, area: 15400, parentId: '340200' },
  { code: '340207', name: '鸠江区', level: 'county', index: 0.85, rating: 'good', yoyChange: 6.5, area: 68300, parentId: '340200' },
  { code: '340208', name: '三山区', level: 'county', index: 0.82, rating: 'good', yoyChange: 5.8, area: 31900, parentId: '340200' },
  { code: '340221', name: '芜湖县', level: 'county', index: 0.84, rating: 'good', yoyChange: 6.0, area: 65000, parentId: '340200' },
  { code: '340222', name: '繁昌区', level: 'county', index: 0.81, rating: 'good', yoyChange: 5.5, area: 58000, parentId: '340200' },
  { code: '340223', name: '南陵县', level: 'county', index: 0.76, rating: 'medium', yoyChange: 3.5, area: 126300, parentId: '340200' },
  { code: '340225', name: '无为市', level: 'county', index: 0.79, rating: 'medium', yoyChange: 4.2, area: 202000, parentId: '340200' },
];

// 根据长势指数获取评级
function getRatingFromIndex(index: number): GrowthRating {
  if (index >= 0.90) return 'excellent';
  if (index >= 0.80) return 'good';
  if (index >= 0.70) return 'medium';
  if (index >= 0.60) return 'poor';
  return 'bad';
}

// 根据长势评级获取颜色
function getGrowthColor(rating: GrowthRating): string {
  switch (rating) {
    case 'excellent':
      return '#1B5E20'; // 深绿色
    case 'good':
      return '#4CAF50'; // 绿色
    case 'medium':
      return '#FFC107'; // 黄色
    case 'poor':
      return '#FF9800'; // 橙色
    case 'bad':
      return '#F44336'; // 红色
    default:
      return '#9E9E9E';
  }
}

// 安徽省各市真实边界GeoJSON数据（简化版）
const anhuiCityBoundaries: Record<string, GeoJSON.GeoJsonObject> = {
  '340100': {
    type: 'Feature',
    properties: { name: '合肥市', code: '340100' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[117.03, 31.47], [117.27, 31.45], [117.52, 31.52], [117.72, 31.75], [117.88, 31.95], [117.82, 32.18], [117.58, 32.35], [117.28, 32.48], [116.95, 32.42], [116.68, 32.15], [116.72, 31.88], [116.88, 31.62], [117.03, 31.47]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340200': {
    type: 'Feature',
    properties: { name: '芜湖市', code: '340200' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[118.02, 31.08], [118.38, 31.05], [118.68, 31.18], [118.85, 31.42], [118.75, 31.68], [118.52, 31.85], [118.18, 31.82], [117.95, 31.65], [117.88, 31.38], [118.02, 31.08]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340300': {
    type: 'Feature',
    properties: { name: '蚌埠市', code: '340300' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[117.05, 32.72], [117.42, 32.68], [117.82, 32.85], [118.12, 33.12], [118.05, 33.45], [117.68, 33.62], [117.22, 33.58], [116.92, 33.28], [116.85, 32.92], [117.05, 32.72]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340400': {
    type: 'Feature',
    properties: { name: '淮南市', code: '340400' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[116.58, 32.42], [116.92, 32.38], [117.28, 32.52], [117.42, 32.78], [117.28, 33.02], [116.92, 33.12], [116.55, 33.02], [116.42, 32.72], [116.58, 32.42]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340500': {
    type: 'Feature',
    properties: { name: '马鞍山市', code: '340500' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[118.22, 31.42], [118.48, 31.38], [118.78, 31.52], [118.92, 31.78], [118.82, 32.02], [118.52, 32.15], [118.18, 32.08], [118.02, 31.82], [118.12, 31.55], [118.22, 31.42]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340600': {
    type: 'Feature',
    properties: { name: '淮北市', code: '340600' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[116.42, 33.62], [116.68, 33.58], [117.02, 33.72], [117.18, 33.98], [117.02, 34.22], [116.62, 34.28], [116.32, 34.12], [116.28, 33.85], [116.42, 33.62]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340700': {
    type: 'Feature',
    properties: { name: '铜陵市', code: '340700' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[117.52, 30.72], [117.82, 30.68], [118.12, 30.82], [118.18, 31.08], [118.02, 31.32], [117.68, 31.38], [117.38, 31.28], [117.32, 31.02], [117.52, 30.72]]]
    }
  } as GeoJSON.GeoJsonObject,
  '340800': {
    type: 'Feature',
    properties: { name: '安庆市', code: '340800' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[115.82, 30.12], [116.28, 30.08], [116.78, 30.22], [117.18, 30.52], [117.28, 30.88], [117.08, 31.22], [116.62, 31.35], [116.18, 31.28], [115.78, 30.98], [115.62, 30.58], [115.82, 30.12]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341000': {
    type: 'Feature',
    properties: { name: '黄山市', code: '341000' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[117.78, 29.42], [118.22, 29.38], [118.68, 29.52], [119.02, 29.88], [119.08, 30.28], [118.82, 30.58], [118.38, 30.72], [117.92, 30.62], [117.58, 30.32], [117.48, 29.88], [117.78, 29.42]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341100': {
    type: 'Feature',
    properties: { name: '滁州市', code: '341100' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[117.82, 31.88], [118.28, 31.82], [118.78, 32.02], [119.18, 32.38], [119.22, 32.82], [118.92, 33.18], [118.42, 33.28], [117.92, 33.12], [117.58, 32.78], [117.48, 32.38], [117.68, 32.08], [117.82, 31.88]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341200': {
    type: 'Feature',
    properties: { name: '阜阳市', code: '341200' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[114.82, 32.52], [115.28, 32.48], [115.78, 32.62], [116.18, 32.88], [116.28, 33.28], [116.08, 33.62], [115.58, 33.72], [115.08, 33.58], [114.72, 33.28], [114.62, 32.88], [114.82, 32.52]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341300': {
    type: 'Feature',
    properties: { name: '宿州市', code: '341300' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[116.42, 33.28], [116.88, 33.22], [117.38, 33.38], [117.62, 33.72], [117.52, 34.12], [117.12, 34.35], [116.58, 34.32], [116.18, 34.08], [116.08, 33.68], [116.22, 33.42], [116.42, 33.28]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341500': {
    type: 'Feature',
    properties: { name: '六安市', code: '341500' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[115.72, 31.22], [116.18, 31.18], [116.68, 31.38], [117.02, 31.72], [117.08, 32.18], [116.82, 32.58], [116.38, 32.78], [115.88, 32.72], [115.48, 32.42], [115.38, 31.98], [115.52, 31.58], [115.72, 31.22]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341600': {
    type: 'Feature',
    properties: { name: '亳州市', code: '341600' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[115.32, 33.38], [115.78, 33.32], [116.22, 33.48], [116.42, 33.82], [116.32, 34.22], [115.88, 34.42], [115.38, 34.38], [115.02, 34.12], [114.98, 33.72], [115.12, 33.48], [115.32, 33.38]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341700': {
    type: 'Feature',
    properties: { name: '池州市', code: '341700' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[117.02, 29.98], [117.42, 29.92], [117.88, 30.08], [118.12, 30.38], [118.05, 30.72], [117.72, 30.88], [117.28, 30.82], [116.92, 30.62], [116.78, 30.28], [116.88, 30.08], [117.02, 29.98]]]
    }
  } as GeoJSON.GeoJsonObject,
  '341800': {
    type: 'Feature',
    properties: { name: '宣城市', code: '341800' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[118.02, 30.32], [118.48, 30.28], [118.98, 30.42], [119.35, 30.72], [119.48, 31.12], [119.32, 31.52], [118.92, 31.72], [118.42, 31.68], [118.02, 31.48], [117.82, 31.12], [117.88, 30.72], [118.02, 30.32]]]
    }
  } as GeoJSON.GeoJsonObject,
};

// 合肥市区县边界
const hefeiCountyBoundaries: Record<string, GeoJSON.GeoJsonObject> = {
  '340102': {
    type: 'Feature',
    properties: { name: '瑶海区', code: '340102' },
    geometry: { type: 'Polygon', coordinates: [[[117.28, 31.82], [117.38, 31.80], [117.48, 31.85], [117.45, 31.92], [117.35, 31.95], [117.28, 31.90], [117.28, 31.82]]] }
  } as GeoJSON.GeoJsonObject,
  '340103': {
    type: 'Feature',
    properties: { name: '庐阳区', code: '340103' },
    geometry: { type: 'Polygon', coordinates: [[[117.22, 31.85], [117.30, 31.82], [117.35, 31.88], [117.32, 31.95], [117.25, 31.98], [117.20, 31.92], [117.22, 31.85]]] }
  } as GeoJSON.GeoJsonObject,
  '340104': {
    type: 'Feature',
    properties: { name: '蜀山区', code: '340104' },
    geometry: { type: 'Polygon', coordinates: [[[117.15, 31.80], [117.25, 31.78], [117.32, 31.82], [117.30, 31.90], [117.22, 31.95], [117.15, 31.92], [117.15, 31.80]]] }
  } as GeoJSON.GeoJsonObject,
  '340111': {
    type: 'Feature',
    properties: { name: '包河区', code: '340111' },
    geometry: { type: 'Polygon', coordinates: [[[117.25, 31.72], [117.38, 31.70], [117.45, 31.75], [117.42, 31.82], [117.32, 31.85], [117.25, 31.80], [117.25, 31.72]]] }
  } as GeoJSON.GeoJsonObject,
  '340121': {
    type: 'Feature',
    properties: { name: '长丰县', code: '340121' },
    geometry: { type: 'Polygon', coordinates: [[[117.02, 31.98], [117.28, 31.95], [117.52, 32.05], [117.58, 32.28], [117.42, 32.45], [117.12, 32.42], [116.92, 32.25], [116.98, 32.08], [117.02, 31.98]]] }
  } as GeoJSON.GeoJsonObject,
  '340122': {
    type: 'Feature',
    properties: { name: '肥东县', code: '340122' },
    geometry: { type: 'Polygon', coordinates: [[[117.42, 31.78], [117.68, 31.75], [117.92, 31.88], [118.02, 32.12], [117.88, 32.35], [117.58, 32.42], [117.32, 32.32], [117.28, 32.05], [117.35, 31.88], [117.42, 31.78]]] }
  } as GeoJSON.GeoJsonObject,
  '340123': {
    type: 'Feature',
    properties: { name: '肥西县', code: '340123' },
    geometry: { type: 'Polygon', coordinates: [[[116.98, 31.62], [117.22, 31.58], [117.48, 31.68], [117.52, 31.92], [117.38, 32.12], [117.08, 32.18], [116.78, 32.05], [116.72, 31.78], [116.82, 31.65], [116.98, 31.62]]] }
  } as GeoJSON.GeoJsonObject,
  '340124': {
    type: 'Feature',
    properties: { name: '庐江县', code: '340124' },
    geometry: { type: 'Polygon', coordinates: [[[117.18, 31.18], [117.42, 31.15], [117.68, 31.28], [117.72, 31.52], [117.58, 31.72], [117.32, 31.78], [117.08, 31.68], [116.98, 31.45], [117.05, 31.28], [117.18, 31.18]]] }
  } as GeoJSON.GeoJsonObject,
  '340181': {
    type: 'Feature',
    properties: { name: '巢湖市', code: '340181' },
    geometry: { type: 'Polygon', coordinates: [[[117.42, 31.42], [117.68, 31.38], [117.98, 31.52], [118.08, 31.78], [117.92, 32.02], [117.62, 32.12], [117.32, 32.02], [117.22, 31.75], [117.28, 31.55], [117.42, 31.42]]] }
  } as GeoJSON.GeoJsonObject,
};

// 芜湖市区县边界
const wuhuCountyBoundaries: Record<string, GeoJSON.GeoJsonObject> = {
  '340202': {
    type: 'Feature',
    properties: { name: '镜湖区', code: '340202' },
    geometry: { type: 'Polygon', coordinates: [[[118.35, 31.32], [118.42, 31.30], [118.48, 31.35], [118.45, 31.42], [118.38, 31.45], [118.32, 31.40], [118.35, 31.32]]] }
  } as GeoJSON.GeoJsonObject,
  '340203': {
    type: 'Feature',
    properties: { name: '弋江区', code: '340203' },
    geometry: { type: 'Polygon', coordinates: [[[118.32, 31.25], [118.40, 31.22], [118.48, 31.28], [118.45, 31.35], [118.38, 31.38], [118.30, 31.32], [118.32, 31.25]]] }
  } as GeoJSON.GeoJsonObject,
  '340207': {
    type: 'Feature',
    properties: { name: '鸠江区', code: '340207' },
    geometry: { type: 'Polygon', coordinates: [[[118.42, 31.38], [118.58, 31.35], [118.72, 31.42], [118.68, 31.55], [118.52, 31.62], [118.38, 31.58], [118.35, 31.48], [118.42, 31.38]]] }
  } as GeoJSON.GeoJsonObject,
  '340208': {
    type: 'Feature',
    properties: { name: '三山区', code: '340208' },
    geometry: { type: 'Polygon', coordinates: [[[118.22, 31.18], [118.35, 31.15], [118.45, 31.22], [118.42, 31.32], [118.32, 31.38], [118.22, 31.32], [118.22, 31.18]]] }
  } as GeoJSON.GeoJsonObject,
  '340221': {
    type: 'Feature',
    properties: { name: '芜湖县', code: '340221' },
    geometry: { type: 'Polygon', coordinates: [[[118.52, 31.18], [118.72, 31.15], [118.88, 31.28], [118.82, 31.48], [118.65, 31.55], [118.48, 31.48], [118.45, 31.32], [118.52, 31.18]]] }
  } as GeoJSON.GeoJsonObject,
  '340222': {
    type: 'Feature',
    properties: { name: '繁昌区', code: '340222' },
    geometry: { type: 'Polygon', coordinates: [[[118.08, 31.08], [118.25, 31.05], [118.38, 31.15], [118.35, 31.28], [118.22, 31.35], [118.08, 31.32], [118.02, 31.22], [118.08, 31.08]]] }
  } as GeoJSON.GeoJsonObject,
  '340223': {
    type: 'Feature',
    properties: { name: '南陵县', code: '340223' },
    geometry: { type: 'Polygon', coordinates: [[[118.18, 30.72], [118.42, 30.68], [118.62, 30.78], [118.58, 31.02], [118.42, 31.18], [118.22, 31.22], [118.08, 31.08], [118.12, 30.85], [118.18, 30.72]]] }
  } as GeoJSON.GeoJsonObject,
  '340225': {
    type: 'Feature',
    properties: { name: '无为市', code: '340225' },
    geometry: { type: 'Polygon', coordinates: [[[117.88, 31.02], [118.15, 30.98], [118.42, 31.08], [118.48, 31.28], [118.38, 31.48], [118.15, 31.52], [117.92, 31.42], [117.82, 31.22], [117.85, 31.08], [117.88, 31.02]]] }
  } as GeoJSON.GeoJsonObject,
};

// 所有区县数据
const countyBoundaries: Record<string, Record<string, GeoJSON.GeoJsonObject>> = {
  '340100': hefeiCountyBoundaries,
  '340200': wuhuCountyBoundaries,
};

const countyGrowthData: Record<string, AreaGrowth[]> = {
  '340100': hefeiCounties,
  '340200': wuhuCounties,
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
    click: (e) => {
      // 检查是否点击在空白区域（非要素上）
      if (e.originalEvent.target === e.target.getContainer()) {
        onMapClick();
      }
    },
  });
  return null;
}

// GeoJSON图层组件
function GeoJSONLayer({
  areas,
  boundaries,
  onAreaClick,
  isClickable = true,
}: {
  areas: AreaGrowth[];
  boundaries: Record<string, GeoJSON.GeoJsonObject>;
  onAreaClick?: (area: AreaGrowth) => void;
  isClickable?: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const style = (feature: GeoJSON.Feature | undefined): L.PathOptions => {
    const areaCode = feature?.properties?.code;
    const areaData = areas.find(a => a.code === areaCode);
    
    return {
      fillColor: areaData ? getGrowthColor(areaData.rating) : '#9E9E9E',
      weight: 2,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.75,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const areaCode = feature.properties?.code || '';
    const areaName = feature.properties?.name || '';
    const areaData = areas.find(a => a.code === areaCode);
    
    if (areaData) {
      const tooltipContent = `
        <div class="text-sm">
          <div class="font-semibold text-base mb-1">${areaData.name}</div>
          <div>长势指数：<span class="font-medium">${areaData.index.toFixed(2)}</span></div>
          <div>长势评级：<span class="font-medium" style="color:${getGrowthColor(areaData.rating)}">${areaData.rating === 'excellent' ? '优秀' : areaData.rating === 'good' ? '良好' : areaData.rating === 'medium' ? '中等' : areaData.rating === 'poor' ? '较差' : '差'}</span></div>
          <div>同比变化：<span class="${areaData.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}">${areaData.yoyChange >= 0 ? '+' : ''}${areaData.yoyChange}%</span></div>
          <div>监测面积：<span class="font-medium">${(areaData.area / 10000).toFixed(1)}万亩</span></div>
          ${isClickable ? '<div class="mt-1 text-xs text-blue-500">点击下钻查看详情</div>' : ''}
        </div>
      `;
      
      layer.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        className: 'growth-tooltip',
      });
      
      if (isClickable && onAreaClick) {
        layer.on({
          click: () => onAreaClick(areaData),
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: 3,
              color: '#1A5C9A',
              fillOpacity: 0.85,
            });
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle(style(feature));
          },
        });
      }
    } else {
      layer.bindTooltip(areaName, {
        permanent: false,
        direction: 'top',
      });
    }
  };

  // 创建FeatureCollection
  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: Object.values(boundaries).map(boundary => {
      if (boundary.type === 'Feature') {
        return boundary as GeoJSON.Feature;
      }
      return boundary as GeoJSON.Feature;
    }),
  };

  return (
    <GeoJSON
      key={JSON.stringify(featureCollection)}
      data={featureCollection as GeoJSON.GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

// 区域标签组件
function AreaLabels({ areas, boundaries }: { areas: AreaGrowth[]; boundaries: Record<string, GeoJSON.GeoJsonObject> }) {
  const map = useMap();
  
  useEffect(() => {
    const labels: L.Marker[] = [];
    
    Object.entries(boundaries).forEach(([code, boundary]) => {
      const area = areas.find(a => a.code === code);
      if (!area) return;
      
      // 计算边界中心
      let center: [number, number] = [0, 0];
      const feature = boundary as GeoJSON.Feature;
      if (feature.type === 'Feature' && feature.geometry) {
        const geom = feature.geometry as GeoJSON.Polygon;
        if (geom.coordinates && geom.coordinates[0]) {
          const coords = geom.coordinates[0] as [number, number][];
          const lats = coords.map(c => c[1]);
          const lngs = coords.map(c => c[0]);
          center = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
        }
      }
      
      const icon = L.divIcon({
        className: 'area-label',
        html: `<div style="
          background: rgba(255,255,255,0.92);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          color: ${getGrowthColor(area.rating)};
          border: 1px solid ${getGrowthColor(area.rating)};
        ">${area.name.replace('市', '').replace('区', '').replace('县', '')}</div>`,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });
      
      const marker = L.marker([center[0], center[1]], { icon, interactive: false }).addTo(map);
      labels.push(marker);
    });
    
    return () => {
      labels.forEach(label => map.removeLayer(label));
    };
  }, [map, areas, boundaries]);
  
  return null;
}

// 面包屑导航
interface BreadcrumbProps {
  items: { name: string; code: string }[];
  onItemClick: (index: number) => void;
}

function Breadcrumb({ items, onItemClick }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm bg-white/95 px-4 py-2 rounded-lg shadow-sm">
      {items.map((item, index) => (
        <div key={item.code} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => onItemClick(index)}
            className={`hover:text-[#1A5C9A] transition-colors ${
              index === items.length - 1 ? 'text-[#1A5C9A] font-medium' : 'text-gray-600'
            }`}
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
  const [currentCounty, setCurrentCounty] = useState<AreaGrowth | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.8, 117.2]);
  const [mapZoom, setMapZoom] = useState(6);
  
  // 获取城市中心坐标
  const getCityCenter = useCallback((code: string): [number, number] => {
    const centers: Record<string, [number, number]> = {
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
    return centers[code] || [31.8, 117.2];
  }, []);
  
  // 获取当前层级的数据
  const getCurrentData = useCallback(() => {
    switch (currentLevel) {
      case 'province':
        return {
          areas: cityGrowthData,
          boundaries: anhuiCityBoundaries,
        };
      case 'city':
        if (currentCity) {
          const countyData = countyGrowthData[currentCity.code];
          const countyBound = countyBoundaries[currentCity.code];
          if (countyData && countyBound) {
            return {
              areas: countyData,
              boundaries: countyBound,
            };
          }
        }
        return { areas: [], boundaries: {} };
      case 'county':
        return { areas: [], boundaries: {} };
      default:
        return { areas: [], boundaries: {} };
    }
  }, [currentLevel, currentCity]);
  
  // 处理区域点击
  const handleAreaClick = useCallback((area: AreaGrowth) => {
    onAreaSelect?.(area);
    
    if (area.level === 'city' && currentLevel === 'province') {
      // 从省级下钻到市级
      setCurrentCity(area);
      setCurrentLevel('city');
      
      // 更新地图中心和缩放
      const cityCenter = getCityCenter(area.code);
      setMapCenter(cityCenter);
      setMapZoom(8);
    } else if (area.level === 'county' && currentLevel === 'city') {
      // 从市级下钻到县级
      setCurrentCounty(area);
      setCurrentLevel('county');
    }
  }, [currentLevel, onAreaSelect, getCityCenter]);
  
  // 返回上一级
  const handleGoBack = useCallback((index: number) => {
    if (index === 0) {
      // 返回省级
      setCurrentLevel('province');
      setCurrentCity(null);
      setCurrentCounty(null);
      setMapCenter([31.8, 117.2]);
      setMapZoom(6);
    } else if (index === 1 && currentCity) {
      // 返回市级
      setCurrentLevel('city');
      setCurrentCounty(null);
      setMapCenter(getCityCenter(currentCity.code));
      setMapZoom(8);
    }
  }, [currentCity, getCityCenter]);
  
  // 构建面包屑数据
  const breadcrumbItems = [
    { name: '安徽省', code: '340000' },
  ];
  if (currentCity) {
    breadcrumbItems.push({ name: currentCity.name, code: currentCity.code });
  }
  if (currentCounty && currentLevel === 'county') {
    breadcrumbItems.push({ name: currentCounty.name, code: currentCounty.code });
  }
  
  const { areas, boundaries } = getCurrentData();
  const showGeoJSON = currentLevel !== 'county' && Object.keys(boundaries).length > 0;
  
  return (
    <div className="relative" style={{ height }}>
      {/* 面包屑导航 */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Breadcrumb items={breadcrumbItems} onItemClick={handleGoBack} />
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
        
        {/* 卫星影像底图 */}
        <TileLayer
          url="https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
          minZoom={3}
        />
        
        {/* 地名标注 */}
        <TileLayer
          url="https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
          minZoom={3}
        />
        
        {/* GeoJSON图层 */}
        {showGeoJSON && (
          <>
            <GeoJSONLayer
              areas={areas}
              boundaries={boundaries}
              onAreaClick={handleAreaClick}
            />
            <AreaLabels areas={areas} boundaries={boundaries} />
          </>
        )}
        
        {/* 县级详情 */}
        {currentLevel === 'county' && currentCounty && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-[1000]">
            <h3 className="text-lg font-semibold mb-4">{currentCounty.name} - 长势详情</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">长势指数：</span>
                <span className="font-medium">{currentCounty.index.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">长势评级：</span>
                <span style={{ color: getGrowthColor(currentCounty.rating) }} className="font-medium">
                  {currentCounty.rating === 'excellent' ? '优秀' : currentCounty.rating === 'good' ? '良好' : currentCounty.rating === 'medium' ? '中等' : currentCounty.rating === 'poor' ? '较差' : '差'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">同比变化：</span>
                <span className={currentCounty.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {currentCounty.yoyChange >= 0 ? '+' : ''}{currentCounty.yoyChange}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">监测面积：</span>
                <span className="font-medium">{(currentCounty.area / 10000).toFixed(1)}万亩</span>
              </div>
            </div>
            <button
              onClick={() => handleGoBack(1)}
              className="mt-4 w-full py-2 bg-[#1A5C9A] text-white rounded-md hover:bg-[#1A5C9A]/90 transition-colors"
            >
              返回{currentCity?.name}
            </button>
          </div>
        )}
      </MapContainer>
      
      {/* 操作提示 */}
      <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-2 rounded-lg shadow-sm text-xs text-gray-500">
        💡 点击区域可下钻查看详细长势数据
      </div>
    </div>
  );
}

export default DrillDownGrowthMap;
