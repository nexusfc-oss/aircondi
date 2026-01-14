export type RoomType = 'LDK' | 'Japanese' | 'Bedroom' | 'Kids' | 'Guest' | 'Office' | 'Other';
export type InstallType = 'Replacement' | 'New' | 'Relocation';
export type UsageType = '24h' | 'Night' | 'Guest' | 'Work' | 'Unselected';

export interface LayoutItem {
  id: number;
  kind: 'indoor' | 'outdoor';
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  side: 'top' | 'bottom' | 'left' | 'right';
}

export interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  size: number;
  usage: UsageType;
  notes: string;
  layoutItems: LayoutItem[];
  
  // Install Type (Moved from Global)
  installType: InstallType;

  // Basic Spec
  maker: string;
  kw: string;
  
  // Installation Spec
  floor: string; // New field
  outdoorLoc: string;
  hole: string;
  wallMaterial: string;
  outlet: string;
  pipe: string;
  cover: string;
  coverColor: string;
  
  // Replacement Spec
  remove: string;
  recycle: string;
}

export interface ProjectSettings {
  staffId: string;
  customerName: string; 
  houseType: string;
  address: string;
  parking: string;
  mapAttached: boolean; 
}

export const ROOM_TYPES: RoomType[] = ['LDK', 'Japanese', 'Bedroom', 'Kids', 'Guest', 'Office', 'Other'];

export const USAGE_LABELS: Record<UsageType, string> = {
  '24h': 'ほぼ24時間',
  'Night': '就寝時メイン',
  'Guest': '来客時のみ',
  'Work': '在宅ワーク',
  'Unselected': '未選択'
};