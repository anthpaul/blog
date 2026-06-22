---
title: "Publicación #4 — Informe Final Integrador: Seguridad en Ubuntu"
date: "2026-06-12"
description: "Síntesis del proyecto mensual: arquitectura, riesgos, hardening implementado, resultados medibles y buenas prácticas por perfil de usuario."
author: "Anthony Paul Delgado Pigave"
tags: ["security", "ubuntu", "final", "hardening"]
---

## 1. Resumen ejecutivo

Durante este proyecto mensual estudiamos la **seguridad del sistema operativo Ubuntu** desde sus fundamentos hasta la aplicación práctica de técnicas de endurecimiento. El trabajo se desarrolló en cuatro etapas documentadas en el blog: (1) la **arquitectura de seguridad** y el modelo de permisos heredado de Unix; (2) el **análisis de vulnerabilidades y riesgos**, con el estudio técnico de tres CVEs reales que afectaron a Ubuntu; (3) la **implementación de hardening** sobre un servidor de laboratorio; y (4) esta integración final.

La conclusión central del proyecto es que **Ubuntu es un sistema seguro por diseño, pero no por defecto**. Es decir, ofrece mecanismos robustos (AppArmor, permisos POSIX, sudo, cifrado LUKS, sandboxing), pero la seguridad real depende de que el administrador los configure y mantenga correctamente. La mayoría de las brechas que estudiamos no se debían a fallos del software sino a **configuraciones inseguras y a la falta de actualizaciones**. El proyecto demostró que, aplicando una serie ordenada de medidas de hardening, es posible elevar de forma significativa el nivel de protección de un sistema Ubuntu, lo cual verificamos midiendo el *Hardening index* con la herramienta Lynis antes y después de las prácticas.

---

## 2. Criterios de seguridad más importantes de Ubuntu

A lo largo del proyecto identificamos los pilares de seguridad que todo administrador de Ubuntu debe dominar:

1. **Separación de privilegios (kernel/usuario y sudo).** El kernel se ejecuta aislado del espacio de usuario, y el acceso administrativo se canaliza mediante `sudo`, lo que aplica el principio de **mínimo privilegio** y deja trazabilidad de cada acción.

2. **Modelo de permisos POSIX (DAC).** El control de lectura/escritura/ejecución por usuario, grupo y otros es la primera línea de defensa sobre los archivos. Su correcta gestión evita exposiciones de datos.

3. **Control de acceso obligatorio (MAC) con AppArmor.** Confina cada aplicación a los recursos que necesita, conteniendo el daño incluso si un servicio es comprometido.

4. **Sandboxing de aplicaciones (Snap/Flatpak).** Aísla las apps del resto del sistema, limitando el impacto de software malicioso o vulnerable.

5. **Cifrado (LUKS y comunicaciones).** Protege la confidencialidad de los datos en reposo (disco) y en tránsito (SSH, HTTPS).

6. **Gestión de actualizaciones.** El criterio más decisivo en la práctica: parchear a tiempo neutraliza la mayoría de los vectores de ataque conocidos.

7. **Autenticación robusta (PAM, llaves SSH, 2FA).** Sustituir contraseñas débiles por llaves criptográficas y doble factor cierra la puerta a los ataques de fuerza bruta.

---

## 3. Riesgos críticos identificados y su mitigación

A partir del cuadro de riesgos elaborado en la entrada #2, estos fueron los riesgos prioritarios y las medidas que aplicamos:

| Riesgo | Nivel | Mitigación implementada |
|--------|-------|-------------------------|
| **Fuerza bruta contra SSH** | Crítico | `PermitRootLogin no`, autenticación solo por llave, `fail2ban`, puerto no estándar |
| **Escalada de privilegios local** (pkexec/sudo) | Alto | Actualizaciones de seguridad automáticas; revisión de binarios SUID |
| **Robo físico / datos expuestos** | Alto | Cifrado de disco con LUKS; cifrado de archivos con GPG |
| **Kernel desactualizado** | Alto | `unattended-upgrades` + reinicios planificados |
| **Software de fuentes no confiables** | Medio | Uso exclusivo de repositorios oficiales y Snaps verificados |
| **Borrado de evidencia / falta de monitoreo** | Medio | `auditd`, revisión de `/var/log/auth.log`, centralización de logs |

