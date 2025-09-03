from flask import Flask, request, jsonify, render_template, make_response
import os
import requests
import pdfplumber
import numpy as np
import faiss
import time
import random
import logging
import re
import torch
import threading
from datetime import datetime
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from sentence_transformers import SentenceTransformer
import arxiv
from functools import lru_cache
import gc
from semanticscholar import SemanticScholar
from fpdf import FPDF
import zipfile
import io

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# GPU optimization settings
os.environ['CUDA_VISIBLE_DEVICES'] = '0'  # Use first GPU
torch.backends.cudnn.benchmark = True
torch.backends.cudnn.deterministic = False

# Global variables
knowledge_bases = {}
embedder_cache = None
device = None

def setup_gpu():
    """Setup GPU optimization"""
    global device
    if torch.cuda.is_available():
        device = torch.device('cuda')
        logging.info(f"GPU detected: {torch.cuda.get_device_name(0)}")
        logging.info(f"GPU memory: {torch.cuda.get_device_properties(0).total_memory // 1024**3} GB")
        
        # Optimize GPU memory
        torch.cuda.empty_cache()
        torch.cuda.set_per_process_memory_fraction(0.8)  # Use 80% of GPU memory
        
        # Enable mixed precision
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
    else:
        device = torch.device('cpu')
        logging.warning("GPU not available, using CPU")
    return device

@lru_cache(maxsize=1)
def get_embedder():
    """Cache embedder model for reuse"""
    global embedder_cache
    if embedder_cache is None:
        logging.info("Loading SentenceTransformer model...")
        embedder_cache = SentenceTransformer('all-MiniLM-L6-v2', device=device)
        embedder_cache.max_seq_length = 256  # Reduce sequence length for speed
        logging.info("Model loaded successfully")
    return embedder_cache

def search_arxiv_papers_fast(query: str, limit: int = 5, year_filter: int = None, min_citations: int = None) -> list:
    """Optimized arXiv search with faster processing, filters, and citations"""
    try:
        logging.info(f"Searching arXiv for: {query} (limit: {limit})")
        client = arxiv.Client()
        original_limit = limit
        if min_citations:
            limit *= 3  # Fetch more to allow filtering
        search_query = query
        if year_filter:
            search_query += f" AND submittedDate:[{year_filter}01010000 TO *]"
        search = arxiv.Search(
            query=search_query,
            max_results=limit,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        papers = []
        s = SemanticScholar(timeout=10)
        for result in client.results(search):
            paper_id = result.entry_id.split('/')[-1]
            paper = {
                'title': result.title.strip(),
                'authors': ', '.join([author.name for author in result.authors[:3]]),  # Limit authors
                'year': result.published.year,
                'pdfUrl': result.pdf_url,
                'abstract': result.summary[:500] + '...' if len(result.summary) > 500 else result.summary,
                'arxiv_id': paper_id
            }
            try:
                sp = s.get_paper(f"arXiv:{paper_id}")
                paper['citation_count'] = sp.citationCount if sp and hasattr(sp, 'citationCount') else 0
            except:
                paper['citation_count'] = 0
            papers.append(paper)
        
        if min_citations:
            papers = [p for p in papers if p['citation_count'] >= min_citations]
            papers = papers[:original_limit]  # Take top after filter
        
        logging.info(f"Found {len(papers)} papers on arXiv after filters")
        return papers
    except Exception as e:
        logging.error(f"Error searching arXiv: {e}")
        return get_fallback_papers_gpu(query)

def get_fallback_papers_gpu(query: str) -> list:
    """Enhanced fallback papers for GPU optimization"""
    paper_database = {
        "machine learning": [
            {
                'title': 'Attention Is All You Need',
                'authors': 'Vaswani, A., Shazeer, N., Parmar, N.',
                'year': 2017,
                'pdfUrl': 'https://arxiv.org/pdf/1706.03762.pdf',
                'abstract': 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
                'citation_count': 10000
            },
            {
                'title': 'Deep Residual Learning for Image Recognition',
                'authors': 'He, K., Zhang, X., Ren, S.',
                'year': 2016,
                'pdfUrl': 'https://arxiv.org/pdf/1512.03385.pdf',
                'abstract': 'Deeper neural networks are more difficult to train. We present a residual learning framework...',
                'citation_count': 8000
            },
            {
                'title': 'BERT: Pre-training of Deep Bidirectional Transformers',
                'authors': 'Devlin, J., Chang, M.W., Lee, K.',
                'year': 2018,
                'pdfUrl': 'https://arxiv.org/pdf/1810.04805.pdf',
                'abstract': 'We introduce a new language representation model called BERT...',
                'citation_count': 12000
            }
        ],
        # ... (other categories similar)
    }
    
    # Smart matching (simplified)
    query_lower = query.lower()
    for key in paper_database:
        if any(word in query_lower for word in key.split()):
            return paper_database[key]
    
    return paper_database["machine learning"]

def generate_summary(text: str):
    """Generate summary using Ollama"""
    try:
        prompt = f"Summarize this research paper in 200 words: {text[:2000]}"
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3:latest",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 250,
                    "num_ctx": 2048
                }
            },
            timeout=30
        )
        if response.status_code == 200:
            return response.json().get("response", "").strip()
        return ""
    except:
        return ""

