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
