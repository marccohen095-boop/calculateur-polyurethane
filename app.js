// Tarifs de base par défaut (NESTAAN S-09)
const DEFAULT_TARIFS = {
    5: { gt400: 12.23, range250_400: 12.63, range150_250: 13.03, range100_150: 13.30, range50_100: 13.96, lt50: 1200 },
    6: { gt400: 13.39, range250_400: 13.83, range150_250: 14.26, range100_150: 14.56, range50_100: 15.28, lt50: 1200 },
    7: { gt400: 14.55, range250_400: 15.02, range150_250: 15.50, range100_150: 15.82, range50_100: 16.61, lt50: 1200 },
    8: { gt400: 15.71, range250_400: 16.22, range150_250: 16.73, range100_150: 17.08, range50_100: 17.93, lt50: 1200 },
    9: { gt400: 16.87, range250_400: 17.42, range150_250: 17.97, range100_150: 18.34, range50_100: 19.25, lt50: 1200 },
    10: { gt400: 18.03, range250_400: 18.62, range150_250: 19.20, range100_150: 19.60, range50_100: 20.58, lt50: 1200 },
    11: { gt400: 19.19, range250_400: 19.81, range150_250: 20.44, range100_150: 20.86, range50_100: 21.90, lt50: 1400 },
    12: { gt400: 20.35, range250_400: 21.01, range150_250: 21.67, range100_150: 22.12, range50_100: 23.22, lt50: 1400 },
    13: { gt400: 21.50, range250_400: 22.21, range150_250: 22.91, range100_150: 23.38, range50_100: 24.54, lt50: 1400 },
    14: { gt400: 22.66, range250_400: 23.40, range150_250: 24.14, range100_150: 24.64, range50_100: 25.87, lt50: 1400 },
    15: { gt400: 23.82, range250_400: 24.60, range150_250: 25.38, range100_150: 25.90, range50_100: 27.19, lt50: 1400 },
    16: { gt400: 24.98, range250_400: 25.80, range150_250: 26.61, range100_150: 27.16, range50_100: 28.51, lt50: 1500 },
    17: { gt400: 26.14, range250_400: 26.99, range150_250: 27.85, range100_150: 28.42, range50_100: 29.84, lt50: 1500 },
    18: { gt400: 27.30, range250_400: 28.19, range150_250: 29.08, range100_150: 29.68, range50_100: 31.16, lt50: 1500 },
    19: { gt400: 28.46, range250_400: 29.39, range150_250: 30.32, range100_150: 30.94, range50_100: 32.48, lt50: 1600 },
    20: { gt400: 29.62, range250_400: 30.59, range150_250: 31.55, range100_150: 32.20, range50_100: 33.81, lt50: 1600 },
    21: { gt400: 30.78, range250_400: 31.78, range150_250: 32.79, range100_150: 33.46, range50_100: 35.13, lt50: 1600 },
    23: { gt400: 33.10, range250_400: 34.18, range150_250: 35.26, range100_150: 35.98, range50_100: 37.77, lt50: 1800 },
    25: { gt400: 35.42, range250_400: 36.57, range150_250: 37.73, range100_150: 38.50, range50_100: 40.42, lt50: 1800 }
};

// Variable globale pour stocker les tarifs actifs
let activeTarifs = JSON.parse(localStorage.getItem('mousse_tarifs')) || JSON.parse(JSON.stringify(DEFAULT_TARIFS));
let storedMarkup = localStorage.getItem('mousse_markup');
let activeMarkup = (storedMarkup !== null && !isNaN(parseFloat(storedMarkup))) ? parseFloat(storedMarkup) : 10.0;

// Variables pour les entrées utilisateur
let selectedThickness = 10;
let metrage = 120;
let clientPrice = 10000;
let clientPricePerM2 = 83.33;
let distance = 0; // 0: <=30km, 1: 30-60km, 2: >60km
let partnerDiscount = false;
let quickPayment = false;

