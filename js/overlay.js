(function () {
    'use strict';

    const canvas = document.getElementById('mainCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const params = new URLSearchParams(window.location.search);
    const allowedProfiles = ['edicao', 'transmissao', 'transmissao-logo'];
    const allowedFonts = ['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Playfair Display'];
    const defaultResolution = '1920x1080';
    const sourceChannel = String(params.get('channel') || 'principal').trim().slice(0, 40) || 'principal';

    const state = {
        name: '',
        role: '',
        profile: 'transmissao',
        font: 'Inter',
        nameBold: true,
        nameItalic: false,
        roleBold: true,
        roleItalic: false,
        colorName: '#1e428b',
        colorRole: '#2c52a0',
        sizeName: 48,
        sizeRole: 28,
        textOffsetX: 0,
        textOffsetY: 0,
        textLineGap: 0,
        bgType: 'preset',
        colorBar1: '#2e6be6',
        colorBar2: '#ffffff',
        bgStyle: 'bndes-double',
        bgOpacity: 100,
        chromaKey: false,
        resolution: defaultResolution,
        animType: 'slide',
        barEnterType: 'slide-left',
        textEnterType: 'slide-up',
        posX: 120,
        posY: 220,
        animDuration: 1200,
        velEntradaTexto: 1000,
        holdDuration: 6000,
        velSaidaTexto: 500,
        velSaidaBarras: 800,
        textEraseType: 'erase',
        barExitType: 'zoom-collapse'
    };

    let animationRunId = 0;
    let isAnimating = false;
    let bndesLogoObj = null;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const parseResolution = (value) => {
        if (!/^\d+x\d+$/.test(String(value || ''))) return defaultResolution;
        const [width, height] = String(value).split('x').map(Number);
        if (!Number.isFinite(width) || !Number.isFinite(height)) return defaultResolution;
        return `${clamp(width, 320, 7680)}x${clamp(height, 240, 4320)}`;
    };

    const setCanvasSize = (resolution) => {
        const [width, height] = parseResolution(resolution).split('x').map(Number);
        state.resolution = `${width}x${height}`;
        canvas.width = width;
        canvas.height = height;
    };

    const hexColor = (value, fallback) => (/^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : fallback);

    const numeric = (value, fallback, min, max) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
    };

    const enumValue = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;

    const applyState = (next = {}) => {
        if (!next || typeof next !== 'object' || Array.isArray(next)) return;
        const nextResolution = parseResolution(next.resolution || state.resolution);
        if (nextResolution) setCanvasSize(nextResolution);
        const legacyEntryMap = {
            slide: 'slide-left',
            fade: 'fade-in',
            scale: 'zoom-in-dynamic'
        };
        if (typeof next.name === 'string') state.name = next.name.slice(0, 120);
        if (typeof next.role === 'string') state.role = next.role.slice(0, 240);
        state.profile = enumValue(next.profile, allowedProfiles, state.profile);
        state.font = enumValue(next.font, allowedFonts, state.font);
        state.nameBold = typeof next.nameBold === 'boolean' ? next.nameBold : state.nameBold;
        state.nameItalic = typeof next.nameItalic === 'boolean' ? next.nameItalic : state.nameItalic;
        state.roleBold = typeof next.roleBold === 'boolean' ? next.roleBold : state.roleBold;
        state.roleItalic = typeof next.roleItalic === 'boolean' ? next.roleItalic : state.roleItalic;
        state.colorName = hexColor(next.colorName, state.colorName);
        state.colorRole = hexColor(next.colorRole, state.colorRole);
        state.sizeName = numeric(next.sizeName, state.sizeName, 20, 80);
        state.sizeRole = numeric(next.sizeRole, state.sizeRole, 15, 50);
        state.textOffsetX = numeric(next.textOffsetX, state.textOffsetX, -300, 300);
        state.textOffsetY = numeric(next.textOffsetY, state.textOffsetY, -150, 150);
        state.textLineGap = numeric(next.textLineGap, state.textLineGap, -20, 60);
        state.colorBar1 = hexColor(next.colorBar1, state.colorBar1);
        state.colorBar2 = hexColor(next.colorBar2, state.colorBar2);
        state.bgStyle = enumValue(next.bgStyle, ['bndes-double', 'modern-pill', 'split-bar', 'accent-left'], state.bgStyle);
        state.bgOpacity = numeric(next.bgOpacity, state.bgOpacity, 10, 100);
        state.chromaKey = typeof next.chromaKey === 'boolean' ? next.chromaKey : state.chromaKey;
        state.animType = enumValue(next.animType, ['slide', 'fade', 'scale'], state.animType);
        if (typeof next.barEnterType === 'string') {
            state.barEnterType = enumValue(next.barEnterType, ['slide-left', 'zoom-in-dynamic', 'fade-in', 'stretch-open'], state.barEnterType);
        } else if (legacyEntryMap[next.animType]) {
            state.barEnterType = legacyEntryMap[next.animType];
        }
        state.posX = numeric(next.posX, state.posX, 0, canvas.width || 1920);
        state.posY = numeric(next.posY, state.posY, 0, canvas.height || 1080);
        state.animDuration = numeric(next.animDuration, state.animDuration, 100, 10000);
        state.velEntradaTexto = numeric(next.velEntradaTexto, state.velEntradaTexto, 100, 10000);
        state.textEnterType = enumValue(next.textEnterType, ['slide-up', 'slide-left', 'fade-in', 'zoom-in', 'typewriter'], state.textEnterType);
        state.holdDuration = numeric(next.holdDuration, state.holdDuration, 500, 60000);
        state.velSaidaTexto = numeric(next.velSaidaTexto, state.velSaidaTexto, 100, 10000);
        state.velSaidaBarras = numeric(next.velSaidaBarras, state.velSaidaBarras, 100, 10000);
        state.textEraseType = enumValue(next.textEraseType, ['erase', 'fade-only'], state.textEraseType);
        state.barExitType = enumValue(next.barExitType, ['zoom-collapse', 'slide-left', 'fade-out'], state.barExitType);
    };

    const roundRectPath = (x, y, width, height, radius) => {
        const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    const drawFittedText = (text, x, y, maxWidth, stylePrefix, desiredSize, minSize = 16) => {
        let size = Number(desiredSize) || minSize;
        const safeText = String(text ?? '');
        do {
            ctx.font = `${stylePrefix} ${size}px '${state.font}', sans-serif`;
            if (ctx.measureText(safeText).width <= maxWidth || size <= minSize) break;
            size -= 2;
        } while (size > minSize);
        ctx.fillText(safeText, x, y, maxWidth);
    };

    const drawPresetBackground = (x, y, direction, progress, customBarProgress) => {
        const op = state.bgOpacity / 100;
        const entryEffect = state.barEnterType || 'slide-left';
        ctx.save();
        ctx.globalAlpha *= op;

        if (state.bgStyle === 'bndes-double') {
            const p1 = direction === 'in' ? Math.min(1, progress * 2) : customBarProgress;
            const p2 = direction === 'in' ? Math.max(0, (progress - 0.5) * 2) : customBarProgress;
            const topBarW = 680;
            const topBarH = 72;
            const bottomBarW = 820;
            const bottomBarH = 50;
            const barFactorY = direction === 'out' && state.barExitType === 'zoom-collapse' ? customBarProgress : 1;
            const stretchFactor = direction === 'in' && entryEffect === 'stretch-open' ? progress : 1;

            ctx.fillStyle = state.colorBar1;
            ctx.fillRect(x, y + (topBarH * (1 - barFactorY) / 2), topBarW * p1 * stretchFactor, topBarH * barFactorY);

            if (p2 > 0) {
                ctx.fillStyle = state.colorBar2;
                ctx.fillRect(x, y + topBarH + (bottomBarH * (1 - barFactorY) / 2), bottomBarW * p2 * stretchFactor, bottomBarH * barFactorY);
            }
        } else if (state.bgStyle === 'modern-pill') {
            ctx.fillStyle = state.colorBar2;
            roundRectPath(x, y, 720, 120, 16);
            ctx.fill();
            ctx.fillStyle = state.colorBar1;
            ctx.fillRect(x + 12, y + 16, 8, 88);
        } else if (state.bgStyle === 'split-bar') {
            ctx.fillStyle = state.colorBar1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 580, y);
            ctx.lineTo(x + 555, y + 64);
            ctx.lineTo(x, y + 64);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = state.colorBar2;
            ctx.beginPath();
            ctx.moveTo(x + 15, y + 66);
            ctx.lineTo(x + 520, y + 66);
            ctx.lineTo(x + 500, y + 112);
            ctx.lineTo(x + 15, y + 112);
            ctx.closePath();
            ctx.fill();
        } else if (state.bgStyle === 'accent-left') {
            ctx.fillStyle = state.colorBar2;
            ctx.fillRect(x + 16, y, 644, 115);
            ctx.fillStyle = state.colorBar1;
            ctx.fillRect(x, y, 16, 115);
        }

        ctx.restore();
    };

    const drawTransmissaoBackground = (x, y, direction, progress, customBarProgress) => {
        const op = state.bgOpacity / 100;
        const entryEffect = state.barEnterType || 'slide-left';
        ctx.save();
        ctx.globalAlpha *= op;

        const barW = canvas.width;
        const barH = 145;
        const highlightH = 6;
        let currentY = y;
        if (direction === 'out' && state.barExitType === 'zoom-collapse') {
            currentY = y + (1 - customBarProgress) * 200;
        }
        const stretchFactor = direction === 'in' && entryEffect === 'stretch-open' ? progress : 1;

        ctx.fillStyle = state.colorBar2;
        ctx.fillRect(0, currentY, barW * stretchFactor, barH);

        ctx.fillStyle = state.colorBar1;
        ctx.fillRect(0, currentY, barW * stretchFactor, highlightH);

        if (state.profile === 'transmissao-logo' && bndesLogoObj?.complete && bndesLogoObj.naturalWidth > 0) {
            const logoW = Math.max(1, Math.min(280, canvas.width * 0.20) - 2);
            const logoH = logoW * (bndesLogoObj.naturalHeight / bndesLogoObj.naturalWidth) * 1.04;
            const rightMargin = Math.max(45, canvas.width * 0.04);
            ctx.drawImage(
                bndesLogoObj,
                canvas.width - rightMargin - logoW,
                currentY + (barH - logoH) / 2,
                logoW,
                logoH
            );
        }

        ctx.restore();
    };

    const drawText = (x, y, direction, progress, customTextProgress, customBarProgress) => {
        const nameText = state.name;
        const roleText = state.role;
        const styleNamePrefix = (state.nameItalic ? 'italic ' : '') + (state.nameBold ? '800' : '400');
        const styleRolePrefix = (state.roleItalic ? 'italic ' : '') + (state.roleBold ? '600' : '400');
        const isBNDESStyle = state.bgType === 'preset' && state.bgStyle === 'bndes-double' && state.profile === 'edicao';
        const isTransmissao = state.profile === 'transmissao' || state.profile === 'transmissao-logo';
        const entryEffect = state.barEnterType || 'slide-left';
        let tX = Number(state.textOffsetX) || 0;
        let tY = Number(state.textOffsetY) || 0;
        const lineGap = Number(state.textLineGap) || 0;
        if (direction === 'in') {
            const textP = Math.max(0, Math.min(1, Number(customTextProgress) || 0));
            if (state.textEnterType === 'slide-up') tY += (1 - textP) * 80;
            else if (state.textEnterType === 'slide-left') tX -= (1 - textP) * 120;
            else if (state.textEnterType === 'zoom-in') tY += (1 - textP) * 20;
        }

        if (isBNDESStyle) {
            const p1 = direction === 'in' ? Math.min(1, customTextProgress * 2) : customTextProgress;
            const p2 = direction === 'in' ? Math.max(0, (customTextProgress - 0.5) * 2) : customTextProgress;
            const topBarH = 72;

            if (p1 > 0.05) {
                ctx.save();
                ctx.shadowColor = state.chromaKey ? 'transparent' : 'rgba(0, 0, 0, 0.35)';
                ctx.shadowBlur = state.chromaKey ? 0 : 6;
                ctx.shadowOffsetX = state.chromaKey ? 0 : 1.5;
                ctx.shadowOffsetY = state.chromaKey ? 0 : 1.5;
                ctx.globalAlpha *= Math.min(1, p1 * 1.5);
                ctx.fillStyle = state.colorName;
                drawFittedText(String(nameText).toUpperCase(), x + 40 + tX, y + 48 + tY, 620, styleNamePrefix, state.sizeName, 20);
                ctx.restore();
            }

            if (p2 > 0) {
                ctx.save();
                ctx.shadowColor = state.chromaKey ? 'transparent' : 'rgba(0, 0, 0, 0.35)';
                ctx.shadowBlur = state.chromaKey ? 0 : 6;
                ctx.shadowOffsetX = state.chromaKey ? 0 : 1.5;
                ctx.shadowOffsetY = state.chromaKey ? 0 : 1.5;
                ctx.globalAlpha *= Math.min(1, p2 * 1.5);
                ctx.fillStyle = state.colorRole;
                let textLength = roleText.length;
                if (direction === 'out' && state.textEraseType === 'erase') {
                    textLength = Math.floor(roleText.length * customTextProgress);
                } else if (direction === 'in') {
                    textLength = Math.min(roleText.length, Math.ceil(roleText.length * p2 * 1.15));
                }
                const visibleText = roleText.substring(0, textLength);
                drawFittedText(visibleText, x + 40 + tX, y + topBarH + 32 + tY + lineGap, 750, styleRolePrefix, state.sizeRole, 16);
                ctx.restore();
            }
            return;
        }

        if (isTransmissao) {
            let currentY = y;
            if (direction === 'in' && entryEffect === 'slide-left') {
                currentY = y + (1 - progress) * 200;
            } else if (direction === 'out' && state.barExitType === 'zoom-collapse') {
                currentY = y + (1 - customBarProgress) * 200;
            }

            ctx.save();
            ctx.globalAlpha *= customTextProgress;
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            ctx.fillStyle = state.colorName;
            const logoReserve = state.profile === 'transmissao-logo' ? Math.min(390, canvas.width * 0.30) : 140;
            const availableTextWidth = Math.max(320, canvas.width - 140 - logoReserve - tX);
            drawFittedText(nameText, 140 + tX, currentY + 65 + tY, availableTextWidth, styleNamePrefix, state.sizeName, 20);

            ctx.fillStyle = state.colorRole;
            drawFittedText(roleText, 140 + tX, currentY + 112 + tY + lineGap, availableTextWidth, styleRolePrefix, state.sizeRole, 16);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.shadowColor = state.chromaKey ? 'transparent' : 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = state.chromaKey ? 0 : 6;
        ctx.shadowOffsetX = state.chromaKey ? 0 : 1.5;
        ctx.shadowOffsetY = state.chromaKey ? 0 : 1.5;
        ctx.globalAlpha *= customTextProgress;
        ctx.fillStyle = state.colorName;
        drawFittedText(nameText, x + 35 + tX, y + 50 + tY, 620, styleNamePrefix, state.sizeName, 20);
        ctx.fillStyle = state.colorRole;
        drawFittedText(roleText, x + 35 + tX, y + 92 + tY + lineGap, 650, styleRolePrefix, state.sizeRole, 16);
        ctx.restore();
    };

    const render = (progress = 1, direction = 'in', customTextProgress = 1, customBarProgress = 1) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (state.chromaKey) {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const width = canvas.width;
        const height = canvas.height;
        let animOffset = 0;
        let opacity = 1;
        let scale = 1;
        const isTransmissao = state.profile === 'transmissao' || state.profile === 'transmissao-logo';
        const entryEffect = state.barEnterType || 'slide-left';

        ctx.save();

        const posX = Number(state.posX);
        const posY = height - Number(state.posY);

        if (direction === 'in') {
            if (entryEffect === 'slide-left') {
                animOffset = (1 - progress) * -400;
                opacity = progress;
            } else if (entryEffect === 'fade-in') {
                opacity = progress;
            } else if (entryEffect === 'zoom-in-dynamic') {
                scale = 0.88 + (progress * 0.12);
                opacity = progress;
            } else if (entryEffect === 'stretch-open') {
                opacity = progress;
            }
            ctx.globalAlpha = opacity;
        } else if (direction === 'out') {
            if (state.barExitType === 'zoom-collapse') {
                scale = customBarProgress;
                opacity = customBarProgress;
            } else if (state.barExitType === 'slide-left') {
                animOffset = (1 - customBarProgress) * -400;
                opacity = customBarProgress;
            } else if (state.barExitType === 'fade-out') {
                opacity = customBarProgress;
            }
            ctx.globalAlpha = opacity;
        }

        if (scale !== 1) {
            const originX = isTransmissao ? width / 2 : posX + 360;
            const originY = posY + 70;
            ctx.translate(originX, originY);
            ctx.scale(scale, scale);
            ctx.translate(-originX, -originY);
        }

        if (state.bgType === 'preset') {
            if (isTransmissao) drawTransmissaoBackground(posX + animOffset, posY, direction, progress, customBarProgress);
            else drawPresetBackground(posX + animOffset, posY, direction, progress, customBarProgress);
        }

        drawText(posX + animOffset, posY, direction, progress, customTextProgress, customBarProgress);
        ctx.restore();
    };

    const waitForFonts = () => {
        if (!document.fonts?.ready) return Promise.resolve();
        return document.fonts.ready.catch(() => {});
    };

    const startAnimationCycle = () => {
        if (isAnimating) return;
        isAnimating = true;
        const runId = ++animationRunId;
        const barsIn = Math.max(1, Number(state.animDuration));
        const textIn = Math.max(1, Number(state.velEntradaTexto));
        const stages = [
            { name: 'in', duration: Math.max(barsIn, textIn) },
            { name: 'hold', duration: Math.max(1, Number(state.holdDuration)) },
            { name: 'out-text', duration: Math.max(1, Number(state.velSaidaTexto)) },
            { name: 'out-bar', duration: Math.max(1, Number(state.velSaidaBarras)) }
        ];
        let stageIndex = 0;
        let stageStartedAt = performance.now();

        render(0, 'in', 0, 0);

        const frame = (now) => {
            if (runId !== animationRunId) return;
            const stage = stages[stageIndex];
            const ratio = Math.min(1, (now - stageStartedAt) / stage.duration);

            if (stage.name === 'in') {
                const barRatio = Math.min(1, (now - stageStartedAt) / barsIn);
                const textRatio = Math.min(1, (now - stageStartedAt) / textIn);
                const easeBar = 1 - Math.pow(1 - barRatio, 3);
                const easeText = 1 - Math.pow(1 - textRatio, 3);
                render(easeBar, 'in', easeText, easeBar);
            } else if (stage.name === 'hold') {
                render(1, 'in', 1, 1);
                setTimeout(() => {
                    if (runId !== animationRunId) return;
                    stageIndex += 1;
                    stageStartedAt = performance.now();
                    requestAnimationFrame(frame);
                }, stage.duration);
                return;
            } else if (stage.name === 'out-text') {
                render(1, 'out', 1 - ratio, 1);
            } else {
                render(1, 'out', 0, Math.pow(1 - ratio, 3));
            }

            if (ratio < 1) {
                requestAnimationFrame(frame);
            } else if (++stageIndex < stages.length) {
                stageStartedAt = now;
                requestAnimationFrame(frame);
            } else {
                render(0, 'out', 0, 0);
                isAnimating = false;
            }
        };

        requestAnimationFrame(frame);
    };

    const handleLiveCommand = (event) => {
        const payload = event?.detail?.eventData || event?.detail?.event_data || event?.detail || {};
        const payloadChannel = String(payload.channel || 'principal').trim().slice(0, 40) || 'principal';
        if (payloadChannel !== sourceChannel) return;
        const action = String(payload.action || '').toLowerCase();
        animationRunId += 1;
        isAnimating = false;

        if (action === 'hide') {
            render(0, 'out', 0, 0);
            return;
        }

        if (action === 'show') {
            const nextState = payload.state || {
                name: typeof payload.name === 'string' ? payload.name : state.name,
                role: typeof payload.role === 'string' ? payload.role : state.role
            };
            applyState(nextState);
            waitForFonts().finally(() => startAnimationCycle());
        }
    };

    const init = () => {
        setCanvasSize(params.get('res') || defaultResolution);
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.display = 'block';

        bndesLogoObj = new Image();
        bndesLogoObj.decoding = 'async';
        bndesLogoObj.onload = () => render(1, 'in', 1, 1);
        bndesLogoObj.onerror = () => {
            bndesLogoObj = null;
        };
        bndesLogoObj.src = 'assets/logo-bndes.png';

        applyState({
            name: params.get('name') || '',
            role: params.get('role') || '',
            profile: params.get('profile') || 'transmissao',
            font: params.get('font') || 'Inter'
        });

        render(0, 'out', 0, 0);
        window.addEventListener('lowerThirdControl', handleLiveCommand);
        waitForFonts().then(() => render(0, 'out', 0, 0)).catch(() => {});
    };

    init();
})();
