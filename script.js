/* =========================================================================
   script.js — v2.1 con correcciones y mejoras
   - Lógica completa original restaurada (Mapa, Perfil, Registro).
   - Nueva asignación de imágenes para contaminantes integrada.
   ========================================================================= */

(() => {
  'use strict';

  /* ---------- Funciones auxiliares ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /**
   * INICIALIZADOR PRINCIPAL
   */
    document.addEventListener('DOMContentLoaded', () => {
        initParticles();
        initScrollReveal();
        initForecastExpand();
        // Do not pass a hardcoded AQI default; initAirQualityGauge will read persisted value
        initAirQualityGauge();
        initAllCarousels();
        initContaminants();
        initInfoModal();
    try {
        if (window.feather) {
            feather.replace();
        }
    } catch (e) {
        console.warn('Feather Icons library not found.');
    }
       

          // --- Dynamic Daily Recommendations based on AQI ---
          function getCurrentAQI() {
              // Try to get AQI from the home gauge
              const el = document.getElementById('aqi-numeric-display');
              if (!el) return null;
              const v = parseInt(el.textContent);
              return isNaN(v) ? null : v;
          }

          function getRecommendationsByAQI(aqi) {
              if (aqi == null) {
                  return [
                      { icon: 'wind', title: 'Ventilation', text: 'Open windows for short periods to improve indoor air quality.' },
                      { icon: 'sun', title: 'Outdoor activity', text: 'Ideal for moderate activities. Enjoy the outdoors!' },
                      { icon: 'shield', title: 'Sensitive groups', text: 'Consider reducing prolonged or intense outdoor exertion.' }
                  ];
              }
              if (aqi <= 50) {
                  return [
                      { icon: 'wind', title: 'Excellent Air Quality', text: 'Enjoy outdoor activities freely. Little or no health risk.' },
                      { icon: 'sun', title: 'Outdoor Activities', text: 'Perfect day for sports, walks, and spending time outside.' },
                      { icon: 'smile', title: 'General Advice', text: 'No restrictions. Take advantage of the good air quality.' }
                  ];
              } else if (aqi <= 100) {
                  return [
                      { icon: 'wind', title: 'Moderate Air Quality', text: 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.' },
                      { icon: 'sun', title: 'Outdoor Activities', text: 'You can go outside, but monitor symptoms if you are sensitive.' },
                      { icon: 'shield', title: 'Sensitive Groups', text: 'Consider reducing intense or long outdoor activities.' }
                  ];
              } else if (aqi <= 150) {
                  return [
                      { icon: 'alert-circle', title: 'Unhealthy for Sensitive Groups', text: 'Children, elderly, and people with respiratory diseases should limit outdoor exertion.' },
                      { icon: 'user', title: 'General Population', text: 'Most people will not be affected, but stay alert for symptoms.' },
                      { icon: 'shield', title: 'Sensitive Groups', text: 'Avoid prolonged or intense outdoor activities.' }
                  ];
              } else if (aqi <= 200) {
                  return [
                      { icon: 'alert-triangle', title: 'Unhealthy Air Quality', text: 'Everyone may begin to experience health effects. Sensitive groups may have more serious effects.' },
                      { icon: 'activity', title: 'Limit Outdoor Activity', text: 'Children, active adults, and those with respiratory diseases should avoid prolonged outdoor exertion.' },
                      { icon: 'shield', title: 'General Advice', text: 'Others should limit outdoor activities.' }
                  ];
              } else if (aqi <= 300) {
                  return [
                      { icon: 'x-octagon', title: 'Very Unhealthy', text: 'Health alert: everyone is at increased risk. Avoid all outdoor physical activity.' },
                      { icon: 'home', title: 'Stay Indoors', text: 'Sensitive groups should avoid any outdoor activity. Others should limit outdoor exertion.' },
                      { icon: 'alert-circle', title: 'General Advice', text: 'Follow health warnings and stay updated.' }
                  ];
              } else {
                  return [
                      { icon: 'x', title: 'Hazardous', text: 'Emergency conditions. The entire population is likely to be affected.' },
                      { icon: 'home', title: 'Stay Indoors', text: 'Avoid any outdoor physical activity. Follow emergency instructions.' },
                      { icon: 'alert-octagon', title: 'Health Warning', text: 'Everyone should avoid all outdoor exertion.' }
                  ];
              }
          }

          function renderDailyRecommendations() {
              const aqi = getCurrentAQI();
              const recs = getRecommendationsByAQI(aqi);
              const list = document.getElementById('daily-recommendations-list');
              if (!list) return;
              list.innerHTML = '';
              recs.forEach(rec => {
                  const li = document.createElement('li');
                  li.innerHTML = `<i data-feather="${rec.icon}"></i><span><strong>${rec.title}:</strong> ${rec.text}</span>`;
                  list.appendChild(li);
              });
              if (window.feather) feather.replace();
          }

          // Initial render and update on AQI change
          renderDailyRecommendations();
          // Listen for AQI changes
          document.addEventListener('aqi:changed', renderDailyRecommendations);
          // Optionally, poll for AQI changes if needed
          setInterval(renderDailyRecommendations, 30000); // update every 30s
  });

  // SEGUNDO INICIALIZADOR PARA LÓGICA DE PERFIL, MAPA Y RECOMENDACIONES
  // Se mantiene separado para preservar la estructura original que funcionaba.
  document.addEventListener('DOMContentLoaded', () => {
    if ($('.profile-form')) {
        initProfilePage();
    }
    if ($('#map')) {
        initMapPage();
    }
    if ($('#personal-recommendations')) {
        initRecommendationsModule();
    }
  });


  /**
   * MÓDULO: PARTÍCULAS DEL HERO
   */
  function initParticles() {
    const container = $('#particle-container');
    if (!container) return;
    container.innerHTML = '';
    const count = 25;
    const colors = ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)'];
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes fall {
        0% { transform: translateY(-10vh) translateX(var(--x-pos)); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translateY(110vh) translateX(var(--x-pos)); opacity: 1; }
    }`;
    document.head.appendChild(style);
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        const size = 3 + Math.random() * 8;
        p.style.setProperty('--x-pos', `${Math.random() * 10 - 5}vw`);
        p.style.cssText += `
            position: absolute;
            width: ${size}px; height: ${size}px;
            border-radius: 50%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: 0;
            opacity: 0;
            animation: fall ${10 + Math.random() * 10}s ${Math.random() * 10}s linear infinite;
        `;
        container.appendChild(p);
    }
  }

  /**
   * MÓDULO: REVELACIÓN EN SCROLL (IntersectionObserver)
   */
  function initScrollReveal() {
    const sections = $$('.fade-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
  }

  /**
   * MÓDULO: ACORDEÓN DEL PRONÓSTICO
   */
  function initForecastExpand() {
    const cards = $$('.forecast-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const isExpanded = card.classList.contains('expanded');
        cards.forEach(c => c.classList.remove('expanded'));
        if (!isExpanded) {
          card.classList.add('expanded');
        }
      });
    });
  }

  /**
   * MÓDULO: MEDIDOR DE CALIDAD DEL AIRE (AQI)
   */
  function initAirQualityGauge(aqiValue) {
    const pointer = $('#aqi-pointer');
    const numericDisplay = $('#aqi-numeric-display');
    const levelDisplay = $('#aqi-level-display');
    const aqiValueText = $('#aqi-value-text');
        const homeLocationSubtitle = document.getElementById('home-location-subtitle');
    if (!pointer || !numericDisplay || !levelDisplay) return;
    const maxAqi = 300;
    // Allow overriding initial aqiValue from persisted nearest-station AQI
    try {
        const persisted = localStorage.getItem('nearest_station_aqi');
        if (persisted && persisted !== '') {
            const pv = Number(persisted);
            if (!isNaN(pv)) aqiValue = pv;
        }
    } catch (e) {}

    function render(value) {
        const v = (value == null || isNaN(value)) ? 0 : Number(value);
        const angle = Math.max(-90, Math.min(90, (v / maxAqi) * 180 - 90));
        let level = 'Good';
        if (v > 50) level = 'Moderate';
        if (v > 100) level = 'Unhealthy for Sensitive Groups';
        if (v > 150) level = 'Unhealthy';
        if (v > 200) level = 'Very Unhealthy';
        if (v > 300) level = 'Hazardous';
        requestAnimationFrame(() => {
            try { pointer.style.transform = `translateX(-50%) rotate(${angle}deg)`; } catch(e){}
            try { numericDisplay.textContent = v || '--'; } catch(e){}
            try { levelDisplay.textContent = level; } catch(e){}
            try { if (aqiValueText) aqiValueText.textContent = `${v} AQI`; } catch(e){}
        });
    }

    // Helper: determine if levelDisplay has wrapped to multiple lines or is too long
    function checkAndToggleStack() {
        try {
            const container = document.querySelector('.aqi-gauge-container');
            if (!container || !levelDisplay) return;
            // If the scrollHeight is greater than clientHeight, text wrapped
            const wrapped = levelDisplay.scrollHeight > levelDisplay.clientHeight || levelDisplay.textContent.length > 20;
            if (wrapped) container.classList.add('aqi-stack'); else container.classList.remove('aqi-stack');
        } catch (e) {
            // ignore
        }
    }

    // run after render to allow DOM to update
    document.addEventListener('aqi:changed', () => { setTimeout(checkAndToggleStack, 80); });
    window.addEventListener('resize', () => { setTimeout(checkAndToggleStack, 120); });
    // ensure check after initial render
    setTimeout(checkAndToggleStack, 700);

    // initial render
    setTimeout(() => render(aqiValue), 500);

    // Helper: sanitize station id like 'airnow:Brownsville-McAllen:26.1900,-97.6900' => 'Brownsville-McAllen'
    function sanitizeStationName(raw) {
        if (!raw || typeof raw !== 'string') return raw;
        // remove common prefix before first ':'
        let s = raw;
        if (s.includes(':')) s = s.split(':').slice(1).join(':');
        // if coordinates present after last ':', remove them
        if (s.match(/\d+\.\d+/)) {
            // remove trailing ':lat,lon' if present
            const parts = s.split(':');
            if (parts.length > 1) {
                s = parts.slice(0, parts.length - 1).join(':');
            }
        }
        return s.trim();
    }

    // Listen to same-page events
    document.addEventListener('aqi:changed', (ev) => {
        const newAqi = ev && ev.detail && ev.detail.aqi;
        const stationName = ev && ev.detail && ev.detail.stationName;
        if (newAqi != null && !isNaN(Number(newAqi))) render(Number(newAqi));
        // update home subtitle if stationName provided
        try {
            if (stationName && homeLocationSubtitle) homeLocationSubtitle.textContent = 'Nearest station: ' + sanitizeStationName(stationName);
        } catch (e) {}
    });

    // Listen to storage changes (from other pages/tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'nearest_station_aqi') {
            const val = e.newValue;
            if (val != null && val !== '' && !isNaN(Number(val))) render(Number(val));
        }
    });
    // Initialize home subtitle from persisted station name (if present)
    try {
        const persistedName = localStorage.getItem('nearest_station_name');
        if (persistedName && homeLocationSubtitle) homeLocationSubtitle.textContent = 'Nearest station: ' + sanitizeStationName(persistedName);
    } catch (e) {}
  }

  /**
   * MÓDULO: CONTROLADOR DE CARRUSELES
   */
  function initAllCarousels() {
    $$('.carousel-wrapper').forEach(wrapper => {
      const track = wrapper.querySelector('.carousel-track');
      const prevBtn = wrapper.querySelector('.carousel-arrow.prev');
      const nextBtn = wrapper.querySelector('.carousel-arrow.next');
      if (track) {
        setupCarousel(track, prevBtn, nextBtn);
      }
    });
  }

  /**
   * MÓDULO: INTERACCIÓN DE CONTAMINANTES (CON IMÁGENES INTEGRADAS)
   */
  function initContaminants() {
    const cards = document.querySelectorAll('.contaminant-card');
    const detailsPanel = document.getElementById('contaminant-details-panel');
    const detailsWrapper = detailsPanel ? detailsPanel.querySelector('.details-content-wrapper') : null;

    if (!detailsPanel || !detailsWrapper) {
        cards.forEach(card => {
            card.addEventListener('click', () => {
                console.log('Contaminant card clicked:', card.dataset.contaminant);
            });
        });
        return;
    }

    
   const modalData = {
    'sabias-que-1': {
        title: 'Did you know?',
        content: `<p>Indoor air can be <strong>2 to 5 times more polluted</strong> than the air outside. This is often due to poor ventilation trapping common household pollutants.</p><p>Sources include:</p><ul><li>Volatile Organic Compounds (VOCs) from cleaning products, paints, and furniture.</li><li>Smoke from cooking and candles.</li><li>Mold spores and pet dander.</li></ul><p>Monitoring indoor air is a key step to creating a healthier living space.</p>`
    },
    'aqi': {
        title: 'What is the AQI?',
        content: `<p>The <strong>Air Quality Index (AQI)</strong> is a government-run scale that makes it easy to understand how clean or polluted your local air is, and what associated health effects might be a concern for you.</p><p>Think of it like a thermometer for air quality, running from 0 to 500. The higher the AQI value, the greater the level of air pollution and the greater the health concern. The scale is divided into color-coded categories for clarity.</p>`
    },
    'contaminantes': {
        title: 'Main Pollutants',
        content: `<p>The AQI tracks five major air pollutants to determine air quality:</p><ul><li><strong>Particulate Matter (PM2.5 & PM10):</strong> Tiny particles from smoke, dust, and industry that can penetrate deep into the lungs.</li><li><strong>Ground-Level Ozone (O3):</strong> A primary component of smog, created by chemical reactions from car and industrial emissions in sunlight.</li><li><strong>Carbon Monoxide (CO):</strong> A toxic gas released from burning fuel, such as in cars and furnaces.</li><li><strong>Sulfur Dioxide (SO2) & Nitrogen Dioxide (NO2):</strong> Gases primarily from the burning of fossil fuels at power plants and in vehicles.</li></ul>`
    },
    'sabias-que-2': {
        title: 'Did you know?',
        content: `<p>Often called "nature's lungs," trees and plants are incredible air purifiers. Through a process called <strong>phytoremediation</strong>, they absorb harmful gases like nitrogen dioxide and ozone through their leaves.</p><p>Their leaves and bark also act as natural filters, trapping particulate matter and removing it from the air we breathe. Even indoor plants can significantly improve air quality in your home or office!</p>`
    },
    'como-mejorar': {
        title: 'How to Protect Your Health',
        content: `<p>You can take simple steps to protect yourself from air pollution, especially on high-AQI days:</p><ul><li><strong>Check the daily AQI forecast</strong> in your area to plan your activities.</li><li><strong>Limit strenuous outdoor exercise</strong> when air quality is poor.</li><li>Keep windows closed on high-pollution days and use <strong>air purifiers with HEPA filters</strong> indoors.</li><li>Consider wearing a well-fitting mask (like an N95) if you need to be outside for extended periods in unhealthy air.</li></ul>`
    }
};

    let activeCard = null;

    const updatePanelContent = (data) => {
        detailsWrapper.innerHTML = `
            <div class="details-content">
                <div class="details-text">
                    <h3>${data.title}</h3>
                    <h4>What is it?</h4>
                    <p>${data.description}</p>
                    <h4>What does the value mean?</h4>
                    <p>${data.meaning}</p>
                    <h4>Where is it found?</h4>
                    <p>${data.sources}</p>
                </div>
                <img src="images/${data.image}" alt="${data.title}" class="details-image">
            </div>`;
    };

    cards.forEach(card => {
        const contaminantId = card.dataset.contaminant;
        const data = contaminantsData[contaminantId];
        const iconContainer = card.querySelector('.card-icon');

        // Reemplazar ícono con imagen
        if (data && iconContainer) {
            const img = document.createElement('img');
            img.src = `images/${data.image}`;
            img.alt = data.title;
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            iconContainer.innerHTML = ''; 
            iconContainer.appendChild(img);
        }
        
        card.addEventListener('click', () => {
            const data = contaminantsData[contaminantId];
            const isPanelOpen = detailsPanel.classList.contains('active');
            if (card === activeCard) {
                detailsPanel.classList.remove('active');
                card.classList.remove('active');
                activeCard = null;
                return;
            }
            if (activeCard) {
                activeCard.classList.remove('active');
            }
            card.classList.add('active');
            activeCard = card;
            if (isPanelOpen) {
                detailsWrapper.classList.add('fading');
                setTimeout(() => {
                    updatePanelContent(data);
                    detailsWrapper.classList.remove('fading');
                }, 300);
            } else {
                updatePanelContent(data);
                detailsPanel.classList.add('active');
                setTimeout(() => {
                    detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
  }

  /**
   * MÓDULO: VENTANA MODAL PARA "CONOCE MÁS"
   */
  function initInfoModal() {
    const modalOverlay = document.getElementById('info-modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close-btn');
    const carouselCards = document.querySelectorAll('.info-card');
    if (!modalOverlay || carouselCards.length === 0) return;
    
   
const contaminantsData = {
    pm25: {
        title: 'Particulate Matter (PM2.5)',
        description: 'Microscopic particles less than 2.5 micrometers in diameter, about 1/30th the width of a human hair. Because they are so small and light, they can stay in the air for longer periods and can penetrate deep into the lungs and even enter the bloodstream.',
        meaning: 'The WHO guideline for annual average exposure is 5 µg/m³. Any level above this increases the risk of respiratory and cardiovascular diseases. Consistent values above 12 µg/m³ are often considered unhealthy for sensitive groups.',
        sources: 'Primarily from combustion sources like vehicle exhaust, power plants, industrial emissions, wildfires, and even indoor activities like cooking and burning candles.',
        image: '2.5PM.jpg'
    },
    pm10: {
        title: 'Particulate Matter (PM10)',
        description: 'Inhalable coarse particles with a diameter between 2.5 and 10 micrometers. They are smaller than a strand of hair but larger than PM2.5. They can irritate the eyes, nose, and throat and can worsen conditions like asthma and bronchitis.',
        meaning: 'The WHO considers an annual average of 15 µg/m³ to be the guideline limit. Short-term spikes above 50 µg/m³ can cause significant respiratory issues, especially for people with pre-existing conditions.',
        sources: 'Generated from mechanical processes like road dust kicked up by vehicles, construction sites, landfills, and agriculture. Also includes natural sources like pollen and mold spores.',
        image: '10PM.jpg'
    },
    co: {
        title: 'Carbon Monoxide (CO)',
        description: 'A colorless, odorless, and tasteless gas often called the "silent killer." It is highly toxic because it reduces the ability of blood to carry oxygen to the body\'s organs and tissues.',
        meaning: 'Outdoor levels are typically low. The health standard is usually around 9 ppm (9,000 ppb) over 8 hours. Any sustained indoor concentration is a serious concern, as it points to faulty fuel-burning appliances.',
        sources: 'Results from the incomplete combustion of carbon-containing fuels. Common sources include vehicle exhaust, industrial processes, and malfunctioning residential appliances like furnaces, water heaters, and stoves.',
        image: 'CO.jpg'
    },
    so2: {
        title: 'Sulfur Dioxide (SO₂)',
        description: 'A colorless, highly reactive gas with a sharp, pungent odor similar to a struck match. It can irritate the skin and mucous membranes of the eyes, nose, and throat, and particularly affects the respiratory system.',
        meaning: 'Even short-term exposure to levels around 75 ppb can cause significant bronchoconstriction in people with asthma. The WHO guideline for a 24-hour period is about 15 ppb.',
        sources: 'The largest source is the burning of fossil fuels (containing sulfur) by power plants and other industrial facilities. Other sources include industrial smelters and volcanic eruptions.',
        image: 'SO2.jpg'
    },
    no2: {
        title: 'Nitrogen Dioxide (NO₂)',
        description: 'A reddish-brown gas with a sharp, biting odor. It is a major contributor to urban haze and a precursor to both ozone and acid rain. It can aggravate respiratory diseases, particularly asthma, leading to coughing, wheezing, or difficulty breathing.',
        meaning: 'The WHO guideline for annual average exposure is about 5 ppb (10 µg/m³). Levels often spike near heavy traffic, and concentrations above 100 ppb can cause significant respiratory distress.',
        sources: 'Emitted from high-temperature combustion processes, primarily from car, truck, and bus engines, as well as power plants and industrial boilers.',
        image: 'NO2.jpg'
    },
    o3: {
        title: 'Ground-Level Ozone (O₃)',
        description: 'Unlike the protective ozone layer in the stratosphere, ground-level ozone is a harmful pollutant and the main component of smog. It is not emitted directly but is formed by chemical reactions in the atmosphere.',
        meaning: 'Often called a "sunburn for your lungs," it can cause chest pain, coughing, and throat irritation. Levels above 70 ppb are considered unhealthy for sensitive groups, and prolonged exposure can damage the lungs.',
        sources: 'It is a secondary pollutant, created when nitrogen oxides (NOx) and volatile organic compounds (VOCs) react in the presence of sunlight and heat. This is why ozone levels are highest on hot, sunny afternoons.',
        image: 'OZONO.jpg'
    }

    function openModal(id) {
        const data = modalData[id];
        if (!data) return;
        modalBody.innerHTML = `<h2>${data.title}</h2>${data.content}`;
        modalOverlay.classList.add('visible');
        document.body.classList.add('modal-open');
    }
    function closeModal() {
        modalOverlay.classList.remove('visible');
        document.body.classList.remove('modal-open');
    }
    carouselCards.forEach(card => {
        card.addEventListener('click', () => openModal(card.dataset.modalId));
    });
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });
  }

  /**
   * LÓGICA DEL CARRUSEL
   */
  function setupCarousel(track, prevBtn, nextBtn) {
    const cards = [...track.children];
    if (cards.length === 0) return;
    const cardsToClone = Math.min(cards.length, 5);
    for (let i = 0; i < cardsToClone; i++) track.appendChild(cards[i].cloneNode(true));
    for (let i = cards.length - 1; i >= cards.length - cardsToClone; i--) track.prepend(cards[i].cloneNode(true));
    let currentIndex = cardsToClone;
    let isTransitioning = false;
    let autoScrollInterval;
    const updatePosition = (instant = false) => {
      isTransitioning = !instant;
      const cardWidth = cards[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(track).gap) || 16;
      track.style.transition = instant ? 'none' : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    };
    const moveTo = (index) => {
        if (isTransitioning) return;
        currentIndex = index;
        updatePosition();
    };
    if(nextBtn) nextBtn.addEventListener('click', () => moveTo(currentIndex + 1));
    if(prevBtn) prevBtn.addEventListener('click', () => moveTo(currentIndex - 1));
    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      if (currentIndex >= cards.length + cardsToClone) {
          currentIndex = cardsToClone;
          updatePosition(true);
      }
      if (currentIndex < cardsToClone) {
          currentIndex = cards.length + cardsToClone - 1;
          updatePosition(true);
      }
    });
    const startAutoScroll = () => {
        stopAutoScroll();
        autoScrollInterval = setInterval(() => moveTo(currentIndex + 1), 4000);
    };
    const stopAutoScroll = () => clearInterval(autoScrollInterval);
    if(track.parentElement.parentElement) {
        track.parentElement.parentElement.addEventListener('mouseenter', stopAutoScroll);
        track.parentElement.parentElement.addEventListener('mouseleave', startAutoScroll);
    }
    updatePosition(true);
    startAutoScroll();
    window.addEventListener('resize', () => updatePosition(true));
  }

  // =========================================================================
  // LÓGICA ESPECÍFICA DE LA PÁGINA DE PERFIL, MAPA Y RECOMENDACIONES
  // =========================================================================

  /**
   * MÓDULO: Lógica de la página del Mapa (COMPLETA)
   */
  function  initMapPage() {
    const mapDiv = document.getElementById("map");
    if (mapDiv && typeof L !== 'undefined') {
        var map = L.map('map').setView([19.4326, -99.1332], 6);
        L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=y6eMi6szg7ZddVJclXiY', {
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        }).addTo(map);

        const detectedLocationEl = document.getElementById('detected-location');
        const panelAqiValueEl = document.getElementById('panel-aqi-value');
        const panelAqiEmojiEl = document.getElementById('panel-aqi-emoji');
        const pollutantSelect = document.getElementById('pollutant-select');
        const infoDetalles = document.getElementById('info-detalles');
        const MAPTILER_KEY = 'y6eMi6szg7ZddVJclXiY';

        map.locate({ setView: true, maxZoom: 12 });

        // DIAGNÓSTICO: comprobar disponibilidad y scripts cargados
        try {
            console.debug('Leaflet object:', typeof L, L && L.version ? ('v' + L.version) : 'no-version');
            const loadedScripts = Array.from(document.scripts).map(s=>s.src).filter(Boolean);
            console.debug('Loaded scripts:', loadedScripts);
        } catch (e) { console.warn('Diag logs failed', e); }

        // Capturar errores de recursos (por ejemplo 404 en scripts/tiles/fetch)
        try {
            window.addEventListener('error', (ev) => {
                try {
                    if (ev && ev.target && ev.target.src) {
                        console.error('Resource load error:', ev.target.src);
                    }
                } catch (e) {}
            }, true);
            window.addEventListener('unhandledrejection', (ev) => { console.error('Unhandled promise rejection', ev.reason); });
        } catch (e) {}

        // Safety: remove any leftover overlay canvases that might visually tint the map
        try {
            const canvases = map.getContainer().querySelectorAll('canvas');
            canvases.forEach(c => {
                try {
                    const style = window.getComputedStyle(c);
                    const mix = style.mixBlendMode || c.style.mixBlendMode || '';
                    const op = parseFloat(style.opacity || c.style.opacity || '1');
                    if (mix.toLowerCase().includes('overlay') || op > 0.8) {
                        c.remove();
                    }
                } catch (e) {}
            });
        } catch (e) {}

        async function reverseGeocodeMapTiler(lat, lng) {
            if (!MAPTILER_KEY) return null;
            try {
                const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`;
                const res = await fetch(url);
                if (!res.ok) return null;
                const data = await res.json();
                if (data && data.features && data.features.length > 0) {
                    const feat = data.features[0];
                    const context = feat.context || [];
                    const result = {
                        label: feat.place_name || '',
                        state: null,
                        region: null,
                        country: null
                    };
                    context.forEach(c => {
                        if (c.id && c.id.startsWith('region')) result.state = c.text;
                        if (c.id && c.id.startsWith('county')) result.region = c.text;
                        if (c.id && c.id.startsWith('country')) result.country = c.text;
                    });
                    return result;
                }
            } catch (err) {
                console.warn('Reverse geocode failed', err);
            }
            return null;
        }

        map.on('locationfound', async function(e) {
            L.marker(e.latlng).addTo(map).bindPopup("You are here 📍").openPopup();
            if (detectedLocationEl) {
                detectedLocationEl.textContent = `${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}`;
            }
            if (MAPTILER_KEY) {
                const info = await reverseGeocodeMapTiler(e.latlng.lat, e.latlng.lng);
                if (info && info.state && detectedLocationEl) {
                    detectedLocationEl.textContent = info.state + (info.country ? `, ${info.country}` : '');
                }
            }
            // save last location and try to highlight nearest station
            lastDetectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
            // if stations already loaded, highlight nearest
            if (stationsCache && stationsCache.length > 0) {
                highlightNearestStation(e.latlng.lat, e.latlng.lng);
            }
        });

        function aqiToColorEmoji(aqi) {
            if (aqi <= 50) return { color: 'var(--aqi-good)', emoji: '🤩' };
            if (aqi <= 100) return { color: 'var(--aqi-moderate)', emoji: '🙂' };
            if (aqi <= 150) return { color: 'var(--aqi-unhealthy-sensitive)', emoji: '😷' };
            if (aqi <= 200) return { color: 'var(--aqi-unhealthy)', emoji: '😟' };
            if (aqi <= 300) return { color: 'var(--aqi-very-unhealthy)', emoji: '😵' };
            return { color: 'var(--aqi-hazardous)', emoji: '☠️' };
        }

        // Initialize panel with persisted nearest_station_aqi if available, otherwise placeholders
        try {
            const persisted = localStorage.getItem('nearest_station_aqi');
            if (persisted != null && persisted !== '' && !isNaN(Number(persisted))) {
                const pv = Number(persisted);
                const face = aqiToColorEmoji(pv);
                if (panelAqiValueEl) panelAqiValueEl.textContent = String(Math.round(pv));
                if (panelAqiEmojiEl) panelAqiEmojiEl.textContent = face.emoji;
            } else {
                if (panelAqiValueEl) panelAqiValueEl.textContent = '--';
                if (panelAqiEmojiEl) panelAqiEmojiEl.textContent = '';
            }
        } catch (e) {
            if (panelAqiValueEl) panelAqiValueEl.textContent = '--';
            if (panelAqiEmojiEl) panelAqiEmojiEl.textContent = '';
        }
        
        const markerLayers = {
            aqi: L.layerGroup().addTo(map),
            halo: L.layerGroup().addTo(map),
            pm25: L.layerGroup(),
            pm10: L.layerGroup(),
            o3: L.layerGroup(),
            no2: L.layerGroup(),
            so2: L.layerGroup(),
            co: L.layerGroup()
        };

    // Heat overlay pane + canvas (covers whole map, draws radial gradients per station)
    // Toggle: set to true to enable canvas heat overlay. This is a fallback used when Leaflet.heat
    // is not available. Set to false to disable.
    const ENABLE_HEAT = false; // disabled: using circle halos instead of canvas overlay
        try {
            if (!map.getPane('heatPane')) {
                map.createPane('heatPane');
                const p = map.getPane('heatPane');
                p.style.zIndex = 450; // above tiles, below markers
                p.style.pointerEvents = 'none';
            } else {
                // remove any existing canvas children that might have been left from previous runs
                try {
                    const p = map.getPane('heatPane');
                    const canvases = p.querySelectorAll && p.querySelectorAll('canvas');
                    if (canvases && canvases.length) {
                        canvases.forEach(c => { try { c.remove(); } catch (e) {} });
                    }
                } catch (e) {}
            }
            // ensure no heat listeners remain (safe no-op if none were attached)
            try { map.off('moveend', drawHeat); map.off('zoomend', drawHeat); map.off('resize', resizeHeatCanvas); } catch (e) {}
            // clear any in-memory canvas refs
            try { if (heatCanvas && heatCanvas.parentNode) heatCanvas.parentNode.removeChild(heatCanvas); } catch (e) {}
            heatCanvas = null; heatCtx = null; heatPoints = [];
        } catch (e) {}

    // Canvas overlay for heatmap-like coverage (kept but can be disabled with ENABLE_HEAT)
    let heatCanvas = null;
    let heatCtx = null;
    let heatPoints = [];
    // (leafletHeatLayer removed) Using canvas fallback only.

        function createHeatCanvas() {
            try {
                const pane = map.getPane('heatPane');
                if (!pane) return;
                if (!heatCanvas) {
                    heatCanvas = document.createElement('canvas');
                    heatCanvas.dataset.heatCanvas = '1';
                    heatCanvas.style.position = 'absolute';
                    heatCanvas.style.top = '0';
                    heatCanvas.style.left = '0';
                    heatCanvas.style.width = '100%';
                    heatCanvas.style.height = '100%';
                    heatCanvas.style.pointerEvents = 'none';
                    // use overlay blend and moderate opacity so the map remains visible
                    heatCanvas.style.mixBlendMode = 'overlay';
                    heatCanvas.style.opacity = '0.6';
                    pane.appendChild(heatCanvas);
                    heatCtx = heatCanvas.getContext('2d');
                }
                resizeHeatCanvas();
            } catch (e) {
                console.warn('Could not create heat canvas', e);
            }
        }

        function resizeHeatCanvas() {
            if (!heatCanvas || !heatCtx) return;
            const size = map.getSize();
            const ratio = window.devicePixelRatio || 1;
            heatCanvas.width = size.x * ratio;
            heatCanvas.height = size.y * ratio;
            heatCanvas.style.width = size.x + 'px';
            heatCanvas.style.height = size.y + 'px';
            heatCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function metersToPixels(meters, lat) {
            const earthCircumference = 40075017; // meters
            const latRad = lat * Math.PI / 180;
            const metersPerPixel = earthCircumference * Math.cos(latRad) / Math.pow(2, map.getZoom() + 8);
            return meters / metersPerPixel;
        }

        function drawHeat() {
            if (!heatCanvas || !heatCtx) return;
            resizeHeatCanvas();
            const ctx = heatCtx;
            const size = map.getSize();
            ctx.clearRect(0, 0, size.x, size.y);
            // soft blur via context.filter (supported in modern browsers)
            try { ctx.filter = 'blur(4px) saturate(1.15)'; } catch (e) { ctx.filter = 'none'; }
            // draw each point as a radial gradient covering many pixels
            const currentZoom = map.getZoom() || 6;
            // scale factor: at low zoom we want larger spread; at high zoom reduce it
            const zoomScale = Math.max(0.5, Math.pow(1.6, (10 - currentZoom)));
            heatPoints.forEach(p => {
                try {
                    const latlng = L.latLng(p.lat, p.lng);
                    const point = map.latLngToContainerPoint(latlng);
                    // apply zoomScale to radiusMeters before converting to pixels
                    const meters = (p.radiusMeters || 40000) * zoomScale;
                    const radiusPx = Math.max(40, metersToPixels(meters, p.lat));
                    const grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radiusPx);
                    // center: stronger, mid: visible, edge: transparent
                    grad.addColorStop(0, p.color.replace('rgb', 'rgba').replace(')', ',0.65)'));
                    grad.addColorStop(0.45, p.color.replace('rgb', 'rgba').replace(')', ',0.38)'));
                    grad.addColorStop(1, p.color.replace('rgb', 'rgba').replace(')', ',0.0)'));
                    // use additive compositing for richer overlapping colors
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, radiusPx, 0, Math.PI * 2);
                    ctx.fill();
                } catch (e) {}
            });
            // reset
            try { ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over'; } catch (e) {}
        }

        // create canvas/listeners only if enabled
        if (ENABLE_HEAT) {
            createHeatCanvas();
            map.on('moveend zoomend', drawHeat);
            map.on('resize', () => { resizeHeatCanvas(); drawHeat(); });
        }

        // Supabase config (will fetch from public table `latest_air_quality`)
        const SUPABASE_URL = 'https://kqegcdizoltciupsozco.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWdjZGl6b2x0Y2l1cHNvemNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzE2MzYsImV4cCI6MjA3NDk0NzYzNn0.9PKz0IAC_3_tgF6q-n8ruckfLSt5XOcGDVzHSTTZsaI'

        // Helper: color by AQI value
        function getAQIColor(aqi) {
            if (aqi == null || isNaN(aqi)) return '#999999';
            if (aqi <= 50) return '#00e400';
            if (aqi <= 100) return '#ffff00';
            if (aqi <= 150) return '#ff7e00';
            if (aqi <= 200) return '#ff0000';
            if (aqi <= 300) return '#8f3f97';
            return '#7e0023';
        }

        function getMaxAQIFromStation(st) {
            const vals = ['pm25','pm10','o3','no2','so2','co'].map(k => {
                const v = st[k];
                return (v == null || isNaN(v) || v < 0) ? null : Number(v);
            }).filter(v => v != null);
            return vals.length ? Math.max(...vals) : null;
        }

        // returns { name: 'pm25', value: 12 } or null
        function getDominantPollutant(st) {
            if (!st) return null;
            const keys = ['pm25','pm10','o3','no2','so2','co'];
            let best = null;
            keys.forEach(k => {
                const v = st[k];
                if (v != null && !isNaN(v) && v >= 0) {
                    if (!best || Number(v) > best.value) best = { name: k, value: Number(v) };
                }
            });
            return best;
        }

        function pollutantLabel(key) {
            if (!key) return '--';
            const map = { pm25: 'PM2.5', pm10: 'PM10', o3: 'O3', no2: 'NO2', so2: 'SO2', co: 'CO' };
            return map[key] || key;
        }

        // cache for stations
        let stationsCache = [];
    // registry of markers by station id (for clicks)
    const markerRegistry = new Map();
        // last detected user location (if any) {lat,lng}
        let lastDetectedLocation = null;

        // Haversine distance (meters)
        function haversineDistance(lat1, lon1, lat2, lon2) {
            const toRad = v => v * Math.PI / 180;
            const R = 6371e3; // meters
            const φ1 = toRad(lat1);
            const φ2 = toRad(lat2);
            const Δφ = toRad(lat2 - lat1);
            const Δλ = toRad(lon2 - lon1);
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        function highlightNearestStation(lat, lon) {
            if (!stationsCache || stationsCache.length === 0) return null;
            let best = null;
            let bestDist = Infinity;
            stationsCache.forEach(st => {
                if (!st.lat || !st.lon) return;
                const d = haversineDistance(lat, lon, Number(st.lat), Number(st.lon));
                if (d < bestDist) { bestDist = d; best = st; }
            });
            if (!best) return null;
            // update panel with station AQI and dominant pollutant in existing UI
            const stationAqi = getMaxAQIFromStation(best);
            const face = aqiToColorEmoji(stationAqi || 55);
            const dominant = getDominantPollutant(best);
            if (panelAqiValueEl) panelAqiValueEl.textContent = stationAqi != null ? `${Math.round(stationAqi)}` : '--';
            if (panelAqiEmojiEl) panelAqiEmojiEl.textContent = face.emoji;

            // zoom to marker if present
            const rec = best.station_id ? markerRegistry.get(best.station_id) : null;
            // show transit toast while animating
            showTransitToast(`Moving to nearest station: ${best.station_id || 'station'}`, 2600);
            if (rec && rec.marker) {
                // temporarily shrink marker to avoid large colored blob during zoom
                const origRadius = (rec.marker && rec.marker.options && rec.marker.options.radius) ? rec.marker.options.radius : 6;
                try { rec.marker.setStyle({ radius: Math.max(3, Math.round(origRadius * 0.6)) }); } catch (e) {}
                try { map.flyTo([best.lat, best.lon], 12, { animate: true, duration: 2.5 }); } catch(e) { map.setView([best.lat, best.lon], 12); }
                setTimeout(() => {
                    try { rec.marker.openPopup(); } catch(e) {}
                    // restore size after arrival
                    setTimeout(() => { try { rec.marker.setStyle({ radius: origRadius }); } catch(e) {} }, 300);
                }, 900);
            } else {
                try { map.flyTo([best.lat, best.lon], 12, { animate: true, duration: 2.5 }); } catch(e) { map.setView([best.lat, best.lon], 12); }
            }
            // set detectedLocationEl to show nearest station summary
            if (detectedLocationEl) {
                const km = (bestDist/1000).toFixed(2);
                const coords = (best.lat != null && best.lon != null) ? `:${Number(best.lat).toFixed(4)},${Number(best.lon).toFixed(4)}` : '';
                detectedLocationEl.innerHTML = `${best.station_id || 'Nearest station'}${coords}<span class="station-distance"> — ${km} km away from you</span>`;
            }
            // persist nearest station AQI so other pages (Home) can read it
            try {
                if (stationAqi != null && !isNaN(Number(stationAqi))) {
                    localStorage.setItem('nearest_station_aqi', String(Math.round(stationAqi)));
                    // also persist station name so Home can display it
                    try { if (best && best.station_id) localStorage.setItem('nearest_station_name', String(best.station_id)); } catch (e) {}
                    document.dispatchEvent(new CustomEvent('aqi:changed', { detail: { aqi: Math.round(stationAqi), stationName: best && best.station_id ? best.station_id : null } }));
                }
            } catch (e) {}
            return best;
        }

        // transient toast shown during animated moves
        function showTransitToast(text, duration = 2500) {
            let toast = document.getElementById('transit-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'transit-toast';
                toast.style.position = 'absolute';
                // try to place below navbar if available
                const nav = document.getElementById('navbar');
                if (nav) {
                    const r = nav.getBoundingClientRect();
                    toast.style.top = (r.bottom + 10) + 'px';
                    toast.style.left = (r.left + r.width/2) + 'px';
                    toast.style.transform = 'translateX(-50%)';
                } else {
                    toast.style.top = '18px';
                    toast.style.left = '50%';
                    toast.style.transform = 'translateX(-50%)';
                }
                toast.style.zIndex = 2000;
                toast.style.background = 'rgba(0,0,0,0.8)';
                toast.style.color = '#fff';
                toast.style.padding = '10px 14px';
                toast.style.borderRadius = '8px';
                toast.style.fontSize = '14px';
                toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 200ms ease-in-out';
                document.body.appendChild(toast);
            }
            toast.textContent = text;
            // show
            requestAnimationFrame(() => { toast.style.opacity = '1'; });
            // hide after duration
            clearTimeout(toast._hideTimer);
            toast._hideTimer = setTimeout(() => {
                toast.style.opacity = '0';
                // optionally remove after fade
                setTimeout(() => {
                    try { if (toast.parentNode) toast.parentNode.removeChild(toast); } catch(e) {}
                }, 300);
            }, duration);
        }

        async function loadStationsFromSupabase() {
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/latest_air_quality?select=*&limit=2000`, {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`
                    }
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const stations = await res.json();

                // save cache and render filtered
                stationsCache = stations.slice();
                renderFilteredStations();

                // update panel counts placeholder (renderFilteredStations will also update counts)
                const infoDetallesEl = document.getElementById('info-detalles');
                if (infoDetallesEl) {
                    const n = stationsCache.length || 0;
                    infoDetallesEl.textContent = `${n} station${n === 1 ? '' : 's'} loaded.`;
                }
                // if we already had a detected location, highlight nearest now that stations exist
                if (lastDetectedLocation) {
                    highlightNearestStation(lastDetectedLocation.lat, lastDetectedLocation.lng);
                }

            } catch (err) {
                console.error('Error loading stations:', err);
                const infoDetalles = document.getElementById('info-detalles');
                if (infoDetalles) infoDetalles.textContent = `Error loading data: ${err.message}`;
            }
        }

        // Render stations applying filters from inputs
        function renderFilteredStations() {
            // read filters
            const minEl = document.getElementById('aqi-min');
            const maxEl = document.getElementById('aqi-max');
            const min = minEl && minEl.value !== '' ? Number(minEl.value) : null;
            const max = maxEl && maxEl.value !== '' ? Number(maxEl.value) : null;

            // clear all marker layers
            Object.values(markerLayers).forEach(l => l.clearLayers());

            // Clear registry and rebuild only with visible stations so halos update correctly
            try { markerRegistry.clear(); } catch (e) {}

            // Read pollutant selection so we can filter stations by pollutant if requested
            const selectedPollutant = (pollutantSelect && pollutantSelect.value) ? pollutantSelect.value : 'aqi';

            // counts per category
            const counts = { good:0, moderate:0, unhealthy_sensitive:0, unhealthy:0, very_unhealthy:0, hazardous:0 };
            // heat points for canvas overlay (cleared each render)
            heatPoints = [];
            // heat data for potential heat implementations: array of [lat, lng, intensity]
            let heatData = [];

            stationsCache.forEach(st => {
                if (!st.lat || !st.lon) return;
                const maxAqi = getMaxAQIFromStation(st);

                // filter by AQI numeric
                if (min != null && (maxAqi == null || maxAqi < min)) return;
                if (max != null && (maxAqi == null || maxAqi > max)) return;

                // If a pollutant filter is selected (not 'aqi'), only include stations
                // that have a value for that pollutant. This guarantees halos match
                // the currently visible pollutant layer.
                if (selectedPollutant && selectedPollutant !== 'aqi') {
                    if (!(st[selectedPollutant] != null && !isNaN(st[selectedPollutant]))) return;
                }

                // no text search filter (removed)

                // determine color and category
                const color = getAQIColor(maxAqi);
                let cat = 'hazardous';
                if (maxAqi == null) cat = 'moderate';
                else if (maxAqi <= 50) cat = 'good';
                else if (maxAqi <= 100) cat = 'moderate';
                else if (maxAqi <= 150) cat = 'unhealthy_sensitive';
                else if (maxAqi <= 200) cat = 'unhealthy';
                else if (maxAqi <= 300) cat = 'very_unhealthy';
                else cat = 'hazardous';
                counts[cat]++;

                const baseRadius = 6; // default pixel radius (can be adjusted by zoom handler)
                const marker = L.circleMarker([st.lat, st.lon], {
                    radius: baseRadius,
                    fillColor: color,
                    color: '#ffffff',
                    weight: 1.5,
                    fillOpacity: 0.9
                });

                // create a larger semi-transparent halo (in meters) for visibility from far
                let halo = null;
                try {
                    const haloMeters = 20000; // base halo radius in meters (20 km)
                    halo = L.circle([st.lat, st.lon], {
                        radius: haloMeters,
                        fillColor: color,
                        color: null,
                        weight: 0,
                        fillOpacity: 0.14,
                        interactive: false
                    });
                    halo.addTo(markerLayers.halo);
                } catch (e) { halo = null; }

                // add to heatPoints for canvas overlay (covering whole map)
                try {
                    // convert hex color to rgb string for canvas gradient stops
                    const hex = color.replace('#','');
                    const bigint = parseInt(hex, 16);
                    const r = (bigint >> 16) & 255;
                    const g = (bigint >> 8) & 255;
                    const b = bigint & 255;
                    const rgb = `rgb(${r}, ${g}, ${b})`;
                    // Use a larger base radius so points produce broad areas at low zoom.
                    // We'll also scale this per-zoom in drawHeat so the coverage grows when zoomed out.
                    // intensity [0..1] based on AQI (normalized to 300 AQI)
                    try {
                        const intensity = (maxAqi != null && !isNaN(maxAqi)) ? Math.min(1, Number(maxAqi) / 300) : 0.12;
                        heatData.push([Number(st.lat), Number(st.lon), intensity]);
                    } catch (e) {}
                    if (typeof ENABLE_HEAT !== 'undefined' && ENABLE_HEAT) {
                        heatPoints.push({ lat: Number(st.lat), lng: Number(st.lon), color: rgb, radiusMeters: 120000 });
                    }
                } catch (e) {}

                // popup content
                const popupParts = [];
                popupParts.push(`<div style="min-width:200px">`);
                popupParts.push(`<div style="font-weight:bold; margin-bottom:6px">${st.station_id || 'Estación'}</div>`);
                popupParts.push(`<div style="font-size:12px; color:#6b7280; margin-bottom:8px">${Number(st.lat).toFixed(4)}, ${Number(st.lon).toFixed(4)}</div>`);
                // if we have user's detected location, show distance to this station
                try {
                        if (lastDetectedLocation && lastDetectedLocation.lat != null && lastDetectedLocation.lng != null) {
                            const distMeters = haversineDistance(Number(st.lat), Number(st.lon), lastDetectedLocation.lat, lastDetectedLocation.lng);
                            if (!isNaN(distMeters)) {
                                const km = (distMeters/1000).toFixed(2);
                                popupParts.push(`<div style="font-size:12px;color:#6b7280;margin-bottom:8px">Distance to you: ${km} km away</div>`);
                            }
                        }
                } catch (e) {}
                ['pm25','o3','pm10','no2','so2','co'].forEach(k => {
                    if (st[k] != null && !isNaN(st[k])) {
                        const rounded = Math.round(Number(st[k]));
                        const badgeColor = (k==='pm25' || k==='o3') ? getAQIColor(rounded) : '#e5e7eb';
                        popupParts.push(`<div style="display:flex;justify-content:space-between;margin:4px 0"><span style="font-size:13px">${k.toUpperCase()}</span><span style="background:${badgeColor};padding:2px 8px;border-radius:4px;color:${(badgeColor===' #e5e7eb' ? '#000':'#fff')}">${rounded}</span></div>`);
                    }
                });
                if (st.ts) {
                    const d = new Date(st.ts);
                    popupParts.push(`<div style="margin-top:8px;font-size:11px;color:#9ca3af;border-top:1px solid #eee;padding-top:6px">Última: ${d.toLocaleString()}</div>`);
                }
                popupParts.push(`</div>`);

                marker.bindPopup(popupParts.join(''));

                // marker click: slow animated zoom and open popup
                marker.on('click', () => {
                    try { map.flyTo([st.lat, st.lon], 12, { animate: true, duration: 2.5 }); } catch(e) { map.setView([st.lat, st.lon], 12); }
                    setTimeout(() => marker.openPopup(), 900);
                    // update detected-location and AQI display with clicked station info
                    const stationAqi = getMaxAQIFromStation(st);
                    const face = aqiToColorEmoji(stationAqi || 55);
                    // show station name and distance (if known)
                    try {
                        if (detectedLocationEl) {
                            if (lastDetectedLocation && lastDetectedLocation.lat != null && lastDetectedLocation.lng != null) {
                                const d = haversineDistance(Number(st.lat), Number(st.lon), lastDetectedLocation.lat, lastDetectedLocation.lng);
                                const km = isNaN(d) ? '' : ` — ${ (d/1000).toFixed(2) } km away from you`;
                                const coords = (st.lat != null && st.lon != null) ? `:${Number(st.lat).toFixed(4)},${Number(st.lon).toFixed(4)}` : '';
                                detectedLocationEl.innerHTML = `${st.station_id || 'Unknown'}${coords}<span class="station-distance">${km}</span>`;
                            } else {
                                detectedLocationEl.textContent = `${st.station_id || 'Unknown'}`;
                            }
                        }
                    } catch (e) {}
                    if (panelAqiValueEl) panelAqiValueEl.textContent = stationAqi != null ? `${Math.round(stationAqi)}` : '--';
                    if (panelAqiEmojiEl) panelAqiEmojiEl.textContent = face.emoji;
                    // NOTE: do not persist clicked station AQI here — Home should reflect
                    // only the station considered 'nearest' by the geolocation flow.
                });

                // add marker to aqi layer and pollutant-specific layers
                marker.addTo(markerLayers.aqi);
                if (st.pm25 != null) marker.addTo(markerLayers.pm25);
                if (st.pm10 != null) marker.addTo(markerLayers.pm10);
                if (st.o3 != null) marker.addTo(markerLayers.o3);
                if (st.no2 != null) marker.addTo(markerLayers.no2);
                if (st.so2 != null) marker.addTo(markerLayers.so2);
                if (st.co != null) marker.addTo(markerLayers.co);
                // save reference for only the stations we've actually added (so adjustMarkerSizes
                // iterates only visible entries and halos update correctly)
                if (st.station_id) markerRegistry.set(st.station_id, { marker, station: st, heatCircle: halo });
            });

            // adjust marker sizes according to current zoom
            function adjustMarkerSizes() {
                const z = map.getZoom() || 6;
                // pixel radius for the small marker
                const base = 6;
                const scale = Math.max(0.5, 6 / z);
                markerRegistry.forEach((rec) => {
                    try {
                        const r = Math.max(2, Math.round(base * scale));
                        rec.marker.setStyle({ radius: r });
                        // adjust halo (heat circle) radius in meters so halos become dramatically
                        // larger when the map is zoomed out (low z), and much smaller when zoomed in.
                        // We use an exponential growth when z is below a reference zoom, and cap
                        // the value to avoid absurdly large radii.
                        if (rec.heatCircle && typeof rec.heatCircle.setRadius === 'function') {
                            const minMeters = 2000;      // minimum halo radius (2 km)
                            const baseMeters = 20000;    // reference radius at anchorZoom (20 km)
                            const anchorZoom = 9;        // zoom level where baseMeters applies
                            const growthFactor = 2.0;    // how fast the halo grows per zoom level below anchor
                            const maxMeters = 800000;    // cap to ~800 km for very-zoomed-out views

                            // If current zoom is below anchorZoom, exponent positive -> growth; else exponent 0 -> baseMeters
                            const exponent = Math.max(0, (anchorZoom - z));
                            let meters = Math.round(baseMeters * Math.pow(growthFactor, exponent));
                            // enforce bounds
                            meters = Math.min(maxMeters, Math.max(minMeters, meters));
                            try { rec.heatCircle.setRadius(meters); } catch (e) {}
                        }
                    } catch (e) {}
                });
            }
            // call initially and on zoom end
            adjustMarkerSizes();
            map.on('zoomend', adjustMarkerSizes);

            // update legend counts
            updateLegendCounts(counts);

            // After we update markers, draw the canvas-based heat overlay (transparent backgrounds)
            try {
                if (typeof ENABLE_HEAT !== 'undefined' && ENABLE_HEAT) {
                    createHeatCanvas();
                    drawHeat();
                }
            } catch (e) {}

            // side panel AQI is updated only when the user selects a marker or when
            // the nearest-station flow updates it. Avoid automatic updates here.
        }

        function updateLegendCounts(counts) {
            const legendRoot = document.getElementById('aqi-legend');
            if (!legendRoot) return;
            // ensure a counts container
            let countsRoot = legendRoot.querySelector('.legend-counts');
            if (!countsRoot) {
                countsRoot = document.createElement('div');
                countsRoot.className = 'legend-counts';
                countsRoot.style.marginTop = '8px';
                countsRoot.style.fontSize = '13px';
                countsRoot.style.display = 'grid';
                countsRoot.style.gridTemplateColumns = '1fr 1fr';
                countsRoot.style.gap = '6px 12px';
                legendRoot.appendChild(countsRoot);
            }
            countsRoot.innerHTML = `
                <div>Good (0-50): ${counts.good}</div>
                <div>Moderate (51-100): ${counts.moderate}</div>
                <div>Unhealthy (sensitive) (101-150): ${counts.unhealthy_sensitive}</div>
                <div>Unhealthy (151-200): ${counts.unhealthy}</div>
                <div>Very Unhealthy (201-300): ${counts.very_unhealthy}</div>
                <div>Hazardous (301+): ${counts.hazardous}</div>
            `;
        }

        // station select removed per request

        // initial load and polling
        loadStationsFromSupabase();
        setInterval(loadStationsFromSupabase, 5 * 60 * 1000);
        // ----------------------


        function showLayer(key) {
            // Remove only the pollutant/aqi layers (but we will ensure halo is re-added)
            Object.keys(markerLayers).forEach(k => {
                try {
                    if (k === 'halo') return; // keep halo handling explicit below
                    if (map.hasLayer(markerLayers[k])) map.removeLayer(markerLayers[k]);
                } catch (e) {}
            });
            // Add the requested main layer (aqi or pollutant)
            try { if (markerLayers[key]) markerLayers[key].addTo(map); } catch (e) {}
            // Always ensure halos are visible together with the selected layer
            try { if (markerLayers.halo && !map.hasLayer(markerLayers.halo)) markerLayers.halo.addTo(map); } catch (e) {}
        }

        if (pollutantSelect) {
            pollutantSelect.addEventListener('change', (e) => {
                // when pollutant selection changes, rebuild markers/halos according to the filter
                try { renderFilteredStations(); } catch (err) { console.warn('renderFilteredStations failed on pollutant change', err); }
                showLayer(e.target.value);
            });
        }

        // wire filter inputs
    const aqiMinEl = document.getElementById('aqi-min');
    const aqiMaxEl = document.getElementById('aqi-max');
    const aqiClearBtn = document.getElementById('aqi-clear');
    [aqiMinEl, aqiMaxEl].forEach(el => { if (el) el.addEventListener('input', () => renderFilteredStations()); });
    if (aqiClearBtn) aqiClearBtn.addEventListener('click', () => { if (aqiMinEl) aqiMinEl.value=''; if (aqiMaxEl) aqiMaxEl.value=''; renderFilteredStations(); });
        
        (function renderAqiLegend() {
            const legendRoot = document.getElementById('aqi-legend');
            if (!legendRoot) return;
            const barsContainer = legendRoot.querySelector('.legend-bars');
            if (!barsContainer) return;
            const ranges = [
                { label: '0-50', varName: '--aqi-good' },
                { label: '51-100', varName: '--aqi-moderate' },
                { label: '101-150', varName: '--aqi-unhealthy-sensitive' },
                { label: '151-200', varName: '--aqi-unhealthy' },
                { label: '201-300', varName: '--aqi-very-unhealthy' },
                { label: '301+', varName: '--aqi-hazardous' }
            ];
            barsContainer.innerHTML = '';
            ranges.forEach(r => {
                const color = getComputedStyle(document.documentElement).getPropertyValue(r.varName).trim() || '#ccc';
                const seg = document.createElement('div');
                seg.className = 'legend-segment';
                seg.style.background = color;
                const label = document.createElement('div');
                label.className = 'range-label';
                label.textContent = r.label;
                seg.appendChild(label);
                barsContainer.appendChild(seg);
            });
        })();
    }
  }

  


  /**
   * MÓDULO: Lógica de la página de Cuenta/Perfil (COMPLETA)
   */
  function initProfilePage() {
    const editIcons = document.querySelectorAll('.edit-icon');
    const saveButton = document.querySelector('.save-button');
    const registerModal = document.getElementById('register-modal');
    const openRegister = document.getElementById('open-register');
    const closeRegister = document.getElementById('close-register');
    const cancelRegister = document.getElementById('cancel-register');
    const registerForm = document.getElementById('register-form');
    const PROFILE_KEY = 'aeris_profile_v1';
    
    // --- Lógica de Edición ---
    const toggleEdit = (input, isEditing) => {
        if(!input) return;
        input.readOnly = !isEditing;
        const icon = input.parentElement.querySelector('.edit-icon');
        if (isEditing) {
            input.focus();
            input.select();
            input.style.borderBottom = '1px solid var(--color-primary)';
            if(icon) {
                icon.classList.remove('fa-pen');
                icon.classList.add('fa-check');
            }
        } else {
            input.style.borderBottom = '1px solid transparent';
            if(icon) {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-pen');
            }
        }
    };
    
    if(editIcons.length) {
        editIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const fieldId = icon.dataset.field;
                const input = document.getElementById(fieldId);
                const currentlyEditing = !input.readOnly;
                if (!currentlyEditing) {
                    toggleEdit(input, true);
                    if(saveButton) saveButton.classList.remove('hidden');
                } else {
                    toggleEdit(input, false);
                    if (!document.querySelector('.profile-form input[readonly="false"]') && saveButton) {
                        saveButton.classList.add('hidden');
                    }
                    console.log(`Guardando cambio para ${fieldId}: ${input.value}`);
                }
            });
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.profile-form input:not([readonly])').forEach(input => {
                toggleEdit(input, false);
                console.log(`Guardado masivo para ${input.id}: ${input.value}`);
            });
            saveButton.classList.add('hidden');
        });
    }

    // --- Lógica de Registro y LocalStorage ---
    const usStates = ['Alabama','Alaska', /* ... y otros estados ... */ ,'Wyoming'];
    const stateSelect = document.getElementById('reg-state');
    if (stateSelect) {
        usStates.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            stateSelect.appendChild(opt);
        });
    }
    
    function saveProfile(data) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    }

    function loadProfile() {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }

    function openRegisterModal(prefill = false) {
        if (!registerModal) return;
        if (prefill) {
            const profile = loadProfile();
            if (profile) {
                $('#reg-name').value = profile.fullName || '';
                $('#reg-email').value = profile.email || '';
                // ... rellenar otros campos
            }
        } else {
            if (registerForm) registerForm.reset();
        }
        registerModal.classList.add('visible'); // O usa style.display = 'flex'
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (!registerModal) return;
        registerModal.classList.remove('visible'); // O usa style.display = 'none'
        document.body.classList.remove('modal-open');
    }

    if(openRegister) openRegister.addEventListener('click', (e) => { e.preventDefault(); openRegisterModal(false); });
    if(closeRegister) closeRegister.addEventListener('click', closeModal);
    if(cancelRegister) cancelRegister.addEventListener('click', closeModal);
    if(registerModal) registerModal.addEventListener('click', (ev) => { if (ev.target === registerModal) closeModal(); });

    if(registerForm){
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                fullName: $('#reg-name').value,
                email: $('#reg-email').value,
                state: $('#reg-state').value,
                respCondition: $('#reg-resp').value,
                activityLevel: $('#reg-activity').value,
                outdoorTime: $('#reg-outdoor').value,
                prefTime: $('#reg-preftime').value,
                sensitivity: $('#reg-sens').value
            };
            saveProfile(data);
            refreshProfileState();
            closeModal();
        });
    }
    
    function refreshProfileState() {
        const profile = loadProfile();
        const prompt = $('#register-prompt');
        if (profile) {
            if(prompt) prompt.style.display = 'none';
            $('#name').value = profile.fullName || 'JuanPerez';
            $('#email').value = profile.email || 'juan.perez@aeris.com';
            $('#location').value = profile.state || 'Ciudad de México';
            $('#sensitive-status').textContent = `Sí (${profile.respCondition || 'Asma'})`;
        } else {
            if(prompt) prompt.style.display = 'block';
            $('#name').value = '';
            $('#email').value = '';
            $('#location').value = '';
            $('#sensitive-status').textContent = 'No registrado';
        }
    }

    refreshProfileState();
  }

  /* ===== PERSONALIZED RECOMMENDATIONS MODULE - BEGIN (copy/paste friendly) ===== */
