// This file uses third-party libraries. In a real project, you would install them:
// npm install jspdf html2canvas html-to-docx
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import saveAs from 'file-saver'; // html-to-docx uses file-saver implicitly/explicitly

interface ExportOptions {
    header?: string;
    footer?: string;
}

export const exportMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDocx = async (htmlContent: string, filename: string, options: ExportOptions = {}) => {
    try {
        const { default: htmlToDocx } = await import('html-to-docx');
        let finalHtml = htmlContent;

        // Prepend header and append footer if they exist
        if (options.header) {
            finalHtml = `<p style="font-size: 10px; color: #555;">${options.header}</p><br/>${finalHtml}`;
        }
        if (options.footer) {
            finalHtml = `${finalHtml}<br/><p style="font-size: 10px; color: #555;">${options.footer}</p>`;
        }

        const fileBuffer = await htmlToDocx(finalHtml, undefined, {
            margins: {
                top: 720, // 1 inch
                right: 720,
                bottom: 720,
                left: 720,
            },
        });
        const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, filename);
    } catch (e) {
        console.error("Error exporting to DOCX:", e);
        alert("Failed to export as DOCX. Please ensure you have a stable internet connection.");
    }
};

export const exportPdf = (element: HTMLElement, filename: string, options: ExportOptions = {}) => {
    if (!element) {
        console.error("Export failed: element not found");
        return;
    }

    // Create a temporary container for rendering to avoid modifying the live DOM
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${element.scrollWidth}px`;
    container.style.backgroundColor = '#1f2937';
    container.style.padding = '2rem';
    container.style.color = '#d1d5db';

    if (options.header) {
        const headerEl = document.createElement('div');
        headerEl.textContent = options.header;
        headerEl.style.marginBottom = '20px';
        headerEl.style.paddingBottom = '10px';
        headerEl.style.borderBottom = '1px solid #6b7280';
        headerEl.style.fontSize = '12px';
        headerEl.style.color = '#6b7280';
        container.appendChild(headerEl);
    }

    const contentClone = element.cloneNode(true) as HTMLElement;
    container.appendChild(contentClone);

    if (options.footer) {
        const footerEl = document.createElement('div');
        footerEl.textContent = options.footer;
        footerEl.style.marginTop = '20px';
        footerEl.style.paddingTop = '10px';
        footerEl.style.borderTop = '1px solid #6b7280';
        footerEl.style.fontSize = '12px';
        footerEl.style.textAlign = 'center';
        footerEl.style.color = '#6b7280';
        container.appendChild(footerEl);
    }

    document.body.appendChild(container);

    html2canvas(container, {
        backgroundColor: '#1f2937',
        scale: 2,
        useCORS: true,
        width: container.scrollWidth,
        height: container.scrollHeight,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
    }).catch(err => {
        console.error("Error generating PDF:", err);
        alert("Failed to export as PDF.");
    }).finally(() => {
        // Crucial: Clean up the temporary element from the DOM
        document.body.removeChild(container);
    });
};
