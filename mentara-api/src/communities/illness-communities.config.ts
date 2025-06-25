// Configuration for communities
export interface CommunityConfig {
  name: string;
  description: string;
  slug: string;
}

export const COMMUNITIES: CommunityConfig[] = [
  {
    name: 'Stress Support Community',
    description:
      'A supportive community for people dealing with stress, pressure, and life challenges. Share coping strategies and find understanding.',
    slug: 'stress-support',
  },
  {
    name: 'Anxiety Warriors',
    description:
      'A safe space for individuals with anxiety disorders. Connect with others who understand the challenges of living with anxiety.',
    slug: 'anxiety-warriors',
  },
  {
    name: 'Depression Support Network',
    description:
      'A compassionate community for those dealing with depression. Find hope, support, and understanding from people who care.',
    slug: 'depression-support',
  },
  {
    name: 'Sleep & Insomnia Support',
    description:
      'A community for people struggling with sleep issues and insomnia. Share tips and find solutions for better sleep.',
    slug: 'insomnia-support',
  },
  {
    name: 'Panic Disorder Support',
    description:
      'A supportive community for individuals with panic disorder. Learn coping strategies and find understanding.',
    slug: 'panic-disorder-support',
  },
  {
    name: 'Bipolar Support Circle',
    description:
      'A community for individuals with bipolar disorder and their loved ones. Share experiences and find support.',
    slug: 'bipolar-support',
  },
  {
    name: 'OCD Support Community',
    description:
      'A safe space for individuals with obsessive-compulsive disorder. Connect with others who understand OCD challenges.',
    slug: 'ocd-support',
  },
  {
    name: 'PTSD Support Network',
    description:
      'A compassionate community for individuals with post-traumatic stress disorder. Find healing and support.',
    slug: 'ptsd-support',
  },
  {
    name: 'Social Anxiety Support',
    description:
      'A community for people with social anxiety. Build confidence and find understanding from others who share similar experiences.',
    slug: 'social-anxiety-support',
  },
  {
    name: 'Phobia Support Group',
    description:
      'A supportive community for individuals dealing with specific phobias. Face fears together and find coping strategies.',
    slug: 'phobia-support',
  },
  {
    name: 'Burnout Recovery',
    description:
      'A community for people experiencing burnout and work-related stress. Find balance and recovery strategies.',
    slug: 'burnout-recovery',
  },
  {
    name: 'Eating Disorder Recovery',
    description:
      'A supportive community for individuals with eating disorders. Find healing, understanding, and recovery support.',
    slug: 'eating-disorder-recovery',
  },
  {
    name: 'ADHD Support Community',
    description:
      'A community for individuals with ADHD/ADD. Share strategies, experiences, and find understanding.',
    slug: 'adhd-support',
  },
  {
    name: 'Substance Recovery Support',
    description:
      'A supportive community for individuals dealing with substance or alcohol use issues. Find recovery and healing.',
    slug: 'substance-recovery-support',
  },
];

// Helper function to get community by slug
export function getCommunityBySlug(slug: string): CommunityConfig | undefined {
  return COMMUNITIES.find((community) => community.slug === slug);
}

// Helper function to get all community names
export function getAllCommunityNames(): string[] {
  return COMMUNITIES.map((community) => community.name);
}