La lección práctica más importante: **los riesgos más probables coinciden con los más fáciles de mitigar**. Blindar SSH y mantener el sistema actualizado elimina, por sí solo, la mayor parte de la exposición real.

---

## 4. Resultados de las prácticas de hardening

Las prácticas realizadas sobre el servidor de laboratorio Ubuntu 24.04 LTS arrojaron los siguientes resultados verificables:

- **Firewall UFW** configurado con política *deny incoming* y solo los puertos imprescindibles abiertos. Evidencia: `ufw status verbose`.
- **SSH endurecido**: root deshabilitado, autenticación por llave Ed25519 funcionando, `MaxAuthTries` reducido y `fail2ban` bloqueando IPs tras intentos fallidos. Evidencia: `sshd_config` + `fail2ban-client status sshd`.
- **Gestión de usuarios** bajo mínimo privilegio, políticas de contraseñas robustas con `pwquality` (mínimo 12 caracteres con complejidad) y caducidad configurada.
- **Cifrado**: archivos cifrados con GPG y verificación del tipo `crypt` con `lsblk`.
- **Actualizaciones automáticas** activas mediante `unattended-upgrades`.
- **Auditoría con Lynis**: se obtuvo un *Hardening index* que mejoró notablemente respecto a la instalación base, con la resolución de varias advertencias señaladas por la herramienta.

> En conjunto, el sistema pasó de una configuración "por defecto" (vulnerable a los riesgos críticos identificados) a una configuración endurecida y auditable.

---

## 5. Buenas prácticas recomendadas

Una de las metas del proyecto es **difundir buenas prácticas** para distintos públicos. Las organizamos por perfil:

### Para usuarios finales (escritorio Ubuntu)

1. **Activa el cifrado de disco** al instalar Ubuntu; protege tus datos si pierdes el equipo.
2. **Mantén el sistema actualizado**: acepta las actualizaciones de seguridad que ofrece el sistema.
3. **Usa contraseñas fuertes y únicas** y, si es posible, un gestor de contraseñas.
4. **Instala software solo de la tienda oficial (Snap Store)** o de repositorios confiables; desconfía de scripts pegados de internet.
5. **No trabajes como root** ni uses `sudo` para todo; aplica el mínimo privilegio también en tu uso diario.
6. **Bloquea la pantalla** al ausentarte y revisa los permisos que pides a cada aplicación.

### Para administradores de sistemas

1. **Hardening de SSH** como prioridad: sin root, solo llaves, con 2FA y `fail2ban`.
2. **Firewall restrictivo** (UFW *deny incoming*), abriendo únicamente lo necesario.
3. **Actualizaciones automáticas de seguridad** y un calendario de reinicios para parches de kernel.
4. **Auditorías periódicas** con Lynis y revisión de binarios SUID y permisos peligrosos.
5. **Centraliza y protege los logs**; el atacante que entra suele intentar borrar su rastro.
6. **Principio de mínimo privilegio** en todas las cuentas de servicio.

### Para empresas

1. **Políticas de seguridad documentadas** y cumplimiento de estándares como el **CIS Benchmark para Ubuntu**.
2. **Gestión centralizada de parches** y de configuración (Ansible, Landscape de Canonical).
3. **Segmentación de red** y VPN (WireGuard) para accesos remotos.
4. **Monitoreo y respuesta a incidentes (SIEM)**, con copias de seguridad cifradas y probadas.
5. **Soporte de seguridad extendido (Ubuntu Pro / ESM)** para recibir parches incluso de paquetes del universo y de versiones en fin de vida.
6. **Capacitación del personal**: el factor humano sigue siendo el eslabón más débil.

---

## 6. Reflexión sobre el aprendizaje y los desafíos

