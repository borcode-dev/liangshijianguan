'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SpotDetailMapProps {
  coordinates: [number, number];
  area?: number;
  spotNo?: string;
  height?: string;
  showBoundary?: boolean;
}

// 天地图卫星影像服务 (免费公开服务)
const TIANDITU_SATELLITE = 'https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=5d27dc754fa1a8a2d35c033b7a54d8cf';

// 天地图影像注记
const TIANDITU_ANNOTATION = 'https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=5d27dc754fa1a8a2d35c033b7a54d8cf';

// 高德卫星影像 (备选)
const AMAP_SATELLITE = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

// 高德影像注记
const AMAP_ANNOTATION = 'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}';

// OpenStreetMap
const OSM_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// GeoQ 地理所底图
const GEOQ_LAYER = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}';

export function SpotDetailMap({ 
  coordinates, 
  area = 10,
  spotNo,
  height = '300px',
  showBoundary = true 
}: SpotDetailMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'satellite' | 'vector'>('satellite');
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const annotationLayerRef = useRef<L.TileLayer | null>(null);
  const vectorLayerRef = useRef<L.TileLayer | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 初始化地图
    const map = L.map(mapContainerRef.current, {
      center: coordinates,
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // 创建卫星影像图层
    satelliteLayerRef.current = L.tileLayer(AMAP_SATELLITE, {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
    });

    // 创建影像注记图层
    annotationLayerRef.current = L.tileLayer(AMAP_ANNOTATION, {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
    });

    // 创建矢量图层 (GeoQ)
    vectorLayerRef.current = L.tileLayer(GEOQ_LAYER, {
      maxZoom: 18,
    });

    // 默认显示卫星影像
    satelliteLayerRef.current.addTo(map);
    annotationLayerRef.current.addTo(map);

    // 创建模拟地块边界 (以坐标为中心，根据面积生成一个不规则多边形)
    if (showBoundary) {
      const centerLat = coordinates[0];
      const centerLng = coordinates[1];
      
      // 根据面积计算大致的半径 (简单估算)
      const radiusKm = Math.sqrt(area * 666.67) / 1000 / 2; // 1亩≈666.67平方米
      
      // 生成不规则多边形坐标
      const numPoints = 8;
      const points: [number, number][] = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const randomRadius = radiusKm * (0.7 + Math.random() * 0.6); // 添加随机性
        const lat = centerLat + randomRadius * Math.cos(angle) * 0.009;
        const lng = centerLng + randomRadius * Math.sin(angle) * 0.011;
        points.push([lat, lng]);
      }

      polygonRef.current = L.polygon(points, {
        color: '#F56C6C',
        weight: 3,
        fillColor: '#F56C6C',
        fillOpacity: 0.3,
      }).addTo(map);

      // 添加图斑编号标注
      if (spotNo) {
        L.marker(coordinates, {
          icon: L.divIcon({
            className: 'spot-label',
            html: `<div style="background: #F56C6C; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap;">${spotNo}</div>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10],
          }),
        }).addTo(map);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, area, spotNo, showBoundary]);

  // 切换地图类型
  useEffect(() => {
    if (!mapRef.current) return;

    if (mapType === 'satellite') {
      if (vectorLayerRef.current && mapRef.current.hasLayer(vectorLayerRef.current)) {
        mapRef.current.removeLayer(vectorLayerRef.current);
      }
      satelliteLayerRef.current?.addTo(mapRef.current);
      annotationLayerRef.current?.addTo(mapRef.current);
    } else {
      if (satelliteLayerRef.current && mapRef.current.hasLayer(satelliteLayerRef.current)) {
        mapRef.current.removeLayer(satelliteLayerRef.current);
      }
      if (annotationLayerRef.current && mapRef.current.hasLayer(annotationLayerRef.current)) {
        mapRef.current.removeLayer(annotationLayerRef.current);
      }
      vectorLayerRef.current?.addTo(mapRef.current);
    }
  }, [mapType]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%', borderRadius: '8px' }}
      />
      {/* 地图类型切换按钮 */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-1 bg-white/90 rounded-md p-1 shadow">
        <button
          onClick={() => setMapType('satellite')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            mapType === 'satellite' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          卫星影像
        </button>
        <button
          onClick={() => setMapType('vector')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            mapType === 'vector' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          矢量地图
        </button>
      </div>
      {/* 图例 */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 rounded-md p-2 shadow text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-red-500/30 border-2 border-red-500 rounded-sm"></div>
          <span>问题图斑</span>
        </div>
      </div>
    </div>
  );
}

// 卫星影像对比组件
interface SatelliteCompareProps {
  beforeCoordinates: [number, number];
  afterCoordinates: [number, number];
  beforeDate: string;
  afterDate: string;
  height?: string;
}

export function SatelliteCompare({
  beforeCoordinates,
  afterCoordinates,
  beforeDate,
  afterDate,
  height = '300px'
}: SatelliteCompareProps) {
  const beforeMapRef = useRef<L.Map | null>(null);
  const afterMapRef = useRef<L.Map | null>(null);
  const beforeContainerRef = useRef<HTMLDivElement>(null);
  const afterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化变化前影像
    if (beforeContainerRef.current && !beforeMapRef.current) {
      const map = L.map(beforeContainerRef.current, {
        center: beforeCoordinates,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(AMAP_SATELLITE, {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
      }).addTo(map);

      L.tileLayer(AMAP_ANNOTATION, {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
      }).addTo(map);

      beforeMapRef.current = map;
    }

    // 初始化变化后影像
    if (afterContainerRef.current && !afterMapRef.current) {
      const map = L.map(afterContainerRef.current, {
        center: afterCoordinates,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(AMAP_SATELLITE, {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
      }).addTo(map);

      L.tileLayer(AMAP_ANNOTATION, {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
      }).addTo(map);

      afterMapRef.current = map;
    }

    return () => {
      beforeMapRef.current?.remove();
      beforeMapRef.current = null;
      afterMapRef.current?.remove();
      afterMapRef.current = null;
    };
  }, [beforeCoordinates, afterCoordinates]);

  // 同步两个地图的缩放和平移
  useEffect(() => {
    if (!beforeMapRef.current || !afterMapRef.current) return;

    beforeMapRef.current.on('zoomend moveend', () => {
      if (beforeMapRef.current && afterMapRef.current) {
        afterMapRef.current.setView(
          beforeMapRef.current.getCenter(),
          beforeMapRef.current.getZoom()
        );
      }
    });

    afterMapRef.current.on('zoomend moveend', () => {
      if (beforeMapRef.current && afterMapRef.current) {
        beforeMapRef.current.setView(
          afterMapRef.current.getCenter(),
          afterMapRef.current.getZoom()
        );
      }
    });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <div 
          ref={beforeContainerRef} 
          style={{ height, width: '100%', borderRadius: '8px' }}
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          变化前 ({beforeDate})
        </div>
      </div>
      <div className="relative">
        <div 
          ref={afterContainerRef} 
          style={{ height, width: '100%', borderRadius: '8px' }}
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          变化后 ({afterDate})
        </div>
      </div>
    </div>
  );
}
