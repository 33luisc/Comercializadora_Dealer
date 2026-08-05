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
    const mapaUsuarios = {};
    
    afiliados.forEach(u => { 
        mapaUsuarios[u.id] = `${u.nombre} ${u.apellido}`; 
    });

    const nivelesOrdenadosDesc = [...niveles].sort((a, b) => b.umbral - a.umbral);

    function calcularNivelDinamico(utilidadTotal) {
        const nivelAlcanzado = nivelesOrdenadosDesc.find(n => utilidadTotal >= n.umbral);
        return nivelAlcanzado ? nivelAlcanzado.nivel : 0;
    }

    // 1. DETERMINAR ESTADO Y NIVEL DE CADA AFILIADO
    afiliados.forEach(usuario => {
        usuario.nombre_patrocinador = usuario.id_patrocinador 
            ? (mapaUsuarios[usuario.id_patrocinador] || `ID: ${usuario.id_patrocinador}`) 
            : 'Ninguno (Raíz)';

        const rutaBuscada = usuario.ruta_de_red;
        const descendientes = afiliados.filter(sub => sub.id !== usuario.id && sub.ruta_de_red && sub.ruta_de_red.startsWith(rutaBuscada));
        const utilidadDescendentes = descendientes.reduce((suma, sub) => suma + (sub.utilidad_propia || 0), 0);

        usuario.utilidad_total_calificacion = (usuario.utilidad_propia || 0) + utilidadDescendentes;
        
        if (usuario.utilidad_propia >= general.compra_minima_activacion) {
            usuario.estado = "Activo";
            usuario.nivel = calcularNivelDinamico(usuario.utilidad_total_calificacion);
        } else {
            usuario.estado = "Inactivo";
            usuario.nivel = 0;
        }
    });

    const nivelMaximoExistente = niveles.length > 0 ? Math.max(...niveles.map(n => n.nivel)) : 4;

    // Mapa para consultar el porcentaje de spread por red configurado según la diferencia de niveles
    // Nivel diferencia 1 -> Spread Nivel 1 (1/6 = 16.66%)
    // Nivel diferencia 2 -> Spread Nivel 2 (2/6 = 33.33%)
    // Nivel diferencia 3 -> Spread Nivel 3 (3/6 = 50.00%)
    const mapaSpreadPorDiferencia = {};
    niveles.forEach(n => {
        mapaSpreadPorDiferencia[n.nivel] = n.spread_red || 0;
    });

    // 2. CALCULAR COMISIONES
    afiliados.forEach(usuario => {
        if (usuario.estado === "Inactivo") {
            usuario.comision_propia = 0;
            usuario.comision_por_red = 0;
            usuario.bono_liderazgo = 0;
            usuario.comision_total = 0;
            return;
        }

        const configNivelUsuario = niveles.find(n => n.nivel === usuario.nivel);
        const porcentajePropio = configNivelUsuario ? configNivelUsuario.porcentaje_propio : 0;

        usuario.comision_propia = usuario.utilidad_propia * porcentajePropio;
        usuario.comision_por_red = 0;
        usuario.bono_liderazgo = 0;

        const descendientes = afiliados.filter(sub => sub.id !== usuario.id && sub.ruta_de_red && sub.ruta_de_red.startsWith(usuario.ruta_de_red));

        // Nivel 1 solo gana por compra propia (comision_por_red = 0)
        if (usuario.nivel > 1) {
            descendientes.forEach(desc => {
                // Solo genera comisión si el descendiente tiene un nivel inferior
                if (desc.nivel > 0 && usuario.nivel > desc.nivel) {
                    const diferenciaNivel = usuario.nivel - desc.nivel;
                    // Obtiene la fracción correspondiente a la diferencia de nivel
                    const factorSpread = mapaSpreadPorDiferencia[diferenciaNivel] || 0;
                    
                    usuario.comision_por_red += desc.utilidad_propia * factorSpread;
                }
            });
        }

        // CALCULO DE BONO DE LIDERAZGO
        if (usuario.nivel === nivelMaximoExistente) {
            const nivelesMaxDirectos = afiliados.filter(sub => sub.id_patrocinador === usuario.id && sub.nivel === nivelMaximoExistente);
            const cantidadNivelesMaxDirectos = nivelesMaxDirectos.length;

            if (cantidadNivelesMaxDirectos >= 1) {
                const utilidadNivelesInferiores = descendientes
                    .filter(desc => desc.nivel >= 1 && desc.nivel < nivelMaximoExistente)
                    .reduce((suma, desc) => suma + desc.utilidad_propia, 0);
                
                usuario.bono_liderazgo += utilidadNivelesInferiores * general.factor_liderazgo;

                const limiteDirectos = Math.min(cantidadNivelesMaxDirectos, general.limite_directos_bono);
                for (let i = 3; i <= limiteDirectos; i += 2) {
                    if (nivelesMaxDirectos[i - 1]) {
                        usuario.bono_liderazgo += nivelesMaxDirectos[i - 1].utilidad_propia * general.factor_liderazgo;
                    }
                }
            }
        }

        usuario.comision_total = usuario.comision_propia + usuario.comision_por_red + usuario.bono_liderazgo;
    });

    return afiliados;
}

module.exports = {
    obtenerConfiguracionCompletaBD,
    procesarCalculosMLMDinamico
};