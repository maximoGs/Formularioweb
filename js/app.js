/**
 * ==========================================================================
 * Ficha de Alta y Relevamiento de Comercios - Logica Principal
 * Envio directo al WhatsApp: +54 9 2612 14-1072
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constantes
  const DESTINATION_PHONE = '5492612141072'; // Destinatario oficial WhatsApp
  const STORAGE_KEY = 'ficha_alta_comercio_draft_v2';
  const TOTAL_STEPS = 8;

  // Estado de la aplicacion
  let currentStep = 1;
  let isSinglePageMode = false;

  // Elementos DOM principales
  const form = document.getElementById('onboardingForm');
  const progressBar = document.getElementById('formProgressBar');
  const prevStepBtn = document.getElementById('prevStepBtn');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const stepCounterLabel = document.getElementById('stepCounterLabel');
  const toggleViewModeBtn = document.getElementById('toggleViewModeBtn');
  const viewModeLabel = document.getElementById('viewModeLabel');
  const clearDraftBtn = document.getElementById('clearDraftBtn');
  const headerSendBtn = document.getElementById('headerSendBtn');
  const sendToWhatsAppBtn = document.getElementById('sendToWhatsAppBtn');
  const copyTextBtn = document.getElementById('copyTextBtn');
  const printPdfBtn = document.getElementById('printPdfBtn');
  const downloadBackupBtn = document.getElementById('downloadBackupBtn');
  const downloadTxtBtn = document.getElementById('downloadTxtBtn');
  const whatsappPreviewBox = document.getElementById('whatsappPreviewBox');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Inicializar modo wizard en el body
  document.body.classList.add('wizard-mode');

  // ==========================================================================
  // 1. MANEJO DE PASOS (WIZARD) Y VISTA COMPLETA
  // ==========================================================================
  
  function updateStepUI() {
    // Actualizar secciones
    const allSections = document.querySelectorAll('.form-step-section');
    allSections.forEach((sec, idx) => {
      const stepNum = idx + 1;
      if (stepNum === currentStep) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Actualizar botones de navegación en header
    const stepNavBtns = document.querySelectorAll('.step-nav-btn');
    stepNavBtns.forEach(btn => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      if (step === currentStep) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar barra de progreso
    const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100);
    progressBar.style.width = `${progressPercent}%`;

    // Botones Prev / Next
    if (prevStepBtn) {
      prevStepBtn.disabled = currentStep === 1;
    }

    if (nextStepBtn) {
      if (currentStep === TOTAL_STEPS) {
        nextStepBtn.classList.add('hidden');
      } else {
        nextStepBtn.classList.remove('hidden');
        if (currentStep === TOTAL_STEPS - 1) {
          nextStepBtn.innerHTML = `<span>Ver Resumen</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
        } else {
          nextStepBtn.innerHTML = `<span>Siguiente</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
        }
      }
    }

    if (stepCounterLabel) {
      stepCounterLabel.textContent = `Paso ${currentStep} de ${TOTAL_STEPS}`;
    }

    // Si llegamos al paso 8 (resumen), refrescar preview
    if (currentStep === 8) {
      refreshSummaryAndPreview();
    }

    // Scroll suave hacia la parte superior del formulario
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > TOTAL_STEPS) return;
    
    // Si avanza hacia adelante, validar paso actual
    if (stepNumber > currentStep) {
      if (!validateCurrentStep(currentStep)) {
        return;
      }
    }

    currentStep = stepNumber;
    updateStepUI();
  }

  // Eventos de botones de paso
  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        if (currentStep < TOTAL_STEPS) {
          currentStep++;
          updateStepUI();
        }
      }
    });
  }

  // Click directo en pestañas del wizard
  document.querySelectorAll('.step-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-step'), 10);
      goToStep(targetStep);
    });
  });

  // Switcher de vista: Paso a paso vs Página completa
  if (toggleViewModeBtn) {
    toggleViewModeBtn.addEventListener('click', () => {
      isSinglePageMode = !isSinglePageMode;
      if (isSinglePageMode) {
        document.body.classList.remove('wizard-mode');
        document.body.classList.add('all-mode');
        viewModeLabel.textContent = 'Modo Paso a Paso';
        refreshSummaryAndPreview();
        showToast('Vista de página completa activada', 'info');
      } else {
        document.body.classList.remove('all-mode');
        document.body.classList.add('wizard-mode');
        viewModeLabel.textContent = 'Ver Todo Junto';
        updateStepUI();
      }
    });
  }

  // ==========================================================================
  // 2. VALIDACIONES DINÁMICAS
  // ==========================================================================
  function validateCurrentStep(step) {
    let isValid = true;
    clearFieldErrors();

    if (step === 1) {
      const nombre = document.getElementById('nombreComercial');
      if (!nombre.value.trim()) {
        showFieldError(nombre, 'El nombre comercial es obligatorio.');
        isValid = false;
      }

      const rubroSelect = document.getElementById('rubroSelect');
      if (!rubroSelect.value) {
        showFieldError(rubroSelect, 'Por favor seleccioná un rubro.');
        isValid = false;
      } else if (rubroSelect.value === 'Otro') {
        const rubroOtro = document.getElementById('rubroOtro');
        if (!rubroOtro.value.trim()) {
          showFieldError(rubroOtro, 'Por favor especificá tu rubro.');
          isValid = false;
        }
      }
    } else if (step === 2) {
      const whatsapp = document.getElementById('whatsappPedidos');
      const val = whatsapp.value.replace(/\D/g, '');
      if (!val || val.length < 8) {
        showFieldError(whatsapp, 'Ingresá un número de WhatsApp válido con código de país y área.');
        isValid = false;
      }
    } else if (step === 3) {
      const tieneLocal = document.querySelector('input[name="tieneLocalFisico"]:checked')?.value;
      if (tieneLocal === 'SI') {
        const direccion = document.getElementById('direccionExacta');
        if (!direccion.value.trim()) {
          showFieldError(direccion, 'Ingresá la dirección exacta de tu local para retiro.');
          isValid = false;
        }
      }
    } else if (step === 5) {
      const horarios = document.getElementById('horariosSemana');
      if (!horarios.value.trim()) {
        showFieldError(horarios, 'Ingresá tus días y horarios habituales de atención.');
        isValid = false;
      }
    }

    if (!isValid) {
      showToast('Por favor completá los campos obligatorios marcados con *', 'warning');
    }

    return isValid;
  }

  function showFieldError(inputEl, message) {
    inputEl.classList.add('field-error');
    inputEl.focus();

    // Buscar si existe span de error
    const parent = inputEl.parentElement;
    const errorSpan = parent.querySelector('.field-error-msg');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.classList.remove('hidden');
    }
  }

  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    document.querySelectorAll('.field-error-msg').forEach(el => el.classList.add('hidden'));
  }

  // ==========================================================================
  // 3. CAMPOS CONDICIONALES & SYNC DE COLORES
  // ==========================================================================

  // Rubro Otro toggle
  const rubroSelect = document.getElementById('rubroSelect');
  const rubroOtroContainer = document.getElementById('rubroOtroContainer');
  if (rubroSelect && rubroOtroContainer) {
    rubroSelect.addEventListener('change', () => {
      if (rubroSelect.value === 'Otro') {
        rubroOtroContainer.classList.remove('hidden');
      } else {
        rubroOtroContainer.classList.add('hidden');
      }
      triggerAutoSave();
    });
  }

  // Color Pickers y Text inputs sync
  const colorPrincipal = document.getElementById('colorPrincipal');
  const colorPrincipalText = document.getElementById('colorPrincipalText');
  if (colorPrincipal && colorPrincipalText) {
    colorPrincipal.addEventListener('input', (e) => {
      colorPrincipalText.value = e.target.value.toUpperCase();
      triggerAutoSave();
    });
    colorPrincipalText.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorPrincipal.value = e.target.value;
        triggerAutoSave();
      }
    });
  }

  const colorSecundario = document.getElementById('colorSecundario');
  const colorSecundarioText = document.getElementById('colorSecundarioText');
  if (colorSecundario && colorSecundarioText) {
    colorSecundario.addEventListener('input', (e) => {
      colorSecundarioText.value = e.target.value.toUpperCase();
      triggerAutoSave();
    });
    colorSecundarioText.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorSecundario.value = e.target.value;
        triggerAutoSave();
      }
    });
  }

  // Logo file sample feedback
  const logoFileInput = document.getElementById('logoFileInput');
  const logoFileName = document.getElementById('logoFileName');
  if (logoFileInput && logoFileName) {
    logoFileInput.addEventListener('change', () => {
      if (logoFileInput.files && logoFileInput.files[0]) {
        logoFileName.textContent = `Archivo: ${logoFileInput.files[0].name}`;
        logoFileName.classList.add('text-emerald-700', 'font-semibold');
      }
      triggerAutoSave();
    });
  }

  // Contador de caracteres descripcion
  const descripcionCorta = document.getElementById('descripcionCorta');
  const descCharCount = document.getElementById('descCharCount');
  if (descripcionCorta && descCharCount) {
    descripcionCorta.addEventListener('input', () => {
      descCharCount.textContent = `${descripcionCorta.value.length} / 180`;
      triggerAutoSave();
    });
  }

  // Local fisico toggle
  const localRadios = document.querySelectorAll('input[name="tieneLocalFisico"]');
  const direccionFields = document.getElementById('direccionFields');
  localRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'SI') {
        direccionFields.classList.remove('hidden');
      } else {
        direccionFields.classList.add('hidden');
      }
      triggerAutoSave();
    });
  });

  // Envíos toggle
  const enviosRadios = document.querySelectorAll('input[name="realizaEnvios"]');
  const enviosFields = document.getElementById('enviosFields');
  enviosRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'SI') {
        enviosFields.classList.remove('hidden');
      } else {
        enviosFields.classList.add('hidden');
      }
      triggerAutoSave();
    });
  });

  // Presets de horario
  document.querySelectorAll('.preset-horario').forEach(btn => {
    btn.addEventListener('click', () => {
      const sem = btn.getAttribute('data-semana');
      const fin = btn.getAttribute('data-finde');
      if (sem) document.getElementById('horariosSemana').value = sem;
      if (fin) document.getElementById('horariosFinDeSemana').value = fin;
      showToast('Horario aplicado con éxito', 'success');
      triggerAutoSave();
    });
  });

  // ==========================================================================
  // 4. ELEMENTOS DINÁMICOS: CATEGORÍAS Y PRODUCTOS
  // ==========================================================================

  // Categorías
  const categoriesList = document.getElementById('categoriesList');
  const addCategoryBtn = document.getElementById('addCategoryBtn');

  if (addCategoryBtn && categoriesList) {
    addCategoryBtn.addEventListener('click', () => {
      const count = categoriesList.querySelectorAll('.category-item').length + 1;
      if (count > 8) {
        showToast('Se recomienda un máximo de 6 a 8 categorías principales', 'warning');
      }

      const catDiv = document.createElement('div');
      catDiv.className = 'category-item bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center';
      catDiv.innerHTML = `
        <div class="sm:col-span-5">
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Categoría ${count}</label>
          <input type="text" class="cat-name w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
            placeholder="Ej: Postres / Snacks / Guarniciones">
        </div>
        <div class="sm:col-span-6">
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Subcategorías / Variedades</label>
          <input type="text" class="cat-subs w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
            placeholder="Ej: Helados, Alfajores, Tortas">
        </div>
        <div class="sm:col-span-1 flex justify-end">
          <button type="button" class="remove-cat-btn text-slate-400 hover:text-rose-500 p-2 rounded-lg transition" title="Eliminar categoría">
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      `;

      categoriesList.appendChild(catDiv);
      triggerAutoSave();
    });

    categoriesList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-cat-btn');
      if (btn) {
        const item = btn.closest('.category-item');
        if (categoriesList.querySelectorAll('.category-item').length <= 1) {
          showToast('Debe haber al menos 1 categoría', 'warning');
          return;
        }
        item.remove();
        // Renumerar etiquetas de categoria
        categoriesList.querySelectorAll('.category-item').forEach((it, idx) => {
          const lbl = it.querySelector('label');
          if (lbl) lbl.textContent = `Categoría ${idx + 1}`;
        });
        triggerAutoSave();
      }
    });
  }

  // Productos
  const productsList = document.getElementById('productsList');
  const addProductBtn = document.getElementById('addProductBtn');

  if (addProductBtn && productsList) {
    addProductBtn.addEventListener('click', () => {
      const count = productsList.querySelectorAll('.product-item').length + 1;
      const prodDiv = document.createElement('div');
      prodDiv.className = 'product-item bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 relative';
      prodDiv.innerHTML = `
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
          <span class="product-index-badge text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">Producto #${count}</span>
          <button type="button" class="remove-product-btn text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition" title="Eliminar producto">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Nombre del producto *</label>
            <input type="text" class="prod-name w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Ej: Hamburguesa Doble Cuarto">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Categoría</label>
            <input type="text" class="prod-category w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Ej: Hamburguesas">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Precio actual *</label>
            <input type="text" class="prod-price w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Ej: $7.500">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Precio anterior tachado (oferta)</label>
            <input type="text" class="prod-old-price w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Ej: $8.500 (o vacío)">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Detalle / Presentación</label>
            <input type="text" class="prod-detail w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Ej: 240g / 750ml / Talle M a XL">
          </div>

          <div class="sm:col-span-2 md:col-span-3">
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Descripción corta</label>
            <input type="text" class="prod-desc w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Ej: Doble medallón de carne 120g, doble cheddar, cebolla picada y kétchup">
          </div>

          <div class="sm:col-span-2 md:col-span-3">
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Foto del producto (link o nombre de archivo)</label>
            <input type="text" class="prod-image w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
              placeholder="Link web o indicar: 'Foto adjunta por WhatsApp'">
          </div>
        </div>
      `;

      productsList.appendChild(prodDiv);
      triggerAutoSave();
    });

    productsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-product-btn');
      if (btn) {
        const item = btn.closest('.product-item');
        item.remove();
        // Renumerar badges de productos
        productsList.querySelectorAll('.product-item').forEach((it, idx) => {
          const badge = it.querySelector('.product-index-badge');
          if (badge) badge.textContent = `Producto #${idx + 1}`;
        });
        triggerAutoSave();
      }
    });
  }

  // ==========================================================================
  // 5. GENERACIÓN DEL MENSAJE ESTRUCTURADO PARA WHATSAPP
  // ==========================================================================

  function getFormDataObject() {
    const nombre = document.getElementById('nombreComercial')?.value.trim() || 'Sin especificar';
    const rubroSel = document.getElementById('rubroSelect')?.value || '';
    const rubroOtro = document.getElementById('rubroOtro')?.value.trim() || '';
    const rubro = (rubroSel === 'Otro' && rubroOtro) ? rubroOtro : (rubroSel || 'Sin especificar');
    const slogan = document.getElementById('slogan')?.value.trim() || 'No informado';
    const desc = document.getElementById('descripcionCorta')?.value.trim() || 'No informada';
    const c1 = document.getElementById('colorPrincipalText')?.value.trim() || '#059669';
    const c2 = document.getElementById('colorSecundarioText')?.value.trim() || '#F59E0B';
    const logoUrl = document.getElementById('logoUrl')?.value.trim();
    const logoFile = document.getElementById('logoFileInput')?.files?.[0]?.name;
    const logoInfo = logoUrl ? logoUrl : (logoFile ? `Archivo local: ${logoFile} (se enviará por chat)` : 'Se enviará por chat / A coordinar');

    // Contacto
    const whatsapp = document.getElementById('whatsappPedidos')?.value.trim() || 'No informado';
    const telVisible = document.getElementById('telefonoVisible')?.value.trim() || 'Mismo de WhatsApp / No especificado';
    const email = document.getElementById('emailContacto')?.value.trim() || 'No informado';
    const ig = document.getElementById('redInstagram')?.value.trim() || 'No informado';
    const fb = document.getElementById('redFacebook')?.value.trim() || 'No informado';
    const tiktok = document.getElementById('redTiktok')?.value.trim() || 'No informado';

    // Ubicacion & Envios
    const tieneLocal = document.querySelector('input[name="tieneLocalFisico"]:checked')?.value || 'SI';
    const direccion = document.getElementById('direccionExacta')?.value.trim() || 'No informada';
    const maps = document.getElementById('enlaceMaps')?.value.trim() || 'Sin link de Google Maps';
    const envios = document.querySelector('input[name="realizaEnvios"]:checked')?.value || 'SI';
    const costoEnvio = document.getElementById('costoEnvioEstandar')?.value.trim() || 'A cotizar según zona';
    const envioGratis = document.getElementById('envioGratisMonto')?.value.trim() || 'No especificado';
    const tiempoEntrega = document.getElementById('tiempoEntrega')?.value.trim() || 'Estimado estándar';

    // Pagos
    const pagoEfec = document.getElementById('pagoEfectivo')?.checked;
    const descEfec = document.getElementById('pagoEfectivoDescuento')?.value.trim();
    const pagoTransf = document.getElementById('pagoTransferencia')?.checked;
    const datosTransf = document.getElementById('pagoTransferenciaDatos')?.value.trim();
    const pagoMP = document.getElementById('pagoMercadoPago')?.checked;
    const datosMP = document.getElementById('pagoMercadoPagoDatos')?.value.trim();
    const pagoTarj = document.getElementById('pagoTarjeta')?.checked;
    const moneda = document.getElementById('monedaExhibicion')?.value || '$ ARS';

    // Horarios
    const horSem = document.getElementById('horariosSemana')?.value.trim() || 'No informado';
    const horFin = document.getElementById('horariosFinDeSemana')?.value.trim() || 'No informado';

    // Políticas
    const plus18 = document.querySelector('input[name="requierePlus18"]:checked')?.value || 'NO';
    const arrepentimiento = document.querySelector('input[name="botonArrepentimiento"]:checked')?.value || 'SI';
    const avisosBarra = document.getElementById('avisosBarra')?.value.trim() || 'Sin avisos especiales';
    const promo = document.getElementById('promocionDestacada')?.value.trim() || 'Ninguna / No especificada';

    // Categorias
    const categories = [];
    document.querySelectorAll('#categoriesList .category-item').forEach(it => {
      const catName = it.querySelector('.cat-name')?.value.trim();
      const catSubs = it.querySelector('.cat-subs')?.value.trim();
      if (catName) {
        categories.push({ name: catName, subs: catSubs || 'General' });
      }
    });

    // Productos
    const adjuntaArchivo = document.getElementById('adjuntaraArchivoMenu')?.checked;
    const products = [];
    document.querySelectorAll('#productsList .product-item').forEach(it => {
      const pName = it.querySelector('.prod-name')?.value.trim();
      const pCat = it.querySelector('.prod-category')?.value.trim() || 'General';
      const pPrice = it.querySelector('.prod-price')?.value.trim() || '$0';
      const pOldPrice = it.querySelector('.prod-old-price')?.value.trim() || '';
      const pDetail = it.querySelector('.prod-detail')?.value.trim() || '';
      const pDesc = it.querySelector('.prod-desc')?.value.trim() || '';
      const pImg = it.querySelector('.prod-image')?.value.trim() || '';

      if (pName) {
        products.push({
          name: pName,
          category: pCat,
          price: pPrice,
          oldPrice: pOldPrice,
          detail: pDetail,
          description: pDesc,
          image: pImg
        });
      }
    });

    return {
      nombre, rubro, slogan, desc, c1, c2, logoInfo,
      whatsapp, telVisible, email, ig, fb, tiktok,
      tieneLocal, direccion, maps, envios, costoEnvio, envioGratis, tiempoEntrega,
      pagoEfec, descEfec, pagoTransf, datosTransf, pagoMP, datosMP, pagoTarj, moneda,
      horSem, horFin,
      plus18, arrepentimiento, avisosBarra, promo,
      categories, adjuntaArchivo, products
    };
  }

  function generateWhatsAppMessageText(data) {
    let msg = `📋 *FICHA DE ALTA DE NUEVO LOCAL*\n`;
    msg += `══════════════════════════════\n`;
    msg += `📌 *1. IDENTIDAD DE MARCA Y COMERCIO*\n`;
    msg += `• *Comercio:* ${data.nombre}\n`;
    msg += `• *Rubro:* ${data.rubro}\n`;
    if (data.slogan && data.slogan !== 'No informado') {
      msg += `• *Slogan:* "${data.slogan}"\n`;
    }
    msg += `• *Descripción:* ${data.desc}\n`;
    msg += `• *Colores:* Principal: ${data.c1} | Secundario: ${data.c2}\n`;
    msg += `• *Logo:* ${data.logoInfo}\n\n`;

    msg += `📞 *2. CONTACTO Y VENTAS POR WHATSAPP*\n`;
    msg += `• *WhatsApp Pedidos:* ${data.whatsapp}\n`;
    if (data.telVisible) msg += `• *Teléfono visible:* ${data.telVisible}\n`;
    if (data.email) msg += `• *Email:* ${data.email}\n`;
    msg += `• *Instagram:* ${data.ig}\n`;
    if (data.fb && data.fb !== 'No informado') msg += `• *Facebook:* ${data.fb}\n`;
    if (data.tiktok && data.tiktok !== 'No informado') msg += `• *TikTok:* ${data.tiktok}\n\n`;

    msg += `📍 *3. UBICACIÓN, ENTREGAS Y ENVÍOS*\n`;
    msg += `• *Local a la calle / Retiro:* ${data.tieneLocal}\n`;
    if (data.tieneLocal === 'SI') {
      msg += `  - Dirección: ${data.direccion}\n`;
      if (data.maps && data.maps !== 'Sin link de Google Maps') {
        msg += `  - Maps: ${data.maps}\n`;
      }
    }
    msg += `• *Envíos a domicilio:* ${data.envios}\n`;
    if (data.envios === 'SI') {
      msg += `  - Costo estándar: ${data.costoEnvio}\n`;
      msg += `  - Envío gratis desde: ${data.envioGratis}\n`;
      msg += `  - Tiempo estimado: ${data.tiempoEntrega}\n`;
    }
    msg += `\n`;

    msg += `💳 *4. MEDIOS DE PAGO Y COBRO*\n`;
    let pagosArr = [];
    if (data.pagoEfec) pagosArr.push(`Efectivo c/ entrega${data.descEfec ? ` (${data.descEfec})` : ''}`);
    if (data.pagoTransf) pagosArr.push(`Transferencia${data.datosTransf ? ` (${data.datosTransf})` : ''}`);
    if (data.pagoMP) pagosArr.push(`Mercado Pago${data.datosMP ? ` (${data.datosMP})` : ''}`);
    if (data.pagoTarj) pagosArr.push(`Tarjeta Débito/Crédito (Posnet/Point)`);
    msg += `• *Acepta:* ${pagosArr.length ? pagosArr.join(' • ') : 'A coordinar'}\n`;
    msg += `• *Moneda:* ${data.moneda}\n\n`;

    msg += `⏰ *5. HORARIOS DE ATENCIÓN*\n`;
    msg += `• *Semana:* ${data.horSem}\n`;
    msg += `• *Fin de semana:* ${data.horFin}\n\n`;

    msg += `⚙️ *6. MÓDULOS Y POLÍTICAS*\n`;
    msg += `• *Venta +18 (Ley 24.788):* ${data.plus18}\n`;
    msg += `• *Botón de Arrepentimiento:* ${data.arrepentimiento}\n`;
    if (data.avisosBarra && data.avisosBarra !== 'Sin avisos especiales') {
      msg += `• *Avisos marquesina:* ${data.avisosBarra}\n`;
    }
    if (data.promo && data.promo !== 'Ninguna / No especificada') {
      msg += `• *Promoción destacada:* ${data.promo}\n`;
    }
    msg += `\n`;

    msg += `📦 *7. CATEGORÍAS Y PRODUCTOS*\n`;
    if (data.categories.length > 0) {
      msg += `*Pestañas de Categoría:*\n`;
      data.categories.forEach((cat, idx) => {
        msg += ` ${idx + 1}) *${cat.name}*: ${cat.subs}\n`;
      });
      msg += `\n`;
    }

    if (data.adjuntaArchivo) {
      msg += `📎 *NOTA DE CATÁLOGO:* El cliente adjuntará archivo Excel/PDF o carta completa en este chat de WhatsApp.\n\n`;
    }

    if (data.products.length > 0) {
      msg += `*Productos de muestra cargados (${data.products.length}):*\n`;
      data.products.forEach((prod, i) => {
        msg += ` ${i + 1}. *${prod.name}* [${prod.category}]\n`;
        msg += `    • Precio: ${prod.price}${prod.oldPrice ? ` (Antes: ${prod.oldPrice})` : ''}\n`;
        if (prod.detail) msg += `    • Presentación: ${prod.detail}\n`;
        if (prod.description) msg += `    • Info: ${prod.description}\n`;
        if (prod.image) msg += `    • Foto: ${prod.image}\n`;
      });
      msg += `\n`;
    }

    msg += `══════════════════════════════\n`;
    msg += `🚀 *Enviado desde el Cargador Web de Fichas de Comercio*`;

    return msg;
  }

  function refreshSummaryAndPreview() {
    const data = getFormDataObject();

    // Actualizar tarjeta de resumen visual
    const sumNombre = document.getElementById('sumNombre');
    const sumRubro = document.getElementById('sumRubro');
    const sumWhatsapp = document.getElementById('sumWhatsapp');
    const sumEntregas = document.getElementById('sumEntregas');

    if (sumNombre) sumNombre.textContent = data.nombre;
    if (sumRubro) sumRubro.textContent = data.rubro;
    if (sumWhatsapp) sumWhatsapp.textContent = data.whatsapp;
    if (sumEntregas) {
      let entStr = [];
      if (data.tieneLocal === 'SI') entStr.push('Retiro en Local');
      if (data.envios === 'SI') entStr.push('Envíos a Domicilio');
      sumEntregas.textContent = entStr.join(' + ') || 'A definir';
    }

    // Generar texto
    const text = generateWhatsAppMessageText(data);
    if (whatsappPreviewBox) {
      whatsappPreviewBox.textContent = text;
    }
    return text;
  }

  // ==========================================================================
  // 6. ACCIONES DE ENVÍO Y DESCARGA
  // ==========================================================================

  function sendToWhatsApp() {
    // Validar datos mínimos
    const nombre = document.getElementById('nombreComercial')?.value.trim();
    if (!nombre) {
      showToast('Por favor completá al menos el nombre de tu comercio', 'warning');
      goToStep(1);
      return;
    }

    const data = getFormDataObject();
    const message = generateWhatsAppMessageText(data);

    // Intentar copiar automáticamente al portapapeles por seguridad
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(() => {});
    }

    // Codificar URL para WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${DESTINATION_PHONE}?text=${encodedMessage}`;

    // Feedback al usuario y redirección
    showToast('Abriendo WhatsApp para enviar la ficha...', 'success');

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 400);
  }

  // Botón principal de WhatsApp
  if (sendToWhatsAppBtn) {
    sendToWhatsAppBtn.addEventListener('click', sendToWhatsApp);
  }

  // Botón WhatsApp en cabecera
  if (headerSendBtn) {
    headerSendBtn.addEventListener('click', sendToWhatsApp);
  }

  // Copiar al portapapeles
  if (copyTextBtn) {
    copyTextBtn.addEventListener('click', () => {
      const data = getFormDataObject();
      const message = generateWhatsAppMessageText(data);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(() => {
          showToast('¡Texto copiado al portapapeles!', 'success');
        }).catch(() => {
          fallbackCopyText(message);
        });
      } else {
        fallbackCopyText(message);
      }
    });
  }

  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('¡Texto copiado al portapapeles!', 'success');
    } catch (err) {
      showToast('No se pudo copiar automáticamente', 'error');
    }
    document.body.removeChild(textarea);
  }

  // Descargar PDF / Imprimir
  if (printPdfBtn) {
    printPdfBtn.addEventListener('click', () => {
      showToast('Preparando vista de impresión...', 'info');
      setTimeout(() => {
        window.print();
      }, 300);
    });
  }

  // Descargar copia de seguridad JSON
  if (downloadBackupBtn) {
    downloadBackupBtn.addEventListener('click', () => {
      const data = getFormDataObject();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `ficha_${(data.nombre || 'comercio').toLowerCase().replace(/\s+/g, '_')}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Copia JSON descargada', 'success');
    });
  }

  // Descargar resumen TXT
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener('click', () => {
      const data = getFormDataObject();
      const text = generateWhatsAppMessageText(data);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `ficha_${(data.nombre || 'comercio').toLowerCase().replace(/\s+/g, '_')}.txt`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Resumen TXT descargado', 'success');
    });
  }

  // ==========================================================================
  // 7. AUTOGUARDADO EN LOCALSTORAGE & RESTAURACIÓN
  // ==========================================================================
  let saveDebounceTimer = null;
  function triggerAutoSave() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      try {
        const data = getFormDataObject();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn('Error al guardar borrador en localStorage', err);
      }
    }, 400);
  }

  // Escuchar cualquier cambio en el formulario
  form.addEventListener('input', triggerAutoSave);
  form.addEventListener('change', triggerAutoSave);

  // Restaurar datos guardados al iniciar
  function restoreSavedDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);

      if (data.nombre && data.nombre !== 'Sin especificar') {
        const el = document.getElementById('nombreComercial');
        if (el) el.value = data.nombre;
      }
      if (data.rubro) {
        const sel = document.getElementById('rubroSelect');
        if (sel) {
          const exists = Array.from(sel.options).some(o => o.value === data.rubro);
          if (exists) {
            sel.value = data.rubro;
          } else {
            sel.value = 'Otro';
            rubroOtroContainer?.classList.remove('hidden');
            const otro = document.getElementById('rubroOtro');
            if (otro) otro.value = data.rubro;
          }
        }
      }
      if (data.slogan && data.slogan !== 'No informado') {
        const el = document.getElementById('slogan');
        if (el) el.value = data.slogan;
      }
      if (data.desc && data.desc !== 'No informada') {
        const el = document.getElementById('descripcionCorta');
        if (el) {
          el.value = data.desc;
          if (descCharCount) descCharCount.textContent = `${data.desc.length} / 180`;
        }
      }
      if (data.c1) {
        if (colorPrincipal) colorPrincipal.value = data.c1;
        if (colorPrincipalText) colorPrincipalText.value = data.c1;
      }
      if (data.c2) {
        if (colorSecundario) colorSecundario.value = data.c2;
        if (colorSecundarioText) colorSecundarioText.value = data.c2;
      }
      if (data.logoUrl) {
        const el = document.getElementById('logoUrl');
        if (el) el.value = data.logoUrl;
      }

      // Contacto
      if (data.whatsapp && data.whatsapp !== 'No informado') {
        const el = document.getElementById('whatsappPedidos');
        if (el) el.value = data.whatsapp;
      }
      if (data.telVisible && data.telVisible !== 'Mismo de WhatsApp / No especificado') {
        const el = document.getElementById('telefonoVisible');
        if (el) el.value = data.telVisible;
      }
      if (data.email && data.email !== 'No informado') {
        const el = document.getElementById('emailContacto');
        if (el) el.value = data.email;
      }
      if (data.ig && data.ig !== 'No informado') {
        const el = document.getElementById('redInstagram');
        if (el) el.value = data.ig;
      }
      if (data.fb && data.fb !== 'No informado') {
        const el = document.getElementById('redFacebook');
        if (el) el.value = data.fb;
      }
      if (data.tiktok && data.tiktok !== 'No informado') {
        const el = document.getElementById('redTiktok');
        if (el) el.value = data.tiktok;
      }

      // Ubicacion
      if (data.tieneLocal) {
        const rad = document.querySelector(`input[name="tieneLocalFisico"][value="${data.tieneLocal}"]`);
        if (rad) rad.checked = true;
        if (data.tieneLocal === 'NO') direccionFields?.classList.add('hidden');
      }
      if (data.direccion && data.direccion !== 'No informada') {
        const el = document.getElementById('direccionExacta');
        if (el) el.value = data.direccion;
      }
      if (data.maps && data.maps !== 'Sin link de Google Maps') {
        const el = document.getElementById('enlaceMaps');
        if (el) el.value = data.maps;
      }
      if (data.envios) {
        const rad = document.querySelector(`input[name="realizaEnvios"][value="${data.envios}"]`);
        if (rad) rad.checked = true;
        if (data.envios === 'NO') enviosFields?.classList.add('hidden');
      }
      if (data.costoEnvio && data.costoEnvio !== 'A cotizar según zona') {
        const el = document.getElementById('costoEnvioEstandar');
        if (el) el.value = data.costoEnvio;
      }
      if (data.envioGratis && data.envioGratis !== 'No especificado') {
        const el = document.getElementById('envioGratisMonto');
        if (el) el.value = data.envioGratis;
      }
      if (data.tiempoEntrega && data.tiempoEntrega !== 'Estimado estándar') {
        const el = document.getElementById('tiempoEntrega');
        if (el) el.value = data.tiempoEntrega;
      }

      // Pagos
      if (typeof data.pagoEfec === 'boolean') {
        const el = document.getElementById('pagoEfectivo');
        if (el) el.checked = data.pagoEfec;
      }
      if (data.descEfec) {
        const el = document.getElementById('pagoEfectivoDescuento');
        if (el) el.value = data.descEfec;
      }
      if (typeof data.pagoTransf === 'boolean') {
        const el = document.getElementById('pagoTransferencia');
        if (el) el.checked = data.pagoTransf;
      }
      if (data.datosTransf) {
        const el = document.getElementById('pagoTransferenciaDatos');
        if (el) el.value = data.datosTransf;
      }
      if (typeof data.pagoMP === 'boolean') {
        const el = document.getElementById('pagoMercadoPago');
        if (el) el.checked = data.pagoMP;
      }
      if (data.datosMP) {
        const el = document.getElementById('pagoMercadoPagoDatos');
        if (el) el.value = data.datosMP;
      }
      if (typeof data.pagoTarj === 'boolean') {
        const el = document.getElementById('pagoTarjeta');
        if (el) el.checked = data.pagoTarj;
      }
      if (data.moneda) {
        const el = document.getElementById('monedaExhibicion');
        if (el) el.value = data.moneda;
      }

      // Horarios
      if (data.horSem && data.horSem !== 'No informado') {
        const el = document.getElementById('horariosSemana');
        if (el) el.value = data.horSem;
      }
      if (data.horFin && data.horFin !== 'No informado') {
        const el = document.getElementById('horariosFinDeSemana');
        if (el) el.value = data.horFin;
      }

      // Políticas
      if (data.plus18) {
        const rad = document.querySelector(`input[name="requierePlus18"][value="${data.plus18}"]`);
        if (rad) rad.checked = true;
      }
      if (data.arrepentimiento) {
        const rad = document.querySelector(`input[name="botonArrepentimiento"][value="${data.arrepentimiento}"]`);
        if (rad) rad.checked = true;
      }
      if (data.avisosBarra && data.avisosBarra !== 'Sin avisos especiales') {
        const el = document.getElementById('avisosBarra');
        if (el) el.value = data.avisosBarra;
      }
      if (data.promo && data.promo !== 'Ninguna / No especificada') {
        const el = document.getElementById('promocionDestacada');
        if (el) el.value = data.promo;
      }

      // Categorias restaurar si guardadas
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        categoriesList.innerHTML = '';
        data.categories.forEach((cat, idx) => {
          const catDiv = document.createElement('div');
          catDiv.className = 'category-item bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center';
          catDiv.innerHTML = `
            <div class="sm:col-span-5">
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Categoría ${idx + 1}</label>
              <input type="text" class="cat-name w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                placeholder="Ej: Hamburguesas / Vinos" value="${cat.name || ''}">
            </div>
            <div class="sm:col-span-6">
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Subcategorías / Variedades</label>
              <input type="text" class="cat-subs w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                placeholder="Ej: Simples, Dobles" value="${cat.subs || ''}">
            </div>
            <div class="sm:col-span-1 flex justify-end">
              <button type="button" class="remove-cat-btn text-slate-400 hover:text-rose-500 p-2 rounded-lg transition" title="Eliminar categoría">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          `;
          categoriesList.appendChild(catDiv);
        });
      }

      // Productos restaurar si guardados
      if (typeof data.adjuntaArchivo === 'boolean') {
        const el = document.getElementById('adjuntaraArchivoMenu');
        if (el) el.checked = data.adjuntaArchivo;
      }

      if (Array.isArray(data.products) && data.products.length > 0) {
        productsList.innerHTML = '';
        data.products.forEach((prod, idx) => {
          const prodDiv = document.createElement('div');
          prodDiv.className = 'product-item bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 relative';
          prodDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <span class="product-index-badge text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">Producto #${idx + 1}</span>
              <button type="button" class="remove-product-btn text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition" title="Eliminar producto">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Nombre del producto *</label>
                <input type="text" class="prod-name w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Ej: Hamburguesa Doble Cuarto" value="${prod.name || ''}">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Categoría</label>
                <input type="text" class="prod-category w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Ej: Hamburguesas" value="${prod.category || ''}">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Precio actual *</label>
                <input type="text" class="prod-price w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Ej: $7.500" value="${prod.price || ''}">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Precio anterior tachado (oferta)</label>
                <input type="text" class="prod-old-price w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Ej: $8.500 (o vacío)" value="${prod.oldPrice || ''}">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Detalle / Presentación</label>
                <input type="text" class="prod-detail w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Ej: 240g / 750ml / Talle M" value="${prod.detail || ''}">
              </div>

              <div class="sm:col-span-2 md:col-span-3">
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Descripción corta</label>
                <input type="text" class="prod-desc w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Ej: Doble medallón de carne 120g..." value="${prod.description || ''}">
              </div>

              <div class="sm:col-span-2 md:col-span-3">
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Foto del producto</label>
                <input type="text" class="prod-image w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm outline-none"
                  placeholder="Link web o indicar: 'Foto adjunta por WhatsApp'" value="${prod.image || ''}">
              </div>
            </div>
          `;
          productsList.appendChild(prodDiv);
        });
      }

      showToast('Se restauró tu borrador guardado', 'info');
    } catch (e) {
      console.error('Error restaurando borrador', e);
    }
  }

  // Limpiar borrador
  if (clearDraftBtn) {
    clearDraftBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseás reiniciar el formulario y borrar los datos cargados?')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
  }

  // ==========================================================================
  // 8. TOAST NOTIFICATIONS
  // ==========================================================================
  let toastTimer = null;
  function showToast(message, type = 'success') {
    if (!toastNotification || !toastMessage) return;

    clearTimeout(toastTimer);
    toastMessage.textContent = message;

    const toastIcon = document.getElementById('toastIcon');
    if (toastIcon) {
      if (type === 'success') {
        toastIcon.className = 'text-emerald-400 text-base';
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      } else if (type === 'warning') {
        toastIcon.className = 'text-amber-400 text-base';
        toastIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
      } else if (type === 'error') {
        toastIcon.className = 'text-rose-400 text-base';
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
      } else {
        toastIcon.className = 'text-sky-400 text-base';
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
      }
    }

    toastNotification.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
    toastNotification.classList.add('opacity-100', 'translate-y-0');

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('opacity-100', 'translate-y-0');
      toastNotification.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
    }, 3200);
  }

  // ==========================================================================
  // 9. INICIO
  // ==========================================================================
  restoreSavedDraft();
  updateStepUI();
});
