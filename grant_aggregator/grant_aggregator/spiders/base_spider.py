import scrapy
import time

class BaseSpider(scrapy.Spider):
    """
    A base spider with common functionalities for all spiders.
    """
    name = "base"

    def __init__(self, *args, **kwargs):
        super(BaseSpider, self).__init__(*args, **kwargs)
        self.start_time = time.time()

    def parse(self, response):
        """
        This method is to be overridden by subclasses.
        """
        raise NotImplementedError

    def respectful_request(self, url, callback):
        """
        Makes a request with a 5-second delay.
        """
        time.sleep(5)
        return scrapy.Request(url=url, callback=callback)
