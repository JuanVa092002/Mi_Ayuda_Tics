#!/bin/bash

echo "==================================================================="
echo "PRUEBA PROFUNDA DE AUTENTICACIÓN MÓVIL - MiAyudaTics"
echo "==================================================================="
echo ""

# 1. Verificar CSP headers
echo "1️⃣  Verificando CSP Headers..."
echo "-------------------------------------------------------------------"
CSP=$(curl -s -I https://miayudatics.web.app | grep -i "content-security-policy" | head -n 1)
echo "$CSP"
echo ""

if echo "$CSP" | grep -q "script-src 'none'"; then
    echo "🚨 ERROR CRÍTICO: CSP tiene script-src 'none'"
    echo "   SOLUCIÓN: Actualizar firebase.json"
elif echo "$CSP" | grep -q "script-src 'self'"; then
    echo "✅ CSP correcto: permite scripts"
else
    echo "⚠️  CSP no encontrado o mal configurado"
fi
echo ""

# 2. Descargar HTML y verificar estructura
echo "2️⃣  Verificando estructura HTML..."
echo "-------------------------------------------------------------------"
curl -s https://miayudatics.web.app > /tmp/index.html

# Verificar si hay meta CSP
META_CSP=$(grep -i "Content-Security-Policy" /tmp/index.html | head -n 1)
if [ -n "$META_CSP" ]; then
    echo "🚨 ALERTA: Encontrado meta tag CSP:"
    echo "$META_CSP"
else
    echo "✅ No hay meta tag CSP conflictivo en HTML"
fi

# Verificar script tags
echo ""
echo "Scripts encontrados:"
grep -o '<script[^>]*>' /tmp/index.html | head -n 3

# Verificar assets
echo ""
echo "Assets principales:"
grep -oE 'src="/assets/[^"]+"' /tmp/index.html | head -n 3
echo ""

# 3. Verificar que los assets se cargan
echo "3️⃣  Verificando que los assets cargan..."
echo "-------------------------------------------------------------------"
MAIN_JS=$(grep -oE '/assets/index-[^"]+\.js' /tmp/index.html | head -n 1 | sed 's|^/||')

if [ -n "$MAIN_JS" ]; then
    echo "Script principal: $MAIN_JS"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://miayudatics.web.app/$MAIN_JS")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Asset carga correctamente (HTTP $HTTP_CODE)"
    else
        echo "🚨 ERROR: Asset no carga (HTTP $HTTP_CODE)"
    fi
else
    echo "❌ No se encontró script principal"
fi
echo ""

# 4. Verificar API backend
echo "4️⃣  Verificando conexión al backend..."
echo "-------------------------------------------------------------------"
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://miayudatics-v1-0.onrender.com/api/auth/verify-token)
echo "API verify-token status: HTTP $API_HEALTH"

if [ "$API_HEALTH" = "401" ]; then
    echo "✅ Backend responde (401 es esperado sin token)"
elif [ "$API_HEALTH" = "200" ]; then
    echo "⚠️  Backend responde 200 (¿hay sesión activa?)"
else
    echo "🚨 Backend NO responde correctamente"
fi
echo ""

# 5. Descargar y analizar el JS bundle
echo "5️⃣  Analizando bundle JavaScript..."
echo "-------------------------------------------------------------------"
if [ -n "$MAIN_JS" ]; then
    curl -s "https://miayudatics.web.app/$MAIN_JS" > /tmp/bundle.js
    
    # Buscar PhoneLogin
    if grep -q "PhoneLogin" /tmp/bundle.js; then
        echo "✅ PhoneLogin encontrado en bundle"
    else
        echo "❌ PhoneLogin NO encontrado"
    fi
    
    # Buscar usePhoneLayout
    if grep -q "usePhoneLayout" /tmp/bundle.js; then
        echo "✅ usePhoneLayout encontrado en bundle"
    else
        echo "❌ usePhoneLayout NO encontrado"
    fi
    
    # Buscar validación mode
    MODE=$(grep -o "mode:['\"][^'\"]*['\"]" /tmp/bundle.js | head -n 5)
    echo ""
    echo "Modos de validación encontrados:"
    echo "$MODE"
    echo ""
fi

# 6. Crear archivo de prueba HTML
echo "6️⃣  Creando página de prueba local..."
echo "-------------------------------------------------------------------"
cat > /tmp/test-mobile.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Mobile Auth</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .success { color: #0f0; }
        .error { color: #f00; }
        .warning { color: #ff0; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #0f0; }
    </style>
</head>
<body>
    <h1>🧪 Test Mobile Auth - MiAyudaTics</h1>
    
    <div class="section">
        <h2>1. CSP Headers</h2>
        <pre id="csp-result">Verificando...</pre>
    </div>
    
    <div class="section">
        <h2>2. Script del usuario (Simula mobile)</h2>
        <pre id="user-agent"></pre>
        <pre id="user-agent-result"></pre>
    </div>
    
    <div class="section">
        <h2>3. Cargar app real</h2>
        <iframe id="app-frame" style="width: 100%; height: 500px; border: 2px solid #0f0;"></iframe>
        <pre id="frame-errors"></pre>
    </div>
    
    <script>
        // Mostrar User Agent
        const ua = navigator.userAgent;
        document.getElementById('user-agent').textContent = 'User Agent: ' + ua;
        
        // Detectar si es móvil según el detector de MiAyudaTics
        const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
        const isMobileUA = mobileKeywords.some(keyword => ua.toLowerCase().includes(keyword));
        const isMobileViewport = window.innerWidth < 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const shouldBeMobile = isMobileUA || isMobileViewport || isTouchDevice;
        
        document.getElementById('user-agent-result').textContent = 
            `Móvil detectado: ${shouldBeMobile ? '✅ SÍ' : '❌ NO'}\n` +
            `  - User Agent móvil: ${isMobileUA ? '✅' : '❌'}\n` +
            `  - Viewport < 768: ${isMobileViewport ? '✅' : '❌'} (${window.innerWidth}px)\n` +
            `  - Touch device: ${isTouchDevice ? '✅' : '❌'}`;
        
        // Cargar la app real en iframe
        const frame = document.getElementById('app-frame');
        const errors = [];
        
        frame.onerror = (msg, url, line) => {
            errors.push(`Error: ${msg} at ${url}:${line}`);
            document.getElementById('frame-errors').textContent = errors.join('\n');
            return false;
        };
        
        // Escuchar errores del iframe
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'error') {
                errors.push(event.data.message);
                document.getElementById('frame-errors').textContent = errors.join('\n');
            }
        });
        
        frame.src = 'https://miayudatics.web.app/loginMain';
        
        // Verificar CSP después de cargar
        fetch('https://miayudatics.web.app', { method: 'HEAD' })
            .then(response => {
                const csp = response.headers.get('Content-Security-Policy');
                document.getElementById('csp-result').textContent = 
                    csp ? `✅ CSP encontrado:\n${csp}` : '❌ Sin CSP header';
            })
            .catch(err => {
                document.getElementById('csp-result').textContent = `🚨 Error: ${err.message}`;
            });
    </script>
</body>
</html>
EOF

echo "✅ Archivo de prueba creado: /tmp/test-mobile.html"
echo "   Abrir con: file:///tmp/test-mobile.html"
echo ""

# Resumen final
echo "==================================================================="
echo "📊 RESUMEN"
echo "==================================================================="
echo ""
echo "✅ Pruebas completadas. Revisar resultados arriba."
echo ""
echo "📱 Para probar manualmente:"
echo "   1. Abrir: https://miayudatics.web.app/loginMain"
echo "   2. Abrir DevTools (F12) → Console"
echo "   3. Verificar que NO hay errores CSP"
echo "   4. Llenar formulario y hacer login"
echo ""
echo "🔧 Si aún hay errores:"
echo "   1. Probar en modo incógnito"
echo "   2. Limpiar cache del navegador"
echo "   3. Probar en otro navegador"
echo ""
