# ══════════════════════════════════════════════════════════
#  Java Code Arena — Production Dockerfile
#  All-in-one: Node.js + Python + Java (JDK) on Linux
# ══════════════════════════════════════════════════════════

# ── Stage 1: Build the React/Vite frontend ──────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Use npm ci if lock exists, otherwise npm install
RUN if [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
    npm ci; \
    else \
    npm install; \
    fi

# Copy source and build
COPY tsconfig.json vite.config.ts tailwind.config.* postcss.config.* ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

RUN npm run build


# ── Stage 2: Production runtime ─────────────────────────
FROM debian:bookworm-slim AS runtime

# Prevent interactive prompts during install
ENV DEBIAN_FRONTEND=noninteractive

# ── Install ALL dependencies ────────────────────────────
# Python 3 + pip + Java JDK + utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    # Java (JDK — includes javac compiler + java runtime)
    default-jdk \
    # Node.js (for any runtime JS if needed)
    curl \
    ca-certificates \
    # Utilities
    procps \
    && rm -rf /var/lib/apt/lists/*

# ── Install Node.js 20.x (from NodeSource) ─────────────
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Verify all runtimes are available ───────────────────
RUN echo "=== Runtime Versions ===" && \
    echo "Python: $(python3 --version)" && \
    echo "Node.js: $(node --version)" && \
    echo "npm: $(npm --version)" && \
    echo "Java: $(java -version 2>&1 | head -1)" && \
    echo "javac: $(javac -version 2>&1)" && \
    echo "========================"

# ── Set up application directory ────────────────────────
WORKDIR /app

# ── Install Python dependencies ─────────────────────────
# Copy Python dependency files
COPY pyproject.toml requirements.txt ./

# Create virtual environment and install Flask + Flask-CORS
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy the Python server ──────────────────────────────
COPY server.py ./

# ── Copy the built frontend from Stage 1 ────────────────
COPY --from=frontend-builder /app/dist ./dist

# ── Expose the server port ──────────────────────────────
EXPOSE 5000

# ── Health check ────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# ── Start the server ────────────────────────────────────
CMD ["python3", "server.py"]
