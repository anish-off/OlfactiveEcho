import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import requests
import json
import torch
import os
import time
import warnings

warnings.filterwarnings("ignore")

# --- Configuration ---
DATA_FILE = 'preprocessed_perfume_data.csv'
INDEX_FILE = 'perfume_index.faiss'
MODEL_NAME = 'all-MiniLM-L6-v2'
OLLAMA_MODEL = 'llama3:latest'

# Set PyTorch environment variable to reduce memory fragmentation
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# --- Step 1: Build and Save Index (Run only once) ---
def build_and_save_index(df, index_path, use_gpu=True):
    """
    Generates embeddings for the dataset and saves the FAISS index to a file.
    This is the time-consuming step that should only be run once.
    """
    print("Building FAISS index from scratch. This will take some time...")
    start_time = time.time()
    
    # Use GPU if available, otherwise fallback to CPU
    device = 'cuda' if use_gpu and torch.cuda.is_available() else 'cpu'
    print(f"Using device for embedding generation: {device}")
    
    try:
        embedder = SentenceTransformer(MODEL_NAME, device=device)
        texts = df['combined_text'].tolist()
        
        # Generate embeddings in batches for memory efficiency
        print("Generating embeddings...")
        embeddings = embedder.encode(texts, show_progress_bar=True, batch_size=128)
        
        # Create and build the FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
        
        # Save the index to disk
        print(f"Saving index to {index_path}...")
        faiss.write_index(index, index_path)
        
        end_time = time.time()
        print(f"Index built and saved successfully in {end_time - start_time:.2f} seconds.")
        
    except Exception as e:
        print(f"An error occurred during index building: {e}")

# --- Step 2: RAG Pipeline Functions (Used for every query) ---

def retrieve_entries(query, embedder, index, df, k=3):
    """
    Embeds the query and searches the loaded FAISS index.
    """
    try:
        query_embedding = embedder.encode([query])
        distances, indices = index.search(query_embedding, k)
        
        retrieved_data = df.iloc[indices[0]].copy()
        retrieved_data['distance'] = distances[0]
        return retrieved_data
    except Exception as e:
        print(f"Error in retrieval: {e}")
        return pd.DataFrame() # Return empty DataFrame on error

def generate_response(query, retrieved_data):
    """
    Sends the query and retrieved context to Ollama to generate a response.
    """
    # Create a concise prompt for the LLM
    context_str = ""
    for _, row in retrieved_data.iterrows():
        context_str += f"- Title: {row['title']}\n  Details: {row['combined_text']}\n\n"
        
    prompt = (
        "You are a helpful perfume expert assistant.\n"
        f"Based *only* on the provided context below, answer the user's query.\n\n"
        f"--- CONTEXT ---\n{context_str}"
        f"--- QUERY ---\n{query}\n\n"
        "--- ANSWER ---\n"
    )

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False # Set to False for simpler response handling
            }
        )
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
        # Parse the single JSON response
        response_data = response.json()
        return response_data.get('response', "No content in response.").strip()

    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama API: {e}")
        return "Sorry, I was unable to connect to the language model to generate a response."
    except Exception as e:
        print(f"An unexpected error occurred during generation: {e}")
        return "An unexpected error occurred while generating the response."


def rag_pipeline(query, df, embedder, index, k=3):
    """
    The main RAG pipeline function.
    """
    print(f"\nProcessing Query: {query}")
    start_time = time.time()
    
    # 1. Retrieve
    retrieved_data = retrieve_entries(query, embedder, index, df, k)
    if retrieved_data.empty:
        return "No relevant perfumes found for your query."
    
    # 2. Generate
    response_text = generate_response(query, retrieved_data)
    
    end_time = time.time()
    print(f"Query processed in {end_time - start_time:.2f} seconds.")

    # Format and return results
    result = {
        'query': query,
        'retrieved': retrieved_data[['title', 'rating', 'distance']].to_dict(orient='records'),
        'response': response_text
    }
    return result

# --- Main Execution ---
if __name__ == "__main__":
    # Load the full dataset into memory once
    try:
        print(f"Loading dataset from {DATA_FILE}...")
        df = pd.read_csv(DATA_FILE)
        # Ensure the combined_text column exists
        if 'combined_text' not in df.columns:
            raise ValueError("Dataset must contain a 'combined_text' column.")
    except FileNotFoundError:
        print(f"Error: The data file '{DATA_FILE}' was not found. Please check the path.")
        exit()
    except Exception as e:
        print(f"Error loading dataset: {e}")
        exit()

    # --- Core Optimization: Check for existing index ---
    if not os.path.exists(INDEX_FILE):
        print("FAISS index file not found.")
        build_and_save_index(df, INDEX_FILE)

    # --- Load the pre-built index and initialize the model ---
    try:
        print(f"Loading pre-built index from {INDEX_FILE}...")
        index = faiss.read_index(INDEX_FILE)
        
        print(f"Initializing sentence transformer model: {MODEL_NAME}...")
        # Model initialization is fast
        embedder = SentenceTransformer(MODEL_NAME)
    except Exception as e:
        print(f"Failed to load index or model: {e}")
        print("Please delete the existing index file and re-run the script to build a new one.")
        exit()
        
    print("\n--- RAG System Ready ---")
    print("Ensure Ollama server is running (`ollama serve`) and LLaMA 3 is loaded.")

    # Example queries
    queries = [
        "Find perfumes with vanilla notes",
        "Describe Nerolia Vetiver by Guerlain",
        "I want a summer fragrance with citrus and marine notes",
    ]

    # Run RAG pipeline for each query
    for query in queries:
        result = rag_pipeline(query, df, embedder, index, k=3)
        
        print("\nRetrieved Perfumes:")
        for item in result.get('retrieved', []):
            print(f"- {item['title']} (Rating: {item['rating']}, Distance: {item['distance']:.4f})")
            
        print("\nGenerated Response:")
        print(result.get('response', 'No response generated.'))
        print("-" * 50)