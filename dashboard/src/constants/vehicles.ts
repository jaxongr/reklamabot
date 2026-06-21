/**
 * Mashina turlari va markalar — barcha dashboard sahifalarda ishlatiladi
 */

// Mashina turlari — kategoriya bo'yicha guruhlangan
export const VEHICLE_TYPE_GROUPS = [
  {
    group: 'Yirik yuk (20+ tonna)',
    items: [
      { value: 'Fura', label: 'Fura (tirkamali)' },
      { value: 'Kamaz', label: 'Kamaz' },
      { value: 'MAN', label: 'MAN' },
      { value: 'Volvo', label: 'Volvo' },
      { value: 'Scania', label: 'Scania' },
      { value: 'DAF', label: 'DAF' },
      { value: 'Mercedes', label: 'Mercedes (Actros/Atego)' },
      { value: 'HOWO', label: 'HOWO (Sinotruk)' },
      { value: 'Shacman', label: 'Shacman' },
      { value: 'Iveco', label: 'Iveco' },
      { value: 'Renault', label: 'Renault' },
      { value: 'Dongfeng', label: 'Dongfeng' },
      { value: 'FAW', label: 'FAW' },
      { value: 'Foton', label: 'Foton' },
    ],
  },
  {
    group: "O'rta yuk (5-20 tonna)",
    items: [
      { value: 'Isuzu', label: 'Isuzu' },
      { value: 'Gazel', label: 'Gazel' },
      { value: 'Canter', label: 'Canter (Mitsubishi Fuso)' },
      { value: 'JAC', label: 'JAC' },
      { value: 'Hyundai', label: 'Hyundai (HD/Mighty)' },
    ],
  },
  {
    group: 'Yengil yuk (1-5 tonna)',
    items: [
      { value: 'Porter', label: 'Porter (Hyundai)' },
      { value: 'Sprinter', label: 'Sprinter (Mercedes)' },
      { value: 'Labo', label: 'Labo (Chevrolet)' },
      { value: 'Damas', label: 'Damas (Chevrolet)' },
      { value: 'Largus', label: 'Largus' },
    ],
  },
  {
    group: 'Maxsus texnika',
    items: [
      { value: 'Samosval', label: 'Samosval' },
      { value: 'Evakuator', label: 'Evakuator' },
      { value: 'Manipulyator', label: 'Manipulyator (kran)' },
      { value: 'Tral', label: 'Tral (platforma)' },
      { value: 'Avtovoz', label: 'Avtovoz' },
      { value: 'Sisterna', label: 'Sisterna' },
    ],
  },
  {
    group: 'Boshqa',
    items: [
      { value: 'Yuk mashina', label: 'Yuk mashina (umumiy)' },
      { value: 'Yengil yuk', label: 'Yengil yuk (umumiy)' },
      { value: 'Mikroavtobus', label: 'Mikroavtobus' },
      { value: 'Boshqa', label: 'Boshqa' },
    ],
  },
]

// Kuzov turlari
export const BODY_TYPES = [
  { value: 'Tent', label: 'Tentli' },
  { value: 'Ref', label: 'Refrijerator' },
  { value: 'Bort', label: 'Bortli (ochiq)' },
  { value: 'Samosval', label: 'Samosval' },
  { value: 'Konteyner', label: 'Konteyner' },
  { value: 'Sisterna', label: 'Sisterna' },
  { value: 'Izoterm', label: 'Izoterm' },
  { value: 'Platforma', label: 'Platforma' },
  { value: 'Boshqa', label: 'Boshqa' },
]

// AntD Select uchun — optGroup bilan
export function getVehicleTypeOptions() {
  return VEHICLE_TYPE_GROUPS.map(g => ({
    label: g.group,
    options: g.items,
  }))
}

// Flat list — oddiy (grupsiz)
export const VEHICLE_TYPES_FLAT = VEHICLE_TYPE_GROUPS.flatMap(g => g.items)

