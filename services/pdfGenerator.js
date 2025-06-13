const PDFDocument = require('pdfkit');

exports.generarPDF = (titulo, contenidoFn, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${titulo.replace(/ /g, '_')}.pdf`);

  doc.pipe(res);

  doc.fontSize(18).text(titulo, { align: 'center' });
  doc.moveDown();

  contenidoFn(doc); // función que dibuja el contenido del PDF

  doc.end();
};