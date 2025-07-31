# RayML Docker App

## 1. Configuración Inicial

Los siguentes comandos asumen que tienes configurado AWS CLI con las credenciales necesarias. Si no lo has hecho, puedes seguir la [guía oficial de AWS](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html). 

O bien puedes usar la interfaz web de AWS para crear los recursos necesarios.

```bash

## 2. Crear Key Pair para SSH 

```bash
aws ec2 create-key-pair --key-name ml-app-key --query 'KeyMaterial' --output text > ml-app-key.pem

chmod 400 ml-app-key.pem
```

## 2. Crear Security Group

```bash
# Crear security group
aws ec2 create-security-group \
    --group-name ml-app-security-group \
    --description "Security group for ML Docker app"

# Obtener el security group ID 
aws ec2 describe-security-groups \
    --group-names ml-app-security-group \
    --query 'SecurityGroups[0].GroupId' \
    --output text
```

### Configurar reglas del Security Group
```bash
SECURITY_GROUP_ID="<SECURITY-GROUP-ID>"

# SSH (puerto 22) (La habilito para poder conectarme por SSH en caso de que necesite hacer cambios o actualizaciones)
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Frontend (puerto 3000)
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0

# API (puerto 8001)
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 8001 \
    --cidr 0.0.0.0/0

# Ray Dashboard (puerto 8265)
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 8265 \
    --cidr 0.0.0.0/0
```

## 3. Lanzar Instancia EC2

```bash
# Buscar AMI de Ubuntu más reciente
aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'Images[*].[ImageId,Name,CreationDate]' \
    --output table

# Lanzar instancia (usa el ImageId más reciente del comando anterior)
aws ec2 run-instances \
    --image-id ami-0e86e20dae90224b4 \
    --count 1 \
    --instance-type t3.large \
    --key-name ml-app-key \
    --security-group-ids $SECURITY_GROUP_ID \
    --block-device-mappings DeviceName=/dev/sda1,Ebs='{VolumeSize=20,VolumeType=gp3}' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ML-Docker-App}]'
```

### Obtener IP pública de la instancia
```bash
# Obtener información de la instancia
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=ML-Docker-App" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text
```

## 4. Script de Instalación para EC2 (Lo puse cuando creamos la instancia)

```bash
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
echo 'export AWS_PUBLIC_IP=$AWS_PUBLIC_IP' >> ~/.bashrc

git clone https://github.com/AndresAlcantaraM/RayML
cd RayML/
echo 'cd ~/RayML' >> ~/.bashrc

# Crear archivo .env
cat > .env << EOF
AWS_DEFAULT_REGION=us-east-1
AWS_PUBLIC_IP=$AWS_PUBLIC_IP
VITE_API_URL=http://$AWS_PUBLIC_IP:8001
EOF

# Poner script de creacion de .env en el .bashrc
echo 'cat > .env << EOF' >> ~/.bashrc
echo 'AWS_DEFAULT_REGION=us-east-1' >> ~/.bashrc
echo 'AWS_PUBLIC_IP=$AWS_PUBLIC_IP' >> ~/.bashrc
echo 'VITE_API_URL=http://$AWS_PUBLIC_IP:8001' >> ~/.bashrc
echo 'EOF' >> ~/.bashrc

# Poner script de docker-compose en el .bashrc
echo 'docker-compose up -d' >> ~/.bashrc

sudo docker-compose up -d
```

Ese script si lo debes poner en el textarea de "User data" al momento de crear la instancia EC2. Esto hará que se ejecute automáticamente al iniciar la instancia. 


## 5. Acceso desde Internet

Una vez desplegado, podrás acceder a:
- Frontend: `http://<PUBLIC-IP>:3000`
- API: `http://<PUBLIC-IP>:8001`
- Ray Dashboard: `http://<PUBLIC-IP>:8265`

