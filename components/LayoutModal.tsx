import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutItem, RoomType } from '../types';
import { X, Plus, Trash2, RotateCcw, Save } from 'lucide-react';

interface LayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: LayoutItem[]) => void;
  initialItems: LayoutItem[];
  roomType: RoomType;
}

export const LayoutModal: React.FC<LayoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItems,
  roomType
}) => {
  const [items, setItems] = useState<LayoutItem[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number; initialItem: LayoutItem } | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setItems(JSON.parse(JSON.stringify(initialItems)));
    }
  }, [isOpen, initialItems]);

  const addItem = (kind: 'indoor' | 'outdoor') => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem: LayoutItem = {
      id: newId,
      kind,
      x: 50,
      y: kind === 'indoor' ? 35 : 85,
      side: kind === 'indoor' ? 'top' : 'bottom'
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePointerDown = (e: React.PointerEvent, item: LayoutItem) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      initialItem: { ...item }
    };
    
    // Capture pointer to handle moves outside the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !stageRef.current || !roomRef.current) return;

    const { startX, startY, initialItem, id: draggingId } = dragRef.current;
    const stageRect = stageRef.current.getBoundingClientRect();
    const roomRect = roomRef.current.getBoundingClientRect();
    
    // Calculate delta in percentage relative to stage
    const deltaX = ((e.clientX - startX) / stageRect.width) * 100;
    const deltaY = ((e.clientY - startY) / stageRect.height) * 100;

    let rawX = initialItem.x + deltaX;
    let rawY = initialItem.y + deltaY;

    // Clamp to stage
    rawX = Math.max(2, Math.min(98, rawX));
    rawY = Math.max(2, Math.min(98, rawY));

    // Snapping Logic
    const roomInfo = {
      top: ((roomRect.top - stageRect.top) / stageRect.height) * 100,
      bottom: ((roomRect.bottom - stageRect.top) / stageRect.height) * 100,
      left: ((roomRect.left - stageRect.left) / stageRect.width) * 100,
      right: ((roomRect.right - stageRect.left) / stageRect.width) * 100,
    };

    // Assuming icon size approx 6% width, 4% height for calculation simply
    const wPct = 6;
    const hPct = 4;

    let snappedX = rawX;
    let snappedY = rawY;
    let newSide = initialItem.side;
    const kind = initialItem.kind;

    // Defined boundaries for snapping
    let targetTop, targetBottom, targetLeft, targetRight;
    
    if (kind === 'indoor') {
      // Indoor units snap inside the room box
      targetTop = roomInfo.top + hPct;
      targetBottom = roomInfo.bottom - hPct;
      targetLeft = roomInfo.left + wPct;
      targetRight = roomInfo.right - wPct;
    } else {
      // Outdoor units snap outside the room box
      targetTop = roomInfo.top - hPct;
      targetBottom = roomInfo.bottom + hPct;
      targetLeft = roomInfo.left - wPct;
      targetRight = roomInfo.right + wPct;
    }

    // Determine nearest wall
    const distTop = Math.abs(rawY - targetTop);
    const distBottom = Math.abs(rawY - targetBottom);
    const distLeft = Math.abs(rawX - targetLeft);
    const distRight = Math.abs(rawX - targetRight);
    
    const minDist = Math.min(distTop, distBottom, distLeft, distRight);

    if (minDist === distTop) {
      snappedY = targetTop;
      snappedX = Math.max(roomInfo.left, Math.min(roomInfo.right, rawX)); // Constrain X to room width
      newSide = 'top';
    } else if (minDist === distBottom) {
      snappedY = targetBottom;
      snappedX = Math.max(roomInfo.left, Math.min(roomInfo.right, rawX));
      newSide = 'bottom';
    } else if (minDist === distLeft) {
      snappedX = targetLeft;
      snappedY = Math.max(roomInfo.top, Math.min(roomInfo.bottom, rawY)); // Constrain Y to room height
      newSide = 'left';
    } else {
      snappedX = targetRight;
      snappedY = Math.max(roomInfo.top, Math.min(roomInfo.bottom, rawY));
      newSide = 'right';
    }

    setItems(prev => prev.map(item => 
      item.id === draggingId 
        ? { ...item, x: snappedX, y: snappedY, side: newSide } 
        : item
    ));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  if (!isOpen) return null;

  // Background style based on room type
  const getRoomStyle = () => {
    switch (roomType) {
      case 'Japanese': return 'bg-green-50 border-green-700';
      case 'Bedroom': return 'bg-orange-50 border-orange-800';
      case 'Kids': return 'bg-yellow-50 border-yellow-600';
      default: return 'bg-amber-50 border-amber-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              間取りシミュレーション
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {roomType}
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">アイコンをドラッグして、壁の位置に合わせてください。</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Controls Sidebar */}
          <div className="p-4 md:w-64 flex flex-col gap-4 border-r border-slate-200 bg-white z-10">
            <div className="space-y-3">
              <button 
                onClick={() => addItem('indoor')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 font-medium transition-all shadow-sm active:scale-95"
              >
                <Plus size={16} /> 室内機を追加
              </button>
              <button 
                onClick={() => addItem('outdoor')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 font-medium transition-all shadow-sm active:scale-95"
              >
                <Plus size={16} /> 室外機を追加
              </button>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <button 
                onClick={() => setItems([])}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} /> 全てクリア
              </button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg leading-relaxed">
              <span className="font-bold block mb-1">💡 ヒント</span>
              壁に近づけると自動的に向きが調整されます。
            </div>
          </div>

          {/* Stage */}
          <div className="flex-1 relative p-4 md:p-8 flex items-center justify-center overflow-hidden">
             {/* Background decorative grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                   backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                   backgroundSize: '20px 20px' 
                 }} 
            />

            <div 
              ref={stageRef}
              className="relative w-full max-w-[600px] aspect-square bg-white rounded-xl shadow-sm border border-slate-200"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp} // Safety net
            >
              {/* The Room */}
              <div 
                ref={roomRef}
                className={`absolute inset-[15%] rounded-[1rem] border-4 shadow-xl flex items-center justify-center ${getRoomStyle()}`}
              >
                <span className="text-slate-400/50 font-bold text-4xl select-none pointer-events-none">
                  {roomType}
                </span>
              </div>

              {/* Items */}
              {items.map(item => (
                <div
                  key={item.id}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  className={`absolute flex items-center justify-center text-[10px] font-bold shadow-lg cursor-grab active:cursor-grabbing border select-none transition-transform touch-none
                    ${item.kind === 'indoor' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 w-[70px] h-[30px] rounded-full' 
                      : 'bg-red-50 border-red-500 text-red-700 w-[70px] h-[34px] rounded-md'
                    }
                    ${(item.side === 'left' || item.side === 'right') ? 'rotate-90' : ''}
                  `}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: `translate(-50%, -50%) ${(item.side === 'left' || item.side === 'right') ? 'rotate(90deg)' : ''}`,
                    zIndex: 20
                  }}
                >
                  <span className="pointer-events-none">
                    {item.kind === 'indoor' ? '室内機' : '室外機'}
                  </span>
                  
                  {/* Remove button (small x) */}
                  <button 
                    className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    onPointerDown={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            キャンセル
          </button>
          <button 
            onClick={() => onSave(items)}
            className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-sm flex items-center gap-2"
          >
            <Save size={16} />
            配置を保存する
          </button>
        </div>
      </div>
    </div>
  );
};
