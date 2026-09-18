// src/utils/exportHelpers.js
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper local para formatear valores numéricos a moneda de Colombia ($)
const fmtCOP = (val) => `$${Number(val || 0).toLocaleString('es-CO')}`;

/**
 * Exporta un arreglo de afiliados/histórico a archivo Excel (.xlsx) incluyendo el resumen ejecutivo.
 */
export const exportarAExcel = (datos, periodo, resumen = null) => {
  try {
    if (!datos || datos.length === 0) {
      alert("No hay registros para exportar en este período.");
      return;
    }

    const filasHoja = [
      [`REPORTE DE HISTÓRICO DE CIERRE - PERÍODO: ${periodo}`],
      [`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`],
      []
    ];

    // 1. Agregar bloque de Resumen Ejecutivo si existe
    if (resumen) {
      filasHoja.push(['--- RESUMEN EJECUTIVO Y RENTABILIDAD ---']);
      filasHoja.push(['Métrica', 'Monto / Valor']);
      filasHoja.push(['Utilidad Bruta Global', Number(resumen.utilidadGlobal || 0)]);
      filasHoja.push(['Comisiones Totales Repartidas', Number(resumen.comisionesPagadas || 0)]);
      filasHoja.push(['Bonificaciones Especiales', Number(resumen.bonificacionesPagadas || 0)]);
      filasHoja.push(['Margen Neto Disponible', Number(resumen.margenLibre || 0)]);
      filasHoja.push(['Porcentaje de Payout', `${resumen.porcentajeRepartido || 0}%`]);
      filasHoja.push(['Monto Acumulado Nivel 0', Number(resumen.montoSinNivel1 || 0)]);
      filasHoja.push([]);
    }

    // 2. Encabezados de la tabla de afiliados
    filasHoja.push(['--- DETALLE DE AFILIADOS Y COMISIONES ---']);
    filasHoja.push([
      'ID Afiliado',
      'Nombre Completo',
      'Cédula',
      'Nivel',
      'Estado',
      'Utilidad Propia ($)',
      'Comisión Propia ($)',
      'Comisión Red ($)',
      'Bono Liderazgo ($)',
      'Comisión Total ($)'
    ]);

    // 3. Filas con los datos de afiliados
    datos.forEach(row => {
      filasHoja.push([
        row.id_afiliado || row.id,
        `${row.nombre || ''} ${row.apellido || ''}`.trim(),
        row.cedula || 'N/A',
        row.nivel ?? 0,
        row.estado || 'N/A',
        Number(row.utilidad_acumulada || row.utilidad_propia || 0),
        Number(row.comision_propia || 0),
        Number(row.comision_por_red || 0),
        Number(row.bono_liderazgo || row.bonificaciones || 0),
        Number(row.comision_total || 0)
      ]);
    });

    // 4. Construir y exportar libro
    const worksheet = XLSX.utils.aoa_to_sheet(filasHoja);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Historico_${periodo}`);

    XLSX.writeFile(workbook, `Reporte_Historico_${periodo}.xlsx`);
  } catch (err) {
    console.error("Error al exportar a Excel:", err);
    alert(`Error al generar Excel: ${err.message}`);
  }
};

/**
 * Exporta un arreglo de afiliados/histórico a archivo PDF (.pdf) incluyendo el resumen ejecutivo.
 */
export const exportarAPDF = (datos, periodo, resumen = null) => {
  try {
    if (!datos || datos.length === 0) {
      alert("No hay registros para exportar en este período.");
      return;
    }

    // Instancia en formato horizontal (landscape)
    const doc = new jsPDF({ orientation: 'landscape' });

    // Encabezado Principal
    doc.setFontSize(16);
    doc.setTextColor(3, 7, 18);
    doc.text(`Reporte de Histórico de Cierre - Período: ${periodo}`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 14, 21);

    let siguienteY = 26;

    // 1. Agregar Tabla de Resumen Ejecutivo si el parámetro está presente
    if (resumen) {
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Resumen Ejecutivo y Rentabilidad Global', 14, siguienteY);

      autoTable(doc, {
        startY: siguienteY + 3,
        head: [['Utilidad Bruta', 'Comisiones', 'Bonificaciones', 'Margen Neto', 'Payout %', 'Monto Nivel 0']],
        body: [[
          fmtCOP(resumen.utilidadGlobal),
          fmtCOP(resumen.comisionesPagadas),
          fmtCOP(resumen.bonificacionesPagadas),
          fmtCOP(resumen.margenLibre),
          `${resumen.porcentajeRepartido || 0}%`,
          fmtCOP(resumen.montoSinNivel1)
        ]],
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8, cellPadding: 2, halign: 'center' }
      });

      siguienteY = doc.lastAutoTable.finalY + 10;
    }

    // 2. Definición de columnas de la tabla de afiliados
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Nombre Completo', dataKey: 'nombre' },
      { header: 'Cédula', dataKey: 'cedula' },
      { header: 'Nivel', dataKey: 'nivel' },
      { header: 'Utilidad ($)', dataKey: 'utilidad' },
      { header: 'Com. Propia ($)', dataKey: 'com_propia' },
      { header: 'Com. Red ($)', dataKey: 'com_red' },
      { header: 'Bono Lid. ($)', dataKey: 'bono_lid' },
      { header: 'Com. Total ($)', dataKey: 'com_total' }
    ];

    // 3. Formateo de las filas
    const rows = datos.map(item => ({
      id: item.id_afiliado || item.id,
      nombre: `${item.nombre || ''} ${item.apellido || ''}`.trim(),
      cedula: item.cedula || 'N/A',
      nivel: item.nivel ?? 0,
      utilidad: fmtCOP(item.utilidad_acumulada || item.utilidad_propia),
      com_propia: fmtCOP(item.comision_propia),
      com_red: fmtCOP(item.comision_por_red),
      bono_lid: fmtCOP(item.bono_liderazgo || item.bonificaciones),
      com_total: fmtCOP(item.comision_total)
    }));

    // Título de la sección de afiliados
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Detalle de Afiliados y Red', 14, siguienteY);

    // 4. Renderizado de la tabla principal
    autoTable(doc, {
      startY: siguienteY + 3,
      columns: columns,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // Descarga del archivo
    doc.save(`Reporte_Historico_${periodo}.pdf`);
  } catch (err) {
    console.error("Error detallado al exportar a PDF:", err);
    alert(`Ocurrió un error al generar el PDF: ${err.message}`);
  }
};