import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import requests
import json
import torch
import os
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import lru_cache
import logging
import time

warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

# Configuration
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
MODEL_NAME = 'all-MiniLM-L12-v2'
OLLAMA_MODEL = 'qwen3:1.7b'  # Note: If this model doesn't exist, consider switching to 'qwen2:1.5b' or 'llama3:8b'
INDEX_FILE = 'perfume_hnsw.index'

# Global variables
embedder = None
index = None
df = None

def load_data(file_path):
    """Load perfume data from CSV file"""
    try:
        logging.info(f"Loading data from {file_path}")
        data = pd.read_csv(file_path, usecols=['title', 'rating', 'combined_text'])
        data = data.dropna(subset=['title', 'rating', 'combined_text'])  # Handle missing values
        logging.info(f"Loaded {len(data)} perfume entries")
        return data
    except Exception as e:
        logging.error(f"Error loading dataset: {e}")
        return None

def build_faiss_index(df):
    """Build FAISS index for semantic search"""
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logging.info(f"Building FAISS index on device: {device}")
        
        local_embedder = SentenceTransformer(MODEL_NAME, device=device)
        
        dimension = 384
        local_index = faiss.IndexHNSWFlat(dimension, 32)
        local_index.hnsw.efConstruction = 40
        local_index.hnsw.efSearch = 64  # Increased for better recall
        
        texts = df['combined_text'].tolist()
        batch_size = 64  # Reduced for lower VRAM usage if needed
        
        logging.info("Encoding texts...")
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            embeddings = local_embedder.encode(batch_texts, batch_size=batch_size, show_progress_bar=False, convert_to_tensor=True)
            embeddings = embeddings.cpu().numpy() if torch.is_cuda(embeddings.device) else np.array(embeddings)
            local_index.add(embeddings.astype(np.float32))
            if i % (batch_size * 10) == 0:
                logging.info(f"Processed {i} texts")
        
        logging.info("FAISS index built successfully")
        return local_embedder, local_index
    except Exception as e:
        logging.error(f"Error building index: {e}")
        return None, None

@lru_cache(maxsize=128)
def retrieve_entries(query, k=3):
    """Retrieve relevant perfume entries using semantic search"""
    try:
        query_embedding = embedder.encode([query], show_progress_bar=False)
        query_embedding = query_embedding[0].astype(np.float32).reshape(1, -1)
        distances, indices = index.search(query_embedding, k)
        retrieved_data = df.iloc[indices[0]].copy()
        retrieved_data['distance'] = distances[0]
        return retrieved_data
    except Exception as e:
        logging.error(f"Retrieval error: {e}")
        return None

