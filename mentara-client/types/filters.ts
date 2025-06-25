export interface TherapistFilters {
  specialties: string[];
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  availability: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    weekends: boolean;
  };
  insurance: string[];
  languages: string[];
  experienceLevel: {
    min: number;
    max: number;
  };
  rating: number;
  sortBy: 'rating' | 'price' | 'experience' | 'availability' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface PriceRange {
  min: number;
  max: number;
  step: number;
}

export interface ExperienceRange {
  min: number;
  max: number;
  step: number;
}

export const DEFAULT_FILTERS: TherapistFilters = {
  specialties: [],
  priceRange: {
    min: 0,
    max: 500,
  },
  location: '',
  availability: {
    morning: false,
    afternoon: false,
    evening: false,
    weekends: false,
  },
  insurance: [],
  languages: [],
  experienceLevel: {
    min: 0,
    max: 50,
  },
  rating: 0,
  sortBy: 'rating',
  sortOrder: 'desc',
};

export const SPECIALTY_OPTIONS: FilterOption[] = [
  { value: 'cbt', label: 'Cognitive Behavioral Therapy (CBT)' },
  { value: 'dbt', label: 'Dialectical Behavior Therapy (DBT)' },
  { value: 'emdr', label: 'EMDR' },
  { value: 'anxiety', label: 'Anxiety Disorders' },
  { value: 'depression', label: 'Depression' },
  { value: 'trauma', label: 'Trauma & PTSD' },
  { value: 'relationship', label: 'Relationship Counseling' },
  { value: 'family', label: 'Family Therapy' },
  { value: 'substance', label: 'Substance Abuse' },
  { value: 'eating', label: 'Eating Disorders' },
  { value: 'bipolar', label: 'Bipolar Disorder' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'stress', label: 'Stress Management' },
  { value: 'adolescent', label: 'Adolescent Therapy' },
];

export const INSURANCE_OPTIONS: FilterOption[] = [
  { value: 'aetna', label: 'Aetna' },
  { value: 'bcbs', label: 'Blue Cross Blue Shield' },
  { value: 'cigna', label: 'Cigna' },
  { value: 'humana', label: 'Humana' },
  { value: 'kaiser', label: 'Kaiser Permanente' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'unitedhealthcare', label: 'UnitedHealthcare' },
  { value: 'tricare', label: 'Tricare' },
  { value: 'out-of-network', label: 'Out of Network' },
];

export const LANGUAGE_OPTIONS: FilterOption[] = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'japanese', label: 'Japanese' },
];

export const LOCATION_OPTIONS: FilterOption[] = [
  { value: 'alberta', label: 'Alberta' },
  { value: 'british-columbia', label: 'British Columbia' },
  { value: 'manitoba', label: 'Manitoba' },
  { value: 'new-brunswick', label: 'New Brunswick' },
  { value: 'newfoundland', label: 'Newfoundland and Labrador' },
  { value: 'northwest-territories', label: 'Northwest Territories' },
  { value: 'nova-scotia', label: 'Nova Scotia' },
  { value: 'nunavut', label: 'Nunavut' },
  { value: 'ontario', label: 'Ontario' },
  { value: 'prince-edward-island', label: 'Prince Edward Island' },
  { value: 'quebec', label: 'Quebec' },
  { value: 'saskatchewan', label: 'Saskatchewan' },
  { value: 'yukon', label: 'Yukon' },
];

export const SORT_OPTIONS: FilterOption[] = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: 'experience', label: 'Most Experience' },
  { value: 'availability', label: 'Earliest Available' },
  { value: 'name', label: 'Name (A-Z)' },
];

export const PRICE_RANGE: PriceRange = {
  min: 50,
  max: 500,
  step: 10,
};

export const EXPERIENCE_RANGE: ExperienceRange = {
  min: 0,
  max: 50,
  step: 1,
};