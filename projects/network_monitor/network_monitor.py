import psutil
import platform
import speedtest
import socket
import datetime
import json
from pathlib import Path

class NetworkMonitor:
    def __init__(self):
        self.log_path = Path("network_logs")
        self.log_path.mkdir(exist_ok=True)

    def get_system_info(self):
        """Get basic system information"""
        return {
            "system": platform.system(),
            "node": platform.node(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor()
        }

    def get_network_interfaces(self):
        """Get information about network interfaces"""
        interfaces = {}
        for interface, addresses in psutil.net_if_addrs().items():
            interface_info = []
            for addr in addresses:
                interface_info.append({
                    "address": addr.address,
                    "netmask": addr.netmask,
                    "family": str(addr.family)
                })
            interfaces[interface] = interface_info
        return interfaces

    def test_internet_speed(self):
        """Test internet connection speed"""
        try:
            st = speedtest.Speedtest()
            print("Testing download speed...")
            download_speed = st.download() / 1_000_000  # Convert to Mbps
            print("Testing upload speed...")
            upload_speed = st.upload() / 1_000_000  # Convert to Mbps
            print("Getting ping...")
            ping = st.results.ping
            
            return {
                "download_speed": f"{download_speed:.2f} Mbps",
                "upload_speed": f"{upload_speed:.2f} Mbps",
                "ping": f"{ping:.2f} ms"
            }
        except Exception as e:
            return {
                "error": f"Failed to test internet speed: {str(e)}"
            }

    def check_port_status(self, host, ports):
        """Check if specific ports are open"""
        results = {}
        for port in ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            results[port] = "Open" if result == 0 else "Closed"
            sock.close()
        return results

    def monitor_network_usage(self, duration=60):
        """Monitor network usage for a specified duration in seconds"""
        start_time = datetime.datetime.now()
        start_bytes = psutil.net_io_counters()
        
        while (datetime.datetime.now() - start_time).seconds < duration:
            current_bytes = psutil.net_io_counters()
            bytes_sent = current_bytes.bytes_sent - start_bytes.bytes_sent
            bytes_recv = current_bytes.bytes_recv - start_bytes.bytes_recv
            
            yield {
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv
            }

    def generate_report(self):
        """Generate a comprehensive network report"""
        report = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "system_info": self.get_system_info(),
            "network_interfaces": self.get_network_interfaces(),
            "internet_speed": self.test_internet_speed(),
            "common_ports": self.check_port_status("localhost", [80, 443, 3306, 5432])
        }

        # Save report to file
        report_file = self.log_path / f"network_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=4)

        return report

def main():
    monitor = NetworkMonitor()
    
    print("Starting Network Monitoring Tool...")
    print("\n1. Generating system report...")
    report = monitor.generate_report()
    
    print("\n2. System Information:")
    print(json.dumps(report["system_info"], indent=2))
    
    print("\n3. Internet Speed Test Results:")
    print(json.dumps(report["internet_speed"], indent=2))
    
    print("\n4. Starting real-time network monitoring (30 seconds)...")
    for usage in monitor.monitor_network_usage(duration=30):
        print(f"\rBytes Sent: {usage['bytes_sent']:,} | Bytes Received: {usage['bytes_received']:,}", end="")
    
    print("\n\nMonitoring complete. Check the network_logs directory for detailed reports.")

if __name__ == "__main__":
    main()
