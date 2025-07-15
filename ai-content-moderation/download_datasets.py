#!/usr/bin/env python3
"""
Dataset Download and Preparation Script
Downloads and prepares training datasets: ToxiGen, DeToxy, HatEval
"""

import os
import requests
import json
import zipfile
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatasetDownloader:
    """Downloads and prepares toxicity detection datasets"""
    
    def __init__(self, data_dir: str = "./datasets"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Dataset URLs and configurations
        self.datasets = {
            'toxigen': {
                'url': 'https://github.com/microsoft/TOXIGEN/archive/refs/heads/main.zip',
                'description': 'ToxiGen: Large-scale machine-generated dataset for adversarial and implicit hate speech detection'
            },
            'detoxy': {
                'url': 'https://github.com/kris-brown/detoxy/archive/refs/heads/master.zip',
                'description': 'DeToxy: Dataset for toxicity detection and mitigation'
            },
            'hateval': {
                'url': 'https://hasocfire.github.io/hasoc/2019/files/english_dataset.zip',
                'description': 'HatEval: Multilingual Detection of Hate Speech'
            }
        }
        
        # Mental health specific patterns to augment datasets
        self.mental_health_patterns = {
            'crisis': [
                "I want to hurt myself",
                "I can't take it anymore",
                "What's the point of living?",
                "I want to end everything",
                "I'm planning to hurt myself"
            ],
            'depression': [
                "I feel so empty inside",
                "Nothing matters anymore",
                "I've lost all hope",
                "I feel worthless",
                "I can't get out of bed"
            ],
            'anxiety': [
                "I'm having panic attacks",
                "I can't stop worrying",
                "My heart is racing",
                "I feel like I'm going to die",
                "I can't breathe properly"
            ],
            'therapeutic': [
                "My therapist said I should",
                "In our session we discussed",
                "I'm working on coping strategies",
                "My medication helps with",
                "I'm making progress in therapy"
            ]
        }
    
    def download_file(self, url: str, filename: str) -> bool:
        """Download a file from URL"""
        try:
            logger.info(f"Downloading {filename} from {url}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            filepath = self.data_dir / filename
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded {filename} ({filepath.stat().st_size} bytes)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to download {filename}: {e}")
            return False
    
    def extract_zip(self, zip_path: Path, extract_to: Path) -> bool:
        """Extract ZIP file"""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            logger.info(f"Extracted {zip_path} to {extract_to}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to extract {zip_path}: {e}")
            return False
    
    def download_toxigen(self) -> bool:
        """Download and prepare ToxiGen dataset"""
        dataset_dir = self.data_dir / 'toxigen'
        dataset_dir.mkdir(exist_ok=True)
        
        zip_path = dataset_dir / 'toxigen.zip'
        
        if not zip_path.exists():
            success = self.download_file(self.datasets['toxigen']['url'], zip_path.name)
            if not success:
                return False
        
        # Extract
        extract_dir = dataset_dir / 'extracted'
        if not extract_dir.exists():
            self.extract_zip(zip_path, extract_dir)
        
        # Process ToxiGen data
        try:
            # Look for data files in the extracted directory
            toxigen_root = extract_dir / 'TOXIGEN-main'
            if toxigen_root.exists():
                data_files = list(toxigen_root.glob('**/*.jsonl'))
                if data_files:
                    processed_data = []
                    for data_file in data_files[:3]:  # Process first 3 files
                        with open(data_file, 'r') as f:
                            for line in f:
                                try:
                                    data = json.loads(line.strip())
                                    processed_data.append({
                                        'text': data.get('text', ''),
                                        'is_toxic': data.get('toxicity', 0) > 0.5,
                                        'source': 'toxigen'
                                    })
                                except:
                                    continue
                    
                    # Save processed data
                    output_file = dataset_dir / 'toxigen_processed.json'
                    with open(output_file, 'w') as f:
                        json.dump(processed_data, f, indent=2)
                    
                    logger.info(f"Processed {len(processed_data)} ToxiGen samples")
                    return True
            
            logger.warning("ToxiGen data files not found in expected location")
            return False
            
        except Exception as e:
            logger.error(f"Failed to process ToxiGen data: {e}")
            return False
    
    def download_detoxy(self) -> bool:
        """Download and prepare DeToxy dataset"""
        dataset_dir = self.data_dir / 'detoxy'
        dataset_dir.mkdir(exist_ok=True)
        
        zip_path = dataset_dir / 'detoxy.zip'
        
        if not zip_path.exists():
            success = self.download_file(self.datasets['detoxy']['url'], zip_path.name)
            if not success:
                return False
        
        # Extract
        extract_dir = dataset_dir / 'extracted'
        if not extract_dir.exists():
            self.extract_zip(zip_path, extract_dir)
        
        # Process DeToxy data
        try:
            detoxy_root = extract_dir / 'detoxy-master'
            if detoxy_root.exists():
                # Look for CSV files
                csv_files = list(detoxy_root.glob('**/*.csv'))
                if csv_files:
                    processed_data = []
                    for csv_file in csv_files[:2]:  # Process first 2 files
                        try:
                            df = pd.read_csv(csv_file)
                            for _, row in df.iterrows():
                                processed_data.append({
                                    'text': str(row.get('text', row.get('comment', ''))),
                                    'is_toxic': bool(row.get('toxic', row.get('toxicity', 0)) > 0.5),
                                    'source': 'detoxy'
                                })
                        except Exception as e:
                            logger.warning(f"Error processing {csv_file}: {e}")
                            continue
                    
                    # Save processed data
                    output_file = dataset_dir / 'detoxy_processed.json'
                    with open(output_file, 'w') as f:
                        json.dump(processed_data, f, indent=2)
                    
                    logger.info(f"Processed {len(processed_data)} DeToxy samples")
                    return True
            
            logger.warning("DeToxy data files not found in expected location")
            return False
            
        except Exception as e:
            logger.error(f"Failed to process DeToxy data: {e}")
            return False
    
    def create_mental_health_dataset(self) -> bool:
        """Create mental health specific training dataset"""
        dataset_dir = self.data_dir / 'mental_health'
        dataset_dir.mkdir(exist_ok=True)
        
        try:
            mental_health_data = []
            
            # Add mental health positive examples
            for category, patterns in self.mental_health_patterns.items():
                for pattern in patterns:
                    mental_health_data.append({
                        'text': pattern,
                        'is_mental_health': True,
                        'is_toxic': category == 'crisis',  # Crisis content is toxic
                        'category': category,
                        'source': 'mental_health_synthetic'
                    })
            
            # Add non-mental health examples
            non_mental_health_examples = [
                "What's the weather like today?",
                "I love this new restaurant",
                "Working on a coding project",
                "Planning my vacation",
                "Great movie last night",
                "Learning new skills",
                "Cooking dinner for family",
                "Playing games with friends",
                "Reading an interesting book",
                "Exercising at the gym"
            ]
            
            for example in non_mental_health_examples:
                mental_health_data.append({
                    'text': example,
                    'is_mental_health': False,
                    'is_toxic': False,
                    'category': 'general',
                    'source': 'mental_health_synthetic'
                })
            
            # Save dataset
            output_file = dataset_dir / 'mental_health_training.json'
            with open(output_file, 'w') as f:
                json.dump(mental_health_data, f, indent=2)
            
            logger.info(f"Created mental health dataset with {len(mental_health_data)} samples")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create mental health dataset: {e}")
            return False
    
    def create_combined_dataset(self) -> bool:
        """Combine all datasets into a unified training set"""
        try:
            combined_data = []
            
            # Load all processed datasets
            dataset_files = [
                self.data_dir / 'toxigen' / 'toxigen_processed.json',
                self.data_dir / 'detoxy' / 'detoxy_processed.json',
                self.data_dir / 'mental_health' / 'mental_health_training.json'
            ]
            
            for dataset_file in dataset_files:
                if dataset_file.exists():
                    with open(dataset_file, 'r') as f:
                        data = json.load(f)
                        combined_data.extend(data)
                        logger.info(f"Loaded {len(data)} samples from {dataset_file.name}")
            
            # Save combined dataset
            output_file = self.data_dir / 'combined_training_data.json'
            with open(output_file, 'w') as f:
                json.dump(combined_data, f, indent=2)
            
            # Create summary statistics
            total_samples = len(combined_data)
            toxic_samples = sum(1 for item in combined_data if item.get('is_toxic', False))
            mental_health_samples = sum(1 for item in combined_data if item.get('is_mental_health', False))
            
            summary = {
                'total_samples': total_samples,
                'toxic_samples': toxic_samples,
                'mental_health_samples': mental_health_samples,
                'non_toxic_samples': total_samples - toxic_samples,
                'sources': list(set(item.get('source', 'unknown') for item in combined_data))
            }
            
            with open(self.data_dir / 'dataset_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info(f"Created combined dataset with {total_samples} samples")
            logger.info(f"Toxic: {toxic_samples}, Mental Health: {mental_health_samples}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to create combined dataset: {e}")
            return False
    
    def download_all(self) -> Dict[str, bool]:
        """Download and prepare all datasets"""
        results = {}
        
        logger.info("🚀 Starting dataset download and preparation...")
        
        # Download individual datasets
        results['toxigen'] = self.download_toxigen()
        results['detoxy'] = self.download_detoxy()
        results['mental_health'] = self.create_mental_health_dataset()
        
        # Create combined dataset
        results['combined'] = self.create_combined_dataset()
        
        # Generate summary
        success_count = sum(1 for success in results.values() if success)
        logger.info(f"📊 Dataset preparation complete: {success_count}/{len(results)} successful")
        
        return results

def main():
    """Main function"""
    downloader = DatasetDownloader()
    results = downloader.download_all()
    
    print("\n" + "="*50)
    print("🎯 DATASET PREPARATION RESULTS")
    print("="*50)
    
    for dataset, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{dataset.upper()}: {status}")
    
    if all(results.values()):
        print("\n🎉 All datasets prepared successfully!")
        print(f"📁 Data directory: {downloader.data_dir}")
        print("\nNext steps:")
        print("1. Review datasets in ./datasets/ directory")
        print("2. Use combined_training_data.json for model training")
        print("3. Check dataset_summary.json for statistics")
    else:
        print("\n⚠️  Some datasets failed to download")
        print("Check logs above for details")

if __name__ == "__main__":
    main()