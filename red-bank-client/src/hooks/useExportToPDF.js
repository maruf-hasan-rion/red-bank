import { useCallback } from 'react';
import html2pdf from 'html2pdf.js';

const useExportToPDF = (elementId, fileName = 'document.pdf') => {
  const exportToPDF = useCallback(() => {
    const element = document.getElementById(elementId);

    if (!element) {
      return false;
    }

    const options = {
      margin: 0.5,
      filename: fileName,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 5,
        useCORS: true,
        logging: false,
        removeContainer: true,
      },
      jsPDF: {
        unit: 'in',
        format: [15, 8.5],
        orientation: 'landscape',
      },
    };

    html2pdf().set(options).from(element).save();
    return true;
  }, [elementId, fileName]);

  return { exportToPDF };
};

export default useExportToPDF;
