/* Webchat Cachi (Not a Chatbot) en dege.com.ar.
   El proveedor lo entrega como dos <script> antes de </body>; el tema Ipanema no está forkeado
   (los .tpl no suben y no hay campo de JS), así que este archivo se inyecta con la API de scripts
   externos de Tiendanube. Mismo efecto: carga el bundle y lo inicializa cuando avisa que está listo. */
(function () {
  if (window.__degeWebchat) return;   // por si el script entra dos veces en la misma página
  window.__degeWebchat = true;

  document.addEventListener('WebChatReady', function () {
    WebChat.initialize({
      title: 'Cachi (De 7 a 16:30 Lun a Vie)',
      avatar: 'https://n3v6oj3tw5ouoeeb.public.blob.vercel-storage.com/webchat-images/deg-ai-1761854376943-DRcB39W2ueOVNoMmT7Tz1ck2zmWfRR.png',
      placeholder: 'Escribe tu mensaje aquí',
      initialMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
      apiKey: '4e2ea775-c7b2-47c2-b872-05b95f67d266',
      contactCapture: true,
      quickReplies: ['Tengo una duda con mi pedido.', 'Quiero hacer una compra!', 'Donde esta mi pedido?'],
      primaryColor: '#7F7F46',
      desktop: { position: 'bottom-right', marginBottom: 20, marginSide: 20, showPopup: true },
      /* 10px lo dejaba encima de la barra fija de "Agregar al carrito" (74px de alto): sube por arriba */
      mobile: { position: 'bottom-right', marginBottom: 92, marginSide: 10, showPopup: true },
      closeButtonIcon: 'default'
    });
  });

  /* Guido (30/09): el chat va solo en esa esquina. El botón flotante de WhatsApp del tema (a.btn-whatsapp,
     sale de store.whatsapp) quedaba tapado abajo, así que se oculta acá. Los links de contacto del footer
     no usan esta clase y no se tocan. Para sacarlo de raíz: borrar el WhatsApp en la configuración de la tienda. */
  var css = document.createElement('style');
  css.textContent = 'a.btn-whatsapp{display:none!important}';
  document.head.appendChild(css);

  var s = document.createElement('script');
  s.src = 'https://unpkg.com/@developer.notchatbot/webchat@latest/dist/webchat-bundle.min.umd.cjs';
  s.async = true;
  document.body.appendChild(s);
})();
