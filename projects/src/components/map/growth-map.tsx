'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 安徽省各市长势数据
interface CityGrowth {
  name: string;
  index: number;
  rating: 'good' | 'medium' | 'poor';
  yoyChange: number;
  area: number;
}

const cityGrowthData: CityGrowth[] = [
  { name: '合肥市', index: 0.85, rating: 'good', yoyChange: 6.2, area: 285000 },
  { name: '芜湖市', index: 0.82, rating: 'good', yoyChange: 5.8, area: 198000 },
  { name: '蚌埠市', index: 0.78, rating: 'medium', yoyChange: 3.2, area: 245000 },
  { name: '淮南市', index: 0.76, rating: 'medium', yoyChange: 2.8, area: 187000 },
  { name: '马鞍山市', index: 0.84, rating: 'good', yoyChange: 5.5, area: 142000 },
  { name: '淮北市', index: 0.72, rating: 'medium', yoyChange: 1.5, area: 98000 },
  { name: '铜陵市', index: 0.79, rating: 'medium', yoyChange: 3.5, area: 85000 },
  { name: '安庆市', index: 0.75, rating: 'medium', yoyChange: 2.2, area: 356000 },
  { name: '黄山市', index: 0.68, rating: 'poor', yoyChange: -1.2, area: 98000 },
  { name: '滁州市', index: 0.83, rating: 'good', yoyChange: 5.2, area: 298000 },
  { name: '阜阳市', index: 0.65, rating: 'poor', yoyChange: -2.5, area: 385000 },
  { name: '宿州市', index: 0.70, rating: 'poor', yoyChange: -0.8, area: 278000 },
  { name: '六安市', index: 0.77, rating: 'medium', yoyChange: 2.5, area: 312000 },
  { name: '亳州市', index: 0.73, rating: 'medium', yoyChange: 1.8, area: 256000 },
  { name: '池州市', index: 0.81, rating: 'good', yoyChange: 4.8, area: 142000 },
  { name: '宣城市', index: 0.80, rating: 'good', yoyChange: 4.2, area: 254000 },
];

// 根据长势评级获取颜色
function getGrowthColor(rating: 'good' | 'medium' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '#67C23A'; // 绿色
    case 'medium':
      return '#E6A23C'; // 黄色
    case 'poor':
      return '#F56C6C'; // 红色
    default:
      return '#909399';
  }
}

// 安徽省各市中心坐标（用于标注）
const cityCenters: Record<string, [number, number]> = {
  '合肥市': [31.82, 117.27],
  '芜湖市': [31.35, 118.38],
  '蚌埠市': [32.92, 117.36],
  '淮南市': [32.63, 116.98],
  '马鞍山市': [31.70, 118.50],
  '淮北市': [33.97, 116.80],
  '铜陵市': [30.93, 117.81],
  '安庆市': [30.53, 117.03],
  '黄山市': [29.72, 118.33],
  '滁州市': [32.30, 118.32],
  '阜阳市': [32.89, 115.81],
  '宿州市': [33.64, 116.98],
  '六安市': [31.73, 116.50],
  '亳州市': [33.87, 115.78],
  '池州市': [30.67, 117.49],
  '宣城市': [30.93, 118.76],
};

