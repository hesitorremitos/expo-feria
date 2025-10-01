import React, { useState, useCallback } from 'react';
import Button from './Button.jsx';
import ImageUploader from './ImageUploader.jsx';
import ResultModal from './ResultModal.jsx';
import GenerationLoader from './GenerationLoader.jsx';

const GhibliClassicForm = () => {
	const [formData, setFormData] = useState({
		personImage: null,
		extraDetails: '',
		quality: 'medium'
	});
	
	const [result, setResult] = useState(null);
	const [isGenerating, setIsGenerating] = useState(false);

	// Manejar subida de imagen
	const handleImageUpload = useCallback((uploaderId, file) => {
		setFormData(prev => ({
			...prev,
			personImage: file
		}));
	}, []);

	// Manejar cambios en inputs de texto
	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	}, []);

	// Validar si el formulario está completo
	const isFormValid = !!formData.personImage;

	// Enviar formulario
	const handleSubmit = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		
		if (!isFormValid) {
			alert('Por favor sube tu foto');
			return;
		}

		console.log('🎨 Iniciando generación de Ghibli Classic...');
		setIsGenerating(true);

		const submitData = new FormData();
		submitData.append('person', formData.personImage);
		submitData.append('extraDetails', formData.extraDetails);
		submitData.append('quality', formData.quality);

		try {
			console.log('🚀 Enviando petición a /api/generate-ghibli-classic...');
			const response = await fetch('/api/generate-ghibli-classic', {
				method: 'POST',
				body: submitData
			});

			console.log('📥 Respuesta recibida:', response.status);
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const result = await response.json();
			console.log('✅ Resultado procesado:', result);

			if (result.success) {
				console.log('✅ Generación exitosa, mostrando modal...');
				setTimeout(() => {
					setResult(result);
				}, 100);
			} else {
				console.error('❌ Error en generación:', result.error);
				alert(`Error: ${result.error}`);
			}
		} catch (error) {
			console.error('❌ Error en petición:', error);
			alert(`Error de red: ${error.message}`);
		} finally {
			setIsGenerating(false);
		}
	};

	// Cerrar modal de resultado
	const handleCloseResult = useCallback(() => {
		console.log('🔴 GhibliClassicForm: Closing result modal');
		setResult(null);
	}, []);

	// Manejar cancelación de generación
	const handleCancelGeneration = useCallback(() => {
		setIsGenerating(false);
	}, []);

	// Reset form
	const handleReset = useCallback(() => {
		setFormData({
			personImage: null,
			extraDetails: '',
			quality: 'medium'
		});
		setResult(null);
	}, []);

	// Manejar eventos globales de subida de imágenes
	React.useEffect(() => {
		const handleImageUploaded = (event) => {
			const { uploaderId, file } = event.detail;
			handleImageUpload(uploaderId, file);
		};

		window.addEventListener('imageUploaded', handleImageUploaded);
		
		return () => {
			window.removeEventListener('imageUploaded', handleImageUploaded);
		};
	}, [handleImageUpload]);

	return (
		<div className="p-8">
			
			<form onSubmit={handleSubmit} className="space-y-8">
				
				{/* Control de calidad */}
				<div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200">
					<h3 className="text-lg font-semibold text-primary-800 mb-4 text-center">
						✨ Calidad de generación
					</h3>
					<div className="flex justify-center space-x-6">
						<label className="flex items-center space-x-3 cursor-pointer">
							<input
								type="radio"
								name="quality"
								value="medium"
								checked={formData.quality === 'medium'}
								onChange={handleInputChange}
								className="w-4 h-4 text-teal-500 border-teal-300 focus:ring-teal-500"
							/>
							<span className="text-sm font-medium text-primary-700">
								🎨 Media (Más rápido)
							</span>
						</label>
						<label className="flex items-center space-x-3 cursor-pointer">
							<input
								type="radio"
								name="quality"
								value="high"
								checked={formData.quality === 'high'}
								onChange={handleInputChange}
								className="w-4 h-4 text-emerald-500 border-emerald-300 focus:ring-emerald-500"
							/>
							<span className="text-sm font-medium text-primary-700">
								✨ Alta (Mejor calidad)
							</span>
						</label>
					</div>
				</div>

				{/* Subida de imagen */}
				<div className="space-y-6">
					<h3 className="text-xl font-bold text-primary-800 text-center">
						📸 Sube tu foto
					</h3>
					
					<div className="max-w-sm mx-auto">
						<ImageUploader
							id="person-image"
							placeholder="Arrastra tu foto aquí o haz clic para seleccionar"
							className="aspect-square"
						/>
						<p className="text-xs text-accent-500 mt-2 text-center">
							Tu foto será redibujada en el icónico estilo anime de Studio Ghibli 🎨
						</p>
					</div>
				</div>

				{/* Detalles adicionales */}
				<div className="space-y-4">
					<label htmlFor="extraDetails" className="block text-sm font-semibold text-primary-800 text-center">
						🎨 Detalles adicionales (opcional)
					</label>
					<div className="max-w-lg mx-auto">
						<textarea
							id="extraDetails"
							name="extraDetails"
							value={formData.extraDetails}
							onChange={handleInputChange}
							rows="3"
							placeholder="Ej: Con fondo de naturaleza, en un prado verde, con nubes suaves, atmósfera nostálgica..."
							className="w-full px-4 py-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors resize-none"
						/>
						<p className="text-xs text-accent-500 mt-2 text-center">
							Agrega detalles creativos para personalizar tu obra de arte Ghibli
						</p>
					</div>
				</div>

				{/* Botón de envío */}
				<div className="text-center space-y-4">
					<Button
						type="submit"
						disabled={!isFormValid || isGenerating}
						className="bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
					>
						{isGenerating ? 'Creando arte Ghibli...' : '🎨 Crear Ghibli Classic'}
					</Button>

					{formData.personImage && (
						<Button
							type="button"
							onClick={handleReset}
							className="bg-accent-400 hover:bg-accent-500 text-white px-4 py-2 text-sm ml-4"
						>
							Limpiar formulario
						</Button>
					)}
				</div>

				{/* Información sobre Ghibli Classic */}
				<div className="bg-teal-50 rounded-xl p-6 border border-teal-200 max-w-2xl mx-auto">
					<div className="text-center text-sm text-primary-700 space-y-2">
						<p className="font-semibold text-base">🎨 ¿Qué es Ghibli Classic?</p>
						<p>Redibuja tu foto en el icónico estilo anime de Studio Ghibli. La IA transforma tu fotografía en una obra de arte con la estética clásica de películas como Spirited Away, Totoro y Howl's Moving Castle.</p>
						<p className="text-xs text-accent-600">Estilo simple y auténtico - deja que la magia de Ghibli hable por sí misma</p>
					</div>
				</div>

			</form>

			{/* Loader de generación */}
			<GenerationLoader 
				isVisible={isGenerating} 
				onCancel={handleCancelGeneration}
			/>

			{/* Modal de resultado */}
			{result && (
				<ResultModal
					result={result}
					onClose={handleCloseResult}
				/>
			)}

		</div>
	);
};

export default GhibliClassicForm;
