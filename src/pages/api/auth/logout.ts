import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
	// Eliminar la cookie de autenticación
	cookies.delete('auth-token', {
		path: '/',
	});

	// Redirigir a la página de login
	return redirect('/login');
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
	// Eliminar la cookie de autenticación
	cookies.delete('auth-token', {
		path: '/',
	});

	// Redirigir a la página de login
	return redirect('/login');
};
