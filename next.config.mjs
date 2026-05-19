/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    // Permitir compilación de producción exitosa aunque existan errores de tipo
    ignoreBuildErrors: true,
  },
  eslint: {
    // Omitir validaciones de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
