// DOM Elements
const contentType = document.getElementById('contentType');
const dynamicFields = document.getElementById('dynamicFields');
const urlField = document.getElementById('urlField');
const textField = document.getElementById('textField');
const contactFields = document.getElementById('contactFields');
const wifiFields = document.getElementById('wifiFields');
const phoneField = document.getElementById('phoneField');
const emailField = document.getElementById('emailField');
const smsFields = document.getElementById('smsFields');

const qrSize = document.getElementById('qrSize');
const errorLevel = document.getElementById('errorLevel');
const outputFormat = document.getElementById('outputFormat');
const foregroundColor = document.getElementById('foregroundColor');
const backgroundColor = document.getElementById('backgroundColor');

const qrPreview = document.getElementById('qrPreview');
const generateQR = document.getElementById('generateQR');
const downloadQR = document.getElementById('downloadQR');
const clearQR = document.getElementById('clearQR');

// Show/hide fields based on content type
contentType.addEventListener('change', () => {
    // Hide all fields
    [urlField, textField, contactFields, wifiFields, phoneField, emailField, smsFields]
        .forEach(field => field.classList.add('d-none'));

    // Show relevant fields
    switch (contentType.value) {
        case 'url':
            urlField.classList.remove('d-none');
            break;
        case 'text':
            textField.classList.remove('d-none');
            break;
        case 'contact':
            contactFields.classList.remove('d-none');
            break;
        case 'wifi':
            wifiFields.classList.remove('d-none');
            break;
        case 'phone':
            phoneField.classList.remove('d-none');
            break;
        case 'email':
            emailField.classList.remove('d-none');
            break;
        case 'sms':
            smsFields.classList.remove('d-none');
            break;
    }
});

// Generate QR code content based on type
function generateQRContent() {
    switch (contentType.value) {
        case 'url':
            return document.getElementById('urlInput').value;
        case 'text':
            return document.getElementById('textInput').value;
        case 'contact':
            const name = document.getElementById('contactName').value;
            const phone = document.getElementById('contactPhone').value;
            const email = document.getElementById('contactEmail').value;
            return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
        case 'wifi':
            const ssid = document.getElementById('wifiSSID').value;
            const password = document.getElementById('wifiPassword').value;
            const encryption = document.getElementById('wifiEncryption').value;
            return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
        case 'phone':
            return `tel:${document.getElementById('phoneInput').value}`;
        case 'email':
            return `mailto:${document.getElementById('emailInput').value}`;
        case 'sms':
            const smsPhone = document.getElementById('smsPhone').value;
            const message = document.getElementById('smsMessage').value;
            return `SMSTO:${smsPhone}:${message}`;
        default:
            return '';
    }
}

// Generate QR code
generateQR.addEventListener('click', async () => {
    const content = generateQRContent();
    if (!content) {
        alert('Please enter content for the QR code');
        return;
    }

    try {
        // Clear previous QR code
        qrPreview.innerHTML = '';

        // QR code options
        const options = {
            text: content,
            width: parseInt(qrSize.value),
            height: parseInt(qrSize.value),
            colorDark: foregroundColor.value,
            colorLight: backgroundColor.value,
            correctLevel: QRCode.CorrectLevel[errorLevel.value]
        };

        // Generate QR code
        if (outputFormat.value === 'svg') {
            const svg = await QRCode.toString(content, options);
            qrPreview.innerHTML = svg;
        } else {
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, content, options);
            qrPreview.appendChild(canvas);
        }

        // Enable download button
        downloadQR.disabled = false;
    } catch (error) {
        alert('Error generating QR code: ' + error.message);
    }
});

// Download QR code
downloadQR.addEventListener('click', () => {
    const format = outputFormat.value;
    const content = generateQRContent();
    const options = {
        text: content,
        width: parseInt(qrSize.value),
        height: parseInt(qrSize.value),
        colorDark: foregroundColor.value,
        colorLight: backgroundColor.value,
        correctLevel: QRCode.CorrectLevel[errorLevel.value]
    };

    if (format === 'svg') {
        QRCode.toString(content, options, (err, svg) => {
            if (err) throw err;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qr-code.svg';
            a.click();
            URL.revokeObjectURL(url);
        });
    } else {
        QRCode.toCanvas(document.createElement('canvas'), content, options, (err, canvas) => {
            if (err) throw err;
            const url = canvas.toDataURL(`image/${format}`);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-code.${format}`;
            a.click();
        });
    }
});

// Clear QR code
clearQR.addEventListener('click', () => {
    qrPreview.innerHTML = '<i class="fas fa-qrcode fa-3x text-muted"></i><p class="mt-2">QR code will appear here</p>';
    downloadQR.disabled = true;
    
    // Clear all input fields
    document.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.id !== 'contentType') {
            field.value = '';
        }
    });
});

// Update preview when settings change
[qrSize, errorLevel, outputFormat, foregroundColor, backgroundColor].forEach(element => {
    element.addEventListener('change', () => {
        if (!downloadQR.disabled) {
            generateQR.click();
        }
    });
}); 