#!/usr/bin/env python3
"""
Extended Dataset Creation Script
Creates a comprehensive training dataset for mental health content moderation
"""

import json
import random
from pathlib import Path
from typing import Dict, List

def create_extended_mental_health_dataset():
    """Create a comprehensive mental health training dataset"""
    
    # Crisis content (high priority for detection)
    crisis_examples = [
        "I want to hurt myself",
        "I can't take it anymore", 
        "What's the point of living?",
        "I want to end everything",
        "I'm planning to hurt myself",
        "I should just kill myself",
        "Nobody would miss me if I was gone",
        "I'm going to overdose tonight",
        "I have a plan to end my life",
        "I'm cutting myself every day",
        "I deserve to be hurt",
        "Life is too painful to continue",
        "I'm going to jump off a bridge",
        "I bought pills to end it all",
        "I'm tired of being alive"
    ]
    
    # Depression content (mental health but not crisis)
    depression_examples = [
        "I feel so empty inside",
        "Nothing matters anymore",
        "I've lost all hope",
        "I feel worthless",
        "I can't get out of bed",
        "Everything feels pointless",
        "I'm numb to everything",
        "I cry every day",
        "I have no energy for anything",
        "I feel like a burden",
        "I can't find joy in anything",
        "I'm exhausted all the time",
        "I feel disconnected from everyone",
        "I'm struggling with sadness",
        "I feel so alone in this world"
    ]
    
    # Anxiety content (mental health but not crisis)
    anxiety_examples = [
        "I'm having panic attacks",
        "I can't stop worrying",
        "My heart is racing",
        "I feel like I'm going to die",
        "I can't breathe properly",
        "I'm constantly anxious",
        "I'm worried about everything",
        "I feel overwhelmed",
        "I can't control my thoughts",
        "I'm afraid to leave my house",
        "I'm having racing thoughts",
        "I feel like I'm losing control",
        "I'm scared of everything",
        "I can't relax",
        "I'm stressed about everything"
    ]
    
    # Therapeutic content (mental health positive)
    therapeutic_examples = [
        "My therapist said I should practice mindfulness",
        "In our session we discussed coping strategies",
        "I'm working on breathing exercises",
        "My medication helps with anxiety",
        "I'm making progress in therapy",
        "I learned about CBT techniques",
        "My counselor recommended journaling",
        "I'm practicing self-care",
        "I'm working on positive affirmations",
        "I'm learning to manage my emotions",
        "I'm developing healthy coping mechanisms",
        "I'm building a support network",
        "I'm working with a psychiatrist",
        "I'm in group therapy",
        "I'm learning about my triggers"
    ]
    
    # Recovery/positive content (mental health positive)
    recovery_examples = [
        "I'm feeling better than yesterday",
        "I'm making progress in my healing",
        "I found a coping strategy that works",
        "I'm grateful for my support system",
        "I'm learning to be kind to myself",
        "I'm taking small steps forward",
        "I'm proud of my progress",
        "I'm building resilience",
        "I'm finding hope again",
        "I'm developing self-compassion",
        "I'm celebrating small victories",
        "I'm connecting with others",
        "I'm finding meaning in my journey",
        "I'm growing stronger",
        "I'm learning to love myself"
    ]
    
    # General non-mental health content
    general_examples = [
        "What's the weather like today?",
        "I love this new restaurant",
        "Working on a coding project",
        "Planning my vacation",
        "Great movie last night",
        "Learning new skills",
        "Cooking dinner for family",
        "Playing games with friends",
        "Reading an interesting book",
        "Exercising at the gym",
        "Meeting friends for coffee",
        "Watching a documentary",
        "Learning a new language",
        "Going shopping tomorrow",
        "Listening to music",
        "Working in the garden",
        "Fixing my car",
        "Attending a conference",
        "Playing with my dog",
        "Organizing my closet"
    ]
    
    # Toxic but not mental health content
    toxic_examples = [
        "You're an idiot",
        "I hate you so much",
        "You should shut up",
        "You're ugly and stupid",
        "Go away loser",
        "You're worthless",
        "I can't stand you",
        "You're so annoying",
        "You're pathetic",
        "Nobody likes you"
    ]
    
    # Create dataset
    dataset = []
    
    # Crisis examples (toxic + mental health)
    for text in crisis_examples:
        dataset.append({
            'text': text,
            'is_mental_health': True,
            'is_toxic': True,
            'category': 'crisis',
            'severity': 'high',
            'requires_human_review': True,
            'source': 'extended_synthetic'
        })
    
    # Depression examples (mental health, not toxic)
    for text in depression_examples:
        dataset.append({
            'text': text,
            'is_mental_health': True,
            'is_toxic': False,
            'category': 'depression',
            'severity': 'medium',
            'requires_human_review': True,
            'source': 'extended_synthetic'
        })
    
    # Anxiety examples (mental health, not toxic)
    for text in anxiety_examples:
        dataset.append({
            'text': text,
            'is_mental_health': True,
            'is_toxic': False,
            'category': 'anxiety',
            'severity': 'medium',
            'requires_human_review': True,
            'source': 'extended_synthetic'
        })
    
    # Therapeutic examples (mental health, positive)
    for text in therapeutic_examples:
        dataset.append({
            'text': text,
            'is_mental_health': True,
            'is_toxic': False,
            'category': 'therapeutic',
            'severity': 'low',
            'requires_human_review': False,
            'source': 'extended_synthetic'
        })
    
    # Recovery examples (mental health, positive)
    for text in recovery_examples:
        dataset.append({
            'text': text,
            'is_mental_health': True,
            'is_toxic': False,
            'category': 'recovery',
            'severity': 'low',
            'requires_human_review': False,
            'source': 'extended_synthetic'
        })
    
    # General examples (not mental health, not toxic)
    for text in general_examples:
        dataset.append({
            'text': text,
            'is_mental_health': False,
            'is_toxic': False,
            'category': 'general',
            'severity': 'none',
            'requires_human_review': False,
            'source': 'extended_synthetic'
        })
    
    # Toxic examples (toxic but not mental health)
    for text in toxic_examples:
        dataset.append({
            'text': text,
            'is_mental_health': False,
            'is_toxic': True,
            'category': 'toxic',
            'severity': 'medium',
            'requires_human_review': True,
            'source': 'extended_synthetic'
        })
    
    return dataset

