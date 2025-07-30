#!/bin/bash

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar git y otras herramientas
sudo apt install -y git htop curl

cd $HOME
PUBLIC_IP=$(curl http://checkip.amazonaws.com)
export AWS_PUBLIC_IP=$PUBLIC_IP

git clone https://github.com/AndresAlcantaraM/RayML
cd RayML/

# Crear archivo .env
cat > .env << EOF
AWS_DEFAULT_REGION=us-east-1
AWS_PUBLIC_IP=$AWS_PUBLIC_IP
VITE_API_URL=http://$AWS_PUBLIC_IP:8001
EOF

sudo docker-compose up -d