module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",'./node_modules/leaflet/**/*.js'],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#D200AB',
          100: '#710188',
          200: '#7D0096',
          300: '#2C1531',
          900:'#2b0b38'
        },
      },
      fontFamily: {
        sans: [
          'Bricolage Grotesque', 
          'ui-sans-serif', 
          'system-ui', 
          'sans-serif'
        ],
        condensed: [
          'Bricolage Grotesque Condensed',
          'ui-sans-serif',
          'system-ui', 
          'sans-serif'
        ],
        'semi-condensed': [
          'Bricolage Grotesque SemiCondensed',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ],
        'open-sans': [
          'Open Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ],
      },
      
      fontWeight: {
        // Extended weight scale (100-900)
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
    },
  },
  plugins: [],
};