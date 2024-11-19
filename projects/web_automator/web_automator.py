import time
import logging
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime

class WebAutomator:
    def __init__(self, headless=False):
        self.setup_logging()
        self.setup_driver(headless)
        self.screenshot_dir = "screenshots"
        self.create_directories()
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('web_automation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('WebAutomator')
        
    def create_directories(self):
        os.makedirs(self.screenshot_dir, exist_ok=True)
        
    def setup_driver(self, headless):
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-notifications')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def navigate_to(self, url):
        """Navigate to a URL and wait for page load"""
        try:
            self.logger.info(f"Navigating to {url}")
            self.driver.get(url)
            return True
        except Exception as e:
            self.logger.error(f"Error navigating to {url}: {str(e)}")
            return False
            
    def wait_for_element(self, by, value, timeout=10):
        """Wait for element to be present and visible"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            self.logger.error(f"Timeout waiting for element {value}")
            return None
            
    def take_screenshot(self, name=None):
        """Take a screenshot of the current page"""
        if name is None:
            name = datetime.now().strftime("%Y%m%d_%H%M%S")
        try:
            filename = f"{self.screenshot_dir}/{name}.png"
            self.driver.save_screenshot(filename)
            self.logger.info(f"Screenshot saved: {filename}")
            return filename
        except Exception as e:
            self.logger.error(f"Error taking screenshot: {str(e)}")
            return None
            
    def fill_form(self, form_data):
        """Fill a form using dictionary of field IDs/names and values"""
        filled_fields = []
        for field_id, value in form_data.items():
            try:
                # Try different locator strategies
                element = None
                for by in [By.ID, By.NAME, By.CSS_SELECTOR]:
                    try:
                        element = self.driver.find_element(by, field_id)
                        break
                    except NoSuchElementException:
                        continue
                        
                if element:
                    element.clear()
                    element.send_keys(value)
                    filled_fields.append(field_id)
                    self.logger.info(f"Filled field {field_id}")
            except Exception as e:
                self.logger.error(f"Error filling field {field_id}: {str(e)}")
                
        return filled_fields
        
    def extract_page_info(self):
        """Extract basic information from the current page"""
        info = {
            'title': self.driver.title,
            'url': self.driver.current_url,
            'links': [],
            'images': [],
            'headers': []
        }
        
        # Extract links
        links = self.driver.find_elements(By.TAG_NAME, 'a')
        for link in links:
            try:
                href = link.get_attribute('href')
                text = link.text
                if href and text:
                    info['links'].append({'text': text, 'href': href})
            except:
                continue
                
        # Extract images
        images = self.driver.find_elements(By.TAG_NAME, 'img')
        for img in images:
            try:
                src = img.get_attribute('src')
                alt = img.get_attribute('alt')
                if src:
                    info['images'].append({'src': src, 'alt': alt})
            except:
                continue
                
        # Extract headers
        for h_level in range(1, 7):
            headers = self.driver.find_elements(By.TAG_NAME, f'h{h_level}')
            for header in headers:
                try:
                    info['headers'].append({
                        'level': h_level,
                        'text': header.text
                    })
                except:
                    continue
                    
        return info
        
    def run_test_scenario(self, scenario):
        """Run a test scenario defined in JSON format"""
        results = []
        try:
            for step in scenario['steps']:
                step_result = {
                    'step_name': step['name'],
                    'success': False,
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                
                try:
                    if step['action'] == 'navigate':
                        success = self.navigate_to(step['url'])
                        step_result['success'] = success
                        
                    elif step['action'] == 'fill_form':
                        filled = self.fill_form(step['data'])
                        step_result['success'] = len(filled) == len(step['data'])
                        step_result['filled_fields'] = filled
                        
                    elif step['action'] == 'screenshot':
                        filename = self.take_screenshot(step.get('name'))
                        step_result['success'] = bool(filename)
                        step_result['filename'] = filename
                        
                    elif step['action'] == 'extract_info':
                        info = self.extract_page_info()
                        step_result['success'] = bool(info)
                        step_result['info'] = info
                        
                    elif step['action'] == 'wait':
                        time.sleep(step.get('seconds', 1))
                        step_result['success'] = True
                        
                except Exception as e:
                    step_result['error'] = str(e)
                    
                results.append(step_result)
                
                if not step_result['success'] and scenario.get('stop_on_error', True):
                    break
                    
        except Exception as e:
            self.logger.error(f"Error running scenario: {str(e)}")
            
        return results
        
    def close(self):
        """Close the browser and clean up"""
        try:
            self.driver.quit()
            self.logger.info("Browser closed successfully")
        except Exception as e:
            self.logger.error(f"Error closing browser: {str(e)}")
            
def main():
    # Example test scenario
    scenario = {
        "name": "Basic Web Test",
        "stop_on_error": True,
        "steps": [
            {
                "name": "Visit Website",
                "action": "navigate",
                "url": "https://www.example.com"
            },
            {
                "name": "Capture Screenshot",
                "action": "screenshot",
                "name": "example_home"
            },
            {
                "name": "Extract Page Info",
                "action": "extract_info"
            }
        ]
    }
    
    automator = WebAutomator(headless=False)
    try:
        results = automator.run_test_scenario(scenario)
        
        # Save results
        with open('test_results.json', 'w') as f:
            json.dump(results, f, indent=4)
            
        print("\nTest Results:")
        for result in results:
            status = "✓" if result['success'] else "✗"
            print(f"{status} {result['step_name']}")
            
    finally:
        automator.close()
        
if __name__ == "__main__":
    main()
