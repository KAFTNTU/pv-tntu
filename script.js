// --- 1. БАЗА ДАНИХ КОМПОНЕНТІВ ---
const COMPONENT_DB = {
    passive: {
        title: "Пасивні компоненти",
        items: [
            { type: 'RES', label: 'Резистор', sym: 'R', w: 60, h: 20 },
            { type: 'POT', label: 'Потенціометр', sym: 'RP', w: 60, h: 40 },
            { type: 'CAP', label: 'Конденсатор', sym: 'C', w: 40, h: 40 },
            { type: 'ECAP', label: 'Електроліт', sym: 'C+', w: 40, h: 40 },
            { type: 'IND', label: 'Індуктивність', sym: 'L', w: 60, h: 20 },
            { type: 'TRANS', label: 'Трансформатор', sym: 'TR', w: 60, h: 40 },
            { type: 'SW', label: 'Перемикач', sym: 'S', w: 40, h: 20 },
            { type: 'BTN', label: 'Кнопка', sym: 'B', w: 40, h: 40 },
            { type: 'RELAY', label: 'Реле', sym: 'RL', w: 60, h: 40 },
            { type: 'FUSE', label: 'Запобіжник', sym: 'F', w: 60, h: 20 }
        ]
    },
    sources: {
        title: "Джерела живлення",
        items: [
            { type: 'VDC', label: 'DC Напруга', sym: 'V', w: 40, h: 60 },
            { type: 'VAC', label: 'AC Напруга', sym: '~V', w: 40, h: 60 },
            { type: 'IDC', label: 'Джерело струму', sym: 'I', w: 40, h: 60 },
            { type: 'GND', label: 'Земля (GND)', sym: '⏚', w: 40, h: 40 },
            { type: 'SINE', label: 'Ген. Синус', sym: '~', w: 50, h: 50 },
            { type: 'PULSE', label: 'Ген. Імпульс', sym: '∏', w: 50, h: 50 }
        ]
    },
    active: {
        title: "Активні елементи",
        items: [
            { type: 'DIODE', label: 'Діод', sym: 'D', w: 60, h: 20 },
            { type: 'ZENER', label: 'Стабілітрон', sym: 'Dz', w: 60, h: 20 },
            { type: 'LED', label: 'LED', sym: '🌣', w: 40, h: 40 },
            { type: 'NPN', label: 'NPN Транз.', sym: 'NPN', w: 40, h: 40 },
            { type: 'PNP', label: 'PNP Транз.', sym: 'PNP', w: 40, h: 40 },
            { type: 'NMOS', label: 'MOSFET N', sym: 'Mn', w: 40, h: 40 },
            { type: 'PMOS', label: 'MOSFET P', sym: 'Mp', w: 40, h: 40 },
            { type: 'OPAMP', label: 'ОП Підсилювач', sym: 'Op', w: 60, h: 50 },
            { type: '555', label: 'Таймер 555', sym: '555', w: 50, h: 50 }
        ]
    },
    digital: {
        title: "Цифрова логіка",
        items: [
            { type: 'AND', label: 'AND', sym: '&', w: 50, h: 50 },
            { type: 'OR', label: 'OR', sym: '≥1', w: 50, h: 50 },
            { type: 'NOT', label: 'NOT', sym: '1', w: 50, h: 50 },
            { type: 'NAND', label: 'NAND', sym: '&!', w: 50, h: 50 },
            { type: 'XOR', label: 'XOR', sym: '=1', w: 50, h: 50 },
            { type: 'DFF', label: 'D-Тригер', sym: 'D-FF', w: 60, h: 50 },
            { type: 'MUX', label: 'Мультиплексор', sym: 'MUX', w: 60, h: 80 }
        ]
    },
    instruments: {
        title: "Вимірювання",
        items: [
            { type: 'VOLT', label: 'Вольтметр', sym: 'V', w: 40, h: 40 },
            { type: 'AMP', label: 'Амперметр', sym: 'A', w: 40, h: 40 },
            { type: 'OSC', label: 'Осцилограф', sym: 'OSC', w: 60, h: 50 }
        ]
    }
};

// --- 2. ГОЛОВНИЙ КЛАС СИМУЛЯТОРА ---
class Simulator {
    constructor() {
        this.canvas = document.getElementById('circuit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('workspace-div');
        
        this.components = []; // Масив компонентів
        
        // Камера
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.gridSize = 20;

        // Миша
        this.isDraggingComp = false;
        this.isPanning = false;
        this.dragItem = null;
        this.lastMouse = { x: 0, y: 0 }; 

        this.init();
    }

    init() {
        this.buildLibrary();
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        
        // Події миші
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        this.draw(); 
    }

    buildLibrary() {
        const container = document.getElementById('library-container');
        container.innerHTML = ''; 
        
        for (const [key, cat] of Object.entries(COMPONENT_DB)) {
            const group = document.createElement('div');
            group.className = 'category-group';
            
            const title = document.createElement('div');
            title.className = 'category-title';
            title.innerHTML = `<span>${cat.title}</span> <span>▼</span>`;
            
            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'category-items';
            if(key === 'passive' || key === 'sources') itemsDiv.classList.add('open');

            title.onclick = () => {
                itemsDiv.classList.toggle('open');
                title.children[1].innerText = itemsDiv.classList.contains('open') ? '▼' : '▶';
            };

            cat.items.forEach(item => {
                const btn = document.createElement('div');
                btn.className = 'component-btn';
                btn.innerHTML = `<div class="comp-icon">${item.sym}</div><span>${item.label}</span>`;
                btn.onclick = () => this.addComponent(item);
                itemsDiv.appendChild(btn);
            });

            group.appendChild(title);
            group.appendChild(itemsDiv);
            container.appendChild(group);
        }
    }

    // ВАЖЛИВО: Отримання правильних координат
    getMouseWorldPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        return {
            x: (screenX - this.panX) / this.scale,
            y: (screenY - this.panY) / this.scale
        };
    }

