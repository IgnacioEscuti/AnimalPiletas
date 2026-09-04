import "dotenv/config";

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  FRONTEND_URLS: process.env.FRONTEND_URLS,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
};

const requeridas = ["MONGO_URI", "JWT_SECRET"];
if (env.NODE_ENV === "production") requeridas.push("FRONTEND_URLS");

const faltantes = requeridas.filter((nombre) => !env[nombre]);

if (faltantes.length > 0) {
  console.error(
    `Faltan variables de entorno obligatorias: ${faltantes.join(", ")}. ` +
      `Cargalas en el archivo .env (o en el panel del hosting) antes de iniciar el servidor.`
  );
  process.exit(1);
}