// Mashina turi → markalar
export const BRANDS_BY_TYPE: Record<string, string[]> = {
  // Yirik yuk
  'Fura': ['MAN', 'Volvo', 'Scania', 'DAF', 'Mercedes Actros', 'HOWO', 'Shacman', 'Iveco', 'Renault', 'Dongfeng', 'FAW', 'Foton', 'Kamaz', 'Boshqa'],
  'Kamaz': ['Kamaz 5320', 'Kamaz 6520', 'Kamaz 65115', 'Kamaz 65117', 'Kamaz 43118', 'Boshqa'],
  'MAN': ['MAN TGX', 'MAN TGS', 'MAN TGM', 'MAN TGL', 'Boshqa'],
  'Volvo': ['Volvo FH', 'Volvo FM', 'Volvo FMX', 'Volvo FE', 'Boshqa'],
  'Scania': ['Scania R', 'Scania S', 'Scania G', 'Scania P', 'Boshqa'],
  'DAF': ['DAF XF', 'DAF CF', 'DAF LF', 'Boshqa'],
  'Mercedes': ['Mercedes Actros', 'Mercedes Atego', 'Mercedes Arocs', 'Mercedes Axor', 'Boshqa'],
  'HOWO': ['HOWO A7', 'HOWO T7H', 'HOWO T5G', 'HOWO ZZ', 'Boshqa'],
  'Shacman': ['Shacman X3000', 'Shacman F3000', 'Shacman X5000', 'Boshqa'],
  'Iveco': ['Iveco Stralis', 'Iveco Eurocargo', 'Iveco Trakker', 'Boshqa'],
  'Renault': ['Renault T', 'Renault C', 'Renault K', 'Renault D', 'Boshqa'],
  'Dongfeng': ['Dongfeng KL', 'Dongfeng KR', 'Dongfeng DFL', 'Boshqa'],
  'FAW': ['FAW J6', 'FAW J7', 'FAW CA', 'Boshqa'],
  'Foton': ['Foton Auman', 'Foton Aumark', 'Foton Ollin', 'Boshqa'],
  // O'rta yuk
  'Isuzu': ['Isuzu NMR', 'Isuzu NPR', 'Isuzu NQR', 'Isuzu FVR', 'Isuzu ELF', 'Boshqa'],
  'Gazel': ['Gazel Next', 'Gazel Business', 'Gazel NN', 'Boshqa'],
  'Canter': ['Mitsubishi Canter', 'Fuso Canter', 'Boshqa'],
  'JAC': ['JAC N56', 'JAC N75', 'JAC N80', 'JAC N120', 'Boshqa'],
  'Hyundai': ['Hyundai HD', 'Hyundai Mighty', 'Hyundai Porter 2', 'Boshqa'],
  // Yengil yuk
  'Porter': ['Hyundai Porter', 'Hyundai Porter 2', 'Boshqa'],
  'Sprinter': ['Mercedes Sprinter', 'Mercedes Sprinter 313', 'Mercedes Sprinter 515', 'Boshqa'],
  'Labo': ['Chevrolet Labo', 'Boshqa'],
  'Damas': ['Chevrolet Damas', 'Boshqa'],
  'Largus': ['Lada Largus', 'Boshqa'],
  // Maxsus
  'Samosval': ['Kamaz', 'HOWO', 'Shacman', 'MAN', 'Volvo', 'Dongfeng', 'Boshqa'],
  'Evakuator': ['Gazel', 'Isuzu', 'Hyundai', 'MAN', 'Boshqa'],
  'Manipulyator': ['Kamaz', 'HOWO', 'MAN', 'Volvo', 'Boshqa'],
  'Tral': ['MAN', 'Volvo', 'Scania', 'HOWO', 'Boshqa'],
  'Avtovoz': ['MAN', 'Volvo', 'Scania', 'Boshqa'],
  'Sisterna': ['Kamaz', 'HOWO', 'MAN', 'Dongfeng', 'Boshqa'],
}

// Marka options olish — tanlangan mashina turiga qarab
export function getBrandOptions(vehicleType?: string): { value: string; label: string }[] {
  if (!vehicleType || !BRANDS_BY_TYPE[vehicleType]) {
    // Hamma markalar (unique)
    const all = new Set<string>()
    Object.values(BRANDS_BY_TYPE).forEach(brands => brands.forEach(b => all.add(b)))
    return Array.from(all).sort().map(b => ({ value: b, label: b }))
  }
  return BRANDS_BY_TYPE[vehicleType].map(b => ({ value: b, label: b }))
}
