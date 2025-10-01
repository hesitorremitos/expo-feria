import { defineMiddleware } from 'astro:middleware';

// Rutas que requieren autenticación
const protectedRoutes = [
	'/generate/chibi-sticker',
	'/generate/figure-collector',
	'/generate/que-paso-ayer',
	'/generate/buzz-cut',
	'/generate/film-noir',
	'/generate/editorial-portrait',
	'/generate/yarn-doll',
	'/generate/pencil-sketch',
	'/generate/instagram-chibi',
];

// Rutas públicas que no requieren autenticación
const publicRoutes = [
	'/',
	'/login',
	'/catalog',
	'/gallery',
	'/api/auth/login',
	'/api/auth/logout',
];

export const onRequest = defineMiddleware(async (context, next) => {
	const { url, cookies, redirect } = context;
	const pathname = url.pathname;

	// Verificar si la ruta es una ruta protegida
	const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
	
	// Si es una ruta protegida, verificar autenticación
	if (isProtectedRoute) {
		const authToken = cookies.get('auth-token');
		
		// Si no hay token de autenticación, redirigir a login
		if (!authToken) {
			return redirect(`/login?error=auth&redirect=${encodeURIComponent(pathname)}`);
		}
	}

	// Continuar con la petición
	return next();
});
