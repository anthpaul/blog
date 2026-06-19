---
title: "Publicación #2 — Vulnerabilidades y análisis de riesgos en Ubuntu"
date: "2026-06-04"
description: "Fallos frecuentes, CVEs documentados (PwnKit, Dirty Pipe, Baron Samedit) y una metodología práctica de evaluación de riesgos."
author: "José Alejandro"
tags: ["security", "vulnerabilities", "CVE", "ubuntu"]
---

## Introducción

Ningún sistema operativo es invulnerable, y Ubuntu no es la excepción. Aunque su arquitectura por capas (descrita en la entrada anterior) lo hace robusto, cada año se descubren cientos de vulnerabilidades en el kernel de Linux y en los componentes que Ubuntu instala por defecto. De hecho, los primeros 16 días de 2025 ya habían registrado más de 130 nuevas vulnerabilidades del kernel de Linux. En esta entrada clasificamos las vulnerabilidades más frecuentes, analizamos en profundidad **tres CVEs reales que afectaron a Ubuntu**, aplicamos una **metodología de análisis de riesgos** y comparamos los fallos históricos con las soluciones del fabricante.

---

## 1. Vulnerabilidades frecuentes en Ubuntu

Las vulnerabilidades que más afectan a sistemas Ubuntu suelen agruparse en estas categorías:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Escalada de privilegios local (LPE)** | Un usuario sin privilegios obtiene acceso root | PwnKit, Dirty Pipe |
| **Ejecución remota de código (RCE)** | Un atacante ejecuta código a través de la red | Fallos en servicios expuestos (SSH, web) |
| **Denegación de servicio (DoS)** | Se satura o cae un servicio/equipo | Bugs en drivers de red del kernel |
| **Fuga de información** | Lectura de memoria o datos sensibles del kernel | CVE-2024-53150 (driver USB-audio) |
| **Configuración insegura** | Errores del administrador (no del software) | SSH con root habilitado, permisos 777 |