def generate_response_ollama(query, retrieved_data, mode="descriptive"):
    """Generate response using Ollama API"""
    try:
        start_time = time.time()
        
        # Build context from retrieved data with rounded ratings
        context = f"User Query: {query}\n\nRelevant Perfumes:\n"
        for idx, row in retrieved_data.iterrows():
            rounded_rating = round(row['rating'], 1)
            context += f"- {row['title']} (Rating: {rounded_rating}/10): {row['combined_text'][:200]}...\n"
        
        if mode == "concise":
            system_prompt = """You are a perfume expert. Create a concise top 3 list matching the query, selecting the most relevant from the provided context.

FORMAT (exactly):
**Perfume Name** (★8.5) Notes: brief notes | Review: short review

EXAMPLE:
**Chanel No. 5** (★9.0) Notes: aldehyde, ylang-ylang, neroli | Review: Iconic floral with powdery elegance, timeless for sophisticated evenings.

**Dior J'adore** (★8.5) Notes: jasmine, rose, ylang-ylang | Review: Luxurious fruity-floral, radiant and feminine for daily confidence.

RULES:
- Limit to maximum 3 perfumes, ranked by relevance to query.
- One line per perfume.
- Brief and focused (10-20 words per section).
- Use star rating format (★X.X) from context ratings.
- Base only on provided context; do not add extra text, introductions, or conclusions.
- Match to query specifics like notes, gender, or occasions."""
            
            prompt = f"{system_prompt}\n\n{context}\n\nResponse:"
            max_tokens = 150
            
        else:  # descriptive
            system_prompt = """You are an expert fragrance critic. Create a comprehensive analysis of the top 3 perfumes matching the query, selecting and ranking the best from the provided context.

FORMAT (follow exactly):
**1. Perfume Name** (Rating: 8.5/10, Fragrance Type: Type)
*Notes:* Detailed fragrance composition with top, middle, base notes
*Review:* Comprehensive review describing the scent journey and personality match
*Perfect for:* Specific occasions, seasons, and target audience
*Performance:* Longevity, projection, and sillage details
*Similar to:* Comparable fragrances and alternatives

**2. Second Perfume** (Rating: X/10, Fragrance Type: Type)
*Notes:* [detailed notes]
*Review:* [detailed review]
*Perfect for:* [occasions and seasons]
*Performance:* [performance details]
*Similar to:* [similar fragrances]

**3. Third Perfume** (Rating: X/10, Fragrance Type: Type)
[Same sections as above]

EXAMPLE (for query 'fresh citrus for summer'):
**1. Acqua di Parma Colonia** (Rating: 9.0/10, Fragrance Type: Citrus Aromatic)
*Notes:* Top: lemon, bergamot; Middle: lavender, rosemary; Base: vetiver, amber.
*Review:* Crisp, invigorating citrus burst evolving to herbal freshness; suits optimistic, energetic personalities seeking effortless sophistication.
*Perfect for:* Daytime summer outings, office wear; ideal for men and women in hot climates.
*Performance:* Moderate longevity (4-6 hours), light projection, subtle sillage.
*Similar to:* Chanel Eau de Cologne or Tom Ford Neroli Portofino.

RULES:
- Limit to exactly 3 perfumes, ranked by relevance/rating from context.
- Number each as 1., 2., 3.
- Include ALL sections for each perfume.
- Rich, detailed descriptions (50-80 words per section).
- Match fragrances to personality types, query specifics (e.g., floral notes for women).
- Include seasonal, occasion, and gender recommendations where relevant.
- Base only on provided context; infer missing details logically but do not hallucinate.
- No additional text outside the format."""
            
            prompt = f"{system_prompt}\n\n{context}\n\nProvide detailed analysis:"
            max_tokens = 1200
        
        # Call Ollama API
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.5 if mode == "concise" else 0.7,
                "top_p": 0.9,
                "num_predict": max_tokens,
                "repeat_penalty": 1.1
            }
        }
        
        logging.info(f"Calling Ollama API in {mode} mode...")
        for attempt in range(2):  # Retry once on failure
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json=payload,
                    timeout=60
                )
                if response.status_code != 200:
                    logging.error(f"Ollama API error: {response.status_code} - {response.text}")
                    continue
                
                result = response.json()
                generated_text = result.get('response', '').strip()
                
                if not generated_text:
                    logging.warning("Empty response from Ollama")
                    continue
                
                generation_time = time.time() - start_time
                logging.info(f"Response generated in {generation_time:.2f}s ({mode} mode)")
                return generated_text
            except requests.exceptions.Timeout:
                logging.error("Ollama API timeout")
            except requests.exceptions.ConnectionError:
                logging.error("Cannot connect to Ollama API")
        
        return generate_fallback_response(retrieved_data, mode)
        
    except Exception as e:
        logging.error(f"Generation error: {e}")
        return generate_fallback_response(retrieved_data, mode)

