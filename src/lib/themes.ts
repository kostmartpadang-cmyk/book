export interface ThemeDef {
  id: string;
  label: string;
  description: string;
  swatch: [string, string, string];
}

export const themes: ThemeDef[] = [
  {
    id: 'soft',
    label: 'Alam Lembut',
    description: 'Hijau & biru pastel yang tenang',
    swatch: ['#6fc5a0', '#8fc6ea', '#a7dcc9'],
  },
  {
    id: 'kerajaan',
    label: 'Kerajaan',
    description: 'Perkamen usang, oxblood & kuningan tua',
    swatch: ['#f2e8d5', '#6b1f2e', '#8a6d2f'],
  },
  {
    id: 'cute',
    label: 'Cute',
    description: 'Pink & baby blue yang imut',
    swatch: ['#ff8fc0', '#a6d6f2', '#d9b8f0'],
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Teal & steel blue yang clean',
    swatch: ['#2cb8a0', '#4a8fc9', '#3ed2b8'],
  },
  {
    id: 'coksu',
    label: 'Coksu',
    description: 'Coklat susu hangat, warna solid',
    swatch: ['#a67c52', '#c9a876', '#d9b384'],
  },
  {
    id: 'coksu-dark',
    label: 'Coksu Dark',
    description: 'Coklat susu gelap, warna solid',
    swatch: ['#a9764a', '#8a6a4a', '#d2a06a'],
  },
  {
    id: 'lautan',
    label: 'Lautan',
    description: 'Putih & biru laut, foto acak tiap kunjungan',
    swatch: ['#ffffff', '#1a7ba8', '#14b8a6'],
  },
  {
    id: 'biru',
    label: 'Biru',
    description: 'Biru langit & periwinkle yang lembut',
    swatch: ['#6f95e0', '#8fb8e8', '#b7c9f0'],
  },
];

export const DEFAULT_THEME = 'soft';
