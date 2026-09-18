const readline = require('readline');
const path = require('path');

// Importaciones locales al estar dentro de la carpeta backend
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

    console.log('\n==========================================');
    console.log('   RESET DE CONTRASEÑA DE ADMINISTRADOR   ');
    console.log('==========================================\n');

    // 1. Pedir nombre de usuario
    const usuarioTarget = await askQuestion('👤 Nombre de usuario: ');

    if (!usuarioTarget.trim()) {
        console.log('\n❌ El nombre de usuario no puede estar vacío.\n');
        db.close();
        return;
    }

    // 2. Pedir nueva contraseña
    const nuevaPassword = await askPassword('🔑 Ingrese la nueva contraseña: ');

    if (!nuevaPassword.trim()) {
        console.log('\n❌ La contraseña no puede estar vacía.\n');
        db.close();
        return;
    }

    // 3. Confirmar contraseña
    const confirmacion = await askPassword('🔁 Confirme la nueva contraseña: ');

    if (nuevaPassword !== confirmacion) {
        console.log('\n❌ Las contraseñas no coinciden. Operación cancelada.\n');
        db.close();
        return;
    }

    // 4. Actualizar en Base de Datos
    const { salt, hash } = hashPassword(nuevaPassword);

    const query = `
        UPDATE usuarios_admin 
        SET hash = ?, salt = ? 
        WHERE usuario = ?
    `;

    db.run(query, [hash, salt, usuarioTarget.trim()], function (err) {
        if (err) {
            console.error('\n❌ Error en la base de datos:', err.message);
        } else if (this.changes === 0) {
            console.log(`\n⚠️ No se encontró el usuario "${usuarioTarget.trim()}".\n`);
        } else {
            console.log(`\n✅ ¡Contraseña actualizada con éxito para "${usuarioTarget.trim()}"!\n`);
        }

        db.close();
    });
}

main();