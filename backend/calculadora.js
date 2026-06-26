// CONFIGURACIÓN MODIFICABLE
const CONFIG_MLM = {
    UMBRALES: { 1: 50000, 2: 400000, 3: 2000000, 4: 6000000 },
    PORCENTAJES_PROPIOS: { 1: 1/6, 2: 2/6, 3: 3/6, 4: 4/6 },
    SPREAD_RED: { 1: 1/2, 2: 2/6, 3: 1/6 },
    FACTOR_LIDERAZGO: 1/6
};

function obtenerNivel(utilidadTotal) {
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[4]) return 4;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[3]) return 3;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[2]) return 2;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[1]) return 1;
    return 0;
}

function calcularComisionesMes(afiliados) {
    // 1. CALCULAR UTILIDAD TOTAL DE CALIFICACIÓN
    afiliados.forEach(usuario => {
        const rutaBuscada = `${usuario.Ruta_de_red}`;
        const utilidadDescendentes = afiliados
            .filter(sub => sub.ID !== usuario.ID && sub.Ruta_de_red.startsWith(rutaBuscada))
            .reduce((suma, sub) => suma + sub.Utilidad_propia, 0);

        usuario.Utilidad_total_calificacion = usuario.Utilidad_propia + utilidadDescendentes;
        usuario.Nivel = obtenerNivel(usuario.Utilidad_total_calificacion);
    });

    // 2. CALCULAR COMISIONES INDIVIDUALES
    afiliados.forEach(usuario => {
        usuario.Comision_propia = usuario.Utilidad_propia * (CONFIG_MLM.PORCENTAJES_PROPIOS[usuario.Nivel] || 0);
        usuario.Comision_por_red = 0;
        usuario.Bono_liderazgo = 0;

        const descendientes = afiliados.filter(sub => sub.ID !== usuario.ID && sub.Ruta_de_red.startsWith(usuario.Ruta_de_red));

        // Spread de Red (Profundidad ilimitada)
        descendientes.forEach(desc => {
            if (desc.Nivel === 1) usuario.Comision_por_red += desc.Utilidad_propia * CONFIG_MLM.SPREAD_RED[1];
            if (desc.Nivel === 2) usuario.Comision_por_red += desc.Utilidad_propia * CONFIG_MLM.SPREAD_RED[2];
            if (desc.Nivel === 3) usuario.Comision_por_red += desc.Utilidad_propia * CONFIG_MLM.SPREAD_RED[3];
        });

        // Bono de Liderazgo (Solo directos Nivel 4)
        if (usuario.Nivel === 4) {
            const niveles4Directos = afiliados.filter(sub => sub.ID_Patrocinador === usuario.ID && sub.Nivel === 4);
            const cantidadNiveles4Directos = niveles4Directos.length;

            if (cantidadNiveles4Directos >= 1) {
                const utilidadNiveles_1_2_3 = descendientes
                    .filter(desc => desc.Nivel >= 1 && desc.Nivel <= 3)
                    .reduce((suma, desc) => suma + desc.Utilidad_propia, 0);
                
                usuario.Bono_liderazgo += utilidadNiveles_1_2_3 * CONFIG_MLM.FACTOR_LIDERAZGO;

                const limiteDirectos = Math.min(cantidadNiveles4Directos, 15);
                for (let i = 3; i <= limiteDirectos; i += 2) {
                    if (niveles4Directos[i - 1]) {
                        usuario.Bono_liderazgo += niveles4Directos[i - 1].Utilidad_propia * CONFIG_MLM.FACTOR_LIDERAZGO;
                    }
                }
            }
        }

        usuario.Comision_total = usuario.Comision_propia + usuario.Comision_por_red + usuario.Bono_liderazgo;
    });

    return afiliados;
}

// ==========================================
// EJECUCIÓN Y AUDITORÍA DE RENTABILIDAD
// ==========================================
const datosEntrada = [
    { ID: 1, Nombre: "Lider_Raiz",  ID_Patrocinador: null, Ruta_de_red: "/1/",   Utilidad_propia: 600000 },
    { ID: 2, Nombre: "Afiliado_2",  ID_Patrocinador: 1,    Ruta_de_red: "/1/2/", Utilidad_propia: 600000 },
    { ID: 3, Nombre: "Afiliado_3",  ID_Patrocinador: 1,    Ruta_de_red: "/1/3/", Utilidad_propia: 2400000 },
    { ID: 4, Nombre: "Afiliado_4",  ID_Patrocinador: 1,    Ruta_de_red: "/1/4/", Utilidad_propia: 6000000 },
    { ID: 5, Nombre: "Afiliado_5",  ID_Patrocinador: 1,    Ruta_de_red: "/1/5/", Utilidad_propia: 6000000 },
    { ID: 6, Nombre: "Afiliado_6",  ID_Patrocinador: 1,    Ruta_de_red: "/1/6/", Utilidad_propia: 6000000 },
    { ID: 7, Nombre: "Afiliado_7",  ID_Patrocinador: 1,    Ruta_de_red: "/1/7/", Utilidad_propia: 6000000 },
    { ID: 8, Nombre: "Afiliado_8",  ID_Patrocinador: 2,    Ruta_de_red: "/1/2/8/", Utilidad_propia: 2000000 },
    { ID: 9, Nombre: "Afiliado_9",  ID_Patrocinador: 2,    Ruta_de_red: "/1/2/9/", Utilidad_propia: 6000000 }
];

const usuariosCalculados = calcularComisionesMes(datosEntrada);

// Variables para métricas globales de rentabilidad
let utilidadGlobalEmpresa = 0;
let totalComisionesPagadas = 0;

console.log("=========================================================================");
console.log("                  DESGLOSE DE GANANCIAS POR AFILIADO                     ");
console.log("=========================================================================");

usuariosCalculados.forEach(u => {
    utilidadGlobalEmpresa += u.Utilidad_propia;
    totalComisionesPagadas += u.Comision_total;

    console.log(`ID: ${u.ID} | ${u.Nombre.padEnd(12)} | Nivel: ${u.Nivel} | Propia: $${u.Utilidad_propia.toLocaleString()}`);
    console.log(`  └─> Com. Propia: $${u.Comision_propia.toLocaleString()}`);
    console.log(`  └─> Com. Red:    $${u.Comision_por_red.toLocaleString()}`);
    console.log(`  └─> Bono Líder:  $${u.Bono_liderazgo.toLocaleString()}`);
    console.log(`  └─> TOTAL GANADO: $${u.Comision_total.toLocaleString()}`);
    console.log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
});

const dineroEmpresaLibre = utilidadGlobalEmpresa - totalComisionesPagadas;
const porcentajeRepartido = (totalComisionesPagadas / utilidadGlobalEmpresa) * 100;

console.log("\n=========================================================================");
console.log("                    REPORTE GENERAL DE RENTABILIDAD                      ");
console.log("=========================================================================");
console.log(`(+) Utilidad Total Generada en Ventas:  $${utilidadGlobalEmpresa.toLocaleString()}`);
console.log(`(-) Total Comisiones Pagadas a la Red:  $${totalComisionesPagadas.toLocaleString()}`);
console.log(`(=) Margen Neto Libre para la Empresa:  $${dineroEmpresaLibre.toLocaleString()}`);
console.log(`[!] Porcentaje de la Utilidad Repartido:  ${porcentajeRepartido.toFixed(2)}%`);
console.log(`[!] Porcentaje Retenido por la Empresa:   ${(100 - porcentajeRepartido).toFixed(2)}%`);
console.log("=========================================================================");