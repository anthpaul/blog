---
title: "Anexo — Manual de Hardening de Ubuntu"
date: "2026-06-15"
description: "Guía rápida de endurecimiento para Ubuntu Server/Desktop 22.04 / 24.04 LTS: 11 pasos accionables con checklist, comandos y evidencias."
author: "anthpaul"
tags: ["hardening", "manual", "ubuntu", "checklist"]
---

> *Guía rápida de endurecimiento para Ubuntu Server/Desktop 22.04 / 24.04 LTS*

Este manual resume, en forma de **pasos accionables con casillas de verificación**, todas las medidas de hardening aplicadas en el proyecto. Está pensado para imprimirse o seguirse junto a una VM. Cada paso indica el comando y la captura de evidencia a tomar.

---

## Checklist general

| # | Medida | Estado |
|---|--------|--------|
| 1 | Sistema actualizado y parches automáticos activos | ☐ |
| 2 | Firewall UFW activo (deny incoming) | ☐ |
| 3 | SSH endurecido (sin root, solo llaves) | ☐ |
| 4 | fail2ban instalado y activo | ☐ |
| 5 | Usuarios bajo mínimo privilegio | ☐ |
| 6 | Política de contraseñas robusta | ☐ |
| 7 | 2FA configurado (opcional pero recomendado) | ☐ |
| 8 | Cifrado de disco/datos activo | ☐ |
| 9 | Binarios SUID y permisos revisados | ☐ |
| 10 | Auditoría con Lynis ejecutada | ☐ |
| 11 | Monitoreo de logs (auditd) activo | ☐ |

---

## Paso 1 — Actualizaciones

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

> [CAPTURA] *Evidencia:* salida de `apt upgrade` + `systemctl status unattended-upgrades`.

---

## Paso 2 — Firewall UFW

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp        # ¡antes de activar!
sudo ufw enable
sudo ufw status verbose
```

> [CAPTURA] *Evidencia:* `ufw status verbose`.

> [AVISO] **Orden crítico:** permite SSH **antes** de `ufw enable` o perderás la conexión remota.

---

## Paso 3 — Hardening de SSH

Editar `/etc/ssh/sshd_config`:

```
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
AllowUsers anthony
```

Aplicar:

```bash
sudo systemctl restart ssh
```

Generar y copiar llave (desde el cliente):

```bash
ssh-keygen -t ed25519
ssh-copy-id anthony@IP_SERVIDOR
```

> [CAPTURA] *Evidencia:* `sshd_config` editado + conexión exitosa por llave.

> [AVISO] Prueba la conexión por llave en **otra terminal** antes de cerrar la sesión actual y antes de poner `PasswordAuthentication no`.

---

## Paso 4 — fail2ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

> [CAPTURA] *Evidencia:* `fail2ban-client status sshd` (idealmente con alguna IP baneada tras intentos fallidos).

---

## Paso 5 — Usuarios y mínimo privilegio

```bash
sudo adduser nombre
sudo usermod -aG sudo nombre     # solo si necesita admin
getent group sudo                # auditar quién es admin
sudo usermod -L cuenta_inactiva  # bloquear cuentas sin uso
```

> [CAPTURA] *Evidencia:* creación de usuario y `getent group sudo`.

---

## Paso 6 — Política de contraseñas

```bash
sudo apt install libpam-pwquality -y
```

En `/etc/security/pwquality.conf`:

```
minlen = 12
dcredit = -1
ucredit = -1
lcredit = -1
ocredit = -1
```

En `/etc/login.defs`:

```
PASS_MAX_DAYS 90
PASS_MIN_DAYS 1
PASS_WARN_AGE 7
```

> [CAPTURA] *Evidencia:* archivos editados + intento de poner una contraseña débil (rechazada).

---

## Paso 7 — Doble factor (2FA) — opcional

```bash
sudo apt install libpam-google-authenticator -y
google-authenticator
```

Habilitar en `/etc/pam.d/sshd` y `KbdInteractiveAuthentication yes` en `sshd_config`.

> [CAPTURA] *Evidencia:* código QR generado + login pidiendo el código TOTP.

---

## Paso 8 — Cifrado

Disco (ideal al instalar) o partición/archivo:

```bash
# Partición
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup luksOpen /dev/sdb1 datos

# Archivo individual
gpg -c archivo_confidencial.pdf
lsblk           # verificar tipo 'crypt'
```

> [CAPTURA] *Evidencia:* `lsblk` mostrando `crypt` y/o archivo `.gpg` generado.

---

## Paso 9 — Revisión de SUID y permisos

```bash
find / -perm -4000 -type f 2>/dev/null    # binarios SUID
find / -perm -0777 -type f 2>/dev/null    # permisos 777 peligrosos
```

> [CAPTURA] *Evidencia:* listado de binarios SUID (relacionar con PwnKit/pkexec).

---

## Paso 10 — Auditoría con Lynis

```bash
sudo apt install lynis -y
sudo lynis audit system
```

> [CAPTURA] *Evidencia:* *Hardening index* y sección de *Suggestions*. Toma una captura **antes** y **después** del hardening para mostrar la mejora.

---

## Paso 11 — Monitoreo y logs

```bash
sudo apt install auditd -y
sudo systemctl enable --now auditd
sudo grep "Failed password" /var/log/auth.log
```

> [CAPTURA] *Evidencia:* `auditd` activo + registro de intentos fallidos.

---

## Resumen final

Tras completar los 11 pasos, el sistema queda:

- **Actualizado** y con parches automáticos.
- **Protegido en red** (firewall + SSH blindado + fail2ban).
- **Con accesos controlados** (mínimo privilegio, contraseñas fuertes, 2FA).
- **Cifrado** en disco y datos sensibles.
- **Auditado y monitoreado** (Lynis + auditd + logs).

> Este es el estado "endurecido" frente a la instalación por defecto. Recuerda: el hardening **no es un evento único**, sino un mantenimiento continuo.

---

## Referencia rápida de archivos importantes

| Archivo | Función |
|---------|---------|
| `/etc/ssh/sshd_config` | Configuración del servidor SSH |
| `/etc/sudoers` | Quién puede usar sudo (editar con `visudo`) |
| `/etc/security/pwquality.conf` | Reglas de complejidad de contraseñas |
| `/etc/login.defs` | Caducidad de contraseñas |
| `/etc/shadow` | Hashes de contraseñas (solo root) |
| `/var/log/auth.log` | Registro de autenticación y uso de sudo |
| `/etc/pam.d/` | Módulos de autenticación (PAM) |
