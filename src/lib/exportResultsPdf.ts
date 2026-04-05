import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Rasterizes a DOM subtree to a multi-page A4 PDF.
 * Uses html-to-image (browser paint) instead of html2canvas, which cannot parse modern CSS colors (oklab/oklch).
 */
export async function exportElementToPdf(element: HTMLElement, fileName: string): Promise<void> {
  const prevScroll = window.scrollY;
  window.scrollTo(0, 0);

  try {
    const w = element.scrollWidth;
    const h = element.scrollHeight;

    const canvas = await toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: '#0a0a12',
      width: w,
      height: h,
      cacheBust: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight - pageHeight;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    while (heightLeft > 0) {
      const position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
  } finally {
    window.scrollTo(0, prevScroll);
  }
}