// 安徽省简化GeoJSON（用于展示各市边界）
const anhuiGeoJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: '合肥市' }, geometry: { type: 'Polygon', coordinates: [[[117.0, 31.5], [117.5, 31.5], [117.5, 32.1], [117.0, 32.1], [117.0, 31.5]]] } },
    { type: 'Feature', properties: { name: '芜湖市' }, geometry: { type: 'Polygon', coordinates: [[[118.0, 31.1], [118.6, 31.1], [118.6, 31.6], [118.0, 31.6], [118.0, 31.1]]] } },
    { type: 'Feature', properties: { name: '蚌埠市' }, geometry: { type: 'Polygon', coordinates: [[[116.8, 32.6], [117.6, 32.6], [117.6, 33.2], [116.8, 33.2], [116.8, 32.6]]] } },
    { type: 'Feature', properties: { name: '淮南市' }, geometry: { type: 'Polygon', coordinates: [[[116.5, 32.4], [117.2, 32.4], [117.2, 32.9], [116.5, 32.9], [116.5, 32.4]]] } },
    { type: 'Feature', properties: { name: '马鞍山市' }, geometry: { type: 'Polygon', coordinates: [[[118.2, 31.4], [118.7, 31.4], [118.7, 31.9], [118.2, 31.9], [118.2, 31.4]]] } },
    { type: 'Feature', properties: { name: '淮北市' }, geometry: { type: 'Polygon', coordinates: [[[116.4, 33.7], [117.1, 33.7], [117.1, 34.2], [116.4, 34.2], [116.4, 33.7]]] } },
    { type: 'Feature', properties: { name: '铜陵市' }, geometry: { type: 'Polygon', coordinates: [[[117.5, 30.6], [118.0, 30.6], [118.0, 31.2], [117.5, 31.2], [117.5, 30.6]]] } },
    { type: 'Feature', properties: { name: '安庆市' }, geometry: { type: 'Polygon', coordinates: [[[115.8, 30.1], [117.2, 30.1], [117.2, 31.0], [115.8, 31.0], [115.8, 30.1]]] } },
    { type: 'Feature', properties: { name: '黄山市' }, geometry: { type: 'Polygon', coordinates: [[[117.8, 29.4], [118.6, 29.4], [118.6, 30.0], [117.8, 30.0], [117.8, 29.4]]] } },
    { type: 'Feature', properties: { name: '滁州市' }, geometry: { type: 'Polygon', coordinates: [[[117.8, 31.8], [118.8, 31.8], [118.8, 32.8], [117.8, 32.8], [117.8, 31.8]]] } },
    { type: 'Feature', properties: { name: '阜阳市' }, geometry: { type: 'Polygon', coordinates: [[[114.8, 32.5], [116.2, 32.5], [116.2, 33.3], [114.8, 33.3], [114.8, 32.5]]] } },
    { type: 'Feature', properties: { name: '宿州市' }, geometry: { type: 'Polygon', coordinates: [[[116.4, 33.2], [117.5, 33.2], [117.5, 34.0], [116.4, 34.0], [116.4, 33.2]]] } },
    { type: 'Feature', properties: { name: '六安市' }, geometry: { type: 'Polygon', coordinates: [[[115.7, 31.2], [117.0, 31.2], [117.0, 32.3], [115.7, 32.3], [115.7, 31.2]]] } },
    { type: 'Feature', properties: { name: '亳州市' }, geometry: { type: 'Polygon', coordinates: [[[115.3, 33.3], [116.3, 33.3], [116.3, 34.2], [115.3, 34.2], [115.3, 33.3]]] } },
    { type: 'Feature', properties: { name: '池州市' }, geometry: { type: 'Polygon', coordinates: [[[117.0, 30.0], [117.9, 30.0], [117.9, 30.7], [117.0, 30.7], [117.0, 30.0]]] } },
    { type: 'Feature', properties: { name: '宣城市' }, geometry: { type: 'Polygon', coordinates: [[[118.0, 30.3], [119.2, 30.3], [119.2, 31.2], [118.0, 31.2], [118.0, 30.3]]] } },
  ],
};

function GeoJSONLayer({ onCityClick }: { onCityClick?: (city: CityGrowth) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const style = (feature: GeoJSON.Feature | undefined): L.PathOptions => {
    const cityName = feature?.properties?.name;
    const cityData = cityGrowthData.find(c => c.name === cityName);
    
    return {
      fillColor: cityData ? getGrowthColor(cityData.rating) : '#909399',
      weight: 1.5,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const cityName = feature.properties?.name || '';
    const cityData = cityGrowthData.find(c => c.name === cityName);
    
    if (cityData) {
      const tooltipContent = `
        <div class="text-sm">
          <div class="font-semibold text-base mb-1">${cityData.name}</div>
          <div>长势指数：<span class="font-medium">${cityData.index.toFixed(2)}</span></div>
          <div>同比变化：<span class="${cityData.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}">${cityData.yoyChange >= 0 ? '+' : ''}${cityData.yoyChange}%</span></div>
          <div>监测面积：<span class="font-medium">${(cityData.area / 10000).toFixed(1)}万亩</span></div>
          <div class="mt-1 text-xs text-gray-500">点击查看详情</div>
        </div>
      `;
      
      layer.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        className: 'growth-tooltip',
      });
      
      layer.on({
        click: () => onCityClick?.(cityData),
      });
    }
  };

  return (
    <GeoJSON
      data={anhuiGeoJSON as GeoJSON.GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

function CityLabels() {
  const map = useMap();
  
  useEffect(() => {
    const labels: L.Marker[] = [];
    
    cityGrowthData.forEach(city => {
      const center = cityCenters[city.name];
      if (center) {
        const icon = L.divIcon({
          className: 'city-label',
          html: `<div style="
            background: rgba(255,255,255,0.9);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            color: ${city.rating === 'good' ? '#67C23A' : city.rating === 'medium' ? '#E6A23C' : '#F56C6C'};
          ">${city.name.replace('市', '')}</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        
        const marker = L.marker([center[0], center[1]], { icon }).addTo(map);
        labels.push(marker);
      }
    });
    
    return () => {
      labels.forEach(label => map.removeLayer(label));
    };
  }, [map]);
  
  return null;
}

interface GrowthMapProps {
  onCityClick?: (city: CityGrowth) => void;
  height?: string;
}

export function GrowthMap({ onCityClick, height = '400px' }: GrowthMapProps) {
  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={[31.8, 117.2]}
        zoom={6}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
        />
        <GeoJSONLayer onCityClick={onCityClick} />
        <CityLabels />
      </MapContainer>
      
      {/* 图例 */}
      <div className="mt-3 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#67C23A' }} />
          <span className="text-muted-foreground">良好 (≥0.8)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#E6A23C' }} />
          <span className="text-muted-foreground">中等 (0.7-0.8)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#F56C6C' }} />
          <span className="text-muted-foreground">偏差 (&lt;0.7)</span>
        </div>
      </div>
    </div>
  );
}

export { cityGrowthData };
export type { CityGrowth };
