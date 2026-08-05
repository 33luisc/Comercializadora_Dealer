// src/utils/exportHelpers.js
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta un arreglo de afiliados/histórico a archivo Excel (.xlsx)
 */
export const exportarAExcel = (datos, periodo) => {
  try {
    if (!datos || datos.length === 0) {
      alert("No hay registros para exportar en este período.");
      return;
    }

    const filasFormateadas = datos.map(row => ({
      "ID Afiliado": row.id_afiliado || row.id,
      "Nombre Completo": `${row.nombre || ''} ${row.apellido || ''}`.trim(),
      "Cédula": row.cedula || 'N/A',
      "Nivel": row.nivel,
      "Estado": row.estado || 'N/A',
      "Utilidad Propia ($)": Number(row.utilidad_propia || 0),
      "Comisión Propia ($)": Number(row.comision_propia || 0),
      "Comisión Red ($)": Number(row.comision_por_red || 0),
      "Bono Liderazgo ($)": Number(row.bono_liderazgo || 0),
      "Comisión Total ($)": Number(row.comision_total || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(filasFormateadas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Historico_${periodo}`);

    XLSX.writeFile(workbook, `Reporte_Historico_${periodo}.xlsx`);
  } catch (err) {
    console.error("Error al exportar a Excel:", err);
    alert(`Error al generar Excel: ${err.message}`);
  }
};

/**
 * Exporta un arreglo de afiliados/histórico a archivo PDF (.pdf)
 */
export const exportarAPDF = (datos, periodo) => {
  try {
    if (!datos || datos.length === 0) {
      alert("No hay registros para exportar en este período.");
      return;
    }

    // Instancia del documento en horizontal (landscape)
    const doc = new jsPDF({ orientation: 'landscape' });

    // Encabezado
    doc.setFontSize(16);
    doc.setTextColor(3, 7, 18);
    doc.text(`Reporte de Histórico de Cierre - Período: ${periodo}`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);

    // Definición de columnas
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

    // Formateo de las filas
    const rows = datos.map(item => ({
      id: item.id_afiliado || item.id,
      nombre: `${item.nombre || ''} ${item.apellido || ''}`.trim(),
      cedula: item.cedula || 'N/A',
      nivel: item.nivel,
      utilidad: `$${Number(item.utilidad_propia || 0).toLocaleString()}`,
      com_propia: `$${Number(item.comision_propia || 0).toLocaleString()}`,
      com_red: `$${Number(item.comision_por_red || 0).toLocaleString()}`,
      bono_lid: `$${Number(item.bono_liderazgo || 0).toLocaleString()}`,
      com_total: `$${Number(item.comision_total || 0).toLocaleString()}`
    }));

    // Invocación directa del plugin autoTable pasando la instancia `doc`
    autoTable(doc, {
      startY: 28,
      columns: columns,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // Descarga directa
    doc.save(`Reporte_Historico_${periodo}.pdf`);
  } catch (err) {
    console.error("Error detallado al exportar a PDF:", err);
    alert(`Ocurrió un error al generar el PDF: ${err.message}`);
  }
};