# Web Automation Framework

A powerful and flexible Python-based web automation framework built with Selenium WebDriver for testing web applications and automating browser interactions.

## Features

- Advanced form filling with multiple locator strategies
- Screenshot capture and management
- Detailed page information extraction
- Test scenario support with JSON configuration
- Comprehensive logging system
- Headless browser support
- Custom wait conditions
- Error handling and recovery

## Installation

```bash
pip install -r requirements.txt
```

## Usage

Basic usage:
```python
from web_automator import WebAutomator

# Create instance (use headless=True for no GUI)
automator = WebAutomator(headless=False)

# Run a test scenario
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

try:
    results = automator.run_test_scenario(scenario)
    print("\nTest Results:")
    for result in results:
        status = "✓" if result['success'] else "✗"
        print(f"{status} {result['step_name']}")
finally:
    automator.close()
```

## Features in Detail

### Form Filling
```python
# Fill form using multiple locator strategies
form_data = {
    "username": "testuser",
    "password": "testpass",
    "email": "test@example.com"
}
automator.fill_form(form_data)
```

### Page Information Extraction
```python
# Extract detailed page information
info = automator.extract_page_info()
print(f"Page Title: {info['title']}")
print(f"Total Links: {len(info['links'])}")
print(f"Total Images: {len(info['images'])}")
```

### Screenshot Management
```python
# Take named screenshot
automator.take_screenshot("homepage")
```

### Custom Wait Conditions
```python
# Wait for specific element
element = automator.wait_for_element(By.ID, "submit-button", timeout=10)
```

## Test Scenario Format

The framework supports JSON-based test scenarios:

```json
{
    "name": "Login Test",
    "stop_on_error": true,
    "steps": [
        {
            "name": "Navigate to Login",
            "action": "navigate",
            "url": "https://example.com/login"
        },
        {
            "name": "Fill Login Form",
            "action": "fill_form",
            "data": {
                "username": "testuser",
                "password": "testpass"
            }
        },
        {
            "name": "Take Screenshot",
            "action": "screenshot",
            "name": "login_complete"
        }
    ]
}
```

## Requirements

- Python 3.7+
- Selenium WebDriver
- Chrome/ChromeDriver
- Other dependencies in requirements.txt

## Future Enhancements

- Support for multiple browsers (Firefox, Edge)
- API testing integration
- Performance metrics collection
- Parallel test execution
- Visual regression testing
- PDF report generation
