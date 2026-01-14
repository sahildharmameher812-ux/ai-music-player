# Python 3.9 base image
FROM python:3.9

# OpenCV ke liye zaroori system libraries
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0

WORKDIR /code

# Requirements install karna
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Baaki saara code copy karna
COPY . .

# Hugging Face Spaces port 7860 use karta hai
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]