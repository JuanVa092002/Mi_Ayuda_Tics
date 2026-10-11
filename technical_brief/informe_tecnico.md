<center>

# Informe Técnico

## Auditor Médico Basado en Deep Learning

**Contexto:**
Proyecto de grado / Capstone
Samsung Innovation Campus
Universidad del Rosario

**Nombre del equipo:**
Kamui

**Integrantes:**
Santiago Palacio Vásquez
Karen Sofía Rodríguez Martínez
Juan Carlos Pastas Valencia
Liliana Patricia Salamanca Rincon
Jhoan Esteban Soler Giraldo

</center>

---

## Resumen

Sistema de auditoría para IPS que permite:
- Cargar y cruzar automáticamente **historia clínica** y **prefactura**.
- Detectar inconsistencias.
- Generar alertas, severidad, justificaciones y acciones recomendadas.
- Renderizar previsualización de resultados y dashboards.
- Exportar resultados en formato CSV o JSON.

Todo accesible directamente a través de una app web intuitiva.

| Capa       | Tecnología                               |
| ---------- | ---------------------------------------- |
| Landing    | Firebase Hosting                         |
| App        | Angular en Vercel                        |
| Analytics  | Looker Studio (embebido; consume la API) |
| API        | FastAPI en Docker (GHCR) sobre AWS EC2   |
| Exposición | Cloudflare Tunnel + TLS                  |
| Datos      | Supabase (PostgreSQL)                    |

---

## Problema y solución

La facturación a EPS exige coherencia entre lo clínico y lo cobrado. El cruce manual genera fugas de ingreso, cobros sin soporte y errores de código o cantidad. El usuario (cajera/auditor) necesita subir CSV, ver alertas y exportar (sin necesidad de ejecutar notebooks).

**Solución:** Sistema que facilita la carga de datos, su validación y enriquecimiento con etiquetas multi-label, justificación y acción recomendada.

![Diagrama de Arquitectura](imgs/arquitectura.svg)

---

## Desarrollo e implementación

### Datos, BD y API

Fuente de verdad: dataset unificado (~3 240 líneas). Carga IPS (4 CSV o 1 CSV unificado) → ETL en background. Persistencia en Supabase (`cargas`, `validaciones`). Superficie HTTPS acotada al producto: carga, validación, listado, resumen, export.

![Contrato OpenAPI (Swagger)](imgs/swagger.png)

### Deep Learning

Diseño con **separación de responsabilidades**: el catálogo CUPS 2026 es la fuente determinística del código y su descripción; la normalización es determinística; el Deep Learning (cross-encoder pairwise) responde sólo a la pregunta semántica *"¿este texto clínico describe el mismo procedimiento que esta descripción CUPS?"*; y una **política de atributos explícitos** (regla de negocio trazable) decide cómo tratar las contradicciones de vía/abordaje/lateralidad/modalidad. El modelo **no memoriza los 13.640 códigos**: generaliza el matching semántico a CUPS no vistos.

![Diagrama de Flujo](imgs/flujo.svg)

**Por qué se abandonó el enfoque anterior (TextCNN + BETO predict-and-compare):** El pipeline original re-derivaba el CUPS desde la descripción clínica con un clasificador multi-clase (TextCNN + embeddings BETO) y lo contrastaba con el facturado. Una auditoría brutal mostró que el dataset histórico estaba contaminado: **8/18 códigos no existen en el catálogo CUPS 2026 real** y **10/18 existen con descripción distinta**, lo que producía F1=1.0 en split estratificado y F1=0.0 en split por texto — memorización de un mapeo texto→código inexistente, no capacidad de codificación clínica. Por eso el dataset histórico se excluye como gold y se construye un dataset sintético anclado al catálogo real.

**Arquitectura del cross-encoder pairwise:** La tarea se reduce a *semantic textual matching* binario: `(texto_clinico, descripcion_cups_normalizada) → 0/1`, donde `0` = coinciden y `1` = no coinciden (`CODIGO_NO_COINCIDE`). Entrada `[CLS] texto_clinico [SEP] descripcion_cups_normalizada [SEP]` → RoBERTa biomedical-clinical-es → `Linear` → sigmoid. Se conservan tanto la descripción original como la normalizada.

**Dataset definitivo (catálogo CUPS 2026 completo, 13.640 códigos):** 11 familias de pares (6 MATCH + 5 MISMATCH) generadas determinísticamente, con split agrupado por CUPS (test = CUPS no vistos en train) y negativos restringidos a la misma partición → **sin leakage**.

