import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import requests
import json
import torch
import os
import warnings
from flask import Flask, request, jsonify, Response, render_template
from flask_cors import CORS
from functools import wraps

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

# Configuration
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# Global variables
embedder = None
index = None
df = None

def load_data(file_path, chunksize=10000):
    try:
        df_chunk = pd.read_csv(file_path, nrows=1)
        if 'combined_text' not in df_chunk.columns:
            raise ValueError("Dataset must contain 'combined_text' column.")
        return pd.read_csv(file_path, chunksize=chunksize)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

def build_faiss_index(chunks, batch_size=100, use_gpu=True):
    try:
        device = 'cuda' if use_gpu and torch.cuda.is_available() else 'cpu'
        print(f"Using device: {device}")
        local_embedder = SentenceTransformer('all-MiniLM-L6-v2', device=device)
        
        dimension = 384
        local_index = faiss.IndexFlatL2(dimension)
        
        for chunk in chunks:
            texts = chunk['combined_text'].tolist()
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                embeddings = local_embedder.encode(batch_texts, show_progress_bar=True, batch_size=batch_size)
                local_index.add(embeddings)
        
        return local_embedder, local_index
    except Exception as e:
        print(f"Error building index: {e}")
        return None, None

def retrieve_entries(query, embedder, index, df, k=3):
    try:
        query_embedding = embedder.encode([query])
        distances, indices = index.search(query_embedding, k)
        retrieved_data = df.iloc[indices[0]].copy()
        retrieved_data['distance'] = distances[0]
        return retrieved_data
    except Exception as e:
        print(f"Retrieval error: {e}")
        return None

def generate_response(query, retrieved_data, ollama_model="llama3:8b", max_tokens=200):
    try:
        prompt = f"Query: {query}\nRelevant Perfumes:\n"
        for idx, row in retrieved_data.iterrows():
            prompt += f"- {row['title']}: {row['combined_text']}\n"
            prompt += """
SYSTEM / USER PROMPT FOR LLaMA 3 — STRICT: TOP 5 WOODY PERFUMES FOR MEN

You are an expert fragrance critic and formatter. You will be given a set of retrieved perfume entries (names, ratings, notes, short review snippets, and any available metadata). Your job is to produce a **clean, professional Top 5 list** of fragrances that are **woody** and **for men**.

RULES (be strict and follow every point):
1. **Filter**: Only include perfumes that are clearly **woody** and intended **for men**. 
   - Decide "woody" from explicit fragrance family tags or from notes strongly associated with woods/ambers/ouds/incense (e.g., cedar, sandalwood, vetiver, patchouli, oud, guaiacwood, amber, incense, agarwood). 
   - Decide "for men" from explicit mentions ("for men", "men's", "male"), brand/product gendering, or strong historical association. 
   - If a retrieved item is not clearly woody-for-men, exclude it.
2. **If fewer than 5 strict matches** are available: fill remaining slots with the **closest matches** (label them clearly as "[Closest match — not strictly Woody-for-Men]" and explain in one short clause why they were included).
3. **Deduplicate**: If the same perfume occurs multiple times, merge them into one entry.
   - Aggregate ratings by computing the **average** of available numeric ratings; round to **one decimal place** (e.g., 8.7/10).
   - Consolidate unique reviewer highlights (e.g., long-lasting, sophisticated) into the reviewer consensus.
4. **Re-rank** the final unique list by the aggregated rating (highest → lowest).
5. **Output exactly a numbered list** (1 to 5). If fewer than 5 unique matches exist, produce as many as found and append a one-line note: "Only X unique woody-for-men perfumes found." If closest matches were used, they must be labeled as required in rule #2.
6. **Format per entry** (strictly — do not deviate):
   - **Name by Brand** (Rating: X.X/10, Fragrance Family)  
     *Notes:* <comma-separated top notes or key notes; if top/mid/base available, list them>  
     *Reviewers say:* <one sentence with consolidated reviewer consensus — performance/character/occasion>  
   - Keep the *Notes* + *Reviewers say* to **2 sentences total** (first sentence = notes, second sentence = reviewer consensus). Avoid any extra lines or commentary.
7. **Tone & Style**: Professional, concise, non-repetitive. No speculation; only state what can be inferred from the input. If you infer a brand or family, prefix with the word "Inferred:" (e.g., "Inferred: Woody Gourmand")—but still include it.
8. **Strict brevity**: Each entry must be compact (the two-sentence rule). Avoid filler phrases like "this is" or "it seems".
9. **Examples** (follow these styles exactly):

Example A (perfect woody-for-men entry):
1. **Tom Ford Oud Wood by Tom Ford** (Rating: 9.2/10, Woody Oriental)  
   *Notes:* Oud, sandalwood, vetiver.  
   *Reviewers say:* Deep, resinous woody core with refined spice — long-lasting and excellent for evening/formal wear.

Example B (closest match label):
4. **Jo Malone Grapefruit by Jo Malone** (Rating: 8.1/10, Citrus Aromatic) [Closest match — not strictly Woody-for-Men]  
   *Notes:* Grapefruit, bergamot, pink pepper.  
   *Reviewers say:* Bright and uplifting; chosen as a closest match because it is unisex/citrus and not primarily woody.

INPUT: The model will be supplied with the retrieved perfume entries following this prompt. Use only those entries and your inferences stated with "Inferred:" where necessary.

OUTPUT: Return only the numbered Top 5 list in the exact format specified above. No additional commentary, no trailing analysis, and no code blocks — just the list.

End of prompt.
"""


        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": ollama_model,
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": True
            },
            stream=True
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama API error: {response.text}")
        
        generated_text = ""
        for line in response.iter_lines():
            if line:
                try:
                    json_data = json.loads(line.decode('utf-8'))
                    if 'response' in json_data:
                        generated_text += json_data['response']
                except json.JSONDecodeError:
                    continue
        
        if not generated_text:
            raise Exception("No response from Ollama")
        return generated_text.split("Summarize the relevant perfumes")[1].strip() if "Summarize the relevant perfumes" in generated_text else generated_text
    except Exception as e:
        print(f"Generation error: {e}")
        return "Unable to generate response."

