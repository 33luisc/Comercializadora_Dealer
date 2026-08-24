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
        u.desglose_comisiones = [];
    });

    const nivelesOrdenadosDesc = [...niveles].sort((a, b) => b.umbral - a.umbral);

    function calcularNivelDinamico(utilidadTotal) {
        const nivelAlcanzado = nivelesOrdenadosDesc.find(n => utilidadTotal >= n.umbral);
        return nivelAlcanzado ? nivelAlcanzado.nivel : 0;
    }

    let acumuladoSinNivel1 = 0;

    // 1. DETERMINAR ESTADO Y NIVEL DE CADA AFILIADO
    afiliados.forEach(usuario => {
        const patrocinador = mapaUsuarios[usuario.id_patrocinador];
        usuario.nombre_patrocinador = patrocinador
            ? `${patrocinador.nombre} ${patrocinador.apellido || ''}`
            : 'Ninguno (Raíz)';

        const rutaBuscada = usuario.ruta_de_red || '';
        const descendientes = afiliados.filter(sub => 
            sub.id !== usuario.id && 
            sub.ruta_de_red && 
            sub.ruta_de_red.startsWith(rutaBuscada)
        );
        
        const utilidadDescendentes = descendientes.reduce((suma, sub) => suma + (Number(sub.utilidad_propia) || 0), 0);
        usuario.utilidad_total_calificacion = (Number(usuario.utilidad_propia) || 0) + utilidadDescendentes;

        usuario.compradores_en_red = descendientes.filter(sub => (Number(sub.utilidad_propia) || 0) > 0).length;

        const directos = afiliados.filter(sub => Number(sub.id_patrocinador) === Number(usuario.id));
        const limiteDirectos = general.limite_directos_bono || 15;
        usuario.cupos_libres = Math.max(0, limiteDirectos - directos.length);

        if ((Number(usuario.utilidad_propia) || 0) >= general.compra_minima_activacion) {
            usuario.estado = "Activo";
            usuario.nivel = calcularNivelDinamico(usuario.utilidad_total_calificacion);
        } else {
            usuario.estado = "Inactivo";
            usuario.nivel = 0;
        }

        // Si no alcanzó el Nivel 1 (es decir, nivel 0), acumulamos su dinero
        if (usuario.nivel === 0) {
            acumuladoSinNivel1 += (Number(usuario.utilidad_propia) || 0);
        }
    });

    // Asignamos la métrica global a cada objeto para que no se pierda sin cambiar el retorno
    afiliados.forEach(u => {
        u._meta_monto_sin_nivel1 = acumuladoSinNivel1;
    });

    const nivelMaximoExistente = niveles.length > 0 ? Math.max(...niveles.map(n => n.nivel)) : 4;

    const mapaConfigNivel = {};
    niveles.forEach(n => {
        mapaConfigNivel[n.nivel] = n;
    });

    // 2. CALCULAR COMISIÓN PROPIA Y DIFERENCIAL DE RED
    afiliados.forEach(comprador => {
        const utilidadComprador = Number(comprador.utilidad_propia) || 0;
        if (comprador.estado === "Inactivo" || utilidadComprador <= 0) return;

        // A. Comisión Propia
        const configNivelComprador = mapaConfigNivel[comprador.nivel];
        const porcentajePropioComprador = configNivelComprador ? (Number(configNivelComprador.porcentaje_propio) || 0) : 0;
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
                    
                    porcentajeCobradoAcumulado = porcentajePatrocinador;
                }
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
                const descendientesInferiores = descendientes.filter(desc => desc.nivel >= 1 && desc.nivel < nivelMaximoExistente);

                descendientesInferiores.forEach(desc => {
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

        usuario.comision_total = usuario.comision_propia + usuario.comision_por_red + usuario.bono_liderazgo;
    });

    // Retorna DIRECTAMENTE el array como siempre lo hizo
    return afiliados;
}

module.exports = {
    obtenerConfiguracionCompletaBD,
    procesarCalculosMLMDinamico
};