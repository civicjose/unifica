import 'isomorphic-fetch'; // Polyfill para la API Fetch en Node.js
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';

// Variable para almacenar el cliente de Graph y no tener que reiniciarlo en cada llamada.
let graphClient;

/**
 * Inicializa el cliente de Microsoft Graph.
 * Se autentica usando las credenciales del archivo .env.
 */
function initializeGraphClient() {
    // Si el cliente ya está inicializado, no hacemos nada más.
    if (graphClient) {
        return;
    }

    const tenantId = process.env.MS_GRAPH_TENANT_ID;
    const clientId = process.env.MS_GRAPH_CLIENT_ID;
    const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Faltan las variables de entorno de Microsoft Graph en el archivo .env');
    }

    // 1. Creamos el objeto de credenciales.
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

    // 2. Creamos el proveedor de autenticación.
    // El ámbito '.default' le dice a la API que use los permisos que concedimos en el portal de Azure (Files.ReadWrite.All).
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default'],
    });

    // 3. Creamos e inicializamos el cliente de Graph.
    graphClient = Client.initWithMiddleware({
        authProvider: authProvider,
    });
}

/**
 * Sube un archivo a una ruta específica en el OneDrive de un usuario y devuelve una URL compartible.
 * @param {string} relativePath - La ruta de carpetas donde se subirá el archivo (ej: 'Unifica/Centro X/2024/09').
 * @param {string} fileName - El nombre del archivo a subir.
 * @param {Buffer} fileBuffer - El contenido del archivo en formato buffer.
 * @returns {Promise<string>} La URL del enlace para ver el archivo.
 */
async function uploadFileAndGetUrl(relativePath, fileName, fileBuffer) {
    initializeGraphClient();

    const userId = process.env.MS_GRAPH_USER_ID;
    if (!userId) {
        throw new Error('Falta la variable MS_GRAPH_USER_ID en el archivo .env');
    }

    // Construimos la URL del endpoint de la API de Graph para la subida.
    // Esto crea las carpetas si no existen y sube el archivo, todo en un solo paso.
    const uploadUrl = `/users/${userId}/drive/root:/${relativePath}/${fileName}:/content`;

    try {
        // 1. Subimos el archivo. La API de Graph es inteligente y si el archivo ya existe, lo sobrescribe.
        const uploadResponse = await graphClient
            .api(uploadUrl)
            .put(fileBuffer);

        // 2. Creamos un enlace para compartir (solo vista).
        const shareResponse = await graphClient
            .api(`/users/${userId}/drive/items/${uploadResponse.id}/createLink`)
            .post({
                type: 'view', // Tipo de enlace: 'view' (solo ver), 'edit' (ver y editar)
                scope: 'organization' // Quién puede acceder: 'anonymous' o 'organization'
            });
            
        // El enlace para ver directamente en el navegador está en 'webUrl'.
        return shareResponse.link.webUrl;

    } catch (error) {
        console.error('Error al subir el archivo a OneDrive:', error);
        throw new Error('No se pudo subir la factura a OneDrive.');
    }
}

// Exportamos solo la función que necesitarán nuestros controladores.
export default {
    uploadFileAndGetUrl,
};