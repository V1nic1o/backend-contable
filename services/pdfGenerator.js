const PDFDocument = require('pdfkit');

exports.generarPDF = (titulo, contenidoFn, res) => {
  try {
    const doc = new PDFDocument({ margin: 40 });

    // Configurar headers HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${titulo.replace(/\s+/g, '_')}.pdf`
    );

    // Enlazar errores del stream
    doc.on('error', (err) => {
      console.error('❌ Error al generar PDF:', err);
      res.status(500).send('Error al generar el PDF');
    });

    // Pipe hacia la respuesta
    doc.pipe(res);

    // Título del PDF
    doc.fontSize(18).text(titulo, { align: 'center' });
    doc.moveDown();

    // Generar contenido
    contenidoFn(doc);

    // Cerrar documento
    doc.end();
  } catch (err) {
    console.error('❌ Error interno al generarPDF:', err);
    if (!res.headersSent) {
      res.status(500).send('Error interno al generar el PDF');
    }
  }
};