// Roles del sistema. El identificador numérico coincide con el _id de la
// colección "roles" y con el campo rol_id de los usuarios.
export const ROLES = {
  USUARIO: 1,
  SOCORRISTA: 2,
  ADMIN_REFUGIO: 3,
  CENTRO_CONTROL: 4,
  ADMIN: 5
};

export const NOMBRES_ROL = {
  [ROLES.USUARIO]: 'Estudiante',
  [ROLES.SOCORRISTA]: 'Socorrista',
  [ROLES.ADMIN_REFUGIO]: 'Administrador Refugio',
  [ROLES.CENTRO_CONTROL]: 'Centro de Control',
  [ROLES.ADMIN]: 'Administrador'
};

export const ROL_SOCORRISTA_ID = ROLES.SOCORRISTA;

export const normalizarRol = (rol) => {
  const valor = Number(rol);
  if (NOMBRES_ROL[valor]) return valor;
  if (String(rol).trim().toLowerCase() === 'socorrista') return ROLES.SOCORRISTA;
  return ROLES.USUARIO;
};

// Los usuarios antiguos solo tienen rol_id, por eso resolvemos el rol
// tanto por el campo "rol" como por el identificador del rol.
export const esSocorrista = (usuario) => {
  const rol = String(usuario?.rol || '').trim().toLowerCase();
  if (rol === 'socorrista') return true;
  return Number(usuario?.rol_id) === ROLES.SOCORRISTA;
};

export const esAdmin = (usuario) => {
  const rol = String(usuario?.rol || '').trim().toLowerCase();
  if (rol === 'admin' || rol === 'administrador') return true;
  return Number(usuario?.rol_id) === ROLES.ADMIN;
};

export const rolDeUsuario = (usuario) => {
  if (esAdmin(usuario)) return 'admin';
  if (esSocorrista(usuario)) return 'socorrista';
  return 'usuario';
};
