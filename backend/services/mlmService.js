const db = require('../config/database');

function obtenerConfiguracionCompletaBD() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM configuracion_mlm WHERE id = 1`, [], (err, general) => {
            if (err) return reject(err);
            db.all(`SELECT * FROM configuracion_niveles ORDER BY nivel ASC`, [], (errNiveles, niveles) => {
                if (errNiveles) return reject(errNiveles);
                resolve({ general, niveles });
            });
        });
    });
}

function procesarCalculosMLMDinamico(afiliados, config) {
    const { general, niveles } = config;

    // Indexar usuarios por ID para accesos rápidos O(1)
    const mapaUsuarios = {};
    afiliados.forEach(u => {
        mapaUsuarios[u.id] = u;
        u.comision_propia = 0;
        u.comision_por_red = 0;
        u.bono_liderazgo = 0;
        u.comision_total = 0;
    });

    const nivelesOrdenadosDesc = [...niveles].sort((a, b) => b.umbral - a.umbral);

    function calcularNivelDinamico(utilidadTotal) {
        const nivelAlcanzado = nivelesOrdenadosDesc.find(n => utilidadTotal >= n.umbral);
        return nivelAlcanzado ? nivelAlcanzado.nivel : 0;
    }

    // 1. DETERMINAR ESTADO Y NIVEL DE CADA AFILIADO
    afiliados.forEach(usuario => {
        const patrocinador = mapaUsuarios[usuario.id_patrocinador];
        usuario.nombre_patrocinador = patrocinador
            ? `${patrocinador.nombre} ${patrocinador.apellido}`
            : 'Ninguno (Raíz)';

        const rutaBuscada = usuario.ruta_de_red || '';
        const descendientes = afiliados.filter(sub => 
            sub.id !== usuario.id && 
            sub.ruta_de_red && 
            sub.ruta_de_red.startsWith(rutaBuscada)
        );
        
        const utilidadDescendentes = descendientes.reduce((suma, sub) => suma + (Number(sub.utilidad_propia) || 0), 0);
        usuario.utilidad_total_calificacion = (Number(usuario.utilidad_propia) || 0) + utilidadDescendentes;

        if ((Number(usuario.utilidad_propia) || 0) >= general.compra_minima_activacion) {
            usuario.estado = "Activo";
            usuario.nivel = calcularNivelDinamico(usuario.utilidad_total_calificacion);
        } else {
            usuario.estado = "Inactivo";
            usuario.nivel = 0;
        }
    });

    const nivelMaximoExistente = niveles.length > 0 ? Math.max(...niveles.map(n => n.nivel)) : 4;

    // Mapa de spreads por diferencia de nivel
    const mapaSpreadPorDiferencia = {};
    niveles.forEach(n => {
        mapaSpreadPorDiferencia[n.nivel] = n.spread_red || 0;
    });

    // 2. CALCULAR COMISIÓN PROPIA Y DIFERENCIAL DE RED (UP-LINE TRAVERSAL)
    afiliados.forEach(comprador => {
        const utilidadComprador = Number(comprador.utilidad_propia) || 0;
        if (comprador.estado === "Inactivo" || utilidadComprador <= 0) return;

        // A. Comisión Propia
        const configNivelComprador = niveles.find(n => n.nivel === comprador.nivel);
        const porcentajePropio = configNivelComprador ? configNivelComprador.porcentaje_propio : 0;
        comprador.comision_propia = utilidadComprador * porcentajePropio;

        // B. Reparto Ascendente (Up-line) para la Comisión por Red
        let nivelCobradoActual = comprador.nivel;
        let idPatrocinadorActual = comprador.id_patrocinador;

        while (idPatrocinadorActual) {
            const patrocinador = mapaUsuarios[idPatrocinadorActual];
            if (!patrocinador) break;

            if (patrocinador.estado === "Activo" && patrocinador.nivel > nivelCobradoActual) {
                const diferenciaNivel = patrocinador.nivel - nivelCobradoActual;
                const factorSpread = mapaSpreadPorDiferencia[diferenciaNivel] || 0;

                patrocinador.comision_por_red += utilidadComprador * factorSpread;
                nivelCobradoActual = patrocinador.nivel;
            }

            idPatrocinadorActual = patrocinador.id_patrocinador;
        }
    });

    // 3. CALCULAR BONO DE LIDERAZGO
    const factorLiderazgo = Number(general.factor_liderazgo) || 0;

    afiliados.forEach(usuario => {
        if (usuario.estado === "Activo" && usuario.nivel === nivelMaximoExistente) {
            const rutaBuscada = usuario.ruta_de_red || '';
            const descendientes = afiliados.filter(sub => 
                sub.id !== usuario.id && 
                sub.ruta_de_red && 
                sub.ruta_de_red.startsWith(rutaBuscada)
            );

            const nivelesMaxDirectos = afiliados.filter(sub => 
                sub.id_patrocinador === usuario.id && 
                sub.nivel === nivelMaximoExistente
            );

            const cantidadNivelesMaxDirectos = nivelesMaxDirectos.length;

            if (cantidadNivelesMaxDirectos >= 1) {
                // Parte A: Red de niveles 1, 2 y 3
                const utilidadNivelesInferiores = descendientes
                    .filter(desc => desc.nivel >= 1 && desc.nivel < nivelMaximoExistente)
                    .reduce((suma, desc) => suma + (Number(desc.utilidad_propia) || 0), 0);

                usuario.bono_liderazgo += utilidadNivelesInferiores * factorLiderazgo;

                // Parte B: Directos Nivel 4 en posiciones 3ª, 5ª, 7ª, etc.
                const limiteDirectos = Math.min(cantidadNivelesMaxDirectos, general.limite_directos_bono || 15);
                for (let i = 3; i <= limiteDirectos; i += 2) {
                    const directoNivelMax = nivelesMaxDirectos[i - 1];
                    if (directoNivelMax) {
                        usuario.bono_liderazgo += (Number(directoNivelMax.utilidad_propia) || 0) * factorLiderazgo;
                    }
                }
            }
        }

        // Consolidador final de comisiones
        usuario.comision_total = usuario.comision_propia + usuario.comision_por_red + usuario.bono_liderazgo;
    });

    return afiliados;
}

module.exports = {
    obtenerConfiguracionCompletaBD,
    procesarCalculosMLMDinamico
};