// Sélections d'éléments DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les éléments de la page
    initThicknessGrid();
    loadInputs();
    renderTarifGridEditor();
    calculateResults();
    setupThemeToggle();

    // Event listeners
    document.getElementById('input-metrage').addEventListener('input', (e) => {
        metrage = Math.max(0, parseFloat(e.target.value) || 0);
        clientPrice = metrage * clientPricePerM2;
        document.getElementById('input-client-price').value = clientPrice.toFixed(2);
        calculateResults();
    });

    document.getElementById('input-client-price-m2').addEventListener('input', (e) => {
        clientPricePerM2 = Math.max(0, parseFloat(e.target.value) || 0);
        clientPrice = metrage * clientPricePerM2;
        document.getElementById('input-client-price').value = clientPrice.toFixed(2);
        calculateResults();
    });

    document.getElementById('input-client-price').addEventListener('input', (e) => {
        clientPrice = Math.max(0, parseFloat(e.target.value) || 0);
        clientPricePerM2 = metrage > 0 ? clientPrice / metrage : 0;
        document.getElementById('input-client-price-m2').value = clientPricePerM2.toFixed(2);
        calculateResults();
    });

    document.getElementById('select-distance').addEventListener('change', (e) => {
        distance = parseInt(e.target.value);
        calculateResults();
    });

    document.getElementById('checkbox-partner').addEventListener('change', (e) => {
        partnerDiscount = e.target.checked;
        calculateResults();
    });

    document.getElementById('checkbox-payment').addEventListener('change', (e) => {
        quickPayment = e.target.checked;
        calculateResults();
    });

    document.getElementById('input-markup').addEventListener('input', (e) => {
        activeMarkup = Math.max(0, parseFloat(e.target.value) || 0);
        localStorage.setItem('mousse_markup', activeMarkup);
        calculateResults();
    });

    // Reset button
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('Voulez-vous réinitialiser tous les tarifs aux valeurs d\'origine ?')) {
            activeTarifs = JSON.parse(JSON.stringify(DEFAULT_TARIFS));
            activeMarkup = 10.0;
            localStorage.setItem('mousse_tarifs', JSON.stringify(activeTarifs));
            localStorage.setItem('mousse_markup', activeMarkup);
            document.getElementById('input-markup').value = activeMarkup;
            renderTarifGridEditor();
            calculateResults();
        }
    });

    // Navigation des onglets
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const view = tab.getAttribute('data-view');
            document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${view}`).classList.add('active');
        });
    });
});

// Créer le sélecteur d'épaisseur interactif
function initThicknessGrid() {
    const grid = document.getElementById('thickness-grid');
    grid.innerHTML = '';
    
    Object.keys(activeTarifs).map(Number).sort((a, b) => a - b).forEach(thickness => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-thickness ${thickness === selectedThickness ? 'active' : ''}`;
        btn.setAttribute('data-val', thickness);
        btn.innerHTML = `
            <span class="thickness-num">${thickness}</span>
            <span class="thickness-unit">cm</span>
        `;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-thickness').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedThickness = thickness;
            calculateResults();
        });
        grid.appendChild(btn);
    });
}

// Charger les valeurs par défaut dans les inputs
function loadInputs() {
    document.getElementById('input-metrage').value = metrage;
    document.getElementById('input-client-price-m2').value = clientPricePerM2;
    document.getElementById('input-client-price').value = clientPrice;
    document.getElementById('input-markup').value = activeMarkup;
}

