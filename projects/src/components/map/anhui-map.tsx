'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 安徽省各市中心坐标
const cityCenters: Record<string, [number, number]> = {
  '合肥市': [31.8206, 117.2272],
  '芜湖市': [31.3526, 118.3762],
  '蚌埠市': [32.9397, 117.3889],
  '淮南市': [32.6269, 116.9969],
  '马鞍山市': [31.6709, 118.5069],
  '淮北市': [33.9717, 116.7947],
  '铜陵市': [30.9299, 117.8121],
  '安庆市': [30.5433, 117.0636],
  '黄山市': [29.7151, 118.3376],
  '滁州市': [32.3173, 118.3162],
  '阜阳市': [32.9897, 115.8147],
  '宿州市': [33.6461, 116.9641],
  '六安市': [31.7529, 116.5078],
  '亳州市': [33.8712, 115.7783],
  '池州市': [30.6666, 117.4915],
  '宣城市': [30.9456, 118.7589],
};

// 安徽省简化边界（用于绘制省级轮廓）
const anhuiBoundary: [number, number][] = [
  [34.6, 116.5], [34.5, 117.8], [33.8, 119.1], [32.5, 119.5],
  [31.0, 119.8], [29.5, 118.5], [29.3, 117.2], [30.0, 116.1],
  [31.5, 115.5], [33.0, 115.0], [34.0, 115.2], [34.6, 116.5]
];

export interface SpotData {
  id: string;
  type: string;
  problemType?: string;
  area: number;
  risk: 'high' | 'medium' | 'low';
  riskLevel?: string;
  status: string;
  location: string;
  coordinates: [number, number];
  deadline?: string;
}

interface AnhuiMapProps {
  spots?: SpotData[];
  onSpotClick?: (spot: SpotData) => void;
  onCityClick?: (city: string) => void;
  showHeatmap?: boolean;
  height?: string;
}

export function AnhuiMap({ 
  spots = [], 
  onSpotClick, 
  onCityClick,
  showHeatmap = false,
  height = '500px' 
}: AnhuiMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 初始化地图
    const map = L.map(mapContainerRef.current, {
      center: [31.8206, 117.2272], // 安徽省中心
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // 添加底图图层 - 使用 OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // 绘制安徽省边界
    L.polygon(anhuiBoundary, {
      color: '#1A5C9A',
      weight: 2,
      fillColor: '#1A5C9A',
      fillOpacity: 0.1,
    }).addTo(map);

    // 添加各市标记点
    Object.entries(cityCenters).forEach(([city, coords]) => {
      const marker = L.circleMarker(coords, {
        radius: 8,
        fillColor: '#1A5C9A',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindTooltip(city, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });

      marker.on('click', () => {
        if (onCityClick) {
          onCityClick(city);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 添加图斑标记
  useEffect(() => {
    if (!mapRef.current || spots.length === 0) return;

    // 清除之前的图斑标记
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker && (layer as any).options.className === 'spot-marker') {
        mapRef.current?.removeLayer(layer);
      }
    });

    // 添加新的图斑标记
    spots.forEach((spot) => {
      const color = 
        spot.risk === 'high' ? '#F56C6C' : 
        spot.risk === 'medium' ? '#E6A23C' : '#67C23A';

      const statusColor = 
        spot.status === '待核查' ? '#E6A23C' :
        spot.status === '整改中' ? '#FF9800' :
        spot.status === '已结案' ? '#67C23A' : '#409EFF';

      const marker = L.circleMarker(spot.coordinates, {
        radius: 10,
        fillColor: statusColor,
        color: color,
        weight: 3,
        fillOpacity: 0.8,
        className: 'spot-marker',
      } as any).addTo(mapRef.current!);

      marker.bindTooltip(`
        <div style="font-size: 12px;">
          <strong>${spot.id}</strong><br/>
          类型: ${spot.type}<br/>
          面积: ${spot.area}亩<br/>
          风险: ${spot.risk === 'high' ? '高' : spot.risk === 'medium' ? '中' : '低'}<br/>
          状态: ${spot.status}
        </div>
      `);

      marker.on('click', () => {
        if (onSpotClick) {
          onSpotClick(spot);
        }
      });
    });
  }, [spots, onSpotClick]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height, width: '100%', borderRadius: '8px' }}
    />
  );
}

// 获取状态颜色
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    '待下发': '#909399',
    '待核查': '#E6A23C',
    '核查中': '#409EFF',
    '待上报': '#409EFF',
    '待审核': '#9C27B0',
    '整改中': '#E6A23C',
    '待验收': '#FF9800',
    '已结案': '#67C23A',
    '超期': '#F56C6C',
    '复查中': '#00BCD4',
  };
  return colors[status] || '#909399';
}

// 获取风险等级颜色
export function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    '高': '#F56C6C',
    '中': '#E6A23C',
    '低': '#67C23A',
  };
  return colors[risk] || '#909399';
}

export default AnhuiMap;
