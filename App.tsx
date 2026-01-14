import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Minus,
  RotateCcw, 
  User, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  PenTool, 
  Layout, 
  MessageCircleQuestion,
  HelpCircle,
  MapPin,
  Car,
  Home,
  Settings2,
  Wrench,
  Printer,
  FileText,
  ArrowLeft,
  Map,
  Camera,
  X,
  AlertCircle
} from 'lucide-react';
import { RoomData, ProjectSettings, ROOM_TYPES, USAGE_LABELS, RoomType, UsageType, InstallType } from './types';
import { 
  ROOM_ICONS, 
  USAGE_ICONS, 
  HOUSE_TYPES, 
  PARKING_TYPES, 
  MAKERS, 
  KW_OPTIONS,
  FLOOR_OPTIONS,
  OUTDOOR_LOCATIONS,
  HOLE_STATUS,
  WALL_MATERIALS,
  OUTLET_TYPES,
  PIPE_LENGTHS,
  COVER_TYPES,
  COVER_COLORS,
  REMOVE_OPTS,
  RECYCLE_OPTS
} from './constants';
import { LayoutModal } from './components/LayoutModal';

const App: React.FC = () => {
  // Global Settings
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    staffId: '4191',
    customerName: '',
    houseType: '戸建て（持ち家）',
    address: '',
    parking: '有（敷地内）',
    mapAttached: false
  });
  
  // App State
  const [rooms, setRooms] = useState<RoomData[]>([
    { 
      id: '1', name: 'お部屋 1', type: 'LDK', size: 10, usage: 'Unselected', notes: '', layoutItems: [],
      installType: 'Replacement',
      maker: '', kw: '', floor: '', outdoorLoc: '', hole: '', wallMaterial: '', outlet: '', pipe: '', cover: '', coverColor: '', remove: '', recycle: ''
    }
  ]);
  const [activeRoomId, setActiveRoomId] = useState<string>('1');
  const [showProTips, setShowProTips] = useState<boolean>(true);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isSummaryMode, setIsSummaryMode] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Derived State
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const activeRoomIndex = rooms.findIndex(r => r.id === activeRoomId);

  // Handlers
  const addRoom = () => {
    const newId = (Math.max(...rooms.map(r => parseInt(r.id))) + 1).toString();
    const newRoom: RoomData = {
      id: newId,
      name: `お部屋 ${rooms.length + 1}`,
      type: 'Bedroom',
      size: 6,
      usage: 'Unselected',
      notes: '',
      layoutItems: [],
      installType: 'Replacement', // Default
      maker: '', kw: '', floor: '', outdoorLoc: '', hole: '', wallMaterial: '', outlet: '', pipe: '', cover: '', coverColor: '', remove: '', recycle: ''
    };
    setRooms([...rooms, newRoom]);
    setActiveRoomId(newId);
  };

  const removeRoom = (id: string) => {
    if (rooms.length <= 1) return;
    const newRooms = rooms.filter(r => r.id !== id);
    setRooms(newRooms);
    if (activeRoomId === id) {
      // If closing the active room, switch to the last available room or the first one
      const prevRoom = newRooms[newRooms.length - 1];
      setActiveRoomId(prevRoom ? prevRoom.id : newRooms[0].id);
    }
  };

  const updateRoom = (id: string, updates: Partial<RoomData>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleReset = () => {
    if (window.confirm('入力内容をすべてリセットしますか？')) {
      setRooms([{ 
        id: '1', name: 'お部屋 1', type: 'LDK', size: 10, usage: 'Unselected', notes: '', layoutItems: [],
        installType: 'Replacement',
        maker: '', kw: '', floor: '', outdoorLoc: '', hole: '', wallMaterial: '', outlet: '', pipe: '', cover: '', coverColor: '', remove: '', recycle: ''
      }]);
      setActiveRoomId('1');
      setProjectSettings({ 
        staffId: '4191',
        customerName: '',
        houseType: '戸建て（持ち家）',
        address: '', 
        parking: '有（敷地内）',
        mapAttached: false
      });
    }
  };

  const handleStaffIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setProjectSettings({ ...projectSettings, staffId: val });
  };

  const handlePrint = () => {
    window.print();
  };

  // UI Components helpers
  const getProgressColor = (room: RoomData) => {
    const hasType = room.type;
    const hasSize = room.size > 0;
    const hasUsage = room.usage !== 'Unselected';
    const hasInstall = room.outdoorLoc && room.outlet && room.hole;
    
    const score = (hasType ? 1 : 0) + (hasSize ? 1 : 0) + (hasUsage ? 1 : 0) + (hasInstall ? 1 : 0);
    
    if (score >= 4) return 'bg-green-500';
    if (score > 1) return 'bg-blue-500';
    return 'bg-slate-300';
  };

  const getRoomStyle = (type: RoomType) => {
    switch (type) {
      case 'Japanese': return 'bg-green-50 border-green-700';
      case 'Bedroom': return 'bg-orange-50 border-orange-800';
      case 'Kids': return 'bg-yellow-50 border-yellow-600';
      default: return 'bg-amber-50 border-amber-800';
    }
  };

  // --- Summary View Component ---
  const SummaryView = () => {
    // Pages logic: Room pages first, then Map page if attached
    const pages: { type: 'rooms' | 'map', data?: RoomData[], pageNum?: number }[] = [];
    
    // Chunk rooms (3 per page)
    for (let i = 0; i < rooms.length; i += 3) {
      pages.push({ type: 'rooms', data: rooms.slice(i, i + 3) });
    }
    
    // Add map page if needed
    if (projectSettings.mapAttached) {
      pages.push({ type: 'map' });
    }

    const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="bg-slate-500/50 min-h-screen p-8 flex flex-col items-center gap-8 print:bg-white print:p-0 print:block">
        {/* Screen-only Controls for Summary */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-full shadow-lg print:hidden sticky top-8 z-50">
          <button 
            onClick={() => setIsSummaryMode(false)}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
          >
            <ArrowLeft size={18} /> 編集に戻る
          </button>
          <div className="h-8 w-px bg-slate-200"></div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
          >
            <Printer size={18} /> 印刷する
          </button>
        </div>

        {/* A4 Pages */}
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] relative print:shadow-none print:w-full print:h-full print:break-after-page mx-auto flex flex-col">
            
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end shrink-0">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">エアコンヒアリングシート</h1>
                <div className="text-sm text-slate-500 mt-1 flex gap-4">
                  <span>担当: {projectSettings.staffId}</span>
                  <span>日付: {dateStr}</span>
                </div>
              </div>
              <div className="text-right">
                 {projectSettings.customerName && (
                   <div className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1">
                     {projectSettings.customerName} 様
                   </div>
                 )}
                 <div className="text-xs text-slate-500">
                    <div className="font-bold text-sm text-slate-800">{projectSettings.address || '住所未入力'}</div>
                    <div>{projectSettings.houseType} / 駐車場: {projectSettings.parking}</div>
                 </div>
              </div>
            </div>

            {/* Page Content */}
            {page.type === 'map' ? (
              // Map Page
              <div className="flex flex-col h-full">
                <div className="h-[50%] w-full border-2 border-slate-300 rounded-lg overflow-hidden shrink-0 relative bg-slate-100 mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(projectSettings.address)}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                    className="pointer-events-none"
                  ></iframe>
                  <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
                    現地地図
                  </div>
                </div>
                <div className="flex-1 border border-dashed border-slate-300 rounded-lg p-4 text-slate-400 text-sm flex items-center justify-center">
                   備考・メモ欄としてご利用ください
                </div>
              </div>
            ) : (
              // Rooms Page
              <div className="flex flex-col gap-6 flex-1">
                {page.data?.map((room, i) => (
                  <div key={room.id} className="border border-slate-300 rounded-lg overflow-hidden break-inside-avoid">
                    {/* Room Header */}
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {(pageIndex * 3) + i + 1}台目
                        </span>
                        <span className="font-bold text-lg text-slate-800">{room.type === 'LDK' ? 'リビング' : room.type}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                          room.installType === 'Replacement' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          room.installType === 'New' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {room.installType === 'Replacement' ? '買替' : room.installType === 'New' ? '新規' : '移設'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-600">
                        {room.size}畳 / {USAGE_LABELS[room.usage]}
                      </div>
                    </div>

                    {/* Room Body */}
                    <div className="p-4 grid grid-cols-12 gap-4">
                      {/* Left: Specs */}
                      <div className="col-span-7 space-y-3">
                         <div className="flex items-center gap-4 mb-2">
                            <div className="bg-indigo-50 px-3 py-1 rounded text-indigo-900 font-bold text-sm border border-indigo-100">
                               メーカー: {room.maker || '未定'}
                            </div>
                            <div className="bg-indigo-50 px-3 py-1 rounded text-indigo-900 font-bold text-sm border border-indigo-100">
                               能力: {room.kw ? `${room.kw}kW` : '未定'}
                            </div>
                         </div>
                         
                         <table className="w-full text-xs border-collapse">
                           <tbody>
                             <tr className="border-b border-slate-100">
                               <th className="py-1 text-left text-slate-500 font-medium w-20">設置階数</th>
                               <td className="py-1 font-bold text-slate-800">{room.floor || '-'}</td>
                               <th className="py-1 text-left text-slate-500 font-medium w-20 pl-2">室外機</th>
                               <td className="py-1 font-bold text-slate-800">{room.outdoorLoc || '-'}</td>
                             </tr>
                             <tr className="border-b border-slate-100">
                               <th className="py-1 text-left text-red-600 font-bold">配管穴</th>
                               <td className="py-1 font-bold text-slate-800">
                                 {room.hole || '-'} 
                                 {['必要', '不明（現地確認）', '特定穴開け'].includes(room.hole) && room.wallMaterial && ` (${room.wallMaterial})`}
                               </td>
                               <th className="py-1 text-left text-red-600 font-bold pl-2">コンセント</th>
                               <td className="py-1 font-bold text-slate-800">{room.outlet || '-'}</td>
                             </tr>
                             <tr className="border-b border-slate-100">
                               <th className="py-1 text-left text-slate-500 font-medium">配管長</th>
                               <td className="py-1 font-bold text-slate-800">{room.pipe || '-'}</td>
                               <th className="py-1 text-left text-slate-500 font-medium pl-2">化粧カバー</th>
                               <td className="py-1 font-bold text-slate-800">
                                 {room.cover || '-'}
                                 {['必要', '再利用希望', '現地確認'].includes(room.cover) && ` : ${room.coverColor}`}
                               </td>
                             </tr>
                             {room.installType === 'Replacement' && (
                               <tr>
                                 <th className="py-1 text-left text-slate-500 font-medium">既存取外</th>
                                 <td className="py-1 font-bold text-slate-800" colSpan={3}>
                                   {room.remove || '-'}
                                   {room.remove === '取り外し有り' && ` (リサイクル: ${room.recycle || '未選択'})`}
                                 </td>
                               </tr>
                             )}
                           </tbody>
                         </table>

                         {room.notes && (
                           <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-100 text-xs text-yellow-900">
                             <span className="font-bold mr-1">備考:</span> {room.notes}
                           </div>
                         )}
                      </div>

                      {/* Right: Layout Preview (Square aspect ratio) */}
                      <div className="col-span-5 h-40 flex items-center justify-center">
                         <div className="border border-slate-300 rounded-lg bg-white relative overflow-hidden aspect-square h-full">
                            {room.layoutItems.length > 0 ? (
                              <div className="relative w-full h-full p-3">
                                 <div className="relative w-full h-full">
                                    {/* Room Box - reusing logic from LayoutModal but scaling to container */}
                                    <div className={`absolute inset-[10%] rounded-[0.5rem] border-2 shadow-sm flex items-center justify-center ${getRoomStyle(room.type)}`}>
                                       <span className="text-slate-400/30 font-bold text-lg select-none">{room.type}</span>
                                    </div>
                                    
                                    {/* Items */}
                                    {room.layoutItems.map(item => (
                                      <div 
                                        key={item.id} 
                                        className={`absolute flex items-center justify-center text-[6px] font-bold shadow-sm border border-white
                                          ${item.kind === 'indoor' 
                                            ? 'bg-blue-500 text-white w-[14%] h-[12%] rounded-full' 
                                            : 'bg-red-500 text-white w-[14%] h-[12%] rounded-sm'
                                          }
                                        `}
                                        style={{ 
                                          left: `${item.x}%`, 
                                          top: `${item.y}%`,
                                          transform: `translate(-50%, -50%) ${(item.side === 'left' || item.side === 'right') ? 'rotate(90deg)' : ''}`,
                                          zIndex: 10
                                        }}
                                      >
                                        {item.kind === 'indoor' ? '内' : '外'}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-slate-400">間取り図なし</div>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="absolute bottom-4 right-8 text-xs text-slate-400">
              Page {pageIndex + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main Render
  return (
    <div className="h-full bg-[#F3F4F6] overflow-hidden">
      {/* If Summary Mode, render Summary View on top (or exclusively) */}
      {isSummaryMode ? (
        <div className="h-full overflow-y-auto">
          <SummaryView />
        </div>
      ) : (
        /* --- MAIN APP VIEW --- */
        <div className="h-full flex flex-col md:flex-row max-w-[1600px] mx-auto print:hidden">
          {/* --- LEFT MAIN PANEL --- */}
          <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto h-full pb-32 md:pb-6">
            
            {/* Header */}
            <header className="flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                  エアコン販売エージェント
                  <span className="text-[10px] md:text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full tracking-wide uppercase">
                    Sales Support Ver 2.0
                  </span>
                </h1>
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  本日の担当スタッフ: 
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={projectSettings.staffId}
                      onChange={handleStaffIdChange}
                      className="bg-white border border-slate-300 rounded px-2 py-0.5 w-16 text-center font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="0000"
                    />
                    <span className="ml-1 text-[10px] text-slate-400">POSコード(4桁)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSummaryMode(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full hover:bg-indigo-100 transition-all"
                >
                  <FileText size={14} />
                  サマリー
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm transition-all"
                >
                  <Printer size={14} />
                  印刷
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm transition-all"
                >
                  <RotateCcw size={14} />
                  リセット
                </button>
              </div>
            </header>

            {/* Global Settings Card */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6 relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">1</span>
                全体条件の設定
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                {/* Room Count & Customer Name */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <User size={12} /> お客様名（任意）
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="例）山田 太郎"
                      value={projectSettings.customerName}
                      onChange={(e) => setProjectSettings({...projectSettings, customerName: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">購入検討台数</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => removeRoom(rooms[rooms.length - 1].id)}
                        disabled={rooms.length <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          rooms.length <= 1 
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110'
                        }`}
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      
                      <div className="flex items-baseline min-w-[3rem] justify-center">
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{rooms.length}</span>
                        <span className="text-sm text-slate-500 font-medium ml-1">台</span>
                      </div>

                      <button 
                        onClick={addRoom}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Housing & Parking */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Home size={12} /> 住居タイプ
                    </label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={projectSettings.houseType}
                      onChange={(e) => setProjectSettings({...projectSettings, houseType: e.target.value})}
                    >
                      {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Car size={12} /> 駐車場
                    </label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={projectSettings.parking}
                      onChange={(e) => setProjectSettings({...projectSettings, parking: e.target.value})}
                    >
                      {PARKING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address & Map */}
                <div className="flex flex-col gap-1.5 h-full">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                       <MapPin size={12} /> 設置先住所
                     </label>
                     <button 
                       onClick={() => setIsMapModalOpen(true)}
                       className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold hover:bg-blue-200 transition-colors"
                     >
                       <Map size={10} /> Mapを開く
                     </button>
                  </div>
                  <textarea 
                    className="w-full h-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    placeholder="市区町村・番地など"
                    value={projectSettings.address}
                    onChange={(e) => setProjectSettings({...projectSettings, address: e.target.value})}
                  />
                  {projectSettings.mapAttached && (
                    <div className="text-[10px] text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={10} /> 地図が添付されています
                    </div>
                  )}
                </div>
              </div>
              
              {showProTips && (
                 <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-3">
                   <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                   <div className="text-xs text-blue-800 leading-relaxed">
                     <span className="font-bold block mb-0.5">ヒアリングのポイント</span>
                     買替の場合：現在のエアコンの電圧（100V/200V）と、コンセントの形状をスマホ写真などで確認できるか聞いてみましょう。
                   </div>
                 </div>
              )}
            </section>

            {/* Room Detail Card */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              
              {/* Room Tabs */}
              <div className="flex overflow-x-auto px-4 pt-4 pb-0 gap-2 scrollbar-hide border-b border-slate-100 shrink-0">
                {rooms.map((room, idx) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all relative border-t border-x ${
                      activeRoomId === room.id 
                        ? 'bg-white border-slate-200 text-indigo-700 z-10 -mb-[1px] shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]' 
                        : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${getProgressColor(room)}`}></span>
                    {idx + 1}台目
                    {rooms.length > 1 && activeRoomId === room.id && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                        className="ml-2 w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-slate-300 transition-colors"
                      >
                        <span className="text-xs">×</span>
                      </span>
                    )}
                  </button>
                ))}
                <button 
                   onClick={addRoom}
                   className="px-3 py-3 rounded-t-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="p-5 md:p-8 flex-1 overflow-y-auto">
                 <div className="flex justify-between items-start mb-6">
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">2</span>
                     お部屋の詳細: {activeRoomIndex + 1}台目
                   </h2>
                   <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                     ID: {activeRoom.id}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   {/* Left Column: Inputs */}
                   <div className="space-y-6">
                     
                     {/* Install Type Per Room Selector */}
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">設置タイプ</label>
                       <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        {(['Replacement', 'New', 'Relocation'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => updateRoom(activeRoomId, { installType: type })}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                              activeRoom.installType === type 
                              ? 'bg-white text-blue-700 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {type === 'Replacement' && '買替'}
                            {type === 'New' && '新規'}
                            {type === 'Relocation' && '移設'}
                          </button>
                        ))}
                      </div>
                     </div>

                     {/* Room Type */}
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">部屋の種類</label>
                       <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                         {ROOM_TYPES.map(type => (
                           <button
                             key={type}
                             onClick={() => updateRoom(activeRoomId, { type })}
                             className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all ${
                               activeRoom.type === type
                                 ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                                 : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                             }`}
                           >
                             {ROOM_ICONS[type]}
                             <span className="text-[10px] font-bold">{type === 'LDK' ? 'リビング' : type === 'Japanese' ? '和室' : type === 'Bedroom' ? '寝室' : type === 'Kids' ? '子供部屋' : type}</span>
                           </button>
                         ))}
                       </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Room Size */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">広さ（畳数）</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="4" 
                              max="30" 
                              step="1"
                              value={activeRoom.size}
                              onChange={(e) => updateRoom(activeRoomId, { size: parseInt(e.target.value) })}
                              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="w-20 text-right flex items-center justify-end gap-1">
                              <input 
                                type="number" 
                                min="1"
                                max="100"
                                value={activeRoom.size}
                                onChange={(e) => updateRoom(activeRoomId, { size: parseInt(e.target.value) || 0 })}
                                className="w-12 border border-slate-300 rounded px-1 py-0.5 text-center font-bold text-slate-800 text-lg focus:outline-none focus:border-indigo-500"
                              />
                              <span className="text-xs text-slate-500 font-medium">畳</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Usage */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">主な用途</label>
                           <select
                             className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                             value={activeRoom.usage}
                             onChange={(e) => updateRoom(activeRoomId, { usage: e.target.value as UsageType })}
                           >
                             {Object.entries(USAGE_LABELS).map(([key, label]) => (
                               <option key={key} value={key}>{label}</option>
                             ))}
                           </select>
                        </div>
                     </div>

                     {/* --- Detailed Specs & Installation --- */}
                     <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                          <Settings2 size={16} className="text-indigo-600"/>
                          商品・工事詳細
                        </h3>
                        
                        {/* Maker & Capacity */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">メーカー</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={activeRoom.maker}
                              onChange={(e) => updateRoom(activeRoomId, { maker: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {MAKERS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">能力 (kW)</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={activeRoom.kw}
                              onChange={(e) => updateRoom(activeRoomId, { kw: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {KW_OPTIONS.map(k => <option key={k} value={k}>{k} kW</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Installation Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          
                          {/* Floor */}
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">設置階数</label>
                            <select 
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                              value={activeRoom.floor}
                              onChange={(e) => updateRoom(activeRoomId, { floor: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {FLOOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          {/* Outdoor Location */}
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">室外機設置</label>
                            <select 
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                              value={activeRoom.outdoorLoc}
                              onChange={(e) => updateRoom(activeRoomId, { outdoorLoc: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {OUTDOOR_LOCATIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          {/* Hole - Highlighted */}
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-red-600 mb-1 flex items-center gap-1">
                              配管穴 <AlertCircle size={10} />
                            </label>
                            <select 
                              className="w-full bg-red-50 border border-red-200 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 focus:ring-red-500/30 focus:border-red-500"
                              value={activeRoom.hole}
                              onChange={(e) => updateRoom(activeRoomId, { hole: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {HOLE_STATUS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          {/* Outlet - Highlighted */}
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-red-600 mb-1 flex items-center gap-1">
                              コンセント <AlertCircle size={10} />
                            </label>
                            <select 
                              className="w-full bg-red-50 border border-red-200 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 focus:ring-red-500/30 focus:border-red-500"
                              value={activeRoom.outlet}
                              onChange={(e) => updateRoom(activeRoomId, { outlet: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {OUTLET_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          {/* Wall Material (Show only if hole is needed/unknown) */}
                          {['必要', '不明（現地確認）', '特定穴開け'].includes(activeRoom.hole) && (
                            <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">外壁素材</label>
                              <select 
                                className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                                value={activeRoom.wallMaterial}
                                onChange={(e) => updateRoom(activeRoomId, { wallMaterial: e.target.value })}
                              >
                                <option value="">未選択</option>
                                {WALL_MATERIALS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          )}

                          {/* Pipe Length */}
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">配管長</label>
                            <select 
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                              value={activeRoom.pipe}
                              onChange={(e) => updateRoom(activeRoomId, { pipe: e.target.value })}
                            >
                              <option value="">未選択</option>
                              {PIPE_LENGTHS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          {/* Cover */}
                          <div className="col-span-1">
                             <label className="block text-[10px] font-bold text-slate-500 mb-1">化粧カバー</label>
                             <select 
                               className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                               value={activeRoom.cover}
                               onChange={(e) => updateRoom(activeRoomId, { cover: e.target.value })}
                             >
                               <option value="">未選択</option>
                               {COVER_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                          </div>

                          {/* Cover Color (Conditional) */}
                          {['必要', '再利用希望', '現地確認'].includes(activeRoom.cover) && (
                            <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">カバー色</label>
                              <select 
                                className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                                value={activeRoom.coverColor}
                                onChange={(e) => updateRoom(activeRoomId, { coverColor: e.target.value })}
                              >
                                <option value="">未選択</option>
                                {COVER_COLORS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          )}

                          {/* Removal/Recycle (Conditional for Replacement) */}
                          {activeRoom.installType === 'Replacement' && (
                            <>
                              <div className="col-span-1 border-t border-slate-200 pt-2 mt-1">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">既存取外</label>
                                <select 
                                  className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                                  value={activeRoom.remove}
                                  onChange={(e) => updateRoom(activeRoomId, { remove: e.target.value })}
                                >
                                  <option value="">未選択</option>
                                  {REMOVE_OPTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                              
                              {activeRoom.remove === '取り外し有り' && (
                                 <div className="col-span-1 border-t border-slate-200 pt-2 mt-1">
                                   <label className="block text-[10px] font-bold text-slate-500 mb-1">リサイクル</label>
                                   <select 
                                     className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs"
                                     value={activeRoom.recycle}
                                     onChange={(e) => updateRoom(activeRoomId, { recycle: e.target.value })}
                                   >
                                     <option value="">未選択</option>
                                     {RECYCLE_OPTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                                 </div>
                              )}
                            </>
                          )}
                        </div>
                     </div>

                   </div>

                   {/* Right Column: Visualization & Layout */}
                   <div className="flex flex-col h-full gap-4">
                     
                     {/* Visual Editor */}
                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col">
                       <div className="flex justify-between items-center mb-3">
                         <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                           <Layout size={16} />
                           間取り・設置イメージ
                         </h3>
                         {activeRoom.layoutItems.length > 0 && (
                           <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                             配置済み
                           </span>
                         )}
                       </div>

                       <div className="flex-1 min-h-[240px] bg-white rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                          {activeRoom.layoutItems.length > 0 ? (
                            <div className="relative w-full h-full flex items-center justify-center pointer-events-none opacity-80 scale-90">
                               {/* Mini preview */}
                               <div className="w-48 h-48 border-4 border-slate-300 rounded-lg relative flex items-center justify-center bg-slate-50/50">
                                  <span className="text-slate-300 font-bold text-2xl">{activeRoom.type}</span>
                                  {activeRoom.layoutItems.map(item => (
                                    <div 
                                      key={item.id} 
                                      className={`absolute w-4 h-4 rounded-full shadow-sm ${item.kind === 'indoor' ? 'bg-blue-500 border-2 border-white' : 'bg-red-500 border-2 border-white'}`}
                                      style={{ 
                                        left: `${item.x}%`, 
                                        top: `${item.y}%`,
                                        transform: 'translate(-50%, -50%)' 
                                      }}
                                    />
                                  ))}
                               </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 space-y-2">
                              <PenTool className="mx-auto text-slate-300" size={32} />
                              <p className="text-xs">
                                間取り図を作成して<br/>
                                室内機・室外機の位置を記録します
                              </p>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => setIsLayoutModalOpen(true)}
                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                          >
                            <span className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transform scale-95 hover:scale-100 transition-transform flex items-center gap-2">
                              <PenTool size={14} />
                              {activeRoom.layoutItems.length > 0 ? '配置を編集する' : '間取りシミュレータ'}
                            </span>
                          </button>
                       </div>
                     </div>

                     {/* Memo */}
                     <div className="mt-auto">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">特記事項・お客様の要望</label>
                       <textarea 
                         rows={3}
                         value={activeRoom.notes}
                         onChange={(e) => updateRoom(activeRoomId, { notes: e.target.value })}
                         placeholder="例）隠蔽配管の可能性あり、化粧カバーは再利用希望、など"
                         className="w-full bg-yellow-50/50 border border-yellow-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all resize-none"
                       />
                     </div>
                   </div>
                 </div>

              </div>
            </section>
          </main>

          {/* --- RIGHT SIDEBAR (SUMMARY) --- */}
          <aside className="hidden md:flex flex-col w-[320px] bg-white border-l border-slate-200 shadow-xl z-20 h-full overflow-hidden print:hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Layout size={18} className="text-indigo-600" />
                見積り構成案
              </h2>
              <p className="text-xs text-slate-500 mt-1">ヒアリング内容がここにまとまります</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {rooms.map((room, index) => (
                <div 
                  key={room.id} 
                  onClick={() => setActiveRoomId(room.id)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all group relative overflow-hidden ${
                    activeRoomId === room.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Active Indicator Strip */}
                  {activeRoomId === room.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}

                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${activeRoomId === room.id ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                        {index + 1}
                      </span>
                      <span className={`text-sm font-bold ${activeRoomId === room.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {room.type === 'LDK' ? 'リビング' : room.type}
                      </span>
                    </div>
                    {room.layoutItems.length > 0 && <CheckCircle2 size={14} className="text-green-500" />}
                  </div>
                  
                  <div className="space-y-1.5 pl-9 pr-1">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1 mb-1">
                      <span className="text-slate-400">スペック</span>
                      <span className="font-bold text-slate-700">
                        {room.size}畳
                        {room.kw ? ` / ${room.kw}kW` : ''}
                      </span>
                    </div>
                    
                    {/* Install Type Badge */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        room.installType === 'Replacement' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        room.installType === 'New' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {room.installType === 'Replacement' ? '買替' : room.installType === 'New' ? '新規' : '移設'}
                      </span>
                      {room.maker && (
                        <span className="text-[10px] text-indigo-700 font-medium bg-indigo-100/50 px-2 py-0.5 rounded">
                          {room.maker}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500">
                       {room.outdoorLoc && <div>外: {room.outdoorLoc}</div>}
                       {room.hole && <div>穴: {room.hole}</div>}
                       {room.outlet && <div>電: {room.outlet}</div>}
                       {room.cover && <div>カバ: {room.cover}</div>}
                    </div>

                    {room.notes && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-amber-600/80 flex gap-1">
                        <Info size={10} className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{room.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center bg-slate-50/50">
                <div className="text-xs text-slate-400 mb-2">合計 {rooms.length} 台</div>
                <div className="flex justify-center gap-2 text-[10px] font-medium text-slate-500">
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded">
                    {projectSettings.houseType}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* --- MODAL FOR LAYOUT --- */}
      <LayoutModal 
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        initialItems={activeRoom.layoutItems}
        roomType={activeRoom.type}
        onSave={(items) => {
          updateRoom(activeRoomId, { layoutItems: items });
          setIsLayoutModalOpen(false);
        }}
      />

      {/* --- MODAL FOR MAP --- */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Map Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-red-500" />
                地図確認
              </h2>
              <button onClick={() => setIsMapModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {/* Map Content */}
            <div className="flex-1 relative bg-slate-100">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(projectSettings.address)}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full"
              ></iframe>
              
              {/* Overlay Controls */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-bold text-slate-700 border border-slate-200">
                {projectSettings.address || "住所が未入力です"}
              </div>

              {/* Screenshot Button (Simulated) */}
              <button 
                onClick={() => {
                  setProjectSettings(prev => ({ ...prev, mapAttached: true }));
                  setIsMapModalOpen(false);
                }}
                className="absolute bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all"
              >
                <Camera size={20} />
                この地図を添付する
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden Print Only Styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:w-full { width: 100% !important; }
          .print\\:h-full { height: 100% !important; }
          .print\\:shadow-none { shadow: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:break-after-page { page-break-after: always; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default App;