---
title: "Publicación #3 — Hardening de Ubuntu: prácticas técnicas paso a paso"
date: "2026-06-08"
description: "Firewall UFW, SSH seguro, gestión de usuarios, cifrado con LUKS/GPG, 2FA y auditoría con Lynis: configuración completa de un servidor Ubuntu."
author: "Mora Alarcón Claudio Jair"
tags: ["security", "hardening", "ubuntu", "ssh", "firewall"]
---

## Introducción

**Hardening** (endurecimiento) es el proceso de reducir la superficie de ataque de un sistema configurándolo de forma segura: desactivando lo innecesario, restringiendo accesos y aplicando buenas prácticas. En esta entrada llevamos a la práctica todo lo aprendido y configuramos un servidor Ubuntu paso a paso. Cada sección incluye los comandos reales y el punto donde debes tomar una **captura de evidencia** (requisito de la rúbrica).

> [AVISO] **Recomendación de laboratorio:** ejecuta esto en una VM de Ubuntu 24.04 LTS y toma un *snapshot* antes de empezar, por si necesitas revertir.

---

## 1. Actualizaciones y gestión de parches

La medida de seguridad más importante y la más ignorada. La mayoría de los CVEs analizados en la entrada #2 ya tenían parche disponible.

```bash
# Actualizar lista de paquetes e instalar todas las actualizaciones
sudo apt update && sudo apt upgrade -y

# Ver actualizaciones de seguridad pendientes
sudo apt list --upgradable
```

### Actualizaciones automáticas de seguridad

Ubuntu permite instalar parches de seguridad de forma desatendida con `unattended-upgrades`:

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Esto asegura que, aunque el administrador olvide actualizar, los parches críticos se apliquen solos.


---

## 2. Configuración del firewall con UFW

Ubuntu incluye **UFW (Uncomplicated Firewall)**, una interfaz amigable sobre `iptables`/`nftables`. La política base debe ser **denegar todo lo entrante y permitir lo saliente**, abriendo solo lo necesario.

```bash
# Política por defecto: bloquear entrada, permitir salida
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (¡antes de activar, para no bloquearte!)
sudo ufw allow 22/tcp

# Permitir web si el servidor lo necesita
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar el firewall
sudo ufw enable

# Verificar estado y reglas
sudo ufw status verbose
```

> [TIP] En distribuciones con `firewalld` (CentOS/RHEL) el equivalente sería `firewall-cmd --add-service=ssh --permanent`. Ubuntu usa UFW por defecto.

---

## 3. Hardening de SSH (la prioridad #1)

Recordemos del análisis de riesgos: el ataque de fuerza bruta contra SSH era el riesgo **crítico (R3)**. Vamos a blindarlo editando `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Cambios recomendados:

```
# Deshabilitar el login directo de root
PermitRootLogin no

# Deshabilitar autenticación por contraseña (usar solo llaves)
PasswordAuthentication no

# Limitar intentos de autenticación
MaxAuthTries 3

# Cambiar el puerto por defecto reduce el ruido de bots (opcional)
Port 2222

# Permitir solo a usuarios específicos
AllowUsers anthony
```

Aplicar cambios:

```bash
sudo systemctl restart ssh
```

### Autenticación por llave SSH (más segura que contraseña)

En **tu máquina cliente** generas un par de llaves y copias la pública al servidor:

```bash
ssh-keygen -t ed25519 -C "anthony@laboratorio"
ssh-copy-id -p 2222 anthony@IP_DEL_SERVIDOR
```

A partir de ahí, el acceso requiere la **llave privada**, que es prácticamente imposible de adivinar por fuerza bruta, a diferencia de una contraseña.


### Protección extra: fail2ban

`fail2ban` bloquea automáticamente IPs que fallan repetidamente el login:

```bash
sudo apt install fail2ban -y
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

---

## 4. Gestión segura de usuarios y permisos

### Principio de mínimo privilegio

Cada usuario debe tener **solo los permisos que necesita**. Buenas prácticas:

```bash
# Crear un usuario normal (no root)
sudo adduser carlos

# Darle privilegios de administrador SOLO si es necesario
sudo usermod -aG sudo carlos

# Revisar quién puede usar sudo
getent group sudo

# Bloquear una cuenta inactiva
sudo usermod -L carlos

# Listar usuarios del sistema
cut -d: -f1 /etc/passwd
```

### Políticas de contraseñas robustas

Instala `libpam-pwquality` para forzar contraseñas fuertes:

