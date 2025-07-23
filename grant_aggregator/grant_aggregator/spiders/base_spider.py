from playwright.sync_api import sync_playwright
import os
import time
import logging
from airtable import Airtable
from ..core.airtable_client import AirtableClient

class BaseScraper:
    def __init__(self, source_name):
        self.source_name = source_name
        self.base_id = os.getenv("AIRTABLE_BASE_ID")
        self.table_name = os.getenv("AIRTABLE_TABLE_NAME")
        self.api_key = os.getenv("AIRTABLE_API_KEY")
        self.client = AirtableClient()
        self.logger = logging.getLogger(__name__)
        self.setup_playwright()
    
    def setup_playwright(self):
        """Initialize Playwright with custom settings"""
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=True,
            args=[
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        self.context = self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        self.page = self.context.new_page()
    
    def close(self):
        """Clean up resources"""
        try:
            self.page.close()
            self.context.close()
            self.browser.close()
            self.playwright.stop()
        except Exception as e:
            self.logger.error(f"Error closing browser: {str(e)}")
    
    def wait_for_element(self, selector, timeout=30):
        """Wait for element to appear with retry logic"""
        for _ in range(3):
            try:
                self.page.wait_for_selector(selector, timeout=timeout*1000)
                return self.page.query_selector(selector)
            except Exception as e:
                self.logger.warning(f"Element not found, retrying... {str(e)}")
                time.sleep(2)
        return None
    
    def extract_text(self, selector, default=""):
        """Extract text from element"""
        element = self.wait_for_element(selector)
        return element.text_content().strip() if element else default
    
    def extract_attribute(self, selector, attribute, default=""):
        """Extract attribute from element"""
        element = self.wait_for_element(selector)
        return element.get_attribute(attribute) if element else default
    
    def scroll_to_bottom(self, scroll_delay=2, max_attempts=5):
        """Scroll to bottom of page to load dynamic content"""
        for _ in range(max_attempts):
            self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(scroll_delay)
    
    def get_current_url(self):
        """Get current page URL"""
        return self.page.url
    
    def save_to_airtable(self, record_data):
        """Save record to Airtable with upsert logic"""
        return self.client.upsert_record(record_data)
    
    def handle_error(self, error_message, traceback=None):
        """Handle and log errors"""
        self.logger.error(f"{self.source_name} - {error_message}")
        if traceback:
            self.logger.exception(traceback)
        self.close()
        return {"error": error_message}
