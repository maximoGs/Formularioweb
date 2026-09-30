# 🛍️ Ficha de Alta y Onboarding de Comercio (Web Estática)

Esta es una aplicación web estática profesional desarrollada para relevar y recopilar toda la información necesaria para el alta, configuración y publicación de una tienda online.

Al completar los datos, el sistema genera automáticamente un informe perfectamente estructurado y lo envía directamente por **WhatsApp al número oficial: `+54 9 2612 14-1072`**.

---

## 🚀 Características Principales

1. **Flujo Paso a Paso (Wizard) y Modo Continuo**:
   - Navegación fluida por las 7 secciones de relevamiento más 1 paso de revisión final.
   - Opción para alternar entre *Modo Paso a Paso* y *Ver Todo Junto*.
2. **Envío Directo a WhatsApp**:
   - Integración nativa con `https://wa.me/5492612141072?text=...`.
   - Mensaje estructurado con viñetas, negritas y emojis profesionales de WhatsApp.
   - Copia automática al portapapeles como respaldo.
3. **Autoguardado en Tiempo Real (`localStorage`)**:
   - Si el cliente recarga la página o cierra el navegador accidentalmente, sus datos no se pierden.
4. **Campos Dinámicos**:
   - Agregado y eliminación de **Categorías Principales** (con subcategorías).
   - Agregado y eliminación de **Productos Iniciales** (con precio oferta, descripciones y fotos).
   - Selector interactivo de colores de marca (`HEX` y paleta).
5. **Cumplimiento y Regulaciones Argentinas**:
   - Verificación de edad +18 para bebidas alcohólicas (Ley Nacional 24.788).
   - Botón de Arrepentimiento para comercio electrónico (Ley 24.240 / Res. 424/2020).
6. **Exportación y Resguardo**:
   - Botón para **Imprimir o Guardar en PDF** con diseño optimizado para hojas A4.
   - Descarga de respaldo en formato **JSON** y **TXT**.

---

## 📂 Estructura del Proyecto

```
Cargador de clientes/
├── index.html        # Página principal y estructura del formulario
├── css/
│   └── style.css     # Estilos personalizados, transiciones y vista de impresión PDF
├── js/
│   └── app.js        # Lógica de pasos, validaciones, WhatsApp URL builder y autoguardado
└── README.md         # Documentación de uso y publicación
```

---

## 🌐 ¿Cómo usarlo o publicarlo?

### 1. Uso Local
Simplemente hacé doble clic en `index.html` para abrirlo en cualquier navegador web moderno (Google Chrome, Edge, Safari, Firefox). No requiere servidores ni dependencias.

### 2. Publicación Gratuita en Internet
Para compartir el enlace con tus clientes por WhatsApp o email:
- **Vercel / Netlify**: Podés arrastrar la carpeta completa y obtener un link público en menos de 1 minuto (ej: `https://alta-local.vercel.app`).
- **GitHub Pages**: Subí estos archivos a un repositorio de GitHub y activá Pages en la pestaña *Settings -> Pages*.

---

## 📞 Número de Destino Configurado
- **WhatsApp**: `+54 9 2612 14-1072` (Código numérico: `5492612141072`).
- Ubicado en la constante `DESTINATION_PHONE` dentro de `js/app.js`.
