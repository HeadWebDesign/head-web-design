# Use official VS Code dev container Ubuntu base
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install only required minimal system packages
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    vim \
    && rm -rf /var/lib/apt/lists/*