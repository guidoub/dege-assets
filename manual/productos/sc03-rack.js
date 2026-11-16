// SC03 · Rack de TV / Estantería horizontal (3 cubos en fila). Ver productos/_cumo.js y estudio/cumo-notas.md
import { cumo } from './_cumo.js?v=0c6ddde886';
export default cumo({
  id: 'sc03-rack', codigo: 'SC03', nombre: 'Rack de TV', cabecera: 'Rack de TV', sust: 'rack', art: 'el',
  tienda: 'https://dege.com.ar/productos/rack-de-tv-estanteria-horizontal/', celdas: [[0, 0], [-1, 0], [-2, 0]], medidas: { w: 111, h: 38.7 },
  llenar: .62, vista: { yaw: -22, pitch: 26 },
  ladoCuerpo: 'Tres cubos en fila que comparten placas: 10 placas iguales y 24 conectores. Seguí los pasos y girá el modelo para ver cada unión.',
  momTitulo: 'Tu rack,<br><em>cubo por cubo</em>',
  finCuerpo: 'Tres huecos de 34,6 cm abajo de la tele: para el decodificador, libros o canastos.',
});