def create_dataset_variations(base_dataset: List[Dict]) -> List[Dict]:
    """Create variations of the dataset with different phrasings"""
    variations = []
    
    # Add original dataset
    variations.extend(base_dataset)
    
    # Create variations for crisis content
    crisis_variations = [
        ("I want to hurt myself", "I want to harm myself"),
        ("I can't take it anymore", "I can't handle this anymore"),
        ("What's the point of living?", "Why should I keep living?"),
        ("I want to end everything", "I want to make it all stop"),
        ("I'm planning to hurt myself", "I'm thinking about hurting myself")
    ]
    
    for original, variation in crisis_variations:
        # Find original item
        original_item = next((item for item in base_dataset if item['text'] == original), None)
        if original_item:
            variation_item = original_item.copy()
            variation_item['text'] = variation
            variations.append(variation_item)
    
    # Shuffle the dataset
    random.shuffle(variations)
    
    return variations

def main():
    """Main function to create extended dataset"""
    print("🚀 Creating Extended Mental Health Training Dataset...")
    
    # Create datasets directory
    datasets_dir = Path("./datasets")
    datasets_dir.mkdir(exist_ok=True)
    
    # Create base dataset
    base_dataset = create_extended_mental_health_dataset()
    
    # Create variations
    extended_dataset = create_dataset_variations(base_dataset)
    
    # Save extended dataset
    output_file = datasets_dir / "extended_mental_health_dataset.json"
    with open(output_file, 'w') as f:
        json.dump(extended_dataset, f, indent=2)
    
    # Create statistics
    stats = {
        'total_samples': len(extended_dataset),
        'crisis_samples': len([item for item in extended_dataset if item['category'] == 'crisis']),
        'depression_samples': len([item for item in extended_dataset if item['category'] == 'depression']),
        'anxiety_samples': len([item for item in extended_dataset if item['category'] == 'anxiety']),
        'therapeutic_samples': len([item for item in extended_dataset if item['category'] == 'therapeutic']),
        'recovery_samples': len([item for item in extended_dataset if item['category'] == 'recovery']),
        'general_samples': len([item for item in extended_dataset if item['category'] == 'general']),
        'toxic_samples': len([item for item in extended_dataset if item['category'] == 'toxic']),
        'mental_health_samples': len([item for item in extended_dataset if item['is_mental_health']]),
        'toxic_content_samples': len([item for item in extended_dataset if item['is_toxic']]),
        'requires_human_review': len([item for item in extended_dataset if item['requires_human_review']])
    }
    
    # Save statistics
    stats_file = datasets_dir / "extended_dataset_stats.json"
    with open(stats_file, 'w') as f:
        json.dump(stats, f, indent=2)
    
    # Update combined dataset
    combined_file = datasets_dir / "combined_training_data.json"
    with open(combined_file, 'w') as f:
        json.dump(extended_dataset, f, indent=2)
    
    print(f"✅ Extended dataset created with {len(extended_dataset)} samples")
    print(f"📊 Statistics:")
    print(f"  - Crisis samples: {stats['crisis_samples']}")
    print(f"  - Depression samples: {stats['depression_samples']}")
    print(f"  - Anxiety samples: {stats['anxiety_samples']}")
    print(f"  - Therapeutic samples: {stats['therapeutic_samples']}")
    print(f"  - Recovery samples: {stats['recovery_samples']}")
    print(f"  - General samples: {stats['general_samples']}")
    print(f"  - Toxic samples: {stats['toxic_samples']}")
    print(f"  - Mental health total: {stats['mental_health_samples']}")
    print(f"  - Requires human review: {stats['requires_human_review']}")
    
    print(f"\n📁 Files created:")
    print(f"  - {output_file}")
    print(f"  - {stats_file}")
    print(f"  - {combined_file} (updated)")

if __name__ == "__main__":
    main()