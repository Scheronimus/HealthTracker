const text = {
  en: { arrange: 'Arrange', done: 'Done', handle: 'Reorder', hint: 'Drag a handle to change the order. With a keyboard, focus a handle and use ↑ or ↓.', moved: 'Order updated', cancel: 'Drag cancelled' },
  de: { arrange: 'Anordnen', done: 'Fertig', handle: 'Verschieben', hint: 'Ziehe einen Griff, um die Reihenfolge zu ändern. Mit der Tastatur: Griff fokussieren und ↑ oder ↓ drücken.', moved: 'Reihenfolge geändert', cancel: 'Verschieben abgebrochen' },
  es: { arrange: 'Ordenar', done: 'Listo', handle: 'Reordenar', hint: 'Arrastra un control para cambiar el orden. Con el teclado, enfoca el control y usa ↑ o ↓.', moved: 'Orden actualizado', cancel: 'Arrastre cancelado' },
  fr: { arrange: 'Organiser', done: 'Terminé', handle: 'Déplacer', hint: 'Faites glisser une poignée pour changer l’ordre. Au clavier, sélectionnez la poignée et utilisez ↑ ou ↓.', moved: 'Ordre modifié', cancel: 'Déplacement annulé' },
}
export function arrangeText(language, key) { return text[language][key] }
