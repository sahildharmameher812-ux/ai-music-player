# 1. Base image
FROM python:3.10-slim

# 2. System dependencies (needed for OpenCV and Audio)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. Set working directory
WORKDIR /app

# 4. Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy all project files
COPY . .

# 6. Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]