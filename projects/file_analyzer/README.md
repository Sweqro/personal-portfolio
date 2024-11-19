# File System Analyzer

A powerful Python tool for analyzing file systems, generating statistics, and identifying patterns in directory structures.

## Features

- File type detection and distribution analysis
- File size categorization and visualization
- Large file identification (>100MB)
- Duplicate file detection using MD5 hashing
- Recent file tracking (modified in last 7 days)
- Comprehensive report generation in JSON and Excel formats
- Visual charts and graphs using matplotlib
- Detailed logging system

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python file_analyzer.py <directory_path>
```

Example:
```bash
python file_analyzer.py "C:/Users/YourName/Documents"
```

## Output

The tool generates several output files in the `analysis_output` directory:

1. `analysis_report.json` - Detailed analysis in JSON format
2. `recent_files.xlsx` - Excel spreadsheet of recently modified files
3. `file_types.png` - Pie chart of file type distribution
4. `size_distribution.png` - Bar chart of file size distribution
5. `file_analysis.log` - Detailed log of the analysis process

## Report Contents

The analysis report includes:
- File type statistics
- Size distribution
- Top 10 largest files
- Recently modified files
- Duplicate file groups

## Requirements

- Python 3.7+
- pandas
- matplotlib
- python-magic-bin

## Future Enhancements

- Add support for custom file type filters
- Implement recursive directory depth control
- Add file permission analysis
- Create interactive web dashboard
- Add support for compressed file analysis