// Calculer les résultats
function calculateResults() {
    const row = activeTarifs[selectedThickness];
    if (!row) return;

    let colName = '';
    let baseRate = 0;
    let isForfait = false;

    // Déterminer la colonne selon la surface (metrage)
    if (metrage < 50) {
        colName = '<50M2 (Forfait)';
        baseRate = row.lt50;
        isForfait = true;
    } else if (metrage < 100) {
        colName = '50-100M2';
        baseRate = row.range50_100;
    } else if (metrage < 150) {
        colName = '100-150M2';
        baseRate = row.range100_150;
    } else if (metrage < 250) {
        colName = '150-250M2';
        baseRate = row.range150_250;
    } else if (metrage <= 400) {
        colName = '250-400M2';
        baseRate = row.range250_400;
    } else {
        colName = '>400M2';
        baseRate = row.gt400;
    }

    // 1. Majoration de base (ex: +10%)
    const markupMultiplier = 1 + (activeMarkup / 100);
    let currentRate = baseRate * markupMultiplier;
    const markupVal = baseRate * (activeMarkup / 100);

    // 2. Facteur Rayon (Distance)
    let rayonFactor = 1.0;
    let rayonText = '0%';
    if (distance === 1) {
        rayonFactor = 1.01;
        rayonText = '+1%';
    } else if (distance === 2) {
        rayonFactor = 1.02;
        rayonText = '+2%';
    }
    const rateAfterRayon = currentRate * rayonFactor;
    const rayonVal = currentRate * (rayonFactor - 1);

    // 3. Remise partenaire (-10%)
    let partnerFactor = 1.0;
    if (partnerDiscount) {
        partnerFactor = 0.90;
    }
    const rateAfterPartner = rateAfterRayon * partnerFactor;
    const partnerVal = rateAfterRayon * (partnerFactor - 1);

    // 4. Escompte paiement rapide (-2% pour 8 jours)
    let paymentFactor = 1.0;
    if (quickPayment) {
        paymentFactor = 0.98;
    }
    const finalUnitRate = rateAfterPartner * paymentFactor;
    const paymentVal = rateAfterPartner * (paymentFactor - 1);

    // Coût total sous-traitant
    let totalSubcontractor = 0;
    if (isForfait) {
        totalSubcontractor = finalUnitRate;
    } else {
        totalSubcontractor = finalUnitRate * metrage;
    }

    // Différence / Marge
    const difference = clientPrice - totalSubcontractor;
    const marginPercent = clientPrice > 0 ? (difference / clientPrice) * 100 : 0;

    // Mise à jour de l'affichage
    document.getElementById('result-subcontractor').textContent = formatCurrency(totalSubcontractor);
    
    const diffEl = document.getElementById('result-diff');
    diffEl.textContent = formatCurrency(difference);
    if (difference >= 0) {
        diffEl.className = 'metric-value positive';
    } else {
        diffEl.className = 'metric-value negative';
    }

    // Mise à jour du cercle de progression de la marge
    const percentEl = document.getElementById('result-margin-percent');
    percentEl.textContent = `${marginPercent.toFixed(1)}%`;
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        const radius = parseFloat(circle.getAttribute('r')) || 58;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        
        let boundedPercent = Math.min(100, Math.max(0, marginPercent));
        const offset = circumference - (boundedPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Changer la couleur du cercle de progression selon la marge
        if (marginPercent < 15) {
            circle.style.stroke = 'var(--accent-red)';
        } else if (marginPercent < 30) {
            circle.style.stroke = 'var(--accent-orange)';
        } else {
            circle.style.stroke = 'var(--accent-green)';
        }
    }

    // Mettre à jour le détail du calcul
    const detailBody = document.getElementById('detail-calculation-body');
    let calculationHTML = `
        <div class="detail-row">
            <span>Grille NESTAAN (Epaisseur ${selectedThickness}cm, Catégorie "${colName}") :</span>
            <strong>${formatCurrency(baseRate)}${isForfait ? '' : ' / m²'}</strong>
        </div>
        <div class="detail-row">
            <span>Majoration de base (+${activeMarkup}%) :</span>
            <span class="adjust-plus">+${formatCurrency(markupVal)}${isForfait ? '' : ' / m²'}</span>
        </div>
        <div class="detail-row">
            <span>Ajustement Distance (${distance === 0 ? 'Rayon ≤ 30km' : distance === 1 ? 'Rayon 30 à 60km' : 'Rayon > 60km'} : ${rayonText}) :</span>
            <span class="${distance > 0 ? 'adjust-plus' : ''}">${distance > 0 ? '+' : ''}${formatCurrency(rayonVal)}${isForfait ? '' : ' / m²'}</span>
        </div>
    `;

    if (partnerDiscount) {
        calculationHTML += `
            <div class="detail-row">
                <span>Conditions Partenaire (-10%) :</span>
                <span class="adjust-minus">${formatCurrency(partnerVal)}${isForfait ? '' : ' / m²'}</span>
            </div>
        `;
    }

    if (quickPayment) {
        calculationHTML += `
            <div class="detail-row">
                <span>Paiement 8 jours (-2%) :</span>
                <span class="adjust-minus">${formatCurrency(paymentVal)}${isForfait ? '' : ' / m²'}</span>
            </div>
        `;
    }

    calculationHTML += `
        <div class="detail-row total-unit-row">
            <span>Tarif unitaire sous-traitant calculé :</span>
            <strong>${formatCurrency(finalUnitRate)}${isForfait ? ' (Forfait)' : ' / m²'}</strong>
        </div>
    `;

    if (!isForfait) {
        calculationHTML += `
            <div class="detail-row">
                <span>Formule de coût :</span>
                <span>${metrage} m² × ${formatCurrency(finalUnitRate)} / m²</span>
            </div>
        `;
    }

    calculationHTML += `
        <div class="detail-row final-total-row">
            <span>Facturation Sous-traitant Totale :</span>
            <strong>${formatCurrency(totalSubcontractor)}</strong>
        </div>
        <div class="detail-row final-total-row">
            <span>Votre Facturation Client :</span>
            <strong>${formatCurrency(clientPrice)}</strong>
        </div>
        <div class="detail-row final-total-row margin-row">
            <span>Votre Bénéfice Net :</span>
            <strong class="${difference >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(difference)} (${marginPercent.toFixed(1)}% de marge)</strong>
        </div>
    `;

    detailBody.innerHTML = calculationHTML;
}