    onMouseDown(e) {
        e.preventDefault();
        const m = this.getMouseWorldPos(e);
        
        // 1. Перевірка кліку по компоненту
        let clickedComp = null;
        for (let i = this.components.length - 1; i >= 0; i--) {
            const c = this.components[i];
            if (m.x >= c.x - c.w/2 - 5 && m.x <= c.x + c.w/2 + 5 &&
                m.y >= c.y - c.h/2 - 5 && m.y <= c.y + c.h/2 + 5) {
                clickedComp = c;
                break;
            }
        }

        // Лівий клік
        if (e.button === 0) {
            if (clickedComp) {
                this.isDraggingComp = true;
                this.dragItem = clickedComp;
                this.canvas.style.cursor = 'grabbing';
            }
        }
        
        // Правий клік (або лівий по порожньому)
        if (e.button === 2 || (e.button === 0 && !clickedComp)) {
             this.isPanning = true;
             this.canvas.style.cursor = 'move';
        }

        this.lastMouse = { x: e.clientX, y: e.clientY };
    }

    onMouseMove(e) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.lastMouse = { x: e.clientX, y: e.clientY };

        if (this.isDraggingComp && this.dragItem) {
            this.dragItem.x += dx / this.scale;
            this.dragItem.y += dy / this.scale;
        } else if (this.isPanning) {
            this.panX += dx;
            this.panY += dy;
        }
    }

    onMouseUp(e) {
        if (this.isDraggingComp && this.dragItem) {
            // Прив'язка до сітки при відпусканні
            this.dragItem.x = Math.round(this.dragItem.x / this.gridSize) * this.gridSize;
            this.dragItem.y = Math.round(this.dragItem.y / this.gridSize) * this.gridSize;
        }

        this.isDraggingComp = false;
        this.isPanning = false;
        this.dragItem = null;
        this.canvas.style.cursor = 'crosshair';
    }

    onWheel(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.panX = mouseX - (mouseX - this.panX) * zoom;
        this.panY = mouseY - (mouseY - this.panY) * zoom;
        this.scale *= zoom;
        
        if (this.scale < 0.2) this.scale = 0.2;
        if (this.scale > 5) this.scale = 5;
    }

    addComponent(def) {
        const x = Math.round(((this.canvas.width / 2 - this.panX) / this.scale) / 20) * 20;
        const y = Math.round(((this.canvas.height / 2 - this.panY) / this.scale) / 20) * 20;
        
        this.components.push({
            id: Date.now() + Math.random(),
            type: def.type,
            sym: def.sym,
            x: x, y: y,
            w: def.w || 50, h: def.h || 50,
            label: def.label
        });
    }

    clear() {
        if(confirm("Очистити поле?")) {
            this.components = [];
            this.panX = 0; this.panY = 0; this.scale = 1;
        }
    }

    start() { alert("Симуляція ПВ: Математичне ядро ще не підключено!"); }
    stop() { alert("Зупинено."); }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.scale, this.scale);

        this.drawGrid(ctx);

        this.components.forEach(c => {
            if (c === this.dragItem) {
                ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0, 122, 204, 0.5)';
            } else { ctx.shadowBlur = 0; }

            ctx.fillStyle = '#252526';
            ctx.strokeStyle = '#d4d4d4';
            ctx.lineWidth = 2;
            
            ctx.fillRect(c.x - c.w/2, c.y - c.h/2, c.w, c.h);
            ctx.strokeRect(c.x - c.w/2, c.y - c.h/2, c.w, c.h);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.sym, c.x, c.y);

            ctx.fillStyle = '#aaa';
            ctx.font = '10px sans-serif';
            ctx.fillText(c.label, c.x, c.y + c.h/2 + 12);
            
            ctx.fillStyle = '#007acc';
            ctx.beginPath();
            if (c.w > c.h) { 
                ctx.arc(c.x - c.w/2, c.y, 3, 0, Math.PI*2);
                ctx.arc(c.x + c.w/2, c.y, 3, 0, Math.PI*2);
            } else { 
                ctx.arc(c.x, c.y - c.h/2, 3, 0, Math.PI*2);
                ctx.arc(c.x, c.y + c.h/2, 3, 0, Math.PI*2);
            }
            ctx.fill();
        });

        ctx.restore();
        requestAnimationFrame(() => this.draw());
    }

    drawGrid(ctx) {
        const sz = this.gridSize;
        const limit = 5000;
        ctx.strokeStyle = '#2d2d2d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let x = -limit; x <= limit; x+=sz) { ctx.moveTo(x, -limit); ctx.lineTo(x, limit); }
        for(let y = -limit; y <= limit; y+=sz) { ctx.moveTo(-limit, y); ctx.lineTo(limit, y); }
        ctx.stroke();
        
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-limit, 0); ctx.lineTo(limit, 0);
        ctx.moveTo(0, -limit); ctx.lineTo(0, limit);
        ctx.stroke();
    }
}

const sim = new Simulator();