El mayor aprendizaje del proyecto fue **desmontar el mito de que "Linux no necesita seguridad"**. Comprobamos que Ubuntu acumuló durante años vulnerabilidades graves en componentes tan básicos como `sudo` y `polkit`, y que la diferencia entre un sistema seguro y uno comprometido no está en la marca del sistema operativo, sino en **la disciplina del administrador**.

Entre los **desafíos** que enfrentamos destacan:

- **Configurar SSH sin bloquearnos a nosotros mismos**: el orden de los pasos importa (abrir el puerto en UFW *antes* de activar el firewall, probar la llave *antes* de deshabilitar la contraseña).
- **Entender el modelo de permisos SUID**, clave para comprender por qué PwnKit y Baron Samedit eran tan peligrosos.
- **Diferenciar DAC y MAC**, es decir, por qué AppArmor protege incluso cuando los permisos POSIX no bastan.
- **Interpretar la salida de Lynis** y traducir sus advertencias en acciones concretas.

También valoramos la **madurez del proceso de seguridad de Canonical**: las *Ubuntu Security Notices* publican parches con gran rapidez, lo que confirma que la responsabilidad final recae en quien administra el sistema y aplica (o no) esas actualizaciones.

En el plano personal y de equipo, el proyecto reforzó la idea de que la seguridad informática es un proceso **continuo y por capas**, no un estado que se alcanza una vez. Un sistema "seguro hoy" deja de serlo mañana si no se mantiene.

---

## 7. Video demostrativo (opcional)

Como complemento, el grupo preparó un **video** demostrando una práctica técnica: el endurecimiento de SSH y el bloqueo automático de un intento de fuerza bruta con `fail2ban`, junto con la ejecución de una auditoría con Lynis. *(Enlace al video aquí si se incluye.)*

---

## Conclusión general del proyecto

Ubuntu ofrece una base de seguridad sólida —kernel aislado, permisos POSIX, AppArmor, sandboxing y cifrado— pero su protección efectiva depende de una administración consciente: **actualizar, restringir, cifrar, autenticar de forma robusta y auditar**. El proyecto nos permitió pasar de la teoría a un sistema realmente endurecido y, sobre todo, entender que la seguridad no es un producto que se instala, sino una práctica que se mantiene.

Si tuviéramos que resumir todo el aprendizaje en una sola idea accionable, sería esta: **la seguridad efectiva en Ubuntu es la suma de pequeñas decisiones disciplinadas**. Aplicar el principio de mínimo privilegio, parchear sin demora, cifrar lo sensible y revisar los registros con regularidad no son tareas heroicas, pero su efecto acumulado es la diferencia entre un sistema comprometido y uno resiliente. La seguridad informática, más que un conjunto de herramientas, es una cultura de mantenimiento constante.

Como cierre, destacamos que el conocimiento adquirido es **transferible**: aunque trabajamos sobre Ubuntu, los principios de defensa en profundidad, control de acceso, cifrado y auditoría son universales y aplican a cualquier sistema operativo. Este proyecto, por tanto, no solo nos enseñó a asegurar Ubuntu, sino a pensar la seguridad como un proceso continuo, medible y mejorable en cualquier entorno tecnológico.

---

## Referencias (APA)

- Canonical. (2024). *Ubuntu Security*. https://ubuntu.com/security
- Center for Internet Security. (2024). *CIS Ubuntu Linux 24.04 LTS Benchmark*. https://www.cisecurity.org/benchmark/ubuntu_linux
- CISOfy. (2024). *Lynis — Security Auditing Tool*. https://cisofy.com/lynis/
- Qualys. (2022). *PwnKit (CVE-2021-4034)*. https://blog.qualys.com/
- National Institute of Standards and Technology. (2017). *Guide to General Server Security* (NIST SP 800-123). https://csrc.nist.gov/
- Cybersecurity and Infrastructure Security Agency. (2025). *Known Exploited Vulnerabilities Catalog*. https://www.cisa.gov/
