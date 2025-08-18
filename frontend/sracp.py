import requests
from bs4 import BeautifulSoup
import os
import json
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def _parse_percentage(style_string):
    """A helper function to extract the width percentage from a style attribute."""
    if not style_string:
        return "0.0"
    match = re.search(r'width:\s*([\d.]+)%', style_string)
    if match:
        return match.group(1)
    return "0.0"

def scrape_fragrance_page(url):
    """
    Scrapes a fragrance page using Selenium to bypass bot protection,
    then parses with BeautifulSoup.
    """
    # --- Selenium Setup to control a real browser ---
    print("Setting up browser with Selenium...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Runs Chrome in the background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    # Use webdriver-manager to automatically handle the driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        print(f"Navigating to {url} with a real browser...")
        driver.get(url)
        
        # IMPORTANT: Wait for the page and any JavaScript challenges to load
        # You might need to increase this time if your connection is slow
        print("Waiting for page to load completely (5 seconds)...")
        time.sleep(5)
        
        # Get the final HTML content after JavaScript has run
        html_content = driver.page_source
        
    finally:
        print("Closing browser.")
        driver.quit()

    soup = BeautifulSoup(html_content, 'html.parser')
    print("Parsing final HTML content...")
    
    fragrance_data = {}

    # --- Section 1: Get Product Name and Brand ---
    try:
        name_h1 = soup.find('h1', itemprop='name')
        fragrance_data['name'] = name_h1.find(string=True, recursive=False).strip()
        fragrance_data['brand'] = name_h1.find('span', itemprop='name').text.strip()
    except (AttributeError, TypeError):
        print("WARNING: Could not find product name or brand.")
        fragrance_data['name'] = "Unknown"
        fragrance_data['brand'] = "Unknown"

    # --- Section 2: Get Main Accords ---
    fragrance_data['main_accords'] = []
    try:
        accord_header = soup.find(lambda tag: tag.name in ['h2', 'div'] and 'main accords' in tag.get_text(strip=True).lower())
        accord_container = accord_header.find_next_sibling('div')
        for accord_box in accord_container.find_all('div', class_='accord-box'):
            bar = accord_box.find('div', class_='accord-bar')
            if bar:
                fragrance_data['main_accords'].append({
                    'accord': bar.text.strip(),
                    'percentage': _parse_percentage(bar.get('style', ''))
                })
    except (AttributeError, TypeError):
        print("WARNING: Could not parse main accords.")

    # --- Section 3: Get User Collection Stats ---
    fragrance_data['user_collection_stats'] = {}
    try:
        stats_container = soup.find('span', string='I have it').find_parent('div', style=lambda s: 'justify-content: space-around' in s)
        for button in stats_container.find_all('div', recursive=False):
            name_span = button.find('span', class_='vote-button-name')
            bar_div = button.select_one('div[style*="width:"]')
            if name_span and bar_div:
                stat_name = name_span.text.strip().lower().replace(' ', '_')
                fragrance_data['user_collection_stats'][stat_name] = _parse_percentage(bar_div.get('style', ''))
    except (AttributeError, TypeError):
        print("WARNING: Could not parse user collection stats.")

    # --- Section 4 & 5: Ratings and Usage (Seasons/Time) ---
    fragrance_data['ratings'] = {}
    fragrance_data['usage'] = {}
    containers = soup.find_all('div', style=lambda s: s and 'justify-content: space-evenly' in s)
    for container in containers:
        legends = [lg.text.strip().lower() for lg in container.find_all('span', class_='vote-button-legend')]
        if 'love' in legends: # This is the ratings container
             for item in container.find_all('div', recursive=False):
                legend = item.find('span', class_='vote-button-legend')
                bar_div = item.select_one('div[style*="width:"]')
                if legend and bar_div:
                    fragrance_data['ratings'][legend.text.strip().lower()] = _parse_percentage(bar_div.get('style', ''))
        elif 'winter' in legends: # This is the usage container
             for item in container.find_all('div', recursive=False):
                legend = item.find('span', class_='vote-button-legend')
                bar_div = item.select_one('div[style*="width:"]')
                if legend and bar_div:
                    fragrance_data['usage'][legend.text.strip().lower()] = _parse_percentage(bar_div.get('style', ''))
    
    # --- Section 6: Pros and Cons ---
    fragrance_data['pros'] = []
    fragrance_data['cons'] = []
    try:
        pros_header = soup.find('h4', string=re.compile(r'\s*Pros\s*'))
        if pros_header:
            pros_container = pros_header.find_parent('div', class_='cell')
            for item in pros_container.find_all('div', class_='cell small-12'):
                if item.find('span'):
                    fragrance_data['pros'].append({
                        'text': item.find('span').next_sibling.strip(),
                        'up_votes': item.select_one('div.vote-box-sp-ai:nth-of-type(1) span.num-votes-sp').text.strip(),
                        'down_votes': item.select_one('div.vote-box-sp-ai:nth-of-type(2) span.num-votes-sp').text.strip()
                    })
    except (AttributeError, TypeError):
        print("WARNING: Could not parse pros.")
        
    try:
        cons_header = soup.find('h4', string=re.compile(r'\s*Cons\s*'))
        if cons_header:
            cons_container = cons_header.find_parent('div', class_='cell')
            for item in cons_container.find_all('div', class_='cell small-12'):
                if item.find('span'):
                    fragrance_data['cons'].append({
                        'text': item.find('span').next_sibling.strip(),
                        'up_votes': item.select_one('div.vote-box-sp-ai:nth-of-type(1) span.num-votes-sp').text.strip(),
                        'down_votes': item.select_one('div.vote-box-sp-ai:nth-of-type(2) span.num-votes-sp').text.strip()
                    })
    except (AttributeError, TypeError):
        print("WARNING: Could not parse cons.")

    # --- Image Download (using requests for efficiency) ---
    try:
        image_tag = soup.find('img', itemprop='image')
        image_url = image_tag['src']
        print(f"Found image URL: {image_url}")
        
        image_folder = "fragrance_images"
        os.makedirs(image_folder, exist_ok=True)
        
        file_name = "".join(x for x in fragrance_data.get('name', 'image') if x.isalnum()).rstrip() or "image"
        image_path = os.path.join(image_folder, f"{file_name}.jpg")

        img_response = requests.get(image_url, stream=True, headers={"User-Agent": "Mozilla/5.0"})
        img_response.raise_for_status()
        with open(image_path, 'wb') as f:
            for chunk in img_response.iter_content(1024):
                f.write(chunk)
        print(f"Image downloaded successfully to {image_path}")
        fragrance_data['image_local_path'] = image_path
    except (AttributeError, TypeError, requests.exceptions.RequestException) as e:
        print(f"WARNING: Could not download image. Reason: {e}")

    # --- Save Data to JSON ---
    json_filename = ("".join(x for x in fragrance_data.get('name', 'data') if x.isalnum()).rstrip() or "data") + ".json"
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(fragrance_data, f, ensure_ascii=False, indent=4)
    print(f"\nScraping complete. All available data saved to {json_filename}")

if __name__ == "__main__":
    TARGET_URL = "https://www.fragrantica.com/perfume/Lattafa-Perfumes/Khamrah-75805.html"
    scrape_fragrance_page(TARGET_URL)