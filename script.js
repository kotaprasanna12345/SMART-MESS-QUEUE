async function sendSMS(phone, name, token, food) {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
    }

    const bodyText = `Your mess token ${token} for ${food} is ready for pickup!`;
    
    try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'To': formattedPhone,
                'From': TWILIO_PHONE_NUMBER,
                'Body': bodyText
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert(`📱 SUCCESS! Real SMS sent to ${formattedPhone}`);
        } else {
            console.error("Twilio error:", data);
            alert("SMS Error: " + (data.message || "Failed to deliver"));
        }
    } catch (error) {
        console.error("Network error:", error);
        alert("Network error while sending SMS.");
    }
}
