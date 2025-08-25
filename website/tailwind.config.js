/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    default: "#22a5f1",
                    100: "#c6e0fb",
                    200: "#a8d1f9",
                    300: "#87c2f6",
                    400: "#61b3f4",
                    500: "#22a5f1",
                    600: "#2687c4",
                    700: "#266b9a",
                    800: "#225071",
                    900: "#1c364b"
                },
                accent: {
                    red: {
                        default: "#de474a",
                    },
                    yellow: {
                        default: "#f8c358",
                    },
                    green: {
                        default: "#6cd29a",
                    },
                },
                background: {
                    default: "#fafafa",
                    card: "#f6f6f6"
                },
                border: {
                    default: "#d1d1d1",
                    grid: "#dcdcdc",
                },
                text: {
                    default: "#000000",
                    secondary: "#8a8a8a"
                }
            }
        },
    },
    plugins: [],
}

