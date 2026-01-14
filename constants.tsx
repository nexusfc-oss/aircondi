import React from 'react';
import { 
  Home, 
  Wind, 
  Bed, 
  Gamepad2, 
  Coffee, 
  Briefcase, 
  Box, 
  Zap, 
  Moon, 
  Users, 
  Monitor 
} from 'lucide-react';
import { RoomType, UsageType } from './types';

export const ROOM_ICONS: Record<RoomType, React.ReactNode> = {
  'LDK': <Coffee size={16} />,
  'Japanese': <Home size={16} />,
  'Bedroom': <Bed size={16} />,
  'Kids': <Gamepad2 size={16} />,
  'Guest': <Users size={16} />,
  'Office': <Briefcase size={16} />,
  'Other': <Box size={16} />,
};

export const USAGE_ICONS: Record<UsageType, React.ReactNode> = {
  '24h': <Zap size={14} />,
  'Night': <Moon size={14} />,
  'Guest': <Coffee size={14} />,
  'Work': <Monitor size={14} />,
  'Unselected': <Box size={14} />
};

export const HOUSE_TYPES = [
  '戸建て（持ち家）', 
  '戸建て（賃貸）', 
  '集合住宅（持ち家）', 
  '集合住宅（賃貸）', 
  'その他（施設等）'
];

export const PARKING_TYPES = [
  '有（敷地内）', 
  '近隣コインP', 
  '無', 
  '要確認'
];

export const MAKERS = [
  'ダイキン', 
  '三菱電機', 
  'パナソニック', 
  '日立', 
  '東芝', 
  '富士通ゼネラル', 
  'シャープ', 
  'コロナ', 
  'ハイセンス'
];

export const KW_OPTIONS = ['2.2', '2.5', '2.8', '3.6', '4.0', '5.6', '6.3', '7.1', '8.0', '9.0'];

export const FLOOR_OPTIONS = ['1階', '2階', '3階', '4階以上', '地下'];

export const OUTDOOR_LOCATIONS = ['標準（地面）', 'ベランダ', '公団天井吊', '屋根置き', '壁付', '室外機立下げ'];

export const HOLE_STATUS = ['必要', '不要', '不明（現地確認）', '特定穴開け'];

export const WALL_MATERIALS = ['モルタル・ALC・木質', 'タイル・セラミック', 'コンクリート', '不明'];

export const OUTLET_TYPES = ['有', '不明', '専用回路工事（同一フロア）', '専用回路工事（他フロア）'];

export const PIPE_LENGTHS = ['～4m', '5m', '6m', '7m', '7m以上'];

export const COVER_TYPES = ['必要', '再利用希望', '不要', '現地確認'];

export const COVER_COLORS = ['アイボリー', 'ホワイト', 'グレー', 'ブラック', 'ブラウン'];

export const REMOVE_OPTS = ['取り外し有り', '取り外し無し', '未定'];

export const RECYCLE_OPTS = ['有り', '無し'];