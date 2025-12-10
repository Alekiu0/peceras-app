// api/chat.js
export default async function handler(req, res) {
  // 1. Configuración de seguridad (CORS) para que solo tu web pueda llamar aquí
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Después lo restringiremos a tu dominio exacto
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responder al "preflight" del navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Aquí recuperamos tu LLAVE SECRETA de la caja fuerte de Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Error de configuración del servidor (Falta API Key)' });
  }

  // 3. Recibimos los datos del frontend (litros, medidas)
  const { message } = req.body;

  try {
    // 4. Llamamos a Google DESDE AQUÍ (Nadie ve esto)
    // Usamos el modelo estable que confirmamos que tienes: gemini-2.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    // 5. Devolvemos la respuesta limpia a tu página web
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando la solicitud' });
  }
}