def download_pdf_parallel(url: str, filename: str, max_retries: int = 2) -> bool:
    """Optimized PDF download with reduced retries for speed"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*',
        'Connection': 'keep-alive'
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=20, stream=True)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '').lower()
                if 'pdf' in content_type or url.endswith('.pdf'):
                    with open(filename, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=16384):  # Larger chunks
                            f.write(chunk)
                    
                    if os.path.exists(filename) and os.path.getsize(filename) > 500:
                        return True
                    else:
                        if os.path.exists(filename):
                            os.remove(filename)
        except Exception as e:
            logging.warning(f"Download attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)  # Shorter wait time
    
    return False

def extract_text_fast(pdf_path: str) -> str:
    """Faster text extraction with optimization"""
    try:
        text_parts = []
        with pdfplumber.open(pdf_path) as pdf:
            # Limit pages for speed (first 20 pages usually contain main content)
            pages_to_process = min(len(pdf.pages), 20)
            
            for i in range(pages_to_process):
                try:
                    page_text = pdf.pages[i].extract_text()
                    if page_text:
                        # Quick cleanup
                        cleaned = re.sub(r'\s+', ' ', page_text.strip())
                        if len(cleaned) > 100:  # Only keep substantial text
                            text_parts.append(cleaned)
                except:
                    continue
        
        full_text = '\n\n'.join(text_parts)
        logging.info(f"Extracted {len(full_text)} characters from {pdf_path}")
        return full_text
    except Exception as e:
        logging.error(f"Error extracting text: {e}")
        return ""

def chunk_text_optimized(text: str, chunk_size: int = 384, overlap: int = 32) -> list:
    """Optimized chunking for GPU processing"""
    if not text.strip():
        return []
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        words = sentence.split()
        word_count = len(words)
        
        if current_length + word_count > chunk_size and current_chunk:
            # Create chunk
            chunk_text = ' '.join(current_chunk)
            if len(chunk_text.strip()) > 50:  # Minimum chunk size
                chunks.append(chunk_text)
            
            # Start new chunk with overlap
            overlap_size = min(overlap, len(current_chunk) // 2)
            current_chunk = current_chunk[-overlap_size:] + [sentence]
            current_length = sum(len(s.split()) for s in current_chunk)
        else:
            current_chunk.append(sentence)
            current_length += word_count
    
    # Add final chunk
    if current_chunk:
        chunk_text = ' '.join(current_chunk)
        if len(chunk_text.strip()) > 50:
            chunks.append(chunk_text)
    
    return chunks

def setup_knowledge_base_gpu(topic: str, limit: int = 5, year_filter: int = None, min_citations: int = None):
    """GPU-optimized knowledge base setup with parallel processing"""
    session_id = str(uuid.uuid4())
    
    try:
        logging.info(f"🚀 GPU-accelerated setup for: {topic}")
        start_time = time.time()
        
        # Search papers
        papers = search_arxiv_papers_fast(topic, limit, year_filter, min_citations)
        if not papers:
            papers = get_fallback_papers_gpu(topic)
        
        # Parallel PDF processing
        documents = []
        
        def process_paper(paper_data):
            paper, index = paper_data
            if not paper.get('pdfUrl'):
                return None
            
            url = paper['pdfUrl']
            filename = f"paper_{session_id}_{index}_{int(time.time())}.pdf"
            
            if download_pdf_parallel(url, filename):
                text = extract_text_fast(filename)
                
                # Cleanup immediately
                try:
                    if os.path.exists(filename):
                        os.remove(filename)
                except:
                    pass
                
                if text and len(text) > 300:
                    summary = generate_summary(text)
                    return {
                        'title': paper.get('title', 'Untitled'),
                        'text': text,
                        'authors': paper.get('authors', 'Unknown'),
                        'year': paper.get('year', 'Unknown'),
                        'abstract': paper.get('abstract', ''),
                        'url': url,
                        'summary': summary if summary else paper.get('abstract', ''),
                        'citation_count': paper.get('citation_count', 0)
                    }
            return None
        
        # Process papers in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:  # Limit concurrent downloads
            paper_data = [(paper, i) for i, paper in enumerate(papers)]
            future_to_paper = {executor.submit(process_paper, data): data for data in paper_data}
            
            for future in as_completed(future_to_paper):
                result = future.result()
                if result:
                    documents.append(result)
        
        if not documents:
            raise ValueError("No papers could be processed. Check internet connection.")
        
        logging.info(f"✅ Processed {len(documents)} papers")
        
        # Create embeddings with GPU acceleration
        all_chunks = []
        chunk_metadata = []
        
        for doc_idx, doc in enumerate(documents):
            chunks = chunk_text_optimized(doc['text'])
            all_chunks.extend(chunks)
            
            for chunk_idx, chunk in enumerate(chunks):
                chunk_metadata.append({
                    'doc_idx': doc_idx,
                    'chunk_idx': chunk_idx,
                    'title': doc['title'],
                    'authors': doc['authors'],
                    'year': doc['year']
                })
        
        if not all_chunks:
            raise ValueError("No text chunks created from documents.")
        
        logging.info(f"📝 Created {len(all_chunks)} chunks")
        
        # GPU-accelerated embedding creation
        embedder = get_embedder()
        
        # Process in larger batches for GPU efficiency
        batch_size = 64 if device.type == 'cuda' else 32
        
        logging.info("🔥 Creating GPU-accelerated embeddings...")
        embeddings = embedder.encode(
            all_chunks,
            batch_size=batch_size,
            show_progress_bar=False,
            convert_to_numpy=True,
            device=device
        )
        
        # Optimize FAISS index for GPU
        d = embeddings.shape[1]
        if device.type == 'cuda' and len(all_chunks) > 1000:
            # Use IVF index for large datasets on GPU
            nlist = min(100, len(all_chunks) // 10)
            quantizer = faiss.IndexFlatL2(d)
            index = faiss.IndexIVFFlat(quantizer, d, nlist)
            index.train(embeddings.astype('float32'))
            index.add(embeddings.astype('float32'))
            index.nprobe = 10
        else:
            # Use flat index for smaller datasets
            index = faiss.IndexFlatL2(d)
            index.add(embeddings.astype('float32'))
        
        # Clear GPU cache
        if device.type == 'cuda':
            torch.cuda.empty_cache()
        
        # Store knowledge base
        knowledge_bases[session_id] = {
            'embedder': embedder,
            'index': index,
            'all_chunks': all_chunks,
            'documents': documents,
            'chunk_metadata': chunk_metadata,
            'created_at': datetime.now(),
            'setup_time': time.time() - start_time
        }
        
        setup_time = time.time() - start_time
        logging.info(f"⚡ Knowledge base ready in {setup_time:.1f}s")
        
        return {
            'success': True,
            'session_id': session_id,
            'paper_count': len(documents),
            'chunk_count': len(all_chunks),
            'setup_time': round(setup_time, 1),
            'papers': [{
                'title': doc['title'],
                'authors': doc['authors'],
                'year': doc['year'],
                'abstract': doc['abstract'][:200] + '...' if len(doc['abstract']) > 200 else doc['abstract'],
                'summary': doc['summary'],
                'citation_count': doc['citation_count']
            } for doc in documents]
        }
        
    except Exception as e:
        logging.error(f"❌ Setup error: {e}")
        return {'success': False, 'error': str(e)}

def retrieve_fast(query: str, embedder, index, all_chunks, chunk_metadata, k: int = 5):
    """Optimized retrieval with GPU acceleration"""
    # Create query embedding
    with torch.no_grad():
        q_emb = embedder.encode([query], convert_to_numpy=True, device=device)
    
    # Search index
    distances, indices = index.search(q_emb.astype('float32'), k)
    
    results = []
    for i, idx in enumerate(indices[0]):
        if idx < len(all_chunks) and idx >= 0:
            results.append({
                'text': all_chunks[idx],
                'metadata': chunk_metadata[idx],
                'distance': float(distances[0][i])
            })
    
    return results

def generate_answer_fast(question: str, session_id: str):
    """Fast answer generation with optimized context"""
    if session_id not in knowledge_bases:
        return {'success': False, 'error': 'Knowledge base not found. Please setup first.'}
    
    kb = knowledge_bases[session_id]
    
    # Fast retrieval
    retrieved_chunks = retrieve_fast(
        question,
        kb['embedder'],
        kb['index'],
        kb['all_chunks'],
        kb['chunk_metadata'],
        k=3  # Reduce for faster processing
    )
    
    # Optimized context formatting
    context_parts = []
    seen_papers = set()
    
    for chunk_data in retrieved_chunks[:3]:  # Limit context for speed
        chunk_text = chunk_data['text'][:800]  # Truncate for faster processing
        metadata = chunk_data['metadata']
        
        paper_key = f"{metadata['title'][:50]}_{metadata['year']}"
        if paper_key not in seen_papers:
            source = f"[{metadata['title'][:60]} ({metadata['year']})]"
            context_parts.append(f"{source}\n{chunk_text}")
            seen_papers.add(paper_key)
    
    context = "\n\n---\n\n".join(context_parts)
    
    # Optimized prompt
    prompt = f"""Based on the research papers below, answer the question concisely and accurately.

