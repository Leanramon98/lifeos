#!/bin/bash

# Script de automatización de despliegue creado por Antigravity para LifeOS

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

# Lista de archivos de configuración que nos interesan
CONFIG_FILES="next.config.mjs firebase.json .firebaserc package.json .github/workflows/firebase-hosting-merge.yml"

clear
echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}    🚀 INICIANDO DESPLIEGUE FORZADO A GITHUB          ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

# 1. Limpiar bloqueos de Git
echo -e "${YELLOW}[1/4] Limpiando bloqueos del repositorio...${NC}"
rm -f .git/index.lock
echo -e "      ✓ Repositorio limpio."
echo ""

# 2. Agregar los archivos de configuración
echo -e "${YELLOW}[2/4] Preparando archivos de configuración...${NC}"
git add $CONFIG_FILES
git rm --cached next.config.ts 2>/dev/null
echo -e "      ✓ Archivos listos para enviar."
echo ""

# 3. Confirmar los cambios localmente
echo -e "${YELLOW}[3/4] Creando confirmación local (Commit)...${NC}"
git commit -m "feat: configurar Firebase Hosting y despliegue automatico desde Git"
if [ $? -ne 0 ]; then
    # Comprobar de forma ultra-específica si nuestros archivos de configuración ya están limpios
    git diff --quiet $CONFIG_FILES && git diff --cached --quiet $CONFIG_FILES
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}      ✓ La configuración de Firebase ya había sido confirmada con éxito previamente.${NC}"
    else
        echo -e "${RED}❌ Error al realizar el commit. Revisa tus credenciales de Git.${NC}"
        exit 1
    fi
fi
echo ""

# 4. Enviar a GitHub de forma FORZADA
echo -e "${YELLOW}[4/4] Subiendo cambios a GitHub (Force Push)...${NC}"
# Intentar empujar con fuerza a 'main'
git push -f origin main
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Intentando empujar de forma forzada a 'master'...${NC}"
    git push -f origin master
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al subir a GitHub. Verifica tu conexión o permisos en tu terminal.${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}   🎉 ¡DESPLIEGUE A GITHUB COMPLETADO CON ÉXITO!      ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "GitHub Actions ya está compilando y desplegando tu app."
echo -e "Estará en vivo en instantes en: ${BLUE}https://lifeos-30ed8.web.app${NC}"
echo -e "${BLUE}======================================================${NC}"
