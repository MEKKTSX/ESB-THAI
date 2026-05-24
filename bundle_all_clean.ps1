# ========================================================
# ESB THAI PREMIUM BUNDLER (No-Emoji, Non-blocking & CORS-Bypassing)
# ========================================================

# ค้นหาตำแหน่งโฟลเดอร์รันสคริปต์
$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = (Get-Location).Path
}

$htmlHeader = @"
<!DOCTYPE html>
<html lang="th" class="dark"> <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ESB Thai - Premium Dashboard</title>
    
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#0B1121">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="ESB Thai">
    <link rel="apple-touch-icon" href="icon.png">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;800&display=swap" rel="stylesheet">
    
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        navy: { 950: '#060A13', 900: '#0B1121', 800: '#151F32', 700: '#1E293B', 600: '#334155' },
                        brand: { blue: '#2563EB', accent: '#2563EB', yellow: '#FACC15' },
                        srs: {
                            again: '#271F2A', againText: '#F43F5E',
                            hard: '#2C241C', hardText: '#F59E0B',
                            good: '#1A2942', goodText: '#3B82F6',
                            easy: '#1E2C22', easyText: '#10B981'
                        }
                    },
                    fontFamily: { 
                        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
                    },
                    boxShadow: { 'glow-yellow': '0 0 25px rgba(250, 204, 21, 0.4)' }
                }
            }
        }
    </script>
    
    <style>
        body { -webkit-tap-highlight-color: transparent; overscroll-behavior-y: none; touch-action: pan-y; }
        .card-tap-active:active { transform: scale(0.98); transition: transform 0.1s; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0B1121; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
        .progress-bar-fill { transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .toggle-checkbox:checked { right: 0; border-color: #2563EB; }
        .toggle-checkbox:checked + .toggle-label { background-color: #2563EB; }
        
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined' !important;
          font-weight: normal !important;
          font-style: normal !important;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal !important;
          text-transform: none !important;
          display: inline-block;
          white-space: nowrap !important;
          word-wrap: normal !important;
          direction: ltr !important;
          -webkit-font-feature-settings: 'liga' !important;
          -webkit-font-smoothing: antialiased;
        }
    </style>

    <!-- PREMIUM ERROR OVERLAY FOR FILE:// PROTOCOL WINDOWS DEVS -->
    <script>
        function showErrorOverlay(message, source, lineno, colno, error) {
            if (document.getElementById('error-overlay')) return;
            const errorDiv = document.createElement('div');
            errorDiv.id = 'error-overlay';
            errorDiv.style.position = 'fixed';
            errorDiv.style.inset = '0';
            errorDiv.style.zIndex = '999999';
            errorDiv.style.backgroundColor = 'rgba(6, 10, 19, 0.97)';
            errorDiv.style.backdropFilter = 'blur(16px)';
            errorDiv.style.color = '#F87171';
            errorDiv.style.padding = '24px';
            errorDiv.style.fontFamily = '"Plus Jakarta Sans", Inter, system-ui, sans-serif';
            errorDiv.style.overflowY = 'auto';
            errorDiv.style.display = 'flex';
            errorDiv.style.alignItems = 'center';
            errorDiv.style.justifyContent = 'center';
            
            let stackHTML = '';
            if (error && error.stack) {
                stackHTML = "<pre style='background: #020408; color: #94A3B8; padding: 16px; border-radius: 12px; font-size: 11px; font-family: monospace; overflow-x: auto; white-space: pre-wrap; word-break: break-all; border: 1px solid rgba(255,255,255,0.03); margin-top: 12px; text-align: left; max-height: 200px;'>" + error.stack + "</pre>";
            } else if (message && (message.indexOf('SyntaxError') !== -1 || message.indexOf('Babel') !== -1)) {
                stackHTML = "<div style='color: #64748B; font-size: 11px; margin-top: 12px; text-align: left;'>💡 Suggestion: Check the syntax of React JSX, such as closing tags, brackets, quotes or variables in your code.</div>";
            }
            
            errorDiv.innerHTML = `
                <div style="max-width: 500px; width: 100%; background: #0B1121; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 28px; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); text-align: center; font-size: 14px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px;">[!]</div>
                    <h3 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; tracking: -0.02em;">Application Error Caught</h3>
                    <p style="color: #64748B; font-size: 13px; margin: 0 0 24px 0;">We detected a script loading or runtime compilation error.</p>
                    <div style="background: rgba(6, 10, 19, 0.4); border: 1px solid rgba(255,255,255,0.03); border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: left; font-family: monospace; border-left: 4px solid #EF4444;">
                        <div style="color: #F87171; font-weight: 700; font-size: 13px; line-height: 1.5; margin-bottom: 8px; word-break: break-word;">` + message + `</div>
                        <div style="color: #475569; font-size: 10px; line-height: 1.4; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px;">
                            <div><strong>Source:</strong> ` + (source || 'Babel standalone parser / compiler') + `</div>
                            <div><strong>Location:</strong> Line ` + (lineno || '?') + `, Col ` + (colno || '?') + `</div>
                        </div>
                    </div>
                    ` + stackHTML + `
                    <div style="display: flex; gap: 12px; margin-top: 28px;">
                        <button onclick="window.location.reload()" style="flex: 1; background: #2563EB; color: white; border: none; padding: 14px 24px; border-radius: 14px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s;">Reload Page</button>
                        <button onclick="localStorage.clear(); window.location.reload();" style="background: rgba(255,255,255,0.04); color: #94A3B8; border: 1px solid rgba(255,255,255,0.08); padding: 14px 18px; border-radius: 14px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s;" title="Clear local storage settings and state">Reset App</button>
                    </div>
                </div>
            `;
            if (document.body) {
                document.body.appendChild(errorDiv);
            } else {
                window.addEventListener('DOMContentLoaded', () => { document.body.appendChild(errorDiv); });
            }
        }
        window.onerror = function(message, source, lineno, colno, error) {
            showErrorOverlay(message, source, lineno, colno, error);
            return false;
        };
        const _origConsoleError = console.error;
        console.error = function(...args) {
            _origConsoleError.apply(console, args);
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            if (msg.indexOf('SyntaxError') !== -1 || msg.indexOf('Babel') !== -1 || msg.indexOf('Failed') !== -1 || msg.indexOf('TypeError') !== -1 || msg.indexOf('ReferenceError') !== -1) {
                showErrorOverlay(msg, 'Console Error Interceptor', 0, 0, null);
            }
        };
    </script>

    <script>
        window.ESB_Sessions = [];
        window.ESB_Features = {};
        window.SharedComponents = {};
    </script>
"@

$htmlFooter = @"
</head>
<body class="bg-[#0B1121] text-slate-200 font-sans min-h-screen select-none overflow-x-hidden">
    <div id="root"></div>
</body>
</html>
"@

# 1. รวบรวมและ Inline ข้อมูล Sentence data (session*.js)
$sessionFiles = @(
    "session1.js",
    "session2.js",
    "session2.1.js",
    "session2.2.js",
    "session2.3.js",
    "session3.js"
)

$inlineSessionsJs = ""
foreach ($sfile in $sessionFiles) {
    $filePath = Join-Path $scriptDir $sfile
    if (Test-Path $filePath) {
        $inlineSessionsJs += "`n// =====================================`n"
        $inlineSessionsJs += "// INLINED DATA: $sfile`n"
        $inlineSessionsJs += "// =====================================`n"
        $inlineSessionsJs += [System.IO.File]::ReadAllText($filePath)
        $inlineSessionsJs += "`n"
    } else {
        Write-Warning "Session file not found: $filePath"
    }
}

$sessionsScriptTag = "<script>`n$inlineSessionsJs`n</script>"

# 2. รวบรวมและ Inline โค้ด JSX ทั้งหมด (shared.js, app.js, ฯลฯ)
$jsxFiles = @(
    "shared.js",
    "bookmarkFeature.js",
    "upcomingFeature.js",
    "retentionFeature.js",
    "practiceFeature.js",
    "typingFeature.js",
    "voiceChatFeature.js",
    "storyFeature.js",
    "home.js",
    "study.js",
    "review.js",
    "profile.js",
    "notificationFeature.js",
    "app.js"
)

$inlineJsx = ""
foreach ($file in $jsxFiles) {
    $filePath = Join-Path $scriptDir $file
    if (Test-Path $filePath) {
        $inlineJsx += "`n// =====================================`n"
        $inlineJsx += "// FILE CONTENT: $file`n"
        $inlineJsx += "// =====================================`n"
        $inlineJsx += [System.IO.File]::ReadAllText($filePath)
        $inlineJsx += "`n"
    } else {
        Write-Warning "JSX File not found at: $filePath"
    }
}

# กำหนดสคริปต์แท็กแบบ babel
$jsxScriptTag = "<script type=`"text/babel`">`n$inlineJsx`n</script>"

# ประกอบร่างและเขียนไฟล์
$finalHtml = $htmlHeader + "`n" + $sessionsScriptTag + "`n" + $jsxScriptTag + "`n" + $htmlFooter

[System.IO.File]::WriteAllText((Join-Path $scriptDir "index.html"), $finalHtml, [System.Text.Encoding]::UTF8)

Write-Host "SUCCESS: Bundled JSX and sessions successfully!"