def initialize_models():
    global embedder, index, df
    file_path = 'preprocessed_perfume_data.csv'
    index_file = 'perfume_faiss.index'
    
    print("Loading dataset...")
    df = pd.read_csv(file_path, usecols=['title', 'rating', 'combined_text'])
    
    print("Initializing FAISS index...")
    if os.path.exists(index_file):
        print(f"Loading existing index from {index_file}")
        index = faiss.read_index(index_file)
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        embedder = SentenceTransformer('all-MiniLM-L6-v2', device=device)
    else:
        chunks = load_data(file_path)
        if chunks is None:
            raise ValueError("Failed to load data")
        embedder, index = build_faiss_index(chunks)
        if embedder is None or index is None:
            print("Retrying with CPU...")
            embedder, index = build_faiss_index(chunks, use_gpu=False)
            if embedder is None or index is None:
                raise ValueError("Failed to build index")
        faiss.write_index(index, index_file)

# Initialize models at startup
with app.app_context():
    initialize_models()

@app.route('/')
def home():
    return "Perfume RAG Model API is running"

@app.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "Missing 'question' field"}), 400
    
    question = data['question']
    retrieved_data = retrieve_entries(question, embedder, index, df)
    
    if retrieved_data is None or retrieved_data.empty:
        return jsonify({"answer": "No relevant perfumes found"})
    
    answer = generate_response(question, retrieved_data)
    return jsonify({"answer": answer})

@app.route('/ui')
def ui():
    return render_template('ui.html')

if __name__ == "__main__":
    if torch.cuda.is_available():
        print(f"CUDA available: {torch.cuda.get_device_name(0)}")
    app.run(debug=True, host='0.0.0.0', port=5001)