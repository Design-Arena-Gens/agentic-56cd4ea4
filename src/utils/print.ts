import html2canvas from "html2canvas";

export const downloadSectionAsImage = async (
  element: HTMLElement | null,
  filename: string,
) => {
  if (!element) return;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename.endsWith(".jpg") ? filename : `${filename}.jpg`;
  link.click();
};

export const openPrintWindow = (html: string, title: string) => {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; }
          * { box-sizing: border-box; }
          .print-container { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 40px 48px 60px; position: relative; }
          .header-image, .footer-image { width: 100%; object-fit: cover; }
          .header-image { max-height: 140px; }
          .footer-image { max-height: 120px; position: absolute; bottom: 0; left: 0; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { border: 1px solid rgba(148, 163, 184, 0.6); padding: 10px 12px; text-align: left; }
          th { background: rgba(99, 102, 241, 0.12); color: #1f1b4d; font-weight: 600; }
          .summary-table td { border: none; padding: 6px 0; }
          .summary-table td:last-child { font-weight: 600; text-align: right; }
          .highlight { background: rgba(79, 70, 229, 0.16); font-weight: 700; }
          .section-title { font-size: 16px; font-weight: 600; color: #1f1b4d; margin: 32px 0 12px; letter-spacing: 0.01em; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 28px; font-size: 14px; margin-bottom: 24px; }
          .meta-item span { display: block; color: #4338ca; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
          .meta-item strong { font-size: 14px; color: #111827; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 600);
};
