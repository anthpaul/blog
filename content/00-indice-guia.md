---
title: "Índice y Guía del Blog — Seguridad Informática en Ubuntu"
date: "2026-05-28"
description: "Guía de navegación del proyecto: estructura de las 4 publicaciones, criterios de la rúbrica, evidencias requeridas e infografías a producir."
author: "anthpaul"
tags: ["security", "ubuntu", "guia", "rubrica"]
---

> **Sistema operativo asignado:** Linux/Unix — **Ubuntu** (referencias a 22.04 LTS *Jammy*, 24.04 LTS *Noble* y 25.04 *Plucky*)
> **Asignatura:** Seguridad Informática
> **Formato de entrega:** 4 publicaciones en blog (WordPress) + manual de hardening como anexo

---

## Estructura del blog

| Entrada | Archivo | Mínimo | Etiquetas sugeridas |
|---------|---------|--------|---------------------|
| Publicación #1 — Fundamentos teóricos | `01-fundamentos.md` | 800 palabras | `security`, `OS`, `ubuntu`, `architecture` |
| Publicación #2 — Vulnerabilidades y riesgos | `02-vulnerabilidades.md` | 1000 palabras | `security`, `vulnerabilities`, `CVE`, `ubuntu` |
| Publicación #3 — Hardening y prácticas | `03-hardening.md` | 1200 palabras | `security`, `hardening`, `ubuntu`, `ssh`, `firewall` |
| Publicación #4 — Informe final integrador | `04-informe-final.md` | 1500 palabras | `security`, `ubuntu`, `final` |
| Anexo — Manual de hardening | `05-manual-hardening.md` | — | `hardening`, `manual`, `ubuntu` |

> Todos los archivos superan el mínimo de palabras exigido por la rúbrica.

---

## Cómo cumplir cada criterio de la rúbrica (10 pts)

| Criterio | Puntos | Dónde lo cubre el contenido |
|----------|--------|-----------------------------|
| Contenido teórico | 2,0 | Publicación #1 (arquitectura, kernel, permisos POSIX, sandboxing, cifrado, autenticación) |
| Calidad de prácticas técnicas | 2,5 | Publicación #3 + Manual (ufw, hardening SSH, gestión de usuarios, FileVault→LUKS, auditoría con Lynis) |
| Uso de WordPress | 1,5 | Estructura con títulos/subtítulos, etiquetas, enlaces internos entre entradas |
| Investigación (citas/fuentes) | 1,5 | Referencias APA al final de cada publicación |
| Originalidad y profundidad | 1,0 | Análisis de 3 CVEs con código vulnerable explicado + comparativa histórica |
| Presentación final integradora | 1,5 | Publicación #4 (resumen ejecutivo, riesgos, buenas prácticas por perfil) |

---

## Evidencias que TÚ debes generar (capturas originales)

La rúbrica exige **capturas de pantalla originales**. Estas las tienes que tomar tú en una VM de Ubuntu (VirtualBox/VMware/WSL2). Te dejo la lista exacta de comandos a ejecutar para cada captura dentro de cada publicación, marcadas con el bloque:

> [CAPTURA] **CAPTURA SUGERIDA:** *(descripción de qué mostrar)*

### Cómo montar el laboratorio rápido
- **Opción A (recomendada):** VirtualBox + Ubuntu Desktop 24.04 LTS (ISO oficial en ubuntu.com).
- **Opción B:** WSL2 en Windows → `wsl --install -d Ubuntu-24.04` (sirve para casi todo menos BitLocker/FileVault equivalentes gráficos).
- Toma un **snapshot** antes de hacer hardening, así puedes revertir.

---

## Infografías/diagramas que necesitas (creados por el grupo)

1. **Diagrama de arquitectura de seguridad de Ubuntu** (capas: hardware → kernel → espacio de usuario → apps). Plantilla descrita en Publicación #1.
2. **Cuadro de riesgos** (activos / amenazas / impacto / probabilidad). Tabla lista en Publicación #2 — puedes pasarla a infografía en Canva.
3. **Flujo de un exploit de escalada de privilegios** (PwnKit). Descrito en Publicación #2.
4. **Checklist visual de hardening**. En el Manual (anexo).