| Métrica dataset | Valor |
| --- | --- |
| Total de pares | 118.670 |
| MATCH (label 0) | 74.746 (63%) |
| MISMATCH (label 1) | 43.924 (37%) |
| CUPS train / test | 10.912 / 2.728 |
| Pares train / test | 95.031 / 23.639 |
| Leakage CUPS train∩test | 0 |
| Adversarial (separado) | 34 |
| Casos especiales (separados) | 3.587 |

![Dataset definitivo - pares por familia](imgs/pairwise_dataset_por_familia.png)

**Política conceptual (validada con muestra manual de 130 pares sobre 3.614 candidatos a granularidad):** Un cualificador adicional en el CUPS **no constituye** `CODIGO_NO_COINCIDE` si el texto clínico no lo contradice; si el texto especifica un valor **incompatible** (abierta vs laparoscópica, anterior vs posterior, derecha vs izquierda, unilateral vs bilateral, diagnóstico vs terapéutico), sí constituye `1`. La distinción crítica no es «subtipo vs vía», sino «subset sin contradicción (0) vs dos valores opuestos en descripciones distintas (1)».

**Entrenamiento:** `roberta-base-biomedical-clinical-es` (cross-encoder), 1 epoch sobre 30k pares submuestreados estratificados por familia, GPU GTX 1650 + fp16 + padding dinámico (~46 min). Modelo guardado para inferencia.

| Métrica | TEST (n=23.639) | ADVERSARIAL (n=34) |
| --- | --- | --- |
| Accuracy | 0.9955 | 0.8529 |
| F1 | 0.9938 | 0.8387 |
| MCC | 0.9903 | 0.7171 |
| Precision | 0.9985 | 0.9286 |
| Recall | 0.9892 | 0.7647 |
| FP / FN | 13 / 93 | 1 / 4 |

![Cross-encoder pairwise - métricas TEST](imgs/pairwise_metricas_test.png)

![Cross-encoder pairwise - matriz de confusión TEST](imgs/pairwise_cm_test.png)

![Cross-encoder pairwise - métricas ADVERSARIAL](imgs/pairwise_metricas_adversarial.png)

**Análisis de errores (valida la separación de responsabilidades):** Los FP se concentran en `match_atributo_coincidente` (el modelo se confunde cuando texto y CUPS *coinciden* en un atributo y predice mismatch — la política de atributos refuerza `0`). Los FN incluyen `mismatch_atributo_contradictorio` (el modelo *no* detecta la contradicción abierta vs endoscópica — **exactamente** lo que la política de atributos resuelve determinísticamente, override a `1`, severidad alta). Los FN restantes son `mismatch_hard_mismo_grupo` (procedimientos semánticamente cercanos) y los 4 FN del adversarial (radiografía de reja costal vs tórax) — casos genuinamente duros de semántica, no de atributos.

![Errores por familia - TEST](imgs/pairwise_errores_por_familia.png)

**Compositor (salida de negocio):** Combina todo y produce `alertas` (`NO_FACTURADO`, `SIN_SOPORTE_CLINICO`, `CANTIDAD_DISCORDANTE`, `DIAGNOSTICO_NO_RELACIONADO`, `CODIGO_NO_COINCIDE`, `CONSISTENTE`), `severidad` (`NINGUNA`/`MEDIA`/`ALTA`),`justificacion`, `accion_recomendada` (`aceptar`/`revisar`).

### Frontend

Inicio → nueva auditoría → procesamiento → resultado/export → historial → analytics (Looker Studio embebido).

![UI - resultado](imgs/ui-resultado.png)
![UI - resumen](imgs/ui-resumen.png)
![UI - detalle](imgs/ui-detalle.png)

## Backend y DevOps

CI/CD (GitHub Actions) → GHCR (imagen Docker) → AWS EC2 (instancia) → Cloudflare (Tunnel + TLS); app web en Vercel, landing page en Firebase y BD en Supabase.

![EC2 - healthy](imgs/ec2-healthy.jpeg)

![Cloudflare Tunnel - healthy](imgs/cloudflare.png)

---

## Resultado y conclusión

Se entrega MVP que permite un flujo completo: carga → validación → export enriquecido con DL → UI y analytics. El fuerte de nuestra solución no está en un modelo aislado, sino en la integración de **Reglas, Deep Learning, API, BD, UI, BI, CI/CD y Cloud segura**.

**Conclusión:** Auditor Médico demuestra un producto desplegado donde el Deep Learning refuerza la detección de inconsistencias y el resto de la arquitectura garantiza usabilidad, trazabilidad y operación en producción.
