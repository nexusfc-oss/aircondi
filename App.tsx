import React, { useState, useEffect } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { RoomData, ProjectSettings, ROOM_TYPES, USAGE_LABELS, RoomType, UsageType } from './types';
import { ROOM_ICONS, USAGE_ICONS } from './constants';
import { LayoutModal } from './components/LayoutModal';

const App: React.FC = () => {
  // Global Settings
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    installType: 'Replacement',
    staffId: '4191'
  });
  
  // App State
  const [rooms, setRooms] = useState<RoomData[]>([
    { id: '1', name: 'お部屋 1', type: 'LDK', size: 10, usage: 'Unselected', notes: '', layoutItems: [] }
  ]);
  const [activeRoomId, setActiveRoomId] = useState<string>('1');
  const [showProTips, setShowProTips] = useState<boolean>(true);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

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
      layoutItems: []
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
      setRooms([{ id: '1', name: 'お部屋 1', type: 'LDK', size: 10, usage: 'Unselected', notes: '', layoutItems: [] }]);
      setActiveRoomId('1');
      setProjectSettings({ ...projectSettings, installType: 'Replacement' });
    }
  };

  // UI Components helpers
  const getProgressColor = (room: RoomData) => {
    const hasType = room.type;
    const hasSize = room.size > 0;
    const hasUsage = room.usage !== 'Unselected';
    const score = (hasType ? 1 : 0) + (hasSize ? 1 : 0) + (hasUsage ? 1 : 0);
    if (score === 3) return 'bg-green-500';
    if (score > 0) return 'bg-blue-500';
    return 'bg-slate-300';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto bg-[#F3F4F6]">
      
      {/* --- LEFT MAIN PANEL --- */}
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto h-screen pb-32 md:pb-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
              エアコン販売エージェント
              <span className="text-[10px] md:text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full tracking-wide uppercase">
                Sales Support Ver 2.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              本日の担当スタッフ: {projectSettings.staffId}
            </p>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm transition-all"
          >
            <RotateCcw size={14} />
            リセット
          </button>
        </header>

        {/* Sales Guide Toggle */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <MessageCircleQuestion size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-indigo-900">接客アシストモード</div>
              <div className="text-xs text-indigo-700/80">新人スタッフ向けにヒアリング項目をガイドします</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={showProTips} onChange={() => setShowProTips(!showProTips)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Global Settings Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">1</span>
            全体条件の設定
          </h2>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">設置タイプ</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['Replacement', 'New', 'Relocation'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setProjectSettings({ ...projectSettings, installType: type })}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      projectSettings.installType === type 
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

            <div className="w-px h-10 bg-slate-200 mx-2 hidden md:block"></div>

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
          <div className="flex overflow-x-auto px-4 pt-4 pb-0 gap-2 scrollbar-hide border-b border-slate-100">
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

          <div className="p-5 md:p-8 flex-1">
             <div className="flex justify-between items-start mb-6">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">2</span>
                 お部屋の詳細: {activeRoomIndex + 1}台目
               </h2>
               <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                 ID: {activeRoom.id}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Left Column: Inputs */}
               <div className="space-y-6">
                 
                 {/* Room Type */}
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">部屋の種類</label>
                   <div className="grid grid-cols-3 gap-2">
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
                     <div className="w-20 text-right">
                       <span className="text-2xl font-bold text-slate-800 tabular-nums">{activeRoom.size}</span>
                       <span className="text-sm text-slate-500 font-medium ml-1">畳</span>
                     </div>
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                     <span>4畳</span>
                     <span>10畳</span>
                     <span>20畳</span>
                     <span>30畳</span>
                   </div>
                 </div>

                 {/* Usage */}
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">主な用途・頻度</label>
                   <div className="flex flex-wrap gap-2">
                     {(Object.keys(USAGE_LABELS) as UsageType[]).filter(k => k !== 'Unselected').map(usage => (
                       <button
                         key={usage}
                         onClick={() => updateRoom(activeRoomId, { usage })}
                         className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-bold transition-all ${
                           activeRoom.usage === usage
                             ? 'bg-amber-50 border-amber-500 text-amber-800'
                             : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                         }`}
                       >
                         {USAGE_ICONS[usage]}
                         {USAGE_LABELS[usage]}
                       </button>
                     ))}
                   </div>
                   {showProTips && (
                    <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 flex gap-2">
                       <Info size={14} className="shrink-0 mt-0.5" />
                       <p>「冬も暖房としてメインで使いますか？」と聞くことで、寒冷地仕様やハイグレードモデルの提案につなげられます。</p>
                    </div>
                   )}
                 </div>
               </div>

               {/* Right Column: Visualization & Layout */}
               <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col h-full">
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

                 <div className="flex-1 bg-white rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                    {activeRoom.layoutItems.length > 0 ? (
                      <div className="relative w-full h-full max-h-[200px] flex items-center justify-center pointer-events-none opacity-80">
                         {/* Mini preview */}
                         <div className="w-32 h-32 border-4 border-slate-300 rounded-lg relative flex items-center justify-center">
                            <span className="text-slate-300 font-bold">{activeRoom.type}</span>
                            {activeRoom.layoutItems.map(item => (
                              <div 
                                key={item.id} 
                                className={`absolute w-3 h-3 rounded-full ${item.kind === 'indoor' ? 'bg-blue-500' : 'bg-red-500'}`}
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
                          まだ配置されていません。<br/>
                          下のボタンから配置を作成できます。
                        </p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setIsLayoutModalOpen(true)}
                      className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform scale-95 hover:scale-100 transition-transform">
                        {activeRoom.layoutItems.length > 0 ? '配置を編集する' : '間取りシミュレータを開く'}
                      </span>
                    </button>
                 </div>

                 <button 
                   onClick={() => setIsLayoutModalOpen(true)}
                   className="mt-3 w-full py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                 >
                   {activeRoom.layoutItems.length > 0 ? '配置を調整する' : '室内機・室外機の位置をメモする'}
                 </button>
               </div>
             </div>

             {/* Memo */}
             <div className="mt-6 pt-6 border-t border-slate-100">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">機種メモ・お客様の要望</label>
               <input 
                 type="text" 
                 value={activeRoom.notes}
                 onChange={(e) => updateRoom(activeRoomId, { notes: e.target.value })}
                 placeholder="例）メーカー指定あり、掃除機能は不要、など"
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
               />
             </div>
          </div>
        </section>
      </main>

      {/* --- RIGHT SIDEBAR (SUMMARY) --- */}
      <aside className="hidden md:flex flex-col w-[320px] bg-white border-l border-slate-200 shadow-xl z-20">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
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
              className={`rounded-xl border p-3 cursor-pointer transition-all group ${
                activeRoomId === room.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${activeRoomId === room.id ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm font-bold ${activeRoomId === room.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {room.type === 'LDK' ? 'リビング' : room.type}
                  </span>
                </div>
                {room.layoutItems.length > 0 && <Layout size={14} className="text-green-500" />}
              </div>
              
              <div className="space-y-1 pl-7">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>広さ</span>
                  <span className="font-medium text-slate-700">{room.size}畳</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>用途</span>
                  <span className="font-medium text-slate-700">{USAGE_LABELS[room.usage]}</span>
                </div>
                {room.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-500 line-clamp-2">
                    Note: {room.notes}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
            <div className="text-xs text-slate-400 mb-2">合計 {rooms.length} 台</div>
            <div className="text-xs font-bold text-slate-600 bg-slate-100 rounded px-2 py-1 inline-block">
              設置区分: {projectSettings.installType === 'Replacement' ? '買替え' : projectSettings.installType === 'New' ? '新規' : '移設'}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
            <span>商品選定へ進む</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>

      {/* --- MODAL --- */}
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
    </div>
  );
};

export default App;