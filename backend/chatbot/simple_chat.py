from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import re
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from parent directory
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
    try:
        # Using latest Gemini 2.5 Flash model
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        print("✓ Gemini 2.5 Flash configured successfully")
    except Exception as e:
        print(f"⚠ Gemini configuration error: {e}")
        # Disable AI, chatbot will still work for product search
        gemini_model = None
        print("ℹ Chatbot will use keyword search (no AI advice mode)")
else:
    gemini_model = None
    print("⚠ Gemini API key not found, using keyword search only")

# Load perfume data
df = None

def load_perfumes():
    global df
    try:
        df = pd.read_csv('archive/fra_perfumes.csv')
        print(f"Loaded {len(df)} perfumes")
        return True
    except Exception as e:
        print(f"Error loading data: {e}")
        return False

def is_advice_question(query):
    """Detect if user is asking for advice/tips rather than product search"""
    advice_keywords = [
        'how to', 'how do', 'what is', 'why', 'when', 'tips', 'advice', 
        'guide', 'best way', 'should i', 'can i', 'help me', 'explain',
        'difference between', ' vs ', ' versus ', 'better', 'choose', 'select', 'pick',
        'layering', 'apply', 'wear', 'store', 'last longer', 'projection',
        'longevity', 'sillage', 'what are', 'tell me about', 'learn about',
        'niche vs', 'designer vs', 'difference', 'compare', 'comparison'
    ]
    query_lower = query.lower()
    
    # Check for comparison patterns (X vs Y, X versus Y)
    if ' vs ' in query_lower or ' versus ' in query_lower:
        return True
    
    return any(keyword in query_lower for keyword in advice_keywords)

def generate_advice_response(query):
    """Generate advice/educational response using Gemini AI"""
    if not gemini_model:
        return None
    
    try:
        prompt = f"""You are an expert perfume consultant. A customer asked: "{query}"

This is an educational question about perfumes, not a product search. Provide helpful, practical advice.

Guidelines:
- Give clear, actionable tips
- Use simple, friendly language
- Keep response 150-250 words
- Include 3-5 specific points
- Be professional but conversational
- If about layering: explain base notes first, complementary scents, application order
- If about storage: mention temperature, light, humidity
- If about application: pulse points, distance, amount

Provide a helpful response:"""

        response = gemini_model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Gemini AI Error: {e}")
        return None

def search_perfumes(query, mode='descriptive'):
    """Smart keyword-based search with context understanding"""
    query_lower = query.lower()
    results = []
    
    # Detect seasonal/occasion keywords and map to fragrance characteristics
    season_map = {
        'summer': ['citrus', 'fresh', 'light', 'aquatic', 'marine', 'green', 'fruity'],
        'winter': ['warm', 'spicy', 'woody', 'amber', 'vanilla', 'oriental', 'rich'],
        'spring': ['floral', 'fresh', 'green', 'light', 'powdery'],
        'fall': ['woody', 'spicy', 'amber', 'earthy', 'warm'],
        'autumn': ['woody', 'spicy', 'amber', 'earthy', 'warm']
    }
    
    # Detect occasion keywords
    occasion_map = {
        'office': ['fresh', 'clean', 'light', 'subtle'],
        'work': ['fresh', 'clean', 'light', 'subtle'],
        'evening': ['rich', 'warm', 'oriental', 'amber'],
        'night': ['rich', 'warm', 'oriental', 'amber', 'musky'],
        'party': ['sweet', 'fruity', 'floral', 'fresh'],
        'date': ['romantic', 'floral', 'sweet', 'amber'],
        'romantic': ['floral', 'sweet', 'vanilla', 'rose']
    }
    
    # Expand query with related terms
    expanded_terms = set(query_lower.split())
    for season, terms in season_map.items():
        if season in query_lower:
            expanded_terms.update(terms)
    for occasion, terms in occasion_map.items():
        if occasion in query_lower:
            expanded_terms.update(terms)
    
    # Search in Name, Main Accords, Description
    for idx, row in df.iterrows():
        score = 0
        text_fields = [
            str(row.get('Name', '')),
            str(row.get('Main Accords', '')),
            str(row.get('Description', '')),
            str(row.get('Perfumers', ''))
        ]
        
        combined = ' '.join(text_fields).lower()
        
        # Scoring with expanded terms
        for word in expanded_terms:
            if len(word) > 2:  # Skip short words
                count = combined.count(word)
                # Higher weight for main accords
                if word in str(row.get('Main Accords', '')).lower():
                    score += count * 5
                else:
                    score += count * 2
        
        if score > 0:
            results.append({
                'title': row.get('Name', 'Unknown'),
                'rating': row.get('Rating Value', 'N/A'),
                'notes': row.get('Main Accords', 'N/A'),
                'brand': 'Various',  # Not in this dataset
                'combined_text': row.get('Description', '')[:300] if pd.notna(row.get('Description')) else '',
                'gender': row.get('Gender', 'Unisex'),
                'score': score
            })
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    # Limit results
    limit = 3 if mode == 'quick' else 5
    return results[:limit]

