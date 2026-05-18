import Fuse, { IFuseOptions } from 'fuse.js';

/**
 * Realiza una búsqueda fuzzy sobre un arreglo de objetos.
 * @param list El arreglo de datos a buscar.
 * @param query La cadena de búsqueda.
 * @param keys Las propiedades del objeto sobre las que buscar (ej. ['name', 'description']).
 * @returns El arreglo filtrado. Si la query está vacía, retorna la lista original.
 */
export function fuzzySearch<T>(list: T[], query: string, keys: string[]): T[] {
  if (!query || query.trim() === '') {
    return list;
  }

  const options: IFuseOptions<T> = {
    keys,
    threshold: 0.3,
    includeScore: true,
  };

  const fuse = new Fuse(list, options);
  const result = fuse.search(query);
  
  return result.map(r => r.item);
}