// Formater les valeurs monétaires
function formatCurrency(val) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

// Rendre la grille des tarifs éditable dans l'onglet Éditeur
function renderTarifGridEditor() {
    const tbody = document.getElementById('editor-table-body');
    tbody.innerHTML = '';

    Object.keys(activeTarifs).map(Number).sort((a, b) => a - b).forEach(thickness => {
        const row = activeTarifs[thickness];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${thickness} cm</strong></td>
            <td><input type="number" step="0.01" class="table-input" data-thick="${thickness}" data-col="gt400" value="${row.gt400.toFixed(2)}"></td>
            <td><input type="number" step="0.01" class="table-input" data-thick="${thickness}" data-col="range250_400" value="${row.range250_400.toFixed(2)}"></td>
            <td><input type="number" step="0.01" class="table-input" data-thick="${thickness}" data-col="range150_250" value="${row.range150_250.toFixed(2)}"></td>
            <td><input type="number" step="0.01" class="table-input" data-thick="${thickness}" data-col="range100_150" value="${row.range100_150.toFixed(2)}"></td>
            <td><input type="number" step="0.01" class="table-input" data-thick="${thickness}" data-col="range50_100" value="${row.range50_100.toFixed(2)}"></td>
            <td><input type="number" step="1" class="table-input" data-thick="${thickness}" data-col="lt50" value="${row.lt50}"></td>
        `;
        tbody.appendChild(tr);
    });

    // Ajouter des écouteurs pour mettre à jour les tarifs en temps réel
    document.querySelectorAll('.table-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const thick = parseInt(e.target.getAttribute('data-thick'));
            const col = e.target.getAttribute('data-col');
            const val = parseFloat(e.target.value) || 0;
            
            activeTarifs[thick][col] = val;
            localStorage.setItem('mousse_tarifs', JSON.stringify(activeTarifs));
            calculateResults();
        });
    });
}

// Thème sombre/clair
function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Check saved theme
    const savedTheme = localStorage.getItem('mousse_theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('mousse_theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (theme === 'light') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }
}
