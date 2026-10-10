const puppeteer = require('puppeteer');

async function testMobileAuth() {
  console.log('🚀 Iniciando prueba de autenticación móvil...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurar como iPhone 12 Pro
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    console.log('📱 Configurado como iPhone 12 Pro');
    console.log('🌐 Navegando a: https://miayudatics.web.app/loginMain\n');
    
    // Ir a la página
    const response = await page.goto('https://miayudatics.web.app/loginMain', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log(`✅ Página cargada: Status ${response.status()}\n`);
    
    // Capturar errores de consola
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Esperar un poco para que cargue todo
    await page.waitForTimeout(3000);
    
    // Verificar CSP headers
    const cspHeader = response.headers()['content-security-policy'];
    console.log('🔒 CSP Header:', cspHeader || 'NO CSP HEADER FOUND', '\n');
    
    // Verificar si hay errores de CSP
    if (cspHeader && cspHeader.includes("script-src 'none'")) {
      console.log('🚨 ERROR CRÍTICO: CSP tiene script-src \'none\'');
    }
    
    // Tomar screenshot inicial
    await page.screenshot({ path: 'mobile-login-initial.png', fullPage: true });
    console.log('📸 Screenshot inicial guardado\n');
    
    // Verificar si hay errores en el DOM
    const hasErrors = await page.evaluate(() => {
      const errors = [];
      
      // Buscar mensajes de error visibles
      const errorElements = document.querySelectorAll('[role="alert"]');
      errorElements.forEach(el => errors.push(el.textContent));
      
      // Buscar si hay campos de formulario
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      
      return {
        errorMessages: errors,
        hasEmailField: !!emailInput,
        hasPasswordField: !!passwordInput,
        emailValue: emailInput?.value || '',
        passwordValue: passwordInput?.value || '',
        bodyHTML: document.body.innerHTML.substring(0, 500)
      };
    });
    
    console.log('📋 Estado del formulario:');
    console.log('  - Campo email:', hasErrors.hasEmailField ? '✅ Presente' : '❌ NO encontrado');
    console.log('  - Campo password:', hasErrors.hasPasswordField ? '✅ Presente' : '❌ NO encontrado');
    console.log('  - Errores visibles:', hasErrors.errorMessages.length > 0 ? hasErrors.errorMessages : 'Ninguno', '\n');
    
    if (hasErrors.errorMessages.length > 0) {
      console.log('🚨 ERRORES DE VALIDACIÓN DETECTADOS SIN INTERACCIÓN:');
      hasErrors.errorMessages.forEach(err => console.log('  -', err));
      console.log('');
    }
    
    // Intentar llenar el formulario
    console.log('🧪 Llenando formulario...\n');
    
    try {
      // Click en campo email (simula touch)
      await page.tap('input[type="email"]');
      await page.waitForTimeout(500);
      
      // Escribir email
      await page.type('input[type="email"]', 'test@sena.edu.co', { delay: 100 });
      console.log('  ✅ Email escrito: test@sena.edu.co');
      
      // Click afuera para trigger validación
      await page.tap('body');
      await page.waitForTimeout(1000);
      
      // Click en campo password
      await page.tap('input[type="password"]');
      await page.waitForTimeout(500);
      
      // Escribir password
      await page.type('input[type="password"]', 'test12345', { delay: 100 });
      console.log('  ✅ Password escrito: test12345\n');
      
      // Click afuera para trigger validación
      await page.tap('body');
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.log('  ❌ Error llenando formulario:', error.message, '\n');
    }
    
    // Tomar screenshot con datos
    await page.screenshot({ path: 'mobile-login-filled.png', fullPage: true });
    console.log('📸 Screenshot con datos guardado\n');
    
    // Verificar errores después de llenar
    const afterFillErrors = await page.evaluate(() => {
      const errors = [];
      const errorElements = document.querySelectorAll('[role="alert"]');
      errorElements.forEach(el => {
        if (el.offsetParent !== null) { // Solo elementos visibles
          errors.push(el.textContent);
        }
      });
      return errors;
    });
    
    console.log('📋 Errores después de llenar:', afterFillErrors.length > 0 ? afterFillErrors : 'Ninguno', '\n');
    
    // Intentar submit
    console.log('🚀 Intentando hacer submit...\n');
    
    try {
      // Buscar botón de submit
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.tap();
        console.log('  ✅ Click en botón submit');
        
        // Esperar navegación o error
        await page.waitForTimeout(5000);
        
        // Verificar URL actual
        const currentUrl = page.url();
        console.log('  📍 URL actual:', currentUrl, '\n');
        
        if (currentUrl.includes('/funcionario') || currentUrl.includes('/casos-por-resolver')) {
          console.log('  ✅ Login exitoso - redireccionado correctamente\n');
        } else if (currentUrl.includes('/loginMain')) {
          console.log('  ⚠️  No hubo redirección\n');
        }
        
        // Tomar screenshot después de submit
        await page.screenshot({ path: 'mobile-login-after-submit.png', fullPage: true });
        console.log('📸 Screenshot después de submit guardado\n');
        
        // Verificar si apareció error
        const afterSubmitErrors = await page.evaluate(() => {
          const errors = [];
          const errorElements = document.querySelectorAll('[role="alert"]');
          errorElements.forEach(el => {
            if (el.offsetParent !== null) {
              errors.push(el.textContent);
            }
          });
          return errors;
        });
        
        if (afterSubmitErrors.length > 0) {
          console.log('❌ Errores después de submit:', afterSubmitErrors, '\n');
        }
        
      } else {
        console.log('  ❌ Botón submit no encontrado\n');
      }
    } catch (error) {
      console.log('  ❌ Error en submit:', error.message, '\n');
    }
    
    // Resultado final
    console.log('📊 RESUMEN DE ERRORES DE CONSOLA:');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('  ✅ No hay errores de consola');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🛑 Browser cerrado');
  }
}

testMobileAuth();
