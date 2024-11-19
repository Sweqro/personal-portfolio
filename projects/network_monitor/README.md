# Network Monitoring Tool

A comprehensive network monitoring tool built in Python that provides real-time network statistics, system information, and performance metrics.

## Features

- System Information Collection
- Network Interface Analysis
- Internet Speed Testing
- Port Status Checking
- Real-time Network Usage Monitoring
- Automated Report Generation

## Requirements

- Python 3.8+
- Dependencies listed in requirements.txt

## Installation

1. Clone this repository
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the script:
```bash
python network_monitor.py
```

The tool will:
1. Generate a system report
2. Display system information
3. Perform an internet speed test
4. Monitor network usage for 30 seconds
5. Save detailed reports in the network_logs directory

## Output

The tool generates JSON reports containing:
- System information
- Network interface details
- Internet speed test results
- Port status information
- Network usage statistics

Reports are saved in the `network_logs` directory with timestamps.

## Technical Details

### Components

1. **SystemInfo Module**
   - Collects OS and hardware information
   - Uses platform library for system details

2. **NetworkInterface Module**
   - Maps all network interfaces
   - Provides IP addresses and network masks

3. **SpeedTest Module**
   - Measures download and upload speeds
   - Calculates ping times

4. **PortScanner**
   - Checks status of common ports
   - Configurable port list

5. **Usage Monitor**
   - Real-time bandwidth monitoring
   - Tracks bytes sent/received

## Future Enhancements

- GUI interface
- Continuous monitoring mode
- Email notifications for network issues
- Historical data analysis
- Network visualization tools
