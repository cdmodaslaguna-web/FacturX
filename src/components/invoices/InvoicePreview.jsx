import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { doDownloadReceiptImage, doSendReceiptViaWhatsApp, doPrintAdvanceTicket, generateTicketCanvas } from '../../utils/receiptGenerator'

export default function InvoicePreview({ invoice, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    let isMounted = true;
    const loadPreview = async () => {
      const canvas = await generateTicketCanvas(invoice, invoice.amountPaid || 0, false, 0, "Comprobante de Pago");
      if (canvas && isMounted) {
        setPreviewImage(canvas.toDataURL('image/png'));
      }
    };
    loadPreview();
    return () => { isMounted = false; };
  }, [invoice]);

  const handleDownload = async () => {
    setIsGenerating(true);
    await doDownloadReceiptImage(invoice, invoice.amountPaid || 0, false, 0, "Comprobante de Pago");
    setIsGenerating(false);
  }

  const handleWhatsApp = async () => {
    setIsGenerating(true);
    await doSendReceiptViaWhatsApp(invoice, invoice.amountPaid || 0, false, 0, "Comprobante de Pago");
    setIsGenerating(false);
  }

  const handlePrint = (format) => {
    doPrintAdvanceTicket(invoice, invoice.amountPaid || 0, format, false, 0, "Comprobante de Pago");
  }

  return (
    <div className="modal-overlay glass-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content premium-modal" 
        style={{ maxWidth: '450px', width: '95%' }}
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="modal-header">
          <h2>Vista Previa de Factura</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="preview-scroll-area" style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
          {previewImage ? (
            <img src={previewImage} alt="Vista Previa del Comprobante" style={{ width: '100%', maxWidth: '350px', height: 'auto', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', width: '100%' }}>
              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Cargando vista previa...</span>
            </div>
          )}
        </div>

        <div className="modal-footer premium-footer" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px' }}>
          <div className="footer-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '100%' }}>
            
            <button className="btn btn-primary" title="Imprimir (Tirilla)" onClick={() => handlePrint('80mm')} disabled={isGenerating} style={{ background: '#184a2c', color: '#fff', border: 'none', padding: 0, width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
            
            <button className="btn btn-primary" title="Imprimir (Carta)" onClick={() => handlePrint('carta')} disabled={isGenerating} style={{ background: '#184a2c', color: '#fff', border: 'none', padding: 0, width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </button>

            <button className="btn btn-primary" title="Descargar Imagen" onClick={handleDownload} disabled={isGenerating} style={{ background: '#184a2c', color: '#fff', border: 'none', padding: 0, width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {isGenerating ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              )}
            </button>

            <button className="btn btn-primary" title="Compartir WhatsApp" onClick={handleWhatsApp} disabled={isGenerating} style={{ background: '#184a2c', color: '#fff', border: 'none', padding: 0, width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {isGenerating ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