```bash
sudo apt install libpam-pwquality -y
```

Edita `/etc/security/pwquality.conf`:

```
minlen = 12          # longitud mínima
dcredit = -1         # al menos un dígito
ucredit = -1         # al menos una mayúscula
lcredit = -1         # al menos una minúscula
ocredit = -1         # al menos un símbolo
```

Y configura caducidad en `/etc/login.defs`:

```
PASS_MAX_DAYS   90
PASS_MIN_DAYS   1
PASS_WARN_AGE   7
```

### Revisar permisos peligrosos

Buscar archivos con permisos excesivos o SUID inesperados:

```bash
# Archivos con permisos 777 (peligrosos)
find / -perm -0777 -type f 2>/dev/null

# Binarios SUID (recordar PwnKit: pkexec era SUID)
find / -perm -4000 -type f 2>/dev/null
```


---

## 5. Autenticación robusta: 2FA y biometría

Para añadir **doble factor (2FA)** al login y a SSH se usa Google Authenticator vía PAM:

```bash
sudo apt install libpam-google-authenticator -y
google-authenticator
```

Luego se habilita en `/etc/pam.d/sshd` y en `sshd_config` (`KbdInteractiveAuthentication yes`). A partir de ahí, además de la llave, se pide un código temporal (TOTP) generado en el móvil. En equipos de escritorio modernos, Ubuntu también admite **biometría** (huella) mediante `fprintd` y el módulo PAM correspondiente.

---

## 6. Cifrado: disco, datos y red

### Cifrado de disco (LUKS)

Lo ideal es activar el **cifrado completo del disco con LUKS** durante la instalación de Ubuntu (opción *"Encrypt the new Ubuntu installation"*). Para cifrar carpetas o particiones después de instalado se usa `cryptsetup`:

```bash
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup luksOpen /dev/sdb1 datos_cifrados
```

Es el equivalente a **BitLocker** (Windows) o **FileVault** (macOS).

### Cifrado de datos puntuales (GPG)

Para cifrar archivos individuales:

```bash
gpg -c documento_confidencial.pdf      # cifra
gpg documento_confidencial.pdf.gpg     # descifra
```

### Cifrado de red

- Usar **SSH** en lugar de Telnet, y **HTTPS/SFTP** en lugar de HTTP/FTP.
- Para acceso remoto seguro, montar una **VPN** (ej. WireGuard).


---

## 7. Auditoría con Lynis (verificación final)

`Lynis` es una herramienta de auditoría que analiza el sistema y da un **índice de endurecimiento** con recomendaciones:

```bash
sudo apt install lynis -y
sudo lynis audit system
```

Al final muestra un *Hardening index* (0–100) y una lista de sugerencias. Es excelente para **medir el antes y el después** del hardening y demostrar el avance en el blog.

---

## 8. Monitoreo y registro

La auditoría continua permite detectar ataques. Herramientas clave:

```bash
# Ver intentos de login (éxitos y fallos)
sudo cat /var/log/auth.log | grep "Failed password"

# Instalar auditd para registro avanzado del sistema
sudo apt install auditd -y
sudo systemctl enable --now auditd
```

Recordemos que cada uso de `sudo` queda registrado: revisar `/var/log/auth.log` regularmente es parte de una buena higiene de seguridad.

---

## Conclusión

El hardening de Ubuntu se construye sobre acciones concretas: **actualizar siempre**, **cerrar el firewall** dejando solo lo necesario, **blindar SSH** con llaves y 2FA, **aplicar mínimo privilegio** en usuarios y permisos, **cifrar** disco y comunicaciones, y **auditar** con Lynis. Ninguna medida por sí sola es suficiente; es la suma de todas la que transforma una instalación por defecto en un sistema resistente. En la entrada final integraremos todo esto en un informe con buenas prácticas por perfil de usuario.


---

## Referencias (APA)

- Canonical. (2024). *Ubuntu Server Guide — Security*. https://ubuntu.com/server/docs/security-introduction
- CISOfy. (2024). *Lynis — Security Auditing Tool for Linux*. https://cisofy.com/lynis/
- OpenSSH Project. (2024). *sshd_config(5) Manual Page*. https://man.openbsd.org/sshd_config
- Center for Internet Security. (2024). *CIS Ubuntu Linux 24.04 LTS Benchmark*. https://www.cisecurity.org/benchmark/ubuntu_linux
- National Institute of Standards and Technology. (2017). *Guide to General Server Security* (NIST SP 800-123). https://csrc.nist.gov/
