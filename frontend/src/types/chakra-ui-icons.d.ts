declare module '@chakra-ui/icons' {
  import React from 'react';
  
  export interface IconProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    boxSize?: string | number;
    color?: string;
  }
  
  export const SearchIcon: React.FC<IconProps>;
  export const MoonIcon: React.FC<IconProps>;
  export const SunIcon: React.FC<IconProps>;
  export const ChevronDownIcon: React.FC<IconProps>;
  export const ChevronUpIcon: React.FC<IconProps>;
  export const ChevronLeftIcon: React.FC<IconProps>;
  export const ChevronRightIcon: React.FC<IconProps>;
  export const CloseIcon: React.FC<IconProps>;
  export const AddIcon: React.FC<IconProps>;
  export const CheckIcon: React.FC<IconProps>;
  export const InfoIcon: React.FC<IconProps>;
  export const WarningIcon: React.FC<IconProps>;
  export const EmailIcon: React.FC<IconProps>;
 