export const colors = {
  primary: '#424D2C',
  primaryPressed: '#323B21',

  accent: '#DDF36B',
  accentSoft: '#F0F8CA',

  background: '#F8F8F4',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F1EA',

  text: '#20251B',
  textSecondary: '#73786D',
  textInverse: '#FFFFFF',

  border: '#E5E7DE',
  disabled: '#B9BDB1',

  discount: '#D95C3B',
  success: '#287A50',
  error: '#C43D3D',
  warning: '#B87819',
} as const;

export type AppColors = typeof colors;