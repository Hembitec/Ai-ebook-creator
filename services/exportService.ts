
import { Book } from '../types';

declare const jspdf: any;
declare const html2canvas: any;
declare const docx: any;
declare const marked: any;

export const exportToPdf = async (book: Book) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const contentElement = document.createElement('div');
  contentElement.style.width = '210mm';
  contentElement.style.padding = '20mm';
  contentElement.style.fontFamily = 'Times, serif';
  contentElement.style.visibility = 'hidden';
  contentElement.style.position = 'absolute';
  contentElement.style.left = '-10000px';

  let htmlContent = '';

  // Cover Image
  if (book.coverImage) {
    htmlContent += `<div style="text-align: center; page-break-after: always;"><img src="${book.coverImage}" style="max-width: 100%; max-height: 257mm;" /></div>`;
  }
  
  // Title page
  htmlContent += `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 257mm; text-align: center; page-break-after: always;">
      <h1 style="font-size: 32px; margin-bottom: 8px;">${book.title}</h1>
      <h2 style="font-size: 24px; font-style: italic; margin-bottom: 24px;">${book.subtitle}</h2>
      <p style="font-size: 18px;">By ${book.author}</p>
    </div>
  `;

  // Chapters
  book.chapters.forEach(chapter => {
    htmlContent += `
      <div style="page-break-after: always;">
        <h3 style="font-size: 24px; margin-bottom: 16px;">${chapter.title}</h3>
        <div style="font-size: 14px; line-height: 1.6;">${marked.parse(chapter.content)}</div>
      </div>
    `;
  });

  contentElement.innerHTML = htmlContent;
  document.body.appendChild(contentElement);

  const canvas = await html2canvas(contentElement, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: contentElement.scrollWidth,
      windowHeight: contentElement.scrollHeight
  });
  
  document.body.removeChild(contentElement);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  doc.save(`${book.title.replace(/ /g, '_')}.pdf`);
};

export const exportToDocx = async (book: Book) => {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun } = docx;

  const sections = [];

  // Cover image
  if (book.coverImage) {
    const response = await fetch(book.coverImage);
    const blob = await response.blob();
    sections.push({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: blob,
              transformation: {
                width: 600,
                height: 800,
              },
            }),
          ],
        }),
      ],
    });
  }

  // Title page
  sections.push({
    children: [
      new Paragraph({ text: book.title, heading: HeadingLevel.TITLE }),
      new Paragraph({ text: book.subtitle, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: `By ${book.author}`, heading: HeadingLevel.HEADING_3 }),
    ],
  });

  // Chapters
  book.chapters.forEach(chapter => {
    const chapterChildren = [
      new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
    ];
    
    // Naive markdown parser
    const paragraphs = chapter.content.split('\n');
    paragraphs.forEach(p => {
        if(p.trim() === '') return;
        chapterChildren.push(new Paragraph({ text: p.trim() }));
    });

    sections.push({ children: chapterChildren });
  });

  const doc = new Document({ sections });

  Packer.toBlob(doc).then(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${book.title.replace(/ /g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