def generate_fallback_response(retrieved_data, mode="descriptive"):
    """Generate fallback response when Ollama fails"""
    if retrieved_data is None or retrieved_data.empty:
        return "No relevant perfumes found for your query."
    
    response = "Here are the top perfumes I found:\n\n"
    
    for idx, row in retrieved_data.iterrows():
        rounded_rating = round(row['rating'], 1)
        if mode == "concise":
            response += f"**{row['title']}** (★{rounded_rating}) Notes: {row['combined_text'][:50]}... | Review: {row['combined_text'][50:100]}...\n"
        else:
            response += f"**{row['title']}** (Rating: {rounded_rating}/10)\n"
            response += f"Description: {row['combined_text'][:300]}...\n\n"
    
    return response

def initialize_models():
    """Initialize embedder and FAISS index"""
    global embedder, index, df
    try:
        logging.info("Initializing models...")
        
        # Load data
        df = load_data('preprocessed_perfume_data.csv')
        if df is None:
            raise ValueError("Failed to load perfume data")
        
        # Load or build index
        if os.path.exists(INDEX_FILE):
            logging.info(f"Loading existing index from {INDEX_FILE}")
            index = faiss.read_index(INDEX_FILE)
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
            embedder = SentenceTransformer(MODEL_NAME, device=device)
            
            # Warm up
            logging.info("Warming up embedder...")
            _ = embedder.encode(["test query"], show_progress_bar=False)
        else:
            logging.info("Building new FAISS index...")
            embedder, index = build_faiss_index(df)
            if embedder is None or index is None:
                raise ValueError("Failed to build FAISS index")
            
            logging.info(f"Saving index to {INDEX_FILE}")
            faiss.write_index(index, INDEX_FILE)
        
        logging.info("Model initialization complete!")
        
        # Test the system
        test_data = retrieve_entries("fresh citrus perfumes", 2)
        if test_data is not None:
            logging.info("System test passed - ready to serve requests")
        else:
            logging.warning("System test failed - check data integrity")
            
    except Exception as e:
        logging.error(f"Initialization error: {e}")
        raise

# Flask routes
@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "Perfume RAG API is running",
        "status": "healthy",
        "models_loaded": embedder is not None and index is not None
    })

@app.route('/query', methods=['POST'])
def query():
    """Main query endpoint"""
    start_time = time.time()
    
    try:
        # Validate request
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Missing 'question' field"}), 400
        
        question = data['question'].strip()
        if not question:
            return jsonify({"error": "Empty question"}), 400
            
        mode = data.get('mode', 'descriptive')
        if mode not in ['concise', 'descriptive']:
            mode = 'descriptive'
        
        logging.info(f"Processing query: '{question}' in {mode} mode")
        
        # Check if models are loaded
        if embedder is None or index is None or df is None:
            return jsonify({"error": "Models not initialized"}), 500
        
        # Retrieve relevant entries (limit to 3 for top 3 consistency)
        k = 3
        retrieved_data = retrieve_entries(question, k)
        
        if retrieved_data is None or retrieved_data.empty:
            return jsonify({
                "answer": "I couldn't find any perfumes matching your query. Try using different keywords like 'woody', 'floral', 'citrus', or specific brand names.",
                "mode": mode,
                "retrieved_count": 0,
                "response_time": round(time.time() - start_time, 2)
            })
        
        # Generate response
        answer = generate_response_ollama(question, retrieved_data, mode)
        total_time = time.time() - start_time
        
        logging.info(f"Query completed in {total_time:.2f}s")
        
        return jsonify({
            "answer": answer,
            "mode": mode,
            "retrieved_count": len(retrieved_data),
            "response_time": round(total_time, 2)
        })
        
    except Exception as e:
        logging.error(f"Query processing error: {e}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    try:
        initialize_models()
        
        if torch.cuda.is_available():
            logging.info(f"CUDA available: {torch.cuda.get_device_name(0)}")
        else:
            logging.info("Running on CPU")
            
        logging.info("Starting Flask server on port 5001...")
        app.run(debug=False, host='0.0.0.0', port=5001, threaded=True)
        
    except Exception as e:
        logging.error(f"Failed to start server: {e}")
        exit(1)