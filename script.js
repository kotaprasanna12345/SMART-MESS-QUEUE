// ==========================================
// TWILIO CREDENTIALS
// ==========================================
const TWILIO_ACCOUNT_SID = 'ACdef6f3673d4c9ad1c2199675057c79d0';
const TWILIO_AUTH_TOKEN = 'eec496511e577ee57a977eb64ddd7d5b';
const TWILIO_PHONE_NUMBER = '+17372212163';

// Array to store queue items
let queueList = [];
let tokenCounter = 101;

// ==========================================
// REAL TWILIO SMS FUNCTION
// ==========================================
async function sendTwilioSMS(toPhoneNumber, messageBody) {
    let formattedPhone = String(toPhoneNumber).trim();
    if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', formattedPhone);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Body', messageBody);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            console.log("SMS Sent Successfully:", data.sid);
            alert("📱 SMS Sent to " + formattedPhone);
        } else {
            console.error("Twilio Error:", data);
            alert("SMS Failed: " + (data.message || "Twilio error occurred"));
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("SMS Error: " + error.message);
    }
}

// ==========================================
// RENDER TABLE FUNCTION
// ==========================================
function renderTable() {
    const tbody = document.getElementById('queueTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (queueList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500">Queue is currently empty. Generate a token to test!</td></tr>`;
    } else {
        queueList.forEach((item, idx) => {
            const isHead = idx === 0;
            const tr = document.createElement('tr');
            tr.className = isHead ? "text-emerald-400 font-bold bg-emerald-950/30" : "text-slate-300";
            
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
                    ${isHead ? `<button onclick="notifyFoodReady('${item.phone}', '${item.name}', '${item.token}')" class="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded">Resend Ready SMS</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// ==========================================
// NOTIFY FOOD READY (SMS)
// ==========================================
function notifyFoodReady(phone, name, token) {
    const readyMessage = `Hello ${name}, your Food for Token ${token} is READY! 🍲 Please come to the counter and collect it immediately.`;
    sendTwilioSMS(phone, readyMessage);
}

// ==========================================
// GENERATE TOKEN EVENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tokenForm') || document.querySelector('form');
    
    // Auto handle button click
    const genBtn = document.querySelector('button[type="submit"]') || document.querySelector('button');

    if (genBtn) {
        genBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const nameInput = document.querySelector('input[placeholder*="NAME"]') || document.querySelectorAll('input')[0];
            const rollInput = document.querySelectorAll('input')[1];
            const phoneInput = document.querySelectorAll('input')[2];
            const foodSelect = document.querySelector('select:last-of-type') || document.querySelector('select');

            const name = nameInput ? nameInput.value.trim() : '';
            const roll = rollInput ? rollInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const food = foodSelect ? foodSelect.value : 'Food Item';

            if (!name || !phone) {
                alert('Please enter Student Name and Phone Number!');
                return;
            }

            const token = `T-${tokenCounter++}`;
            const newItem = { token, name, roll, phone, food };

            queueList.push(newItem);
            renderTable();

            // Check if this student is first in queue (Food Ready / Serving Now)
            if (queueList.length === 1) {
                notifyFoodReady(phone, name, token);
            } else {
                // Booking Confirmation SMS
                const bookingMsg = `Hello ${name}, Token ${token} issued for ${food}. Your turn will come soon!`;
                sendTwilioSMS(phone, bookingMsg);
            }

            // Clear inputs
            if (nameInput) nameInput.value = '';
            if (rollInput) rollInput.value = '';
            if (phoneInput) phoneInput.value = '';
        });
    }
});