(function(){
    // Simple helper to get stored profile (same key used elsewhere)
    const PROFILE_KEY = 'aeris_profile_v1';
    function loadProfile() {
        try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch(e) { return null; }
    }

    function getCurrentAqi() {
        const el = document.getElementById('current-aqi-value');
        if (!el) return null;
        const v = parseInt(el.textContent);
        return isNaN(v) ? null : v;
    }

    function pickRandom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

    // Rules engine: returns array of recommendation objects {title, text, badge}
    function generateRecommendations(profile, aqi) {
        const recs = [];
        // If no profile, return some general recommendations (randomized)
        if (!profile) {
            const generics = [
                { title: 'Walk more often', text: 'Try adding short walks (15-20 min) during your day to improve cardiopulmonary health.', badge: 'Tip' },
                { title: 'Ventilate your home', text: 'Opening windows 10-15 minutes a day helps renew indoor air and reduce accumulated pollutants.', badge: 'Home' },
                { title: 'Stay hydrated', text: 'Keep hydrated: drinking water regularly helps maintain healthy mucous membranes.', badge: 'Health' },
                { title: 'Avoid peak traffic', text: 'If possible, schedule outdoor activities outside peak traffic hours.', badge: 'AQI' }
            ];
            // return 3 random generics
            while (recs.length < 3) {
                const r = pickRandom(generics);
                if (!recs.find(x=>x.title===r.title)) recs.push(r);
            }
            return recs;
        }

        // 1) Recommendations based on respiratory condition
        const cond = (profile.respCondition || '').toLowerCase();
        if (cond.includes('asma') || cond.includes('epoc') || cond.includes('fibrosis')) {
            recs.push({ title: 'Check your inhalers', text: 'Make sure your inhalers and medications are at hand and review your action plan with your doctor.', badge: 'Medication' });
        }
        if (cond.includes('alerg') || cond.includes('sinusitis') || cond.includes('bronquitis')) {
            recs.push({ title: 'Reduce pollen exposure', text: 'Check pollen forecasts and avoid outdoor activities during high pollen peaks if you suffer from allergies.', badge: 'Allergies' });
        }

        // 2) Activity level suggestions
        const act = (profile.activityLevel || '').toLowerCase();
        if (act.includes('sedentario')) {
            recs.push({ title: 'Start small', text: 'Add 10–15 minutes of daily activity and gradually increase to build endurance.', badge: 'Activity' });
        } else if (act.includes('moderado')) {
            recs.push({ title: 'Keep consistency', text: 'Maintain low-impact routines on poor air quality days or after allergic episodes.', badge: 'Activity' });
        } else if (act.includes('deportista')) {
            recs.push({ title: 'Protect your breathing', text: 'During intense training check the AQI; at high levels reduce intensity or train indoors with filtration.', badge: 'Training' });
        }

        // 3) Time outdoors preference
        const out = (profile.outdoorTime || '').toLowerCase();
        if (out.includes('menos')) {
            recs.push({ title: 'Make outdoor time count', text: 'If you spend little time outside, try to do it when air quality is better.', badge: 'Exposure' });
        }

        // 4) Preference time of day
        const pref = (profile.prefTime || '').toLowerCase();
        if (pref.includes('mañ') || pref.includes('mana')) {
            recs.push({ title: 'Mornings are often better', text: 'Air quality often improves in the morning; consider scheduling walks then when AQI allows.', badge: 'Timing' });
        }

        // 5) Sensitivity
        const sens = (profile.sensitivity || '').toLowerCase();
        if (sens.includes('piel') || sens.includes('irrit')) {
            recs.push({ title: 'Care for your skin', text: 'Wash face and hands after being outside and use protective measures if you notice irritation.', badge: 'Care' });
        }
        if (sens.includes('dolor') || sens.includes('migra')) {
            recs.push({ title: 'Rest and monitor', text: 'If you suffer frequent headaches, avoid prolonged exposure on high AQI days and consult your doctor.', badge: 'Health' });
        }

        // 6) AQI based recommendations (prioritizar)
        if (typeof aqi === 'number') {
            if (aqi <= 50) {
                recs.unshift({ title: 'Good day to be outside', text: 'Air quality is good: enjoy moderate outdoor activity.', badge: 'AQI' });
            } else if (aqi <= 100) {
                recs.unshift({ title: 'Light caution', text: 'Air quality is moderate. Sensitive people should limit prolonged outdoor exertion.', badge: 'AQI' });
            } else if (aqi <= 150) {
                recs.unshift({ title: 'Reduce exertion', text: 'AQI unhealthy for sensitive groups: lower exercise intensity and use protection if needed.', badge: 'AQI' });
            } else if (aqi <= 200) {
                recs.unshift({ title: 'Avoid intense activity', text: 'Poor air quality. Avoid intense outdoor exercise and consider staying indoors with filtration.', badge: 'AQI' });
            } else {
                recs.unshift({ title: 'High risk', text: 'Air quality is very poor. Stay indoors, use protection, and follow medical advice.', badge: 'Alert' });
            }
        }

        // Devolver top 4 recomendaciones (priorizando las añadidas al principio)
        const unique = [];
        for (const r of recs) {
            if (!unique.find(u => u.title === r.title)) unique.push(r);
            if (unique.length >= 4) break;
        }
        return unique;
    }

    function renderRecommendations(recs) {
        const container = document.getElementById('recommendations-list');
        if (!container) return;
        container.innerHTML = '';
        recs.forEach(r => {
            const card = document.createElement('div');
            card.className = 'rec-card';
            card.innerHTML = `<h4>${r.title}</h4><p>${r.text}</p><div class="rec-action"><span class="rec-badge">${r.badge}</span><button class="action-button-transparent small-button">View details</button></div>`;
            container.appendChild(card);
        });
    }

    function refreshRecommendationsUI() {
        const profile = loadProfile();
        const aqi = getCurrentAqi();

        const promptEl = document.getElementById('register-prompt');
        if (!profile) {
            // show CTA and random recommendations
            if (promptEl) promptEl.style.display = 'block';
            const recs = generateRecommendations(null, aqi);
            renderRecommendations(recs);
        } else {
            if (promptEl) promptEl.style.display = 'none';
            const recs = generateRecommendations(profile, aqi);
            renderRecommendations(recs);
        }
    }

    // Wire CTA
    document.addEventListener('click', (ev) => {
        const t = ev.target;
        if (!(t instanceof Element)) return;
        if (t.id === 'open-register-cta' || t.id === 'open-register') {
            // If this is a real anchor with a non-hash href (e.g. cuenta.html),
            // allow the browser to navigate instead of opening the modal.
            if (t.tagName === 'A') {
                const href = t.getAttribute('href') || '';
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    return; // let the link navigate normally
                }
            }
            ev.preventDefault();
            // Reuse global modal opener if exists
            const openRegister = document.getElementById('open-register');
            if (openRegister) openRegister.click();
            else {
                // fallback: try to open register modal function if available
                if (typeof openRegisterModal === 'function') openRegisterModal(false);
            }
        }
    });

    // Inicializar al cargar DOM
    document.addEventListener('DOMContentLoaded', () => {
        // Intenta leer AQI desde el panel si el script principal ya lo puso
        // Si no hay valor, se dejará null y las recomendaciones se basarán sólo en perfil
        // Observador: si el AQI cambia en el DOM, refrescamos
        const aqiEl = document.getElementById('current-aqi-value');
        if (aqiEl) {
            const mo = new MutationObserver(() => refreshRecommendationsUI());
            mo.observe(aqiEl, { childList: true, characterData: true, subtree: true });
        }

        // Also refresh on load
        setTimeout(refreshRecommendationsUI, 180);
    });
    /**
   * MÓDULO: Asistente Virtual (Chatbot) - Adaptado del sketch de React
   */
  function initChatbotModule() {
    // ¡REEMPLAZA ESTO con la URL de tu Space!
    const API_URL = "https://gabziag03-v4-nsac-2025.hf.space"; 

    // Referencias a elementos del DOM
    const chatWindow = $('#chat-window');
    const chatInput = $('#chat-input');
    const sendBtn = $('#send-btn');
    const chatInputForm = $('#chat-input-form');
    const aqiDisplay = $('#aqi-dual-display');
    const statusArea = $('#chat-status-area');

    if (!chatWindow || !chatInput || !sendBtn || !chatInputForm) return;

    // Estado local
    let chatHistory = [];
    let aqiData = null;
    let isLoading = false;
    
    // --- Lógica del Sketch de React (Adaptada) ---
    
    // Rangos y funciones para generación aleatoria
    const FEATURE_RANGES = {
        'lat': [19.884490, 62.141694], 'lon': [-156.877217, -69.036592], 'mes': [1, 12], 
        'dia_semana': [0, 6], 'o3_lag1': [0.001000, 0.050000], 'o3_lag3': [0.001000, 0.050000],
        'o3_lag7': [0.001000, 0.050000], 'pm25_lag1': [-0.150000, 24.509960],
        'pm25_lag3': [-0.150000, 24.509960], 'pm25_lag7': [-0.150000, 24.509960],
    };
    const generateRandomValue = (min, max, isInteger = false) => {
        const value = Math.random() * (max - min) + min;
        return isInteger ? Math.floor(value) : parseFloat(value.toFixed(6)); 
    };
    const generateRandomFeatures = () => {
        const newFeatures = {};
        for (const key in FEATURE_RANGES) {
            const [min, max] = FEATURE_RANGES[key];
            const isInteger = key === 'mes' || key === 'dia_semana';
            newFeatures[key] = generateRandomValue(min, max, isInteger);
        }
        return newFeatures;
    };

    // Función auxiliar para scroll
    const scrollToBottom = () => {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };
    
    // Mapeo de categorías a clases CSS para colores
    const getAqiClass = (category) => {
        if (!category) return 'bg-gray-400';
        const lower = category.toLowerCase();
        if (lower.includes('bueno') || lower.includes('good')) return 'aqi-color-good';
        if (lower.includes('moderado') || lower.includes('moderate')) return 'aqi-color-moderate';
        if (lower.includes('sensibles') || lower.includes('sensitive')) return 'aqi-color-sensitive';
        if (lower.includes('insalubre') && !lower.includes('muy')) return 'aqi-color-unhealthy';
        if (lower.includes('muy insalubre') || lower.includes('very unhealthy')) return 'aqi-color-very-unhealthy';
        if (lower.includes('peligroso') || lower.includes('hazardous')) return 'aqi-color-hazardous';
        return 'bg-gray-400';
    };

    // Renderizado del historial de chat, excluyendo mensajes internos
    const renderChat = (history) => {
        const SYSTEM_PROMPT_START = "Eres un asistente especializado en calidad del aire.";
        const SYSTEM_ACK_TEXT = "Entendido. Estoy listo para asumir el rol.";
        const GROUNDING_PROMPT_START = "El AQI Actual es";
        
        const displayHistory = history.filter(msg => {
            const text = msg.parts[0]?.text?.trim() || ''; 
            // Ocultar mensajes internos del sistema
            if (msg.role === 'user' && text.includes(SYSTEM_PROMPT_START)) return false; 
            if (msg.role === 'model' && text === SYSTEM_ACK_TEXT) return false; 
            if (msg.role === 'user' && text.startsWith(GROUNDING_PROMPT_START)) return false;
            return true;
        });
        
        chatWindow.innerHTML = displayHistory.map(msg => {
            const text = msg.parts[0].text;
            const roleClass = msg.role === 'user' ? 'user-message' : 'bot-message';
            const alignment = msg.role === 'user' ? 'justify-end' : 'justify-start';
            return `<div class="message ${alignment}"><div class="${roleClass}"><p>${text}</p></div></div>`;
        }).join('');
        
        scrollToBottom();
    };

    // Renderizado del AQI Dual
    const renderAqiData = (data) => {
        if (!data) return;
        
        aqiDisplay.style.display = 'block';

        // AQI Actual
        const actualCard = $('#aqi-actual-card');
        actualCard.className = `aqi-card ${getAqiClass(data.actual.categoria)}`;
        $('#aqi-actual-value').textContent = data.actual.aqi;
        $('#aqi-actual-category').textContent = data.actual.categoria;
        
        // AQI Pronosticado
        const forecastCard = $('#aqi-forecast-card');
        forecastCard.className = `aqi-card ${getAqiClass(data.pronosticado.categoria)}`;
        $('#aqi-forecast-value').textContent = data.pronosticado.aqi;
        $('#aqi-forecast-category').textContent = data.pronosticado.categoria;
        
        // Contaminante dominante
        $('#dominant-pollutant span').textContent = data.dominante;
        
        // Almacenar AQI actual en localStorage para el módulo de recomendaciones
        try {
            localStorage.setItem('chatbot_aqi_value', data.actual.aqi);
            // Si el módulo de recomendaciones existe en esta página, forzar un refresh
            const aqiEl = document.getElementById('current-aqi-value');
            if (aqiEl) aqiEl.textContent = data.actual.aqi;
        } catch(e) { /* ignore */ }
    };

    // Actualiza el estado de carga y UI
    const updateLoadingState = (loading, errorText = '') => {
        isLoading = loading;
        sendBtn.disabled = loading || !chatInput.value.trim();
        chatInput.placeholder = loading ? "Waiting for response..." : "Write your question or comment...";
        chatInput.disabled = loading;
        
        statusArea.innerHTML = ''; // Limpiar errores
        
        if (loading) {
            statusArea.innerHTML = `<div class="loader"></div><p style="text-align:center; color:#666;">Generating data and calculating forecast...</p>`;
            chatInputForm.style.display = 'none';
        } else {
            chatInputForm.style.display = 'flex';
            if (errorText) {
                statusArea.innerHTML = `<div class="p-3 mb-4 text-sm text-red-700 bg-red-100 bg-opacity-70 rounded-lg" role="alert"><span style="font-weight: 600;">Error:</span> ${errorText} <button id="retry-btn" class="underline ml-2">Retry</button></div>`;
                $('#retry-btn')?.addEventListener('click', handleInitialSubmit);
                chatInputForm.style.display = 'none';
            }
        }

        chatWindow.style.display = aqiData && !loading ? 'block' : 'none';
    };

    // Maneja el inicio de la conversación (Grounding)
    const handleInitialSubmit = async () => {
        aqiData = null;
        chatHistory = [];
        updateLoadingState(true);

        const newRandomFeatures = generateRandomFeatures();
        
        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newRandomFeatures }) 
            });
            
            if (!response.ok) { 
                const errorData = await response.json(); 
                throw new Error(errorData.error || `Unknown error: ${response.status}`); 
            }
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            aqiData = {
                actual: { aqi: data.aqi_data.aqi_actual, categoria: data.aqi_data.categoria_actual },
                pronosticado: { aqi: data.aqi_data.aqi_pronosticado, categoria: data.aqi_data.categoria_pronosticada },
                dominante: data.aqi_data.dominante
            };
            chatHistory = data.history; 
            
            renderAqiData(aqiData);
            renderChat(chatHistory);

        } catch (err) {
            console.error('Catch error:', err);
            updateLoadingState(false, `Error starting conversation: ${err.message}`);
            return; 
        } finally {
            updateLoadingState(false);
        }
    };

    // Maneja la continuación de la conversación
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput || isLoading) return;
        
        const userMsgPayload = userInput;
        
        // Agregar mensaje de usuario temporal
        const tempUserMsg = { role: 'user', parts: [{ text: userMsgPayload }] };
        const tempHistory = [...chatHistory, tempUserMsg];
        chatInput.value = "";
        renderChat(tempHistory);
        updateLoadingState(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    history: chatHistory, // Envía el historial anterior (sin el mensaje temporal)
                    user_message: userMsgPayload 
                })
            });
            
            if (!response.ok) { 
                const errorData = await response.json(); 
                throw new Error(errorData.error || `Unknown error: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            chatHistory = data.history; // Reemplazar con el historial completo y correcto
            renderChat(chatHistory);

        } catch (err) {
            const errorMessage = `Error in conversation: ${err.message}`;
            alert(errorMessage);
            console.error(errorMessage);
            // Si falla, restaurar historial original y agregar un mensaje de error visual
            chatHistory = tempHistory; 
            renderChat(chatHistory);
        } finally {
            updateLoadingState(false);
        }
    };

    // Event Listeners
    chatInputForm.addEventListener('submit', handleChatSubmit);
    chatInput.addEventListener('input', () => {
        sendBtn.disabled = isLoading || !chatInput.value.trim();
    });

    // Inicialización: Llamar handleInitialSubmit al cargar el módulo
    handleInitialSubmit();
  }
  
  // Agregar la llamada al inicializador principal
  document.addEventListener('DOMContentLoaded', () => {
    // ... [código de inicialización existente] ...
    if ($('.chatbot-card')) {
        initChatbotModule();
    }
  });

  /* ===== PERSONALIZED RECOMMENDATIONS MODULE - BEGIN (copy/paste friendly) ===== */
  // ... [código de recomendaciones existente] ...
  
  // Modificación para que las recomendaciones lean el AQI del chatbot si existe.
  (function(){
      // ... [código existente] ...
      function getCurrentAqi() {
          const el = document.getElementById('current-aqi-value');
          // NUEVO: Intentar leer de localStorage (chatbot) si el elemento no tiene valor
          let v = null;
          if (el) v = parseInt(el.textContent);
          
          if (isNaN(v) || v == null) {
              try {
                  const chatAqi = localStorage.getItem('chatbot_aqi_value');
                  if (chatAqi && !isNaN(Number(chatAqi))) {
                      v = Number(chatAqi);
                      if (el) el.textContent = v; // Actualizar el elemento DOM si se encuentra
                  }
              } catch (e) {}
          }
          return isNaN(v) ? null : v;
      }
      // ... [código existente] ...
  })();
  /* ===== PERSONALIZED RECOMMENDATIONS MODULE - END ===== */
})();

/* ===== PERSONALIZED RECOMMENDATIONS MODULE - END ===== */

  

})();


