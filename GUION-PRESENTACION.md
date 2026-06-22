# Guion de presentación — Seguridad en Ubuntu

**Equipo:** Anthony Paul Delgado Pigave · Mora Alarcón Claudio Jair · Moreira Mantuano Jhon Jairo
**Sistema operativo asignado:** Ubuntu 24.04 LTS
**Duración objetivo:** **15 minutos** (cubre TODO el contenido de los 4 módulos)
**Materiales en pantalla:** blog publicado, VM Ubuntu con hardening aplicado, terminal con SSH ya autenticada.

---

## Reparto de tiempos (cronómetro)

| # | Bloque | Tiempo | Acumulado | Quién |
|---|---|---|---|---|
| 1 | Apertura | 0:30 | 0:30 | Anthony |
| 2 | Semana 1 — Fundamentos completos | 2:30 | 3:00 | Anthony |
| 3 | Semana 2 — Vulns, CVEs, riesgos y auditoría | 3:00 | 6:00 | Claudio |
| 4 | Semana 3 — Hardening en vivo (8 medidas) | 5:30 | 11:30 | Jhon |
| 5 | Semana 4 — Informe integrador | 2:30 | 14:00 | Anthony |
| 6 | Reflexión y cierre | 1:00 | 15:00 | Claudio + Jhon |

> Si un bloque se pasa 15 s, el siguiente lo recupera. No improvisar.

---

## 1. Apertura (0:30 — Anthony)

> "Buenos días. Somos el equipo que trabajó la seguridad de **Ubuntu 24.04 LTS**. Durante cuatro semanas estudiamos su arquitectura, analizamos vulnerabilidades reales, lo endurecimos en laboratorio y medimos el resultado. La idea que queremos dejar es una: **Ubuntu es seguro por diseño, pero no por defecto**. Hoy lo demostramos en quince minutos."

---

## 2. Semana 1 — Fundamentos completos (2:30 — Anthony)

> "La seguridad de Ubuntu se organiza en **cinco capas concéntricas**: hardware con UEFI y Secure Boot; kernel; control de acceso obligatorio con AppArmor; espacio de usuario con permisos POSIX y `sudo`; y aplicaciones aisladas con Snap o Flatpak. Si una capa falla, las demás siguen conteniendo el daño. Eso se llama **defensa en profundidad**.
>
> El **kernel** es el único componente que corre en modo privilegiado, *ring 0*. Toda app que necesite hardware se lo pide vía **llamadas al sistema o syscalls**. Esta separación entre modo usuario y modo kernel es la primera barrera. Linux suma además **namespaces**, que aíslan la vista que cada proceso tiene de los recursos, y **cgroups**, que limitan cuánta CPU, memoria o red consume. Sobre estos dos se construyen los contenedores como Docker.
>
> Encima está el **modelo de permisos POSIX**: cada archivo tiene propietario, grupo y otros, con permisos de lectura, escritura y ejecución, expresados también en octal —755, 644—. Se modifican con `chmod` y `chown`. Esto es **DAC**, control de acceso discrecional: el dueño decide. Por encima, Ubuntu añade **MAC, control de acceso obligatorio, con AppArmor**, activo por defecto. AppArmor define perfiles que dicen qué archivos y capacidades puede tocar cada programa, incluso si corre como root. Aunque un atacante comprometa Apache, el perfil le impide leer `/etc/shadow`. El estado se ve con `aa-status`.
>
> En Ubuntu **root no tiene contraseña habilitada**: se trabaja con `sudo`, que aplica **mínimo privilegio** y deja **trazabilidad** en `/var/log/auth.log`. La configuración vive en `/etc/sudoers`, editable de forma segura con `visudo`.
>
> El **sandboxing** con Snap y Flatpak aísla cada app: solo accede a los recursos que declara mediante interfaces. Si la app es maliciosa, el daño queda confinado.
>
> Y por último: **cifrado LUKS** para el disco —equivalente a BitLocker o FileVault—, **OpenSSL/OpenSSH** para la red, y **PAM**, *Pluggable Authentication Modules*, que permite encadenar contraseña, biometría, llaves físicas o 2FA. Las contraseñas no se guardan en texto plano: van **hasheadas** en `/etc/shadow`, que solo root puede leer."

---

## 3. Semana 2 — Vulnerabilidades, CVEs, riesgos y auditoría (3:00 — Claudio)