Research Context:
{context}

Question: {question}

Answer (be specific and cite paper titles):"""
    
    try:
        # Optimized Ollama request
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3:latest",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.9,
                    "num_predict": 300,  # Shorter responses for speed
                    "num_ctx": 2048,     # Reduced context window
                    "stop": ["\n\nQuestion:", "Question:"]
                }
            },
            timeout=60  # Shorter timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("response", "No answer generated.").strip()
            
            # Add concise source list
            sources = list(seen_papers)
            if sources:
                answer += f"\n\n📚 Sources: {', '.join([s.split('_')[0] + '...' for s in sources[:2]])}"
            
            return {'success': True, 'answer': answer}
        else:
            return {'success': False, 'error': f'Ollama API error: {response.status_code}'}
            
    except requests.exceptions.ConnectionError:
        return {'success': False, 'error': 'Ollama not available. Ensure it\'s running on localhost:11434'}
    except Exception as e:
        return {'success': False, 'error': f'Generation error: {str(e)}'}

# Flask Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/setup', methods=['POST'])
def setup():
    try:
        data = request.get_json()
        topic = data.get('topic', '').strip()
        limit = int(data.get('limit', 5))
        year_filter = data.get('year_filter')
        year_filter = int(year_filter) if year_filter else None
        min_citations = data.get('min_citations')
        min_citations = int(min_citations) if min_citations else None
        
        if not topic:
            return jsonify({'success': False, 'error': 'Topic is required'})
        
        if limit < 1 or limit > 10:
            return jsonify({'success': False, 'error': 'Limit must be between 1 and 10'})
        
        result = setup_knowledge_base_gpu(topic, limit, year_filter, min_citations)
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Setup error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/query', methods=['POST'])
def query():
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        session_id = data.get('session_id', '')
        
        if not question:
            return jsonify({'success': False, 'error': 'Question is required'})
        
        if not session_id or session_id not in knowledge_bases:
            return jsonify({'success': False, 'error': 'Invalid session. Please setup knowledge base first.'})
        
        result = generate_answer_fast(question, session_id)
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Query error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/download_summaries/<session_id>')
def download_summaries(session_id):
    if session_id not in knowledge_bases:
        return jsonify({'success': False, 'error': 'Session not found'}), 404
    
    documents = knowledge_bases[session_id]['documents']
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    for doc in documents:
        pdf.set_font("Arial", 'B', 14)
        pdf.multi_cell(0, 10, doc['title'])
        pdf.set_font("Arial", 'I', 10)
        pdf.multi_cell(0, 10, f"Authors: {doc['authors']} ({doc['year']}) - Citations: {doc['citation_count']}")
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, "Summary:")
        pdf.multi_cell(0, 10, doc['summary'])
        pdf.multi_cell(0, 10, "\nAbstract:")
        pdf.multi_cell(0, 10, doc['abstract'])
        pdf.add_page()
    
    response = make_response(pdf.output(dest='S').encode('latin-1'))
    response.headers.set('Content-Disposition', 'attachment', filename='summaries.pdf')
    response.headers.set('Content-Type', 'application/pdf')
    return response

@app.route('/download_papers/<session_id>')
def download_papers(session_id):
    if session_id not in knowledge_bases:
        return jsonify({'success': False, 'error': 'Session not found'}), 404
    
    documents = knowledge_bases[session_id]['documents']
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for i, doc in enumerate(documents):
            url = doc['url']
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    safe_title = re.sub(r'[^\w\-_\. ]', '_', doc['title'][:50])
                    zip_file.writestr(f"{safe_title}.pdf", response.content)
            except:
                pass
    
    zip_buffer.seek(0)
    response = make_response(zip_buffer.getvalue())
    response.headers["Content-Type"] = "application/zip"
    response.headers["Content-Disposition"] = "attachment; filename=papers.zip"
    return response

@app.route('/health')
def health():
    """Enhanced health check with GPU info"""
    gpu_info = {}
    gpu_available = False
    
    if torch.cuda.is_available():
        gpu_available = True
        gpu_info = {
            'gpu_name': torch.cuda.get_device_name(0),
            'gpu_memory_total': torch.cuda.get_device_properties(0).total_memory // 1024**3,
            'gpu_memory_used': torch.cuda.memory_allocated(0) // 1024**3,
            'gpu_memory_free': (torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_allocated(0)) // 1024**3
        }
    
    # Check Ollama
    ollama_available = False
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=3)
        ollama_available = response.status_code == 200
    except:
        pass
    
    return jsonify({
        'status': 'healthy',
        'gpu_available': gpu_available,
        'ollama_available': ollama_available,
        'active_knowledge_bases': len(knowledge_bases),
        'device': str(device),
        **gpu_info
    })

@app.route('/status/<session_id>')
def status(session_id):
    """Check knowledge base status"""
    if session_id in knowledge_bases:
        kb = knowledge_bases[session_id]
        return jsonify({
            'exists': True,
            'paper_count': len(kb['documents']),
            'chunk_count': len(kb['all_chunks']),
            'setup_time': kb.get('setup_time', 0),
            'created_at': kb['created_at'].isoformat()
        })
    else:
        return jsonify({'exists': False})

@app.route('/clear_cache')
def clear_cache():
    """Clear GPU cache and old knowledge bases"""
    try:
        # Clear old knowledge bases (keep only last 5)
        if len(knowledge_bases) > 5:
            old_sessions = sorted(knowledge_bases.keys())[:-5]
            for session_id in old_sessions:
                del knowledge_bases[session_id]
        
        # Clear GPU cache
        if device.type == 'cuda':
            torch.cuda.empty_cache()
        
        gc.collect()
        return jsonify({'success': True, 'message': 'Cache cleared successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    print("⚡ Starting GPU-Accelerated RAG System")
    print("=" * 60)
    
    # Initialize GPU
    device = setup_gpu()
    print(f"🔥 Device: {device}")
    
    if device.type == 'cuda':
        print(f"🚀 GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory // 1024**3} GB")
        print("⚡ GPU acceleration ENABLED")
    else:
        print("⚠️ GPU not available, using CPU mode")
    
    print("\n📚 Fast Research Paper RAG System")
    print("🌐 Open: http://localhost:5000")
    print("🤖 Ensure Ollama is running: ollama serve")
    
    print("\n💡 Optimizations:")
    print(" • GPU-accelerated embeddings")
    print(" • Parallel PDF processing")
    print(" • Optimized chunking strategy")
    print(" • Efficient FAISS indexing")
    print(" • Memory management for RTX 3050")
    print("=" * 60)
    
    # Pre-load embedder for faster first request
    try:
        get_embedder()
        print("✅ SentenceTransformer model pre-loaded")
    except Exception as e:
        print(f"⚠️ Model pre-loading failed: {e}")
    
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)