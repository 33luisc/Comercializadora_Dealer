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

    // Indexación O(1) de usuarios y reseteo de campos de comisión
    const mapaUsuarios = {};
    afiliados.forEach(u => {
        mapaUsuarios[u.id] = u;
        u.comision_propia = 0;
        u.comision_por_red = 0;
        u.bono_liderazgo = 0;
        u.comision_total = 0;
        u.desglose_comisiones = [];
    });

    const nivelesOrdenadosDesc = [...niveles].sort((a, b) => b.umbral - a.umbral);

    function calcularNivelDinamico(utilidadTotal) {
        const nivelAlcanzado = nivelesOrdenadosDesc.find(n => utilidadTotal >= n.umbral);
        return nivelAlcanzado ? nivelAlcanzado.nivel : 0;
    }

    // Helper estricto de rutas jerárquicas
    function esDescendienteRuta(rutaPadre, rutaHijo) {
        if (!rutaPadre || !rutaHijo || rutaPadre === rutaHijo) return false;
        return rutaHijo.startsWith(rutaPadre);
    }

    let acumuladoSinNivel1 = 0;

    // 1. DETERMINAR ESTADO Y NIVEL DE CADA AFILIADO
    afiliados.forEach(usuario => {
        const patrocinador = mapaUsuarios[usuario.id_patrocinador];
        usuario.nombre_patrocinador = patrocinador
            ? `${patrocinador.nombre} ${patrocinador.apellido || ''}`
            : 'Ninguno (Raíz)';

        const descendientes = afiliados.filter(sub => 
            sub.id !== usuario.id && 
            esDescendienteRuta(usuario.ruta_de_red, sub.ruta_de_red)
        );
        
        const utilidadPropiaNum = Number(usuario.utilidad_propia) || 0;
        const utilidadDescendentes = descendientes.reduce((suma, sub) => suma + (Number(sub.utilidad_propia) || 0), 0);
        
        // CORRECCIÓN: La utilidad de calificación DEBE sumar la propia + la red descendente
        usuario.utilidad_total_calificacion = utilidadPropiaNum + utilidadDescendentes;

        usuario.compradores_en_red = descendientes.filter(sub => (Number(sub.utilidad_propia) || 0) > 0).length;

        const directos = afiliados.filter(sub => String(sub.id_patrocinador) === String(usuario.id));
        const limiteDirectos = general.limite_directos_bono || 15;
        usuario.cupos_libres = Math.max(0, limiteDirectos - directos.length);

        if (utilidadPropiaNum >= (general.compra_minima_activacion || 0)) {
            usuario.estado = "Activo";
            usuario.nivel = calcularNivelDinamico(usuario.utilidad_total_calificacion);
        } else {
            usuario.estado = "Inactivo";
            usuario.nivel = 0;
        }

        if (usuario.nivel === 0) {
            acumuladoSinNivel1 += utilidadPropiaNum;
        }
    });

    afiliados.forEach(u => {
        u._meta_monto_sin_nivel1 = acumuladoSinNivel1;
    });

    const nivelMaximoExistente = niveles.length > 0 ? Math.max(...niveles.map(n => n.nivel)) : 4;

    const mapaConfigNivel = {};
    niveles.forEach(n => {
        mapaConfigNivel[n.nivel] = n;
    });

    // 2. CALCULAR COMISIÓN PROPIA Y DIFERENCIAL UP-LINE
    afiliados.forEach(comprador => {
        const utilidadComprador = Number(comprador.utilidad_propia) || 0;
        if (comprador.estado === "Inactivo" || utilidadComprador <= 0) return;

        // A. Comisión Propia
        const configNivelComprador = mapaConfigNivel[comprador.nivel];
        let porcentajePropioComprador = configNivelComprador ? (Number(configNivelComprador.porcentaje_propio) || 0) : 0;
        
        if (porcentajePropioComprador === 0) {
            porcentajePropioComprador = 1 / 6; // Base por defecto si no ha alcanzado nivel en tabla
        }

        const montoComisionPropia = utilidadComprador * porcentajePropioComprador;
        comprador.comision_propia = montoComisionPropia;
        
        if (montoComisionPropia > 0) {
            comprador.desglose_comisiones.push({
                origen_id: comprador.id,
                nombre_origen: `${comprador.nombre} ${comprador.apellido || ''}`,
                tipo: 'Compra Propia',
                porcentaje: (porcentajePropioComprador * 100).toFixed(1) + '%',
                monto: montoComisionPropia
            });
        }

        // B. Reparto Ascendente (Up-line) con Diferencial Real
        let porcentajeCobradoAcumulado = porcentajePropioComprador;
        let idPatrocinadorActual = comprador.id_patrocinador;

        while (idPatrocinadorActual) {
            const patrocinador = mapaUsuarios[idPatrocinadorActual];
            if (!patrocinador) break;

            if (patrocinador.estado === "Activo" && patrocinador.nivel > 0) {
                const configPatrocinador = mapaConfigNivel[patrocinador.nivel];
                const porcentajePatrocinador = configPatrocinador ? (Number(configPatrocinador.porcentaje_propio) || 0) : 0;

                // Solo cobra si tiene un porcentaje mayor al que ya se ha repartido en la línea ascendente
                if (porcentajePatrocinador > porcentajeCobradoAcumulado) {
                    const factorDiferencial = porcentajePatrocinador - porcentajeCobradoAcumulado;
                    const montoDiferencial = utilidadComprador * factorDiferencial;

                    patrocinador.comision_por_red += montoDiferencial;

                    patrocinador.desglose_comisiones.push({
                        origen_id: comprador.id,
                        nombre_origen: `${comprador.nombre} ${comprador.apellido || ''}`,
                        tipo: 'Diferencial de Red',
                        porcentaje: (factorDiferencial * 100).toFixed(1) + '%',
                        monto: montoDiferencial
                    });
                    
                    // Actualizamos el tope cobrado acumulado para evitar sobrepagos a niveles superiores de igual o menor rango
                    porcentajeCobradoAcumulado = porcentajePatrocinador;
                }
            }

            idPatrocinadorActual = patrocinador.id_patrocinador;
        }
    });

    // 3. CALCULAR BONO DE LIDERAZGO (CON FILTRO DE ESCUDO POR LÍDER INTERMEDIO)
    const factorLiderazgo = Number(general.factor_liderazgo) || 0;

    afiliados.forEach(usuario => {
        if (usuario.estado === "Activo" && usuario.nivel === nivelMaximoExistente) {
            
            const nivelesMaxDirectos = afiliados.filter(sub => 
                String(sub.id_patrocinador) === String(usuario.id) && 
                sub.nivel === nivelMaximoExistente
            );

            const cantidadNivelesMaxDirectos = nivelesMaxDirectos.length;

            if (cantidadNivelesMaxDirectos >= 1) {
                // Filtrar solo los descendientes que NO tienen a otro líder de Nivel Máximo intermedio entre ellos y el usuario
                const descendientesElegibles = afiliados.filter(sub => {
                    if (sub.id === usuario.id || sub.nivel === 0 || sub.nivel >= nivelMaximoExistente) return false;
                    if (!esDescendienteRuta(usuario.ruta_de_red, sub.ruta_de_red)) return false;

                    let curr = mapaUsuarios[sub.id_patrocinador];
                    while (curr && curr.id !== usuario.id) {
                        if (curr.nivel === nivelMaximoExistente) return false; // Bloqueado por escudo intermedio
                        curr = mapaUsuarios[curr.id_patrocinador];
                    }
                    return true;
                });

                descendientesElegibles.forEach(desc => {
                    const utilidad = Number(desc.utilidad_propia) || 0;
                    if (utilidad > 0) {
                        const montoBono = utilidad * factorLiderazgo;
                        usuario.bono_liderazgo += montoBono;
                        
                        usuario.desglose_comisiones.push({
                            origen_id: desc.id,
                            nombre_origen: `${desc.nombre} ${desc.apellido || ''}`,
                            tipo: 'Bono Liderazgo (Red Nivel < Max)',
                            porcentaje: (factorLiderazgo * 100).toFixed(1) + '%',
                            monto: montoBono
                        });
                    }
                });

                const limiteDirectos = Math.min(cantidadNivelesMaxDirectos, general.limite_directos_bono || 15);
                for (let i = 3; i <= limiteDirectos; i += 2) {
                    const directoNivelMax = nivelesMaxDirectos[i - 1];
                    if (directoNivelMax) {
                        const utilidad = Number(directoNivelMax.utilidad_propia) || 0;
                        if (utilidad > 0) {
                            const montoBono = utilidad * factorLiderazgo;
                            usuario.bono_liderazgo += montoBono;

                            usuario.desglose_comisiones.push({
                                origen_id: directoNivelMax.id,
                                nombre_origen: `${directoNivelMax.nombre} ${directoNivelMax.apellido || ''}`,
                                tipo: `Bono Liderazgo (Directo Nivel Máx pos #${i})`,
                                porcentaje: (factorLiderazgo * 100).toFixed(1) + '%',
                                monto: montoBono
                            });
                        }
                    }
                }
            }
        }
    });

    // CONSOLIDACIÓN Y REDONDEO FINAL
    afiliados.forEach(usuario => {
        usuario.comision_propia = Math.round(usuario.comision_propia);
        usuario.comision_por_red = Math.round(usuario.comision_por_red);
        usuario.bono_liderazgo = Math.round(usuario.bono_liderazgo);
        usuario.comision_total = usuario.comision_propia + usuario.comision_por_red + usuario.bono_liderazgo;
    });

    return afiliados;
}

module.exports = {
    obtenerConfiguracionCompletaBD,
    procesarCalculosMLMDinamico
};