const readline = require('readline');
const path = require('path');

// Importaciones desde la carpeta backend
const db = require(path.join(__dirname, 'config', 'database'));
const { hashPassword } = require(path.join(__dirname, 'utils', 'cryptoUtils'));

// Función auxiliar para preguntas de texto plano
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Función para pedir contraseña ocultando la entrada
function askPassword(query) {
    return new Promise((resolve) => {
        process.stdout.write(query);

        const stdin = process.stdin;
        let password = '';
        const wasRaw = stdin.isRaw;

        if (stdin.setRawMode) {
            stdin.setRawMode(true);
        }
        stdin.resume();
        stdin.setEncoding('utf8');

        const onData = (char) => {
            if (char === '\r' || char === '\n') {
                stdin.removeListener('data', onData);
                if (stdin.setRawMode) {
                    stdin.setRawMode(wasRaw);
                }
                stdin.pause();
                process.stdout.write('\n');
                resolve(password);
                return;
            }

            if (char === '\u0003') {
                process.exit(0);
            }

            if (char === '\u0008' || char === '\x7f') {
                if (password.length > 0) {
                    password = password.slice(0, -1);
                    process.stdout.write('\b \b');
                }
                return;
            }

            password += char;
            process.stdout.write('*');
        };

        stdin.on('data', onData);
    });
}

async function main() {
    await new Promise((res) => setTimeout(res, 200));

    console.log('\n=================================================');
    console.log('  MODIFICACIÓN DE CREDENCIALES DE ADMINISTRADOR  ');
    console.log('=================================================\n');

    // 1. Pedir el usuario actual para identificar la cuenta
    const usuarioActual = await askQuestion('👤 Nombre de usuario ACTUAL: ');

    if (!usuarioActual.trim()) {
        console.log('\n❌ El nombre de usuario actual no puede estar vacío.\n');
        db.close();
        return;
    }

    // Verificar si el usuario existe antes de pedir nuevos datos
    db.get('SELECT * FROM usuarios_admin WHERE usuario = ?', [usuarioActual.trim()], async (err, userRow) => {
        if (err) {
            console.error('\n❌ Error al consultar la base de datos:', err.message);
            db.close();
            return;
        }

        if (!userRow) {
            console.log(`\n⚠️ No se encontró ningún administrador con el usuario "${usuarioActual.trim()}".\n`);
            db.close();
            return;
        }

        console.log(`\n✅ Usuario encontrado (${userRow.nombre}).`);
        console.log('-------------------------------------------------');

        // 2. Pedir el NUEVO nombre de usuario (Opcional)
        const nuevoUsuarioInput = await askQuestion(`✏️  NUEVO nombre de usuario (Presiona Enter para conservar "${userRow.usuario}"): `);
        const nuevoUsuario = nuevoUsuarioInput.trim() !== '' ? nuevoUsuarioInput.trim() : userRow.usuario;

        // 3. Pedir la NUEVA contraseña
        const nuevaPassword = await askPassword('🔑 Ingrese la NUEVA contraseña: ');

        if (!nuevaPassword.trim()) {
            console.log('\n❌ La contraseña no puede estar vacía.\n');
            db.close();
            return;
        }

        // 4. Confirmar la NUEVA contraseña
        const confirmacion = await askPassword('🔁 Confirme la NUEVA contraseña: ');

        if (nuevaPassword !== confirmacion) {
            console.log('\n❌ Las contraseñas no coinciden. Operación cancelada.\n');
            db.close();
            return;
        }

        // 5. Hash de la nueva contraseña y actualización
        const { salt, hash } = hashPassword(nuevaPassword);

        const queryUpdate = `
            UPDATE usuarios_admin 
            SET usuario = ?, hash = ?, salt = ? 
            WHERE id = ?
        `;

        db.run(queryUpdate, [nuevoUsuario, hash, salt, userRow.id], function (updateErr) {
            if (updateErr) {
                if (updateErr.message.includes('UNIQUE constraint failed')) {
                    console.error(`\n❌ Error: El usuario "${nuevoUsuario}" ya existe en el sistema.\n`);
                } else {
                    console.error('\n❌ Error al actualizar en la base de datos:', updateErr.message);
                }
            } else {
                console.log('\n=================================================');
                console.log('✅ ¡CREDENCIAES ACTUALIZADAS CON ÉXITO!');
                console.log(`   - Usuario:    ${nuevoUsuario}`);
                console.log('   - Contraseña: [ACTUALIZADA]');
                console.log('=================================================\n');
            }

            db.close();
        });
    });
}

main();