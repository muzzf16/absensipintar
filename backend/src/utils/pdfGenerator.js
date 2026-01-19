const PDFDocument = require('pdfkit');

/**
 * Generate a professional PDF report for visits
 * @param {Array} visits - Array of visit records with user and customer info
 * @param {Object} filters - Filter parameters (startDate, endDate, etc.)
 * @returns {PDFDocument} PDF document stream
 */
const generateVisitsPDF = (visits, filters = {}) => {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
    });

    // Header
    doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('Laporan Kunjungan Nasabah', { align: 'center' })
        .moveDown(0.5);

    doc.fontSize(10)
        .font('Helvetica')
        .text('Presensi Pintar & Kunjungan Nasabah', { align: 'center' })
        .moveDown(0.3);

    // Report Info
    const now = new Date();
    doc.fontSize(9)
        .text(`Tanggal Cetak: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`, { align: 'center' })
        .moveDown(0.5);

    // Filters Info
    if (filters.startDate || filters.endDate || filters.userId || filters.customerId) {
        doc.fontSize(9)
            .font('Helvetica-Bold')
            .text('Filter:', 50, doc.y);

        if (filters.startDate) {
            doc.font('Helvetica')
                .text(`  Dari: ${new Date(filters.startDate).toLocaleDateString('id-ID')}`, 50, doc.y);
        }
        if (filters.endDate) {
            doc.font('Helvetica')
                .text(`  Sampai: ${new Date(filters.endDate).toLocaleDateString('id-ID')}`, 50, doc.y);
        }
        if (filters.userId) {
            doc.font('Helvetica')
                .text(`  User ID: ${filters.userId}`, 50, doc.y);
        }
        if (filters.customerId) {
            doc.font('Helvetica')
                .text(`  Customer ID: ${filters.customerId}`, 50, doc.y);
        }
        doc.moveDown(1);
    }

    // Horizontal line
    doc.moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(0.5);

    // Summary Statistics
    const approvedCount = visits.filter(v => v.status === 'approved').length;
    const pendingCount = visits.filter(v => v.status === 'pending').length;
    const rejectedCount = visits.filter(v => v.status === 'rejected').length;

    doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Ringkasan:', 50, doc.y)
        .font('Helvetica')
        .text(`Total Kunjungan: ${visits.length}`, 50, doc.y)
        .text(`Disetujui: ${approvedCount}`, 50, doc.y)
        .text(`Pending: ${pendingCount}`, 50, doc.y)
        .text(`Ditolak: ${rejectedCount}`, 50, doc.y)
        .moveDown(1);

    // Table Header
    const tableTop = doc.y;
    const colWidths = {
        no: 30,
        date: 70,
        time: 50,
        employee: 90,
        customer: 100,
        purpose: 100,
        status: 60
    };

    let currentX = 50;

    doc.fontSize(9)
        .font('Helvetica-Bold')
        .text('No', currentX, tableTop, { width: colWidths.no });
    currentX += colWidths.no;

    doc.text('Tanggal', currentX, tableTop, { width: colWidths.date });
    currentX += colWidths.date;

    doc.text('Waktu', currentX, tableTop, { width: colWidths.time });
    currentX += colWidths.time;

    doc.text('Karyawan', currentX, tableTop, { width: colWidths.employee });
    currentX += colWidths.employee;

    doc.text('Nasabah', currentX, tableTop, { width: colWidths.customer });
    currentX += colWidths.customer;

    doc.text('Tujuan', currentX, tableTop, { width: colWidths.purpose });
    currentX += colWidths.purpose;

    doc.text('Status', currentX, tableTop, { width: colWidths.status });

    doc.moveDown(0.3);

    // Horizontal line under header
    doc.moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(0.3);

    // Table Rows
    visits.forEach((visit, index) => {
        const rowY = doc.y;

        // Check if we need a new page
        if (rowY > 700) {
            doc.addPage();
            doc.y = 50;
        }

        currentX = 50;

        doc.fontSize(8)
            .font('Helvetica')
            .text((index + 1).toString(), currentX, doc.y, { width: colWidths.no });
        currentX += colWidths.no;

        const visitDate = new Date(visit.visitTime);
        doc.text(visitDate.toLocaleDateString('id-ID'), currentX, rowY, { width: colWidths.date });
        currentX += colWidths.date;

        doc.text(visitDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), currentX, rowY, { width: colWidths.time });
        currentX += colWidths.time;

        doc.text(visit.user?.name || 'Unknown', currentX, rowY, { width: colWidths.employee });
        currentX += colWidths.employee;

        doc.text(visit.customer?.name || 'Unknown', currentX, rowY, { width: colWidths.customer });
        currentX += colWidths.customer;

        // Truncate purpose if too long
        const purpose = visit.purpose.length > 30 ? visit.purpose.substring(0, 27) + '...' : visit.purpose;
        doc.text(purpose, currentX, rowY, { width: colWidths.purpose });
        currentX += colWidths.purpose;

        // Status with color
        if (visit.status === 'approved') {
            doc.fillColor('green');
        } else if (visit.status === 'rejected') {
            doc.fillColor('red');
        } else {
            doc.fillColor('orange');
        }
        doc.text(visit.status.toUpperCase(), currentX, rowY, { width: colWidths.status });
        doc.fillColor('black');

        doc.moveDown(0.5);
    });

    // Footer with page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        // Page number at bottom
        doc.fontSize(8)
            .font('Helvetica')
            .text(
                `Halaman ${i + 1} dari ${pages.count}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );

        // Company info at bottom
        doc.fontSize(7)
            .text(
                'Presensi Pintar © 2026 - Laporan ini digenerate secara otomatis',
                50,
                doc.page.height - 35,
                { align: 'center' }
            );
    }

    return doc;
};

module.exports = { generateVisitsPDF };
