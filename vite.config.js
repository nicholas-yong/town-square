import react from '@vitejs/plugin-react-swc';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [react()],
};

export default config;
