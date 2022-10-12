/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			width: {
				'88': '22rem'
			},
			boxShadow: {
				'custom': 'rgb(30 248 228 / 40%) 0px 5px, rgb(30 248 228 / 30%) 0px 10px, rgb(30 248 228 / 20%) 0px 15px, rgb(30 248 228 / 10%) 0px 20px, rgb(30 248 228 / 5%) 0px 25px',
				'custom-red': 'rgb(247 114 114 / 40%) 0px 5px, rgb(247 114 114 / 30%) 0px 10px, rgb(247 114 114 / 20%) 0px 15px, rgb(247 114 114 / 10%) 0px 20px, rgb(247 114 114 / 5%) 0px 25px' 
			}
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [{
			light: {
				...require("daisyui/src/colors/themes")["[data-theme=light]"],
				secondary: '#000',
				accent: '#1EF8E4'
			}
		}]
	}
}