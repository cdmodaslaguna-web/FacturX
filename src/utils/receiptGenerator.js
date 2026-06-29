import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import log2 from '../assets/logos/log2.png';
import by2 from '../assets/logos/by 2.png';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const generateTicketCanvas = async (data, amountPaid, hasShipping, shippingCost, title = "Comprobante de Anticipo") => {
  // data can be an order or an invoice
  const customerName = data.customer_name || data.clientName || 'Mostrador';
  const total = data.total || 0;
  const totalConEnvio = total + (hasShipping ? shippingCost : 0);
  const balance = totalConEnvio - amountPaid;
  const date = new Date(data.created_at || data.date || Date.now()).toLocaleString();
  const docId = data.id || data.orderId || 'S/N';
  const items = data.items || [];

  const ticketDiv = document.createElement('div');
  ticketDiv.style.position = 'absolute';
  ticketDiv.style.left = '-9999px';
  ticketDiv.style.width = '400px';
  ticketDiv.style.background = '#ffffff';
  ticketDiv.style.padding = '20px';
  ticketDiv.style.color = '#1e293b';
  ticketDiv.style.fontFamily = "'Outfit', sans-serif";

  const logoSrc = new URL(log2, window.location.origin).href;
  const footerSrc = new URL(by2, window.location.origin).href;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: 0.85rem;">${item.qty}x ${item.name || item.description}</td>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right; font-size: 0.85rem;">${formatPrice((item.price || item.unitPrice) * item.qty)}</td>
    </tr>
  `).join('');

  const shippingHtml = hasShipping ? `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: 0.85rem; font-weight: bold;">Envío / Domicilio</td>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right; font-size: 0.85rem; font-weight: bold;">${formatPrice(shippingCost)}</td>
    </tr>
  ` : '';

  ticketDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="${logoSrc}" style="max-width: 150px; height: auto; margin-bottom: 5px;" crossorigin="anonymous" />
      <h3 style="margin: 0; font-size: 1.1rem; color: #184a2c; text-transform: uppercase;">${title}</h3>
    </div>
    <div style="font-size: 0.9rem; color: #475569; margin-bottom: 15px;">
      <p style="margin: 4px 0;"><strong>Fecha:</strong> ${date}</p>
      <p style="margin: 4px 0;"><strong>Cliente:</strong> ${customerName}</p>
      <p style="margin: 4px 0;"><strong>Doc #:</strong> ${docId.slice(0, 8).toUpperCase()}</p>
    </div>
    <div style="border-bottom: 2px dashed #cbd5e1; margin: 15px 0;"></div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
      ${shippingHtml}
    </table>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="font-weight: 700; font-size: 1.05rem;">
        <td style="padding: 6px 0;">Total a Pagar:</td>
        <td style="text-align: right;">${formatPrice(totalConEnvio)}</td>
      </tr>
      <tr style="font-weight: 700; font-size: 1.2rem; color: #184a2c;">
        <td style="padding: 6px 0;">Monto Abonado:</td>
        <td style="text-align: right;">${formatPrice(amountPaid)}</td>
      </tr>
      <tr style="font-weight: 700; font-size: 1.05rem; color: #ef4444;">
        <td style="padding: 6px 0;">Saldo Pendiente:</td>
        <td style="text-align: right;">${formatPrice(balance > 0 ? balance : 0)}</td>
      </tr>
    </table>
    <div style="border-bottom: 2px dashed #cbd5e1; margin: 20px 0;"></div>
    <div style="text-align: center; font-size: 0.85rem; color: #64748b;">
      <p style="margin: 4px 0;"><strong>El pago está sujeto a verificación bancaria.</strong></p>
      <p style="margin: 15px 0 5px 0; font-weight: 700; color: #184a2c; font-size: 1.1rem;">¡Gracias por confiar en nosotros!</p>
      <img src="${footerSrc}" style="max-width: 80px; margin-top: 10px;" crossorigin="anonymous" />
    </div>
  `;

  document.body.appendChild(ticketDiv);

  const waitImages = new Promise((resolve) => {
    const imgs = Array.from(ticketDiv.querySelectorAll('img'));
    let loaded = 0;
    if (imgs.length === 0) resolve();
    imgs.forEach(img => {
      if (img.complete) {
        loaded++;
        if (loaded === imgs.length) resolve();
      } else {
        img.onload = () => { loaded++; if (loaded === imgs.length) resolve(); };
        img.onerror = () => { loaded++; if (loaded === imgs.length) resolve(); };
      }
    });
  });

  try {
    await waitImages;
    const canvas = await html2canvas(ticketDiv, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    document.body.removeChild(ticketDiv);
    return canvas;
  } catch (err) {
    document.body.removeChild(ticketDiv);
    console.error(err);
    return null;
  }
};

export const doDownloadReceiptImage = async (data, amountPaid, hasShipping, shippingCost, title = "Comprobante de Anticipo") => {
  const canvas = await generateTicketCanvas(data, amountPaid, hasShipping, shippingCost, title);
  if (!canvas) {
    toast.error("Hubo un error al generar la imagen.");
    return;
  }
  const imgData = canvas.toDataURL('image/jpeg', 0.9);
  const link = document.createElement('a');
  link.href = imgData;
  const docId = data.id || data.orderId || 'S/N';
  link.download = `Comprobante_EsperanzaLaguna_${docId.slice(0, 8)}.jpg`;
  link.click();
  toast.success("¡La imagen se ha descargado correctamente!");
};

export const doSendReceiptViaWhatsApp = async (data, amountPaid, hasShipping, shippingCost, title = "Comprobante de Anticipo") => {
  const customerPhone = data.customer_phone || data.clientPhone || data.clientId || '';
  if (!customerPhone) {
    toast.error("Sin número registrado. Selecciona el contacto en WhatsApp.");
  }
  
  let phone = customerPhone.replace(/\D/g, '');
  if (phone.length === 10) {
    phone = '57' + phone;
  }

  const canvas = await generateTicketCanvas(data, amountPaid, hasShipping, shippingCost, title);
  if (!canvas) {
    toast.error("Error al generar imagen. Se enviará solo el texto.");
  }
    
  const totalConEnvio = (data.total || 0) + (hasShipping ? shippingCost : 0);
  const balance = totalConEnvio - amountPaid;
  const customerName = data.customer_name || data.clientName || '';

  if (canvas) {
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        let text = `🧾 *${title.toUpperCase()}*%0A*Casa de Modas Esperanza Laguna*%0A%0A`;
        text += `¡Hola ${customerName}! Te enviamos el comprobante por *${formatPrice(amountPaid)}*.%0A`;
        if (balance > 0) text += `Tu saldo pendiente es de *${formatPrice(balance)}*.%0A%0A`;
        else text += `*¡Tu cuenta está totalmente saldada!*%0A%0A`;
        text += `👉 _(Para pegar el comprobante aquí dale *Ctrl + V* o *Pegar*)_`;
        toast.success("Imagen copiada. Pégala en WhatsApp (Ctrl+V)");
        setTimeout(() => {
          window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
        }, 1500);
      } catch (err) {
        console.error("Error al copiar:", err);
        let text = `🧾 *${title.toUpperCase()}*%0A*Casa de Modas Esperanza Laguna*%0A%0A`;
        text += `¡Hola ${customerName}! Te enviamos el comprobante por *${formatPrice(amountPaid)}*.%0A`;
        if (balance > 0) text += `Tu saldo pendiente es de *${formatPrice(balance)}*.%0A%0A`;
        else text += `*¡Tu cuenta está totalmente saldada!*%0A%0A`;
        text += `_(Adjunta a este mensaje la imagen que descargaste en tu computadora)_`;
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      }
    }, 'image/png');
  } else {
    let text = `🧾 *${title.toUpperCase()}*%0A*Casa de Modas Esperanza Laguna*%0A%0A`;
    text += `¡Hola ${customerName}! Te enviamos el comprobante por *${formatPrice(amountPaid)}*.%0A`;
    if (balance > 0) text += `Tu saldo pendiente es de *${formatPrice(balance)}*.%0A`;
    else text += `*¡Tu cuenta está totalmente saldada!*%0A`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }
};

