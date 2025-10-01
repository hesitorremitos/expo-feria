import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	let password: string | null = null;
	let redirectTo: string = '/';

	try {
		// Intentar obtener los datos del formulario
		const formData = await request.formData();
		password = formData.get('password')?.toString() || null;
		redirectTo = formData.get('redirect')?.toString() || '/';
	} catch (error) {
		console.error('Error parsing form data:', error);
		return new Response('Error processing form data', { status: 400 });
	}

	// Validar que se proporcione la contraseña
	if (!password) {
		return new Response('Password is required', { status: 400 });
	}

	// Obtener la contraseña correcta desde las variables de entorno
	const correctPassword = import.meta.env.AUTH_PASSWORD || 'admin123';

	// Verificar la contraseña
	if (password !== correctPassword) {
		// Redirigir con error
		return redirect(`/login?error=invalid&redirect=${encodeURIComponent(redirectTo)}`);
	}

	// Crear token de sesión (usando un simple token)
	const sessionToken = crypto.randomUUID();

	// Establecer cookie de autenticación
	// httpOnly: true para prevenir acceso desde JavaScript del cliente
	// secure: true en producción para requerir HTTPS
	// sameSite: 'lax' para protección CSRF
	// maxAge: 7 días de sesión
	cookies.set('auth-token', sessionToken, {
		path: '/',
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7, // 7 días
	});

	// Redirigir a la página solicitada o al inicio
	return redirect(redirectTo);
};