> "Ubuntu **sí es vulnerable**. En los primeros 16 días de 2025 se registraron más de 130 vulnerabilidades nuevas solo del kernel. Las clasificamos en cinco familias: **escalada de privilegios local (LPE)**, **ejecución remota de código (RCE)**, **denegación de servicio**, **fuga de información** y, la más común en la práctica, **mala configuración** del administrador.
>
> Analizamos tres CVEs reales que afectaron a Ubuntu.
>
> **PwnKit, CVE-2021-4034**, CVSS 7.8: fallo en `pkexec`, parte de **Polkit**, un binario **SUID-root**. No validaba bien la cantidad de argumentos y, al invocarlo vacío, terminaba ejecutando variables de entorno como si fueran comandos. Manipulando `GCONV_PATH`, cualquier usuario local se convertía en root. Llevaba **doce años oculto**. La mitigación temporal fue quitarle el bit SUID; Canonical publicó el parche en pocos días.
>
> **Dirty Pipe, CVE-2022-0847**: bug en el kernel desde la versión 5.8. Permitía **sobrescribir archivos de solo lectura** abusando del manejo de la *page cache* a través de pipes. Un atacante podía modificar `/etc/passwd` o inyectar código en un binario SUID. Se corrigió en los kernels 5.16.11, 5.15.25 y 5.10.102. Mitigación: **actualizar kernel y reiniciar**.
>
> **Baron Samedit, CVE-2021-3156**: desbordamiento de heap en `sudo`, también SUID-root, al procesar `sudoedit -s` con una barra invertida al final. Afectó **diez años** de versiones de `sudo`. Parche en `sudo 1.9.5p2`. El patrón común de los tres es claro: **código viejo y privilegiado que nadie revisa**.
>
> Y no es historia: en 2025 **CISA añadió a su catálogo KEV el CVE-2025-38352**, una condición de carrera **TOCTOU** en temporizadores POSIX del kernel, crítica para hosts de contenedores. Más fallos en drivers USB con fuga de memoria. Actualizar **no es opcional**.
>
> Aplicamos una **metodología de riesgos** sencilla: *Riesgo = Impacto × Probabilidad* sobre activo, amenaza y vulnerabilidad. De ahí sacamos un cuadro con siete riesgos: el **crítico fue R3, fuerza bruta SSH**; altos fueron robo físico con disco sin cifrar, escalada local por pkexec/sudo y kernel desactualizado.
>
> Para detectar a tiempo presentamos **tres herramientas gratuitas y complementarias**: **Lynis** audita la configuración y da un *hardening index* de 0 a 100; **chkrootkit** busca firmas de rootkits conocidos y binarios alterados como `login`, `ps`, `ls`; **rkhunter** verifica integridad por hashes, puertos sospechosos y archivos ocultos. Buena práctica: automatizarlas con `cron` y enviar el reporte por correo."

---

## 4. Semana 3 — Hardening en vivo, 8 medidas (5:30 — Jhon)

> "Aplicamos ocho medidas sobre una VM Ubuntu 24.04. Una por bloque, treinta segundos cada una. Si algo falla, paso a la captura de respaldo y sigo."

### 4.1 Actualizaciones y parches (0:30)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```
> "La medida más importante y la más ignorada. `unattended-upgrades` aplica los parches de seguridad **solo**, aunque el admin se olvide. Habría neutralizado los tres CVEs que mostramos."