export const doPrintAdvanceTicket = (data, amountPaid, format, hasShipping, shippingCost, title = "Comprobante de Anticipo") => {
  const total = data.total || 0;
  const totalConEnvio = total + (hasShipping ? shippingCost : 0);
  const balance = totalConEnvio - amountPaid;
  const date = new Date(data.created_at || data.date || Date.now()).toLocaleString();
  const docId = data.id || data.orderId || 'S/N';
  const customerName = data.customer_name || data.clientName || 'Mostrador';
  const items = data.items || [];
  
  const logoSrc = new URL(log2, window.location.origin).href;
  const footerSrc = new URL(by2, window.location.origin).href;
  const isCarta = format === 'carta';
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: ${isCarta ? '1rem' : '0.85rem'};">${item.qty}x ${item.name || item.description}</td>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right; font-size: ${isCarta ? '1rem' : '0.85rem'};">${formatPrice((item.price || item.unitPrice) * item.qty)}</td>
    </tr>
  `).join('');

  const shippingHtml = hasShipping ? `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: ${isCarta ? '1rem' : '0.85rem'}; font-weight: bold;">Envío / Domicilio</td>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right; font-size: ${isCarta ? '1rem' : '0.85rem'}; font-weight: bold;">${formatPrice(shippingCost)}</td>
    </tr>
  ` : '';

  const html = `
    <html>
      <head>
        <title>${title} - ${docId}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page { margin: 0; size: ${isCarta ? 'letter portrait' : '80mm auto'}; }
          body { 
            font-family: 'Outfit', sans-serif; 
            padding: ${isCarta ? '40px' : '15px'}; 
            color: #1e293b; 
            width: ${isCarta ? '100%' : '80mm'}; 
            max-width: ${isCarta ? '800px' : '80mm'}; 
            margin: 0 auto; 
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            min-height: ${isCarta ? '90vh' : 'auto'};
          }
          .header { text-align: center; margin-bottom: 20px; }
          .logo-img { max-width: ${isCarta ? '200px' : '120px'}; height: auto; margin-bottom: 10px; }
          .subtitle { font-size: ${isCarta ? '1.2rem' : '0.85rem'}; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
          p { margin: 4px 0; font-size: ${isCarta ? '1rem' : '0.85rem'}; }
          .divider { border-bottom: 1px dashed #cbd5e1; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .totals { font-weight: 700; font-size: ${isCarta ? '1.1rem' : '0.95rem'}; }
          .totals td { padding: 6px 0; }
          .highlight { color: #184a2c; font-size: ${isCarta ? '1.3rem' : '1.1rem'}; }
          .info { font-size: ${isCarta ? '0.9rem' : '0.75rem'}; text-align: center; margin-top: 30px; color: #64748b; flex-grow: 1; }
          .info strong { color: #1e293b; }
          .footer-img { max-width: ${isCarta ? '100px' : '60px'}; margin-top: 20px; }
          .flex-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoSrc}" class="logo-img" alt="Logo Esperanza Laguna" onerror="this.style.display='none'" />
          <p class="subtitle">${title}</p>
        </div>
        
        <div class="${isCarta ? 'flex-row' : ''}">
          <div>
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Cliente:</strong> ${customerName}</p>
          </div>
          ${isCarta ? `<div><p><strong>Doc #:</strong> ${docId.slice(0, 8).toUpperCase()}</p></div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <table class="items-table">
          ${itemsHtml}
          ${shippingHtml}
        </table>
        
        <div style="${isCarta ? 'width: 50%; margin-left: auto;' : ''}">
          <table>
            <tr class="totals">
              <td>Total a Pagar:</td>
              <td style="text-align: right;">${formatPrice(totalConEnvio)}</td>
            </tr>
            <tr class="totals highlight">
              <td>Monto Abonado:</td>
              <td style="text-align: right;">${formatPrice(amountPaid)}</td>
            </tr>
            <tr class="totals">
              <td style="color: ${balance > 0 ? '#ef4444' : '#184a2c'};">Saldo Pendiente:</td>
              <td style="text-align: right; color: ${balance > 0 ? '#ef4444' : '#184a2c'};">${formatPrice(balance > 0 ? balance : 0)}</td>
            </tr>
          </table>
        </div>
        
        <div class="divider"></div>
        <div class="info">
          <p><strong>El pago está sujeto a verificación bancaria.</strong></p>
          <p>Este documento ampara el anticipo entregado para la confección de los artículos listados.</p>
          <p style="margin-top: 15px; font-weight: 700; color: #184a2c; font-size: ${isCarta ? '1.2rem' : '1rem'};">¡Gracias por confiar en nosotros!</p>
          <img src="${footerSrc}" class="footer-img" alt="Powered by2" onerror="this.style.display='none'" />
        </div>
      </body>
    </html>
  `;
  
  const win = window.open('', '_blank');
  if(win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 800);
  } else {
    alert("Por favor habilita las ventanas emergentes (pop-ups) para imprimir el ticket.");
  }
}
