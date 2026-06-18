---
title: "Publicación #1 — Fundamentos de la seguridad en Ubuntu"
date: "2026-06-01"
description: "Arquitectura, modelo de permisos y mecanismos nativos de protección: kernel, POSIX, AppArmor, sandboxing, LUKS y PAM."
author: "Anthony Paul Delgado Pigave"
tags: ["security", "OS", "ubuntu", "architecture"]
---

## Introducción

Ubuntu es una de las distribuciones de Linux más utilizadas del mundo, tanto en servidores como en escritorios y en la nube. Su popularidad la convierte también en un objetivo frecuente de ataques, por lo que entender **cómo está construida su seguridad desde la base** es el primer paso para administrarla de forma responsable. En esta primera entrada explicamos la arquitectura de seguridad del sistema, su modelo de permisos heredado de Unix y los mecanismos nativos que protegen al usuario incluso antes de instalar herramientas adicionales.

A diferencia de la idea popular de que "Linux no necesita seguridad", la realidad es que Ubuntu **sí es vulnerable** si está mal configurado. Lo que ofrece es un conjunto de defensas en capas (*defense in depth*) que, bien usadas, lo vuelven un sistema robusto.

---

## 1. Arquitectura de seguridad de Ubuntu

La seguridad en Ubuntu se organiza en **capas concéntricas**, donde cada capa protege a la siguiente. Si una falla, las demás siguen conteniendo el daño.

| Capa | Componentes | Mecanismo de seguridad |
|------|-------------|------------------------|
| **Aplicaciones** | Firefox, apps Snap / Flatpak | Sandboxing por app |
| **Espacio de usuario** | Procesos, librerías (glibc), servicios | Permisos POSIX, `sudo` |
| **Control de acceso obligatorio** | AppArmor / SELinux | Políticas MAC |
| **Kernel (núcleo Linux)** | Syscalls, namespaces, cgroups | Aislamiento de procesos |
| **Hardware + arranque seguro** | UEFI / GRUB | Secure Boot, cifrado de disco |

### El kernel: el corazón del sistema

El **kernel** es el núcleo del sistema operativo. Es el único componente que se ejecuta en *modo privilegiado* (ring 0) y controla el acceso directo al hardware: CPU, memoria, discos y red. Toda aplicación que necesite un recurso del sistema debe pedírselo al kernel mediante **llamadas al sistema (syscalls)**. Esta separación entre *modo usuario* y *modo kernel* es la primera barrera de seguridad: un programa común nunca toca el hardware directamente, sino que pasa por el filtro del kernel.

El kernel de Linux incorpora tecnologías de aislamiento como los **namespaces** (que separan la visión que un proceso tiene de los recursos) y los **cgroups** (que limitan cuántos recursos puede consumir). Estas tecnologías son la base de los contenedores (Docker, LXC) y de buena parte del aislamiento moderno.

---

## 2. Modelo de permisos y control de acceso

Ubuntu hereda el modelo de permisos de Unix, basado en la tríada **usuario, grupo y otros**, combinado con tres permisos básicos: **lectura (r), escritura (w) y ejecución (x)**.

### Permisos POSIX

Cada archivo y directorio tiene un propietario, un grupo y un conjunto de permisos. Al ejecutar `ls -l` veremos algo como:

```
-rwxr-xr--  1 anthony  desarrollo  2048  jun 10 12:00  script.sh
```

- `rwx` → el **propietario** puede leer, escribir y ejecutar.
- `r-x` → el **grupo** puede leer y ejecutar.
- `r--` → **los demás** solo pueden leer.

Estos permisos se representan también en **notación octal** (ej. `755`, `644`) y se modifican con `chmod`, mientras que el propietario se cambia con `chown`. Este modelo se conoce como **DAC (Control de Acceso Discrecional)**: el dueño del archivo decide quién accede.


### sudo: privilegios bajo control

En Ubuntu, por diseño, **el usuario root no tiene contraseña habilitada** para inicio de sesión directo. En su lugar se usa **`sudo`** (*superuser do*), que permite a usuarios autorizados ejecutar comandos como administrador de forma temporal y **registrada**. Esto aporta dos ventajas de seguridad:

1. **Mínimo privilegio:** el usuario trabaja con permisos normales y solo eleva cuando es necesario.
2. **Trazabilidad:** cada uso de `sudo` queda registrado en `/var/log/auth.log`, lo que facilita auditar quién hizo qué.

La configuración de quién puede usar `sudo` vive en el archivo `/etc/sudoers` (editable de forma segura con `visudo`).

### MAC: AppArmor

Mientras el modelo POSIX es *discrecional*, Ubuntu añade una capa de **Control de Acceso Obligatorio (MAC)** mediante **AppArmor**, activo por defecto. AppArmor define **perfiles** que restringen qué archivos y capacidades puede usar cada programa, **incluso si se ejecuta como root**. Por ejemplo, aunque un atacante comprometa el servidor web, el perfil de AppArmor puede impedir que ese proceso lea `/etc/shadow`. Su comando de estado es `aa-status`.



## 3. Sandboxing de aplicaciones

Ubuntu impulsa el formato de paquetes **Snap**, que ejecuta cada aplicación dentro de un **sandbox** (caja de arena). El sandboxing aísla la aplicación del resto del sistema: una app empaquetada como Snap solo puede acceder a los recursos que declara explícitamente mediante *interfaces*. Así, si una aplicación es maliciosa o vulnerable, el daño queda confinado. El mismo principio aplica a **Flatpak**, otra tecnología de empaquetado aislado muy usada en escritorios Linux.

---

## 4. Cifrado y autenticación

### Cifrado

Ubuntu ofrece **cifrado de disco completo con LUKS** (*Linux Unified Key Setup*) durante la instalación. Si el equipo se pierde o lo roban, los datos del disco son ilegibles sin la clave. Es el equivalente a BitLocker en Windows o FileVault en macOS. A nivel de comunicaciones, Ubuntu usa **OpenSSL** y **OpenSSH** para cifrar el tráfico de red.

### Autenticación

La autenticación de usuarios en Ubuntu se gestiona con **PAM (Pluggable Authentication Modules)**, un sistema modular que permite encadenar métodos: contraseña, biometría, llaves físicas o **2FA** (doble factor). Las contraseñas no se guardan en texto plano: se almacenan **hasheadas** en `/etc/shadow`, archivo que solo root puede leer.

---

## Conclusión

La seguridad de Ubuntu no depende de un solo mecanismo, sino de la **combinación de varias capas**: la separación kernel/usuario, el modelo de permisos POSIX, el uso disciplinado de `sudo`, el control obligatorio de AppArmor, el sandboxing de aplicaciones y el cifrado con LUKS. Entender estos fundamentos es indispensable antes de analizar vulnerabilidades y aplicar técnicas de hardening, que abordaremos en las próximas entradas del blog.

---

## Referencias (APA)

- Canonical. (2024). *Ubuntu Security Features*. Ubuntu Documentation. https://ubuntu.com/security
- Canonical. (2024). *AppArmor — Ubuntu Server Documentation*. https://ubuntu.com/server/docs/security-apparmor
- The Linux Foundation. (2023). *The Linux Kernel Documentation*. https://www.kernel.org/doc/html/latest/
- Vermeulen, S. (2020). *SELinux System Administration* (3.ª ed.). Packt Publishing.
- National Institute of Standards and Technology. (2017). *Guide to General Server Security* (NIST SP 800-123). https://csrc.nist.gov/
