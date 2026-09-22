import { VialIcon, PillIcon, CapsuleIcon, CrossIcon, TubeIcon, BottleIcon } from '../components/icons/MedicineIcons';

// Maps a category name (Thai, from Supabase) to a representative custom
// holographic icon. Falls back to a generic pill bottle for anything
// unmatched, so new categories added later never break the UI.
const RULES = [
  { test: /ปฏิชีวนะ|antibiotic/i, icon: VialIcon },
  { test: /ปวด|ไข้|analgesic/i, icon: PillIcon },
  { test: /วิตามิน|เสริม|supplement/i, icon: CapsuleIcon },
  { test: /เรื้อรัง|chronic/i, icon: CrossIcon },
  { test: /ผิวหนัง|dermatolog/i, icon: TubeIcon },
];

export function getCategoryIcon(name = '') {
  const match = RULES.find((r) => r.test.test(name));
  return match ? match.icon : BottleIcon;
}
