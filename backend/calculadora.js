// CONFIGURACIÓN MODIFICABLE (Aquí es donde el dueño puede cambiar las cifras en el futuro)
const CONFIG_MLM = {
    UMBRALES: {
        1: 50000,
        2: 400000,
        3: 2000000,
        4: 6000000
    },
    PORCENTAJES_PROPIOS: {
        1: 1/6,
        2: 2/6,
        3: 3/6,
        4: 4/6
    },
    SPREAD_RED: {
        1: 1/2, // Lo que ganas de la utilidad de un Nivel 1 en tu red
        2: 2/6, // Lo que ganas de la utilidad de un Nivel 2 en tu red
        3: 1/6  // Lo que ganas de la utilidad de un Nivel 3 en tu red
    },
    FACTOR_LIDERAZGO: 1/6
};

/**
 * Determina el nivel de calificación según la utilidad total (propia + descendentes)
 */
function obtenerNivel(utilidadTotal) {
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[4]) return 4;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[3]) return 3;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[2]) return 2;
    if (utilidadTotal >= CONFIG_MLM.UMBRALES[1]) return 1;
    return 0; // No califica o inactivo
}

/**
 * Función principal que calcula las comisiones de toda la red
 * @param {Array} afiliados - Lista de usuarios traídos de la base de datos o Excel
 */
function calcularComisionesMes(afiliados) {
    // 1. Calcular Utilidad Total de Calificación para cada uno (Propia + Descendentes)
    // Usamos la 'Ruta de red' (ej: /1/3/) para saber quién es descendiente de quién de forma limpia
    afiliados.forEach(usuario => {
        const rutaBuscada = `${usuario.Ruta_de_red}`;
        
        const utilidadDescendentes = afiliados
            .filter(sub => sub.ID !== usuario.ID && sub.Ruta_de_red.startsWith(rutaBuscada))
            .reduce((suma, sub) => suma + sub.Utilidad_propia, 0);

        usuario.Utilidad_total_calificacion = usuario.Utilidad_propia + utilidadDescendentes;
        usuario.Nivel = obtenerNivel(usuario.Utilidad_total_calificacion);
    });

    // 2. Calcular Comisiones, Spreads y Bonos
    afiliados.forEach(usuario => {
        // Inicializamos los contadores de comisiones
        usuario.Comision_propia = usuario.Utilidad_propia * (CONFIG_MLM.PORCENTAJES_PROPIOS[usuario.Nivel] || 0);
        usuario.Comision_por_red = 0;
        usuario.Bono_liderazgo = 0;

        // Obtener todos los descendientes directos e indirectos
        const descendientes = afiliados.filter(sub => sub.ID !== usuario.ID && sub.Ruta_de_red.startsWith(usuario.Ruta_de_red));

        // --- CÁLCULO DE SPREAD DE RED (Para niveles 1, 2 y 3 debajo) ---
        descendientes.forEach(desc => {
            if (desc.Nivel === 1) usuario.Comision_por_red += desc.Utilidad_propia * CONFIG_MLM.SPREAD_RED[1];
            if (desc.Nivel === 2) usuario.Comision_por_red += desc.Utilidad_propia * CONFIG_MLM.SPREAD_RED[2];
            if (desc.Nivel === 3) usuario.Comision_por_red += desc.Utilidad_propia * CONFIG_MLM.SPREAD_RED[3];
        });

        // --- CÁLCULO DEL BONO DE LIDERAZGO (Regla Nivel 4) ---
        if (usuario.Nivel === 4) {
            const niveles4Debajo = descendientes.filter(desc => desc.Nivel === 4);
            const cantidadNiveles4 = niveles4Debajo.length;

            if (cantidadNiveles4 >= 1) {
                // Base del bono: 1/6 de la utilidad de los niveles 1, 2 y 3 debajo (Se suma una sola vez)
                const utilidadNiveles_1_2_3 = descendientes
                    .filter(desc => desc.Nivel >= 1 && desc.Nivel <= 3)
                    .reduce((suma, desc) => suma + desc.Utilidad_propia, 0);
                
                usuario.Bono_liderazgo += utilidadNiveles_1_2_3 * CONFIG_MLM.FACTOR_LIDERAZGO;

                // Regla especial para Niveles 4 impares (3, 5, 7, etc.)
                // Si hay 3 o más, sumamos el 1/6 de los niveles 4 en posiciones impares específicos
                for (let i = 3; i <= cantidadNiveles4; i += 2) {
                    if (niveles4Debajo[i - 1]) { // i - 1 por el índice del Array (0-indexed)
                        usuario.Bono_liderazgo += niveles4Debajo[i - 1].Utilidad_propia * CONFIG_MLM.FACTOR_LIDERAZGO;
                    }
                }
            }
        }

        // Comisión Total de este afiliado
        usuario.Comision_total = usuario.Comision_propia + usuario.Comision_por_red + usuario.Bono_liderazgo;
    });

    return afiliados;
}

// ==========================================
// PRUEBA DE COMPROBACIÓN (Simulando tus datos del Excel)
// ==========================================
const datosEjemplo = [
    { ID: 1, Nombre: "Lider_Raiz", Ruta_de_red: "/1/", Utilidad_propia: 50000 },
    { ID: 2, Nombre: "Afiliado_2", Ruta_de_red: "/1/2/", Utilidad_propia: 6000000 },
    { ID: 3, Nombre: "Afiliado_3", Ruta_de_red: "/1/2/3/", Utilidad_propia: 6000000 },
    { ID: 4, Nombre: "Afiliado_4", Ruta_de_red: "/1/2/4/", Utilidad_propia: 6000000 },
    { ID: 5, Nombre: "Afiliado_5", Ruta_de_red: "/1/2/5/", Utilidad_propia: 6000000 }
];

const resultado = calcularComisionesMes(datosEjemplo);
console.log("=== RESULTADOS DE PRUEBA ===");
resultado.forEach(u => {
    console.log(`\nUser: ${u.Nombre} (Nivel ${u.Nivel})`);
    console.log(`- Com. Propia: $${u.Comision_propia}`);
    console.log(`- Com. Red:   $${u.Comision_por_red}`);
    console.log(`- Bono Lider: $${u.Bono_liderazgo}`);
    console.log(`- Total:      $${u.Comision_total}`);
});