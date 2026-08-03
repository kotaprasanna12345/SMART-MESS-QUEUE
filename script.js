let scene, camera, renderer, controls;
let queueList = [];
let tokenSeq = 101;

// TWILIO CONFIGURATION (Mee API Keys ikkada paste cheyandi)
const TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN';
const TWILIO_PHONE_NUMBER = 'YOUR_TWILIO_PHONE_NUMBER';

const foodItemsDetails = {
    "Breakfast": [
        { name: "Hot Idly with Chutney", price: "₹30" },
        { name: "Puri with Curry", price: "₹40" },
        { name: "Masala Dosa", price: "₹50" }
    ],
    "Lunch": [
        { name: "Special Veg Biryani", price: "₹90" },
        { name: "Full Veg Meals", price: "₹80" },
        { name: "Curd Rice", price: "₹40" }
    ],
    "Snacks": [
        { name: "Samosa & Chutney", price: "₹25" },
        { name: "Hot Tea / Coffee", price: "₹15" },
        { name: "Veg Puff", price: "₹20" }
    ],
    "Dinner": [
        { name: "Veg Fried Rice", price: "₹70" },
        { name: "Malabar Parota", price: "₹50" },
        { name: "Roti & Butter Paneer", price: "₹85" }
    ]
};

const avatarColors = [0x10b981, 0x3b82f6, 0xf59e0b, 0x8b5cf6, 0xec4899];

function initClock() {
    setInterval(() => {
        document.getElementById('live-datetime').innerText = new Date().toLocaleString();
    }, 1000);
}

function updateFoodItemsOptions() {
    const category = document.getElementById('meal-category').value;
    const foodSelect = document.getElementById('food-item');
    foodSelect.innerHTML = '';
    
    foodItemsDetails[category].forEach(item => {
        const opt = document.createElement('option');
        opt.value = `${item.name} (${item.price})`;
        opt.innerText = `${item.name} - ${item.price}`;
        foodSelect.appendChild(opt);
    });
}

function init3D() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 12, 22);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    createFloorAndCounter();
    animate();
}

function createFloorAndCounter() {
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Counter
    const counterGeo = new THREE.BoxGeometry(6, 2, 2.5);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 1, -8);
    scene.add(counter);
}

function createAvatarMesh(index) {
    const group = new THREE.Group();

    const color = avatarColors[index % avatarColors.length];
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.1;
    group.add(head);

    const targetZ = -5.5 + (index * 2.2);
    group.position.set(0, 0, targetZ);

    scene.add(group);
    return group;
}

// SMS Sending via Twilio Function
async function sendSMSViaTwilio(phoneNumber, studentName, token, foodItem) {
    if(TWILIO_ACCOUNT_SID === 'YOUR_TWILIO_ACCOUNT_SID') {
        console.warn("SMS alert: Twilio SID not configured yet.");
        alert(`[DEMO SMS] Hello ${studentName}, Token: ${token} for ${foodItem}.`);
        return;
    }

    const messageBody = `Hello ${studentName}, your Smart Mess Token is ${token} for ${foodItem}. Please present this at the mess counter.`;

    try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'To': '+91' + phoneNumber,
                'From': TWILIO_PHONE_NUMBER,
                'Body': messageBody
            })
        });

        if (response.ok) {
            alert(`SMS Notification sent successfully to +91 ${phoneNumber}!`);
        } else {
            console.error("SMS failed:", await response.json());
        }
    } catch (error) {
        console.error("SMS Error:", error);
    }
}

function handleEnqueue(e) {
    e.preventDefault();
    const name = document.getElementById('stu-name').value;
    const roll = document.getElementById('stu-id').value;
    const phone = document.getElementById('stu-phone').value;
    const food = document.getElementById('food-item').value;
    const token = "T-" + tokenSeq++;

    const mesh = createAvatarMesh(queueList.length);

    queueList.push({
        mesh: mesh,
        token: token,
        name: name,
        roll: roll,
        phone: phone,
        food: food
    });

    // Send SMS Notification
    sendSMSViaTwilio(phone, name, token, food);

    document.getElementById('stu-name').value = '';
    document.getElementById('stu-id').value = '';
    document.getElementById('stu-phone').value = '';

    renderTable();
}

function handleDequeue() {
    if (queueList.length === 0) return;

    const served = queueList.shift();
    scene.remove(served.mesh);

    queueList.forEach((item, idx) => {
        item.mesh.position.z = -5.5 + (idx * 2.2);
    });

    renderTable();
}

function renderTable() {
    const TWILIO_ACCOUNT_SID = 'ACdef6f3673d4c9ad1c2199675057c79d0';
    tbody.innerHTML = '';

    if (queueList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-600">Queue is currently empty. Generate a token to test!</td></tr>`;
    } else {
        queueList.forEach((item, idx) => {
            const isHead = idx === 0;
            const tr = document.createElement('tr');
            tr.className = isHead ? "text-emerald-400 font-bold bg-emerald-500/10" : "text-slate-300";
            tr.innerHTML = `
                <td class="py-2.5 font-bold">${item.token}</td>
                <td class="py-2.5">${item.name}</td>
                <td class="py-2.5 text-slate-400">
                    <div>${item.roll}</div>
                    <div class="text-[10px] text-slate-500">${item.phone}</div>
                </td>
                <td class="py-2.5">${item.food}</td>
                <td class="py-2.5 text-right">
                    <span class="px-2 py-0.5 rounded text-[10px] ${isHead ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}">
                        ${isHead ? 'SERVING NOW' : 'WAITING'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('queue-count-text').innerText = `${queueList.length} Active Tokens`;
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

window.onload = () => {
    initClock();
    updateFoodItemsOptions();
    init3D();
    renderTable();
};
