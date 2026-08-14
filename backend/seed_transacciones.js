const API_URL = 'http://127.0.0.1:4000/api/transacciones';

// Objetivos permitidos para el valor acumulado total por usuario
const MONTOS_OBJETIVO = [
    49999, 
    50000, 
    399999, 
    400000, 
    1999999, 
    2000000, 
    5999999, 
    6000000
];

/**
 * Genera N transacciones para un afiliado de modo que la SUMA TOTAL
 * sea exactamente igual a uno de los MONTOS_OBJETIVO.
 */
function generarTransaccionesPorAfiliado(idAfiliado) {
    // 1. Elegir un monto objetivo aleatorio para este afiliado
    const montoTotalTarget = MONTOS_OBJETIVO[Math.floor(Math.random() * MONTOS_OBJETIVO.length)];
    
    // 2. Determinar en cuántas transacciones se fragmentará (1, 2 o 3)
    const numTransacciones = Math.floor(Math.random() * 3) + 1;
    const transacciones = [];

    if (numTransacciones === 1) {
        // Una sola transacción con el valor completo
        transacciones.push({
            id_afiliado: idAfiliado,
            monto: montoTotalTarget,
            descripcion: "Pago por servicios"
        });
    } else if (numTransacciones === 2) {
        // Parte el total en 2 montos enteros que sumados dan el target
        const monto1 = Math.floor(Math.random() * (montoTotalTarget - 1)) + 1;
        const monto2 = montoTotalTarget - monto1;

        transacciones.push(
            { id_afiliado: idAfiliado, monto: monto1, descripcion: "Abono 1/2 por servicios" },
            { id_afiliado: idAfiliado, monto: monto2, descripcion: "Abono 2/2 por servicios" }
        );
    } else {
        // Parte el total en 3 montos
        const corte1 = Math.floor(Math.random() * (montoTotalTarget - 2)) + 1;
        const corte2 = Math.floor(Math.random() * (montoTotalTarget - corte1 - 1)) + (corte1 + 1);

        const monto1 = corte1;
        const monto2 = corte2 - corte1;
        const monto3 = montoTotalTarget - corte2;

        transacciones.push(
            { id_afiliado: idAfiliado, monto: monto1, descripcion: "Abono 1/3 por servicios" },
            { id_afiliado: idAfiliado, monto: monto2, descripcion: "Abono 2/3 por servicios" },
            { id_afiliado: idAfiliado, monto: monto3, descripcion: "Abono 3/3 por servicios" }
        );
    }

    return transacciones;
}

function generarTransaccionesAleatorias(totalAfiliados = 201) {
    const lista = [];
    for (let id = 1; id <= totalAfiliados; id++) {
        const txsAfiliado = generarTransaccionesPorAfiliado(id);
        lista.push(...txsAfiliado);
    }
    return lista;
}

const transacciones = generarTransaccionesAleatorias(201);

async function registrarTransacciones() {
    console.log(`🚀 Registrando ${transacciones.length} transacciones para 201 afiliados...\n`);
    
    for (const tx of transacciones) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tx)
            });
            
            if (res.ok) {
                console.log(`✅ Registrada: Afiliado ${tx.id_afiliado} - Monto: $${tx.monto.toLocaleString()}`);
            } else {
                console.error(`❌ Error registrando afiliado ${tx.id_afiliado}: Status ${res.status}`);
            }
        } catch (error) {
            console.error(`⚠️ Error de red con afiliado ${tx.id_afiliado}:`, error.message);
        }
    }
}

registrarTransacciones();