def generate_ai_response(results, query, mode):
    """Generate AI-powered response using Gemini"""
    if not gemini_model or not results:
        return None
    
    try:
        # Prepare perfume data for AI
        perfume_context = "\n\n".join([
            f"{i+1}. {p['title']} (Rating: {p['rating']}/5)\n"
            f"   Gender: {p['gender']}\n"
            f"   Main Accords: {p['notes']}\n"
            f"   Description: {p['combined_text'][:200] if p['combined_text'] else 'No description available'}"
            for i, p in enumerate(results[:5])
        ])
        
        prompt = f"""You are an expert perfume consultant. A customer asked: "{query}"

Based on these perfumes from our collection:
{perfume_context}

Provide a helpful, conversational response that:
1. Directly answers their question
2. Recommends 2-3 best matches from the list above
3. Explains why each perfume suits their request
4. Keeps response concise (150-200 words)
5. Use friendly, professional tone

Format recommendations with perfume names in **bold**."""

        response = gemini_model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Gemini AI Error: {e}")
        return None

def format_response(results, query, mode):
    """Format search results into readable response"""
    if not results:
        return f"I couldn't find perfumes matching '{query}'. Try searching for specific notes like 'vanilla', 'citrus', or brand names."
    
    # Try AI response first
    if gemini_model and mode == 'descriptive':
        ai_response = generate_ai_response(results, query, mode)
        if ai_response:
            return ai_response
    
    # Fallback to template response
    if mode == 'quick':
        response = f"Found {len(results)} perfumes:\n\n"
        for i, perfume in enumerate(results, 1):
            response += f"**{i}. {perfume['title']}** (★{perfume['rating']}/5)\n"
            response += f"Main Accords: {perfume['notes'][:100]}\n\n"
    else:
        response = f"Top {len(results)} recommendations for '{query}':\n\n"
        for i, perfume in enumerate(results, 1):
            response += f"**{i}. {perfume['title']}** (Rating: {perfume['rating']}/5)\n"
            response += f"*Gender:* {perfume['gender']}\n"
            response += f"*Main Accords:* {perfume['notes'][:100]}\n"
            if perfume['combined_text']:
                response += f"*Description:* {perfume['combined_text'][:150]}...\n"
            response += "\n"
    
    return response

@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'message': 'AI-Powered Perfume Chatbot API',
        'perfumes_loaded': len(df) if df is not None else 0,
        'ai_enabled': gemini_model is not None
    })

@app.route('/query', methods=['POST'])
def query():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Missing 'question' field"}), 400
        
        question = data['question']
        mode = data.get('mode', 'descriptive')
        
        # Check if this is an advice question
        if is_advice_question(question):
            # Try to get AI advice first
            ai_advice = generate_advice_response(question)
            if ai_advice:
                return jsonify({
                    "answer": ai_advice,
                    "mode": mode,
                    "type": "advice"
                })
        
        # Otherwise, search perfumes
        results = search_perfumes(question, mode)
        
        # Format response
        answer = format_response(results, question, mode)
        
        return jsonify({
            "answer": answer,
            "mode": mode,
            "results_count": len(results),
            "type": "product_search"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'perfumes': len(df) if df is not None else 0,
        'ai_enabled': gemini_model is not None
    })

if __name__ == '__main__':
    print("Starting AI-Powered Perfume Chatbot...")
    if load_perfumes():
        print("✓ Data loaded successfully")
        if gemini_model:
            print("✓ Gemini AI ready for intelligent responses")
        else:
            print("⚠ Running in keyword-search mode (no AI)")
        print("Starting Flask server on http://127.0.0.1:5001")
        app.run(host='127.0.0.1', port=5001, debug=True)
    else:
        print("✗ Failed to load data. Please check the CSV file.")
