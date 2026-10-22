const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

/**
 * Construye la URL de un recurso estático respetando PUBLIC_URL, para que la
 * aplicación funcione tanto en la raíz del dominio como en una subruta
 * (por ejemplo /civilizatu).
 */
export const asset = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_URL}${normalized}`;
};

export default asset;
