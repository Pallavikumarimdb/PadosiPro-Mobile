export interface TaskKind {
  label: string;
  services: string[];
}

export interface CatalogCategory {
  title: string;
  description: string;
  icon: string;
  comingSoon: boolean;
  kinds: TaskKind[];
}

export const TASKS: CatalogCategory[] = [
  { title: 'Errands & Daily Tasks', description: 'Bills, banks, documents, government work', icon: 'check-square', comingSoon: false,
    kinds: [
      { label: 'Bills & Payments', services: ['Bill payment help', 'Pickup & drop'] },
      { label: 'Bank Work', services: ['Queue & paperwork handling', 'Document collection'] },
      { label: 'Documents', services: ['Document collection', 'Pickup & drop'] },
      { label: 'Government Work', services: ['Queue & paperwork handling', 'Document collection'] },
    ] },
  { title: 'Home Services', description: 'AC, plumbing, electrical, cleaning, repairs', icon: 'home', comingSoon: false,
    kinds: [
      { label: 'Repair', services: ['AC service & repair', 'Plumber visit', 'Electrician visit'] },
      { label: 'Cleaning', services: ['Deep cleaning'] },
      { label: 'Installation', services: ['AC service & repair', 'Electrician visit'] },
    ] },
  { title: 'Travel & Tourism', description: 'Flights, hotels, visas, transfers, itineraries', icon: 'map-pin', comingSoon: false,
    kinds: [
      { label: 'Book Travel', services: ['Language & local guide support', 'Luggage handling & storage'] },
      { label: 'On-Trip Support', services: ['Language & local guide support', 'Luggage handling & storage', 'SIM card & connectivity setup', 'Emergency travel changes handling'] },
      { label: 'Documents & Visa', services: ['SIM card & connectivity setup', 'Emergency travel changes handling'] },
      { label: 'Local Transport', services: ['Language & local guide support', 'Luggage handling & storage'] },
    ] },
  { title: 'Health & Medical', description: 'Doctor visits, pharmacy, labs, physio', icon: 'heart', comingSoon: false,
    kinds: [
      { label: 'Doctor Visit', services: ['Appointment booking'] },
      { label: 'Pharmacy', services: ['Medicine pickup'] },
      { label: 'Lab Tests', services: ['Lab sample collection'] },
    ] },
  { title: 'Senior Care', description: 'Check-ins, medicines, vitals, companionship', icon: 'users', comingSoon: false,
    kinds: [
      { label: 'Check-in', services: ['Daily check-in call'] },
      { label: 'Medicines', services: ['Medicine reminders'] },
      { label: 'Companionship', services: ['Accompanied visits'] },
    ] },
  { title: 'Events & Management', description: 'Weddings, décor, catering, photography', icon: 'calendar', comingSoon: false,
    kinds: [
      { label: 'Weddings', services: ['Vendor coordination'] },
      { label: 'Décor', services: ['Décor setup', 'Vendor coordination'] },
      { label: 'Catering', services: ['Catering order', 'Vendor coordination'] },
    ] },
  { title: 'Home Tech', description: 'WiFi, CCTV, smart locks, device repair', icon: 'wifi', comingSoon: false,
    kinds: [
      { label: 'Setup', services: ['WiFi setup', 'CCTV installation'] },
      { label: 'Repair', services: ['Device repair', 'WiFi setup'] },
    ] },
  { title: 'Relocation Services', description: 'Packers, movers, handover, paperwork', icon: 'truck', comingSoon: false,
    kinds: [
      { label: 'Packing', services: ['Packers booking'] },
      { label: 'Moving', services: ['Movers coordination', 'Handover paperwork'] },
    ] },
  { title: 'NutriFix', description: 'Groceries, food delivery, diet plans, meal prep', icon: 'shopping-bag', comingSoon: true, kinds: [] },
  { title: 'Fashion & Styling', description: 'Salon at home, tailoring, styling, gifting', icon: 'scissors', comingSoon: true, kinds: [] },
  { title: 'Religious & Cultural', description: 'Pandit booking, puja, temple visits', icon: 'star', comingSoon: true, kinds: [] },
  { title: 'Business Support', description: 'Registration, GST, bookkeeping, compliance', icon: 'briefcase', comingSoon: true, kinds: [] },
  { title: 'Education Support', description: 'Tutors, admissions, exam prep', icon: 'book', comingSoon: true, kinds: [] },
  { title: 'Insurance & Loans', description: 'Compare policies, plan loans, paperwork handled', icon: 'shield', comingSoon: true, kinds: [] },
];

export interface TaskRow {
  title: string;
  description: string;
  icon: string;
  comingSoon: boolean;
  kinds: string[];
  servicesByKind: Record<string, string[]>;
}

/** Flatten the catalog into the shape stored in Postgres / served by GET /tasks. */
export function toTaskRow(t: CatalogCategory): TaskRow {
  return {
    title: t.title,
    description: t.description,
    icon: t.icon,
    comingSoon: t.comingSoon,
    kinds: t.kinds.map((k) => k.label),
    servicesByKind: Object.fromEntries(t.kinds.map((k) => [k.label, k.services])),
  };
}
