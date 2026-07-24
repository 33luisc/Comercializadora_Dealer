const ID_CAMILO = 1; 

const afiliadosDirectos = [
  { nombre: 'Andrés', apellido: 'Mendoza', cedula: '2001', celular: '3101000001', correo: 'andres.m@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Sofia', apellido: 'Castro', cedula: '2002', celular: '3101000002', correo: 'sofia.c@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Mateo', apellido: 'Ríos', cedula: '2003', celular: '3101000003', correo: 'mateo.r@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Valentina', apellido: 'Morales', cedula: '2004', celular: '3101000004', correo: 'valentina.m@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Diego', apellido: 'Herrera', cedula: '2005', celular: '3101000005', correo: 'diego.h@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Camila', apellido: 'Vargas', cedula: '2006', celular: '3101000006', correo: 'camila.v@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Gabriel', apellido: 'Ortega', cedula: '2007', celular: '3101000007', correo: 'gabriel.o@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Isabella', apellido: 'Silva', cedula: '2008', celular: '3101000008', correo: 'isabella.s@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Alejandro', apellido: 'Navarro', cedula: '2009', celular: '3101000009', correo: 'alejandro.n@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Mariana', apellido: 'Rojas', cedula: '2010', celular: '3101000010', correo: 'mariana.r@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Daniel', apellido: 'Medina', cedula: '2011', celular: '3101000011', correo: 'daniel.m@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Lucía', apellido: 'Cortés', cedula: '2012', celular: '3101000012', correo: 'lucia.c@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Santiago', apellido: 'Guerrero', cedula: '2013', celular: '3101000013', correo: 'santiago.g@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Natalia', apellido: 'Salazar', cedula: '2014', celular: '3101000014', correo: 'natalia.s@test.com', id_patrocinador: ID_CAMILO },
  { nombre: 'Felipe', apellido: 'Delgado', cedula: '2015', celular: '3101000015', correo: 'felipe.d@test.com', id_patrocinador: ID_CAMILO }
];

async function registrarDirectos() {
  console.log(`🚀 Registrando 15 afiliados directos para el patrocinador ID: ${ID_CAMILO}...\n`);

  for (const usuario of afiliadosDirectos) {
    try {
      const res = await fetch('http://127.0.0.1:4000/api/afiliados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });

      if (res.ok) {
        console.log(`✅ Registrado: ${usuario.nombre} ${usuario.apellido}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error(`❌ Error registrando a ${usuario.nombre}:`, errorData.message || res.statusText);
      }
    } catch (error) {
      console.error(`❌ Error de conexión al registrar a ${usuario.nombre}:`, error.message);
    }
  }

  console.log('\n✨ Proceso de registro finalizado.');
}

registrarDirectos();