### 4.2 Firewall UFW (0:30)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp && sudo ufw enable
sudo ufw status verbose
```
> "UFW es la interfaz amigable sobre `iptables`/`nftables`. Política base: **denegar entrante, permitir saliente**. Abrimos solo SSH, 80 y 443. **Orden crítico:** permitir SSH **antes** de activar, o quedamos fuera. En RHEL el equivalente sería `firewalld`."

### 4.3 Hardening SSH (0:50)
Mostrar `/etc/ssh/sshd_config`:
```
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
Port 2222
AllowUsers anthony
```
> "Sin root, sin contraseñas, solo **llave Ed25519**, máximo 3 intentos y puerto no estándar para reducir ruido de bots. La llave la genera el cliente con `ssh-keygen -t ed25519` y se copia con `ssh-copy-id`. Esto neutraliza el riesgo crítico R3."

### 4.4 Fail2ban (0:25)
```bash
sudo apt install fail2ban -y
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```
> "Defensa de respaldo: tres fallos y la IP queda baneada automáticamente. Vemos la IP de prueba ya en la lista."

### 4.5 Usuarios y permisos (0:40)
```bash
sudo adduser carlos
sudo usermod -aG sudo carlos
getent group sudo
sudo usermod -L cuenta_inactiva
sudo find / -perm -4000 -type f 2>/dev/null
```
> "Mínimo privilegio: usuarios normales por defecto, sudo solo si lo necesita, cuentas inactivas bloqueadas. Y auditamos los **binarios SUID**, exactamente el tipo de archivo que explotó PwnKit."

### 4.6 Política de contraseñas (0:30)
En `/etc/security/pwquality.conf`: `minlen=12`, complejidad obligatoria —dígito, mayúscula, minúscula y símbolo—. En `/etc/login.defs`: caducidad a 90 días, aviso a 7. Intento poner `1234` y el sistema lo rechaza.

### 4.7 Cifrado y 2FA (0:50)
```bash
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup luksOpen /dev/sdb1 datos
gpg -c documento_confidencial.pdf
lsblk
```
> "**LUKS** cifra disco o partición; **GPG** cifra archivos sueltos; **HTTPS/SSH/VPN WireGuard** cifran la red. Sumamos **2FA con `libpam-google-authenticator`**: además de la llave se pide un TOTP del móvil. Defensa en profundidad."

### 4.8 Auditoría con Lynis y monitoreo (0:55)
```bash
sudo lynis audit system
sudo apt install auditd -y && sudo systemctl enable --now auditd
sudo grep "Failed password" /var/log/auth.log
```
> "Lynis nos da el *hardening index* antes y después. Esa es la **métrica objetiva** del proyecto. `auditd` registra eventos del sistema y `auth.log` muestra cada intento fallido. Una auditoría no leída no sirve para nada."

---

## 5. Semana 4 — Informe integrador (2:30 — Anthony)

> "El informe final integra todo en cuatro bloques.
>
> **Criterios de seguridad de Ubuntu** que todo admin debe dominar: separación kernel/usuario, permisos POSIX, **AppArmor (MAC)**, sandboxing Snap/Flatpak, cifrado LUKS, gestión de actualizaciones y autenticación robusta con PAM, llaves y 2FA.
>
> **Riesgos críticos mitigados:** fuerza bruta SSH cerrada con llaves, fail2ban y puerto no estándar; escalada de privilegios cerrada con `unattended-upgrades` y revisión SUID; robo físico cerrado con LUKS y GPG; kernel desactualizado cerrado con actualizaciones automáticas; software no confiable cerrado con uso exclusivo de repositorios oficiales y Snaps verificados; borrado de logs cerrado con `auditd` y centralización.
>
> **Resultados verificables:** UFW `deny incoming`, SSH endurecido y validado por llave, política de contraseñas que rechaza débiles, cifrado funcionando y el *hardening index* de Lynis con mejora medible. El sistema pasó de configuración por defecto a configuración endurecida y auditable.
>
> **Buenas prácticas por perfil**, el aporte didáctico del informe:
>
> - **Usuario final:** cifrar disco al instalar, mantener actualizaciones, contraseñas únicas con gestor, software solo de Snap Store, no trabajar como root, bloquear pantalla.
> - **Administrador:** SSH blindado, firewall restrictivo, `unattended-upgrades` con calendario de reinicios, auditorías con Lynis y revisión SUID, centralización y protección de logs, mínimo privilegio en cuentas de servicio.
> - **Empresa:** cumplir el **CIS Benchmark para Ubuntu**, gestión centralizada con Ansible o Landscape, segmentación de red con VPN WireGuard, SIEM con copias cifradas probadas, **Ubuntu Pro / ESM** para soporte extendido, y capacitación del personal, porque el factor humano sigue siendo el eslabón más débil."

---

## 6. Reflexión y cierre (1:00 — Claudio + Jhon)

**Claudio (0:30):**
> "El mayor aprendizaje fue desmontar el mito de que 'Linux no necesita seguridad'. `sudo` y `polkit` acumularon fallos graves durante años. La diferencia entre un sistema seguro y uno comprometido **no está en la marca, está en la disciplina del administrador**. Los desafíos: configurar SSH sin bloquearnos a nosotros mismos —el orden importa—, entender por qué el bit SUID hizo a PwnKit tan peligroso, distinguir DAC de MAC y traducir las advertencias de Lynis en acciones."

**Jhon (0:30):**
> "Si todo cabe en una sola frase, es esta: **la seguridad efectiva en Ubuntu es la suma de pequeñas decisiones disciplinadas**. Actualizar, restringir, cifrar, autenticar bien y auditar. Ninguna medida aislada alcanza; la suma es la que vuelve resiliente al sistema. Y estos principios son **transferibles a cualquier sistema operativo**. Gracias."

---

## Checklist técnico antes de exponer

- [ ] VM con snapshot reciente.
- [ ] Terminal con fuente ≥ 16 pt, tema oscuro, prompt acortado.
- [ ] Sesión SSH ya autenticada (no logueo en vivo).
- [ ] Capturas de respaldo abiertas en `/public/imagenesreales/` e `/public/images-manual/`.
- [ ] Lynis ya corrido una vez (el segundo run es más rápido).
- [ ] Pestañas del blog: portada → #1 → #2 → #3 → #4 → anexo.
- [ ] Cronómetro visible para el presentador.
- [ ] Orden de turnos: Anthony → Claudio → Jhon → Anthony → Claudio → Jhon.
- [ ] Acuerdo: si la demo falla, **pasar a la captura y seguir**, no improvisar.

## Q&A rápida (por si sobra tiempo)

| Pregunta | Respuesta en 15 s |
|---|---|
| ¿Por qué Ubuntu? | LTS 5 años, Pro extiende a 10, AppArmor por defecto, comunidad amplia. |
| ¿UFW o firewalld? | UFW nativo en Ubuntu; firewalld en RHEL/CentOS. Misma lógica. |
| ¿Y si pierdo la llave SSH? | Llave de respaldo y acceso por consola física o de la VM. |
| ¿Cambiar puerto 22 es seguro? | Es higiene, no seguridad: limpia los logs de ruido de bots. |
| ¿Por qué 2FA si ya hay llave? | Defensa en profundidad: llave (algo que tienes) + TOTP (segundo factor). |
| ¿Cuánto subió el Lynis index? | Citar número real medido antes/después. |