Un punto **clave** que repetiremos en todo el blog: muchas brechas reales **no** se deben a fallos del software, sino a **malas configuraciones** del administrador. Por eso el hardening (entrada #3) es tan importante.

---

## 2. Análisis técnico de 3 CVEs relevantes

### CVE-2021-4034 — "PwnKit" (escalada de privilegios en pkexec)

- **Componente:** `pkexec`, parte de **Polkit (PolicyKit)**, instalado por defecto en todas las distribuciones principales, incluida Ubuntu.
- **Tipo:** escalada de privilegios local (LPE).
- **CVSS:** 7,8 (Alto).
- **Antigüedad:** la vulnerabilidad estuvo oculta **más de 12 años**, desde la primera versión de pkexec en 2009.

**¿Cómo funciona?** `pkexec` es un programa **SUID-root** (se ejecuta con privilegios de root aunque lo lance un usuario normal), similar a `sudo`. El fallo está en que **no valida correctamente la cantidad de argumentos** que recibe. Cuando se invoca sin argumentos, el programa termina **intentando ejecutar variables de entorno como si fueran comandos**. Manipulando una variable como `GCONV_PATH`, un atacante consigue que pkexec cargue y ejecute código arbitrario **con privilegios de root**. El resultado: cualquier usuario local se convierte en administrador total del sistema.

> [INFO] **Por qué es tan peligroso:** es trivial de explotar (existen PoC públicos de pocas líneas), no requiere acceso remoto pero sí una sesión local, y afectaba a *casi todas* las instalaciones de Ubuntu.

**Solución del fabricante:** Canonical publicó el parche en `policykit-1` (versión `0.105-26ubuntu1.2` en Ubuntu 20.04). El parche agrega una verificación de `argc < 1`. **Mitigación temporal** si no se podía parchear: quitar el bit SUID con `chmod 0755 /usr/bin/pkexec`.



### CVE-2022-0847 — "Dirty Pipe" (escritura arbitraria en el kernel)

- **Componente:** kernel de Linux (mecanismo de *pipes* y *page cache*), kernels 5.8 en adelante.
- **Tipo:** escalada de privilegios local por escritura arbitraria.
- **CVSS:** 7,8 (Alto).

**¿Cómo funciona?** El fallo permite a un proceso sin privilegios **sobrescribir datos en archivos de solo lectura** aprovechando un error en la gestión de la *page cache* a través de *pipes* (tuberías). Un atacante puede, por ejemplo, modificar `/etc/passwd` para quitarle la contraseña a root, o inyectar código en un binario SUID, logrando así privilegios de administrador. Recibió su nombre por su parecido con "Dirty COW" (2016) y por usar pipes.

**Solución del fabricante:** se corrigió en los kernels 5.16.11, 5.15.25 y 5.10.102, y Canonical distribuyó las actualizaciones del kernel para todas las versiones soportadas de Ubuntu. La mitigación principal: **mantener el kernel actualizado** (`apt upgrade` + reinicio).

### CVE-2021-3156 — "Baron Samedit" (desbordamiento en sudo)

- **Componente:** **`sudo`**, presente en prácticamente toda instalación de Ubuntu.
- **Tipo:** desbordamiento de búfer en el heap → escalada a root.
- **CVSS:** 7,8 (Alto).

**¿Cómo funciona?** Un error en el modo de procesamiento de la línea de comandos de `sudo` (cuando se usa con `sudoedit -s` y una barra invertida al final del argumento) provoca un **desbordamiento de heap**. Como `sudo` es SUID-root, explotar ese desbordamiento permite ejecutar código como root. Lo grave es que afectaba a casi **diez años** de versiones de sudo.

**Solución del fabricante:** parche en `sudo 1.9.5p2`; Canonical lo distribuyó vía actualizaciones de seguridad (USN). Mitigación: actualizar el paquete `sudo`.

> [TIP] **Patrón común en los tres casos:** todos son **programas SUID-root o componentes del kernel** que estuvieron años con el fallo presente. La lección es clara: **el problema no es solo el software nuevo, sino el código viejo y privilegiado que nadie revisa.**

---

## 3. El panorama actual (2025): siguen apareciendo fallos

Para demostrar que esto no es historia antigua, en 2025 la agencia estadounidense **CISA** añadió a su catálogo de vulnerabilidades explotadas activamente (KEV) el **CVE-2025-38352**, una condición de carrera *TOCTOU* (*Time-of-Check/Time-of-Use*) en los temporizadores POSIX del kernel que puede provocar corrupción de memoria y **escalada de privilegios**, con riesgo especial para hosts de contenedores. También se reportaron fallos en drivers USB (CVE-2024-53104, CVE-2024-53150) con fuga de memoria del kernel. Esto confirma que el kernel sigue siendo la superficie de ataque más crítica y que **actualizar a tiempo no es opcional**.

---

## 4. Metodología de análisis de riesgos

Para evaluar riesgos usamos una metodología básica de cuatro variables: **activo, amenaza, impacto y probabilidad**. El nivel de riesgo se calcula como:

> **Riesgo = Impacto × Probabilidad**

### Cuadro de riesgos de un servidor Ubuntu

| # | Activo | Amenaza | Vulnerabilidad asociada | Impacto | Probabilidad | Riesgo |
|---|--------|---------|-------------------------|---------|--------------|--------|
| R1 | Datos en disco | Robo físico del equipo | Disco sin cifrar | Alto | Media | **Alto** |
| R2 | Cuenta root | Escalada de privilegios local | pkexec/sudo sin parchear | Alto | Media | **Alto** |
| R3 | Servicio SSH | Ataque de fuerza bruta | Login root + contraseñas débiles | Alto | Alta | **Crítico** |
| R4 | Kernel | Ejecución de código | Kernel desactualizado | Alto | Media | **Alto** |
| R5 | Aplicaciones | App maliciosa | Software de fuentes no oficiales | Medio | Media | **Medio** |
| R6 | Red | Intercepción de tráfico | Servicios sin cifrar (HTTP, FTP) | Medio | Baja | **Bajo** |
| R7 | Logs | Borrado de evidencia | Logs sin protección/centralización | Medio | Media | **Medio** |


### Interpretación

El riesgo **crítico (R3)** es el más urgente: los ataques de fuerza bruta contra SSH son constantes en internet. Por eso, en la siguiente entrada, el hardening de SSH será la primera prioridad. Los riesgos altos (R1, R2, R4) se mitigan con **cifrado de disco** y **actualizaciones automáticas de seguridad**.

---

## 5. Comparación: fallo histórico vs. solución del fabricante

| CVE | Año descubierto | Tiempo que estuvo oculto | Respuesta de Canonical |
|-----|-----------------|--------------------------|------------------------|
| Baron Samedit (sudo) | 2021 | ~10 años | Parche distribuido vía USN en días |
| PwnKit (polkit) | 2022 | 12+ años | Parche y mitigación (quitar SUID) inmediatos |
| Dirty Pipe (kernel) | 2022 | ~1,5 años (desde 5.8) | Kernels corregidos para todas las versiones LTS |
| CVE-2025-38352 (kernel) | 2025 | reciente | Parches sincronizados en mainline/cloud/edge |

La conclusión de esta comparación es positiva para Ubuntu: aunque los fallos existieron mucho tiempo, **Canonical tiene un proceso de respuesta rápido y coordinado** (las USN — *Ubuntu Security Notices*) que publica parches en cuestión de horas o días. La debilidad no está en la reacción del fabricante, sino en los administradores que **no aplican las actualizaciones**.

---

## 6. Herramientas de auditoría y detección en Ubuntu

Detectar a tiempo si un sistema está comprometido o mal configurado es tan importante como prevenirlo. En Ubuntu, el ecosistema ofrece **tres herramientas gratuitas y complementarias** que conviene incluir en cualquier proceso de auditoría: **Lynis**, **chkrootkit** y **rkhunter**. Cada una cubre un ángulo distinto.

### Lynis — auditoría de configuración

`Lynis` es la herramienta de referencia para auditar la **postura de seguridad** del sistema: revisa cientos de controles (kernel, SSH, firewall, parches, permisos) y entrega un *Hardening index* de 0 a 100 con sugerencias accionables. Es ideal para medir **antes y después** del hardening.

```bash
sudo apt install lynis -y
sudo lynis audit system
sudo lynis show details TEST-ID   # detalle de un control específico
```

### chkrootkit — verificación de rootkits conocidos

`chkrootkit` analiza el sistema buscando **firmas de rootkits conocidos**, binarios alterados (login, ps, ls, netstat), interfaces de red en modo promiscuo y entradas sospechosas en logs. Es rápido y útil como primer chequeo tras detectar un comportamiento extraño.

```bash
sudo apt install chkrootkit -y
sudo chkrootkit
```

Salidas típicas como `INFECTED` deben investigarse de inmediato; los `not found` indican que la firma no coincide en este sistema.

### rkhunter — detección heurística y de integridad

`rkhunter` (*Rootkit Hunter*) complementa a chkrootkit con un enfoque más amplio: además de firmas, verifica **integridad de binarios del sistema** mediante hashes, busca **archivos ocultos**, **puertos abiertos sospechosos** y configuraciones inseguras. Conviene ejecutarlo periódicamente y tras cada actualización mayor.

```bash
sudo apt install rkhunter -y
sudo rkhunter --update          # actualizar firmas
sudo rkhunter --propupd         # registrar línea base de hashes
sudo rkhunter --check --sk      # análisis completo
```

### Cuándo usar cada una

| Herramienta | Enfoque | Cuándo ejecutarla |
|-------------|---------|-------------------|
| **Lynis** | Configuración / hardening | Antes y después del endurecimiento, mensualmente |
| **chkrootkit** | Firmas de rootkits conocidos | Ante sospecha de compromiso, semanalmente |
| **rkhunter** | Integridad + heurística | Tras parches del kernel, semanalmente |

> [TIP] **Buena práctica:** automatiza estas tres herramientas con `cron` y envía los reportes por correo. Una auditoría no leída no sirve para nada.

---

## Conclusión

Ubuntu enfrenta vulnerabilidades de escalada de privilegios, ejecución de código y denegación de servicio, muchas de ellas alojadas durante años en componentes privilegiados como `sudo`, `polkit` y el propio kernel. El análisis de riesgos demuestra que las amenazas más probables (fuerza bruta SSH, software desactualizado) son también las más fáciles de mitigar. La defensa no consiste en "esperar a no ser vulnerable", sino en **reducir la superficie de ataque y aplicar parches a tiempo**, que es justo lo que cubriremos en la entrada de hardening.

---

## Referencias (APA)

- Qualys. (2022). *PwnKit: Local Privilege Escalation Vulnerability Discovered in polkit's pkexec (CVE-2021-4034)*. https://blog.qualys.com/
- MITRE Corporation. (2022). *CVE-2021-4034*. https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-4034
- Canonical. (2022). *Ubuntu Security Notices (USN)*. https://ubuntu.com/security/notices
- Cybersecurity and Infrastructure Security Agency. (2025). *Known Exploited Vulnerabilities Catalog*. https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- Kumar, A. (2025). *Linux Kernel Vulnerabilities Exploited in 2025: CISA KEV Insights*. LinuxSecurity. https://linuxsecurity.com/
- National Institute of Standards and Technology. (2012). *Guide for Conducting Risk Assessments* (NIST SP 800-30 Rev. 1). https://csrc.nist.gov/
- Boelen, M. (2024). *Lynis — Security auditing tool for Linux, macOS and Unix-based systems*. CISOfy. https://cisofy.com/lynis/
- Murilo, N., & Steding-Jessen, K. (2017). *chkrootkit — locally checks for signs of a rootkit*. http://www.chkrootkit.org/
- Boelen, M. (2018). *The Rootkit Hunter project (rkhunter)*. https://rkhunter.sourceforge.net/
