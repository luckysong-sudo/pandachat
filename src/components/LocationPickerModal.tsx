import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Compass,
  Sparkles
} from 'lucide-react';

export interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendLocation: (loc: LocationData) => void;
}

const PRESET_LOCATIONS: LocationData[] = [
  {
    name: '成都大熊猫繁育研究基地 🐼',
    address: '四川省成都市成华区熊猫大道1375号',
    latitude: 30.733,
    longitude: 104.148,
  },
  {
    name: '功夫熊猫竹林露营地 🏕️',
    address: '北京市朝阳区生态风景区竹林路88号',
    latitude: 39.932,
    longitude: 116.452,
  },
  {
    name: '熊猫竹笋咖啡轻食馆 ☕',
    address: '上海市静安区南京西路1268号',
    latitude: 31.229,
    longitude: 121.455,
  },
  {
    name: '西湖风景区断桥残雪 🌸',
    address: '浙江省杭州市西湖区北山街',
    latitude: 30.258,
    longitude: 120.142,
  },
  {
    name: '广州塔（小蛮腰）🎡',
    address: '广东省广州市海珠区阅江西路222号',
    latitude: 23.106,
    longitude: 113.324,
  },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSendLocation,
}) => {
  const [selectedLoc, setSelectedLoc] = useState<LocationData>(PRESET_LOCATIONS[0]);
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locateStatus, setLocateStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Use Browser Geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateStatus('您的浏览器暂不支持 GPS 定位，已使用默认高精地图坐标。');
      return;
    }

    setIsLocating(true);
    setLocateStatus('GPS 卫星信号定位中...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const gpsLoc: LocationData = {
          name: '我的当前实地位置 📍',
          address: `经度 ${lng}°, 纬度 ${lat}° (GPS 精确匹配)`,
          latitude: lat,
          longitude: lng,
        };
        setSelectedLoc(gpsLoc);
        setIsLocating(false);
        setLocateStatus('🎉 GPS 定位成功！已精准匹配当前坐标');
      },
      (err) => {
        setIsLocating(false);
        setLocateStatus(`定位提示: ${err.message || '获取GPS权限失败，可手选或输入自定义地点'}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSend = () => {
    let finalLoc = selectedLoc;
    if (customName.trim()) {
      finalLoc = {
        name: customName.trim(),
        address: customAddress.trim() || '自定义定位点',
        latitude: selectedLoc.latitude,
        longitude: selectedLoc.longitude,
      };
    }
    onSendLocation(finalLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden space-y-3 p-5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">发送我的当前位置</h3>
              <p className="text-[10px] text-slate-400 font-mono">真实 GPS + 高精地图坐标卡片</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* GPS Auto Locate Button */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? '正在获取实时 GPS 经纬度...' : '🎯 点击自动获取我当前真实 GPS 定位'}</span>
        </button>

        {locateStatus && (
          <div className="p-2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-center font-mono">
            {locateStatus}
          </div>
        )}

        {/* Visual Simulated Map Card */}
        <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 bg-emerald-950/90 flex items-center justify-center p-3 text-white shadow-inner">
          {/* Simulated Map Grid Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
          
          <div className="relative z-10 text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/90 border-2 border-white shadow-lg mx-auto flex items-center justify-center text-xl animate-bounce">
              📍
            </div>
            <div className="font-bold text-xs text-white truncate max-w-[260px] mx-auto drop-shadow-sm">
              {customName.trim() || selectedLoc.name}
            </div>
            <div className="text-[10px] text-emerald-200 font-mono truncate max-w-[260px] mx-auto">
              {customAddress.trim() || selectedLoc.address}
            </div>
            <div className="text-[9px] text-emerald-400 font-mono">
              ({selectedLoc.latitude}°, {selectedLoc.longitude}°)
            </div>
          </div>
        </div>

        {/* Custom Location Inputs */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-700 block">自定义地点名称 / 搜索：</label>
          <input
            type="text"
            placeholder="例如: 熊猫竹子小屋 (选填)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
          />
          <input
            type="text"
            placeholder="详细地址 (选填)"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        {/* Presets List */}
        <div className="space-y-1.5 flex-1 overflow-y-auto min-h-[120px]">
          <div className="text-[11px] font-bold text-slate-500">热门 / 推荐地点一键发送：</div>
          <div className="space-y-1.5">
            {PRESET_LOCATIONS.map((loc) => {
              const isSelected = selectedLoc.name === loc.name && !customName.trim();
              return (
                <div
                  key={loc.name}
                  onClick={() => {
                    setSelectedLoc(loc);
                    setCustomName('');
                    setCustomAddress('');
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 font-bold'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-slate-800 text-xs font-bold truncate">{loc.name}</div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">{loc.address}</div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSend}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
        >
          <MapPin className="w-4 h-4" />
          <span>确认发送定位消息卡片</span>
        </button>
      </div>
    </div>
  );
};
