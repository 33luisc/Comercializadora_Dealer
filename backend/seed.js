const API_URL = 'http://127.0.0.1:4000/api/afiliados';
const TOTAL_USUARIOS = 200;
const MAX_REFERIDOS = 15;
const ID_INICIAL = 1; // ID de Camilo (primer patrocinador)

const nombres = ['Andrés', 'Sofía', 'Mateo', 'Valentina', 'Diego', 'Camila', 'Gabriel', 'Isabella', 'Alejandro', 'Mariana', 'Daniel', 'Lucía', 'Santiago', 'Natalia', 'Felipe', 'Carlos', 'Andrea', 'Javier', 'Elena', 'Nicolás'];
const apellidos = ['Mendoza', 'Castro', 'Ríos', 'Morales', 'Herrera', 'Vargas', 'Ortega', 'Silva', 'Navarro', 'Rojas', 'Medina', 'Cortés', 'Guerrero', 'Salazar', 'Delgado', 'Gómez', 'López', 'Martínez', 'Torres', 'Ramírez'];

// Genera un arreglo de 200 usuarios distribuidos en niveles
function generarUsuarios(total) {
  const usuarios = [];

  for (let i = 0; i < total; i++) {
    // Cálculo del ID del patrocinador asegurando máximo 15 por cada uno
    // i = 0 a 14  -> id_patrocinador = 1
    // i = 15 a 29 -> id_patrocinador = 2
    // i = 30 a 44 -> id_patrocinador = 3 ...
    const idPatrocinador = ID_INICIAL + Math.floor(i / MAX_REFERIDOS);
    
    const nombre = nombres[i % nombres.length];
    const apellido = apellidos[Math.floor(i / nombres.length) % apellidos.length];
    const numeroUnico = (i + 1).toString().padStart(3, '0');

    usuarios.push({
      nombre: `${nombre}`,
      apellido: `${apellido}`,
      cedula: `2000${numeroUnico}`,
      celular: `310100${numeroUnico.padStart(4, '0')}`,
      correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${numeroUnico}@test.com`,
      id_patrocinador: idPatrocinador
    });
  }

  return usuarios;
}

async function registrarUsuarios() {
  const usuarios = generarUsuarios(TOTAL_USUARIOS);
  
  console.log(`🚀 Iniciando registro masivo de ${TOTAL_USUARIOS} usuarios en la red...\n`);

  let exitosos = 0;
  let fallidos = 0;

  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });

      if (res.ok) {
        exitosos++;
        console.log(`[${i + 1}/${TOTAL_USUARIOS}] ✅ Registrado: ${usuario.nombre} ${usuario.apellido} (Patrocinador ID: ${usuario.id_patrocinador})`);
      } else {
        fallidos++;
        const errorData = await res.json().catch(() => ({}));
        console.error(`[${i + 1}/${TOTAL_USUARIOS}] ❌ Error con ${usuario.nombre}:`, errorData.message || res.statusText);
      }
    } catch (error) {
      fallidos++;
      console.error(`[${i + 1}/${TOTAL_USUARIOS}] ❌ Error de conexión con ${usuario.nombre}:`, error.message);
    }
  }

  console.log('\n--- Resumen del proceso ---');
  console.log(`✨ Completados exitosamente: ${exitosos}`);
  console.log(`⚠️ Fallidos: ${fallidos}`);
}

registrarUsuarios();