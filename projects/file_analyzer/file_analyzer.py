import os
import sys
import hashlib
import magic
import datetime
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from collections import defaultdict
import logging
import json

class FileSystemAnalyzer:
    def __init__(self, root_path):
        self.root_path = Path(root_path)
        self.setup_logging()
        self.file_types = defaultdict(int)
        self.size_distribution = defaultdict(int)
        self.large_files = []
        self.duplicate_files = defaultdict(list)
        self.recent_files = []
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('file_analysis.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('FileAnalyzer')

    def calculate_file_hash(self, file_path):
        """Calculate MD5 hash of a file"""
        try:
            hash_md5 = hashlib.md5()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            self.logger.error(f"Error calculating hash for {file_path}: {str(e)}")
            return None

    def get_file_type(self, file_path):
        """Determine file type using python-magic"""
        try:
            return magic.from_file(str(file_path), mime=True)
        except Exception as e:
            self.logger.error(f"Error determining file type for {file_path}: {str(e)}")
            return "unknown/unknown"

    def analyze_directory(self):
        """Analyze the directory structure and collect statistics"""
        self.logger.info(f"Starting analysis of {self.root_path}")
        
        for file_path in self.root_path.rglob("*"):
            if file_path.is_file():
                try:
                    # Get file stats
                    stats = file_path.stat()
                    file_size = stats.st_size
                    mod_time = datetime.datetime.fromtimestamp(stats.st_mtime)
                    
                    # Update file type statistics
                    file_type = self.get_file_type(file_path)
                    self.file_types[file_type] += 1
                    
                    # Update size distribution
                    size_category = self.categorize_size(file_size)
                    self.size_distribution[size_category] += 1
                    
                    # Track large files (>100MB)
                    if file_size > 100_000_000:
                        self.large_files.append({
                            'path': str(file_path),
                            'size': file_size,
                            'type': file_type
                        })
                    
                    # Track recently modified files (last 7 days)
                    if (datetime.datetime.now() - mod_time).days <= 7:
                        self.recent_files.append({
                            'path': str(file_path),
                            'modified': mod_time.strftime('%Y-%m-%d %H:%M:%S'),
                            'type': file_type
                        })
                    
                    # Check for duplicates
                    file_hash = self.calculate_file_hash(file_path)
                    if file_hash:
                        self.duplicate_files[file_hash].append(str(file_path))
                        
                except Exception as e:
                    self.logger.error(f"Error processing {file_path}: {str(e)}")

    def categorize_size(self, size):
        """Categorize file size into ranges"""
        if size < 1024:  # < 1KB
            return "< 1KB"
        elif size < 1024 * 1024:  # < 1MB
            return "< 1MB"
        elif size < 1024 * 1024 * 10:  # < 10MB
            return "< 10MB"
        elif size < 1024 * 1024 * 100:  # < 100MB
            return "< 100MB"
        else:
            return "> 100MB"

    def generate_visualizations(self):
        """Generate visual representations of the analysis"""
        output_dir = Path("analysis_output")
        output_dir.mkdir(exist_ok=True)
        
        # File types pie chart
        plt.figure(figsize=(10, 8))
        plt.pie(self.file_types.values(), labels=self.file_types.keys(), autopct='%1.1f%%')
        plt.title('File Type Distribution')
        plt.savefig(output_dir / 'file_types.png')
        plt.close()
        
        # Size distribution bar chart
        plt.figure(figsize=(10, 6))
        plt.bar(self.size_distribution.keys(), self.size_distribution.values())
        plt.title('File Size Distribution')
        plt.xticks(rotation=45)
        plt.savefig(output_dir / 'size_distribution.png')
        plt.close()

    def generate_report(self):
        """Generate a comprehensive analysis report"""
        report = {
            'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'root_path': str(self.root_path),
            'statistics': {
                'file_types': dict(self.file_types),
                'size_distribution': dict(self.size_distribution),
                'large_files': self.large_files[:10],  # Top 10 largest files
                'recent_files': self.recent_files[:10],  # 10 most recent files
                'duplicates': {k: v for k, v in self.duplicate_files.items() if len(v) > 1}
            }
        }
        
        # Save report as JSON
        output_dir = Path("analysis_output")
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / 'analysis_report.json', 'w') as f:
            json.dump(report, f, indent=4)
        
        # Generate Excel report
        df_files = pd.DataFrame(self.recent_files)
        df_files.to_excel(output_dir / 'recent_files.xlsx', index=False)
        
        return report

def main():
    if len(sys.argv) != 2:
        print("Usage: python file_analyzer.py <directory_path>")
        sys.exit(1)
    
    directory = sys.argv[1]
    analyzer = FileSystemAnalyzer(directory)
    
    print("Starting file system analysis...")
    analyzer.analyze_directory()
    
    print("Generating visualizations...")
    analyzer.generate_visualizations()
    
    print("Generating report...")
    report = analyzer.generate_report()
    
    print("\nAnalysis complete! Check the 'analysis_output' directory for results.")
    
    # Print summary
    print("\nQuick Summary:")
    print(f"Total file types found: {len(report['statistics']['file_types'])}")
    print(f"Large files (>100MB): {len(report['statistics']['large_files'])}")
    print(f"Recent files (7 days): {len(report['statistics']['recent_files'])}")
    print(f"Duplicate file groups: {len(report['statistics']['duplicates'])}")

if __name__ == "__main__":
    main()
