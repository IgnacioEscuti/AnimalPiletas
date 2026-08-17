import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import { usuarioService } from "../services/usuario.service.js";
import { usuarioRepository } from "../repositories/usuario.repository.js";
import { env } from "../config/env.js";

passport.use(
  "registro",
  new LocalStrategy({ usernameField: "email", passwordField: "pin" }, async (email, pin, done) => {
    try {
      const nuevoUsuario = await usuarioService.registrar({ email, pin });
      return done(null, nuevoUsuario);
    } catch (error) {
      if (error.statusCode) {
        return done(null, false, { message: error.message, statusCode: error.statusCode });
      }
      return done(error);
    }
  })
);

passport.use(
  "login",
  new LocalStrategy({ usernameField: "email", passwordField: "pin" }, async (email, pin, done) => {
    try {
      const usuario = await usuarioService.login(email, pin);
      return done(null, usuario);
    } catch (error) {
      if (error.statusCode) {
        return done(null, false, { message: error.message, statusCode: error.statusCode });
      }
      return done(error);
    }
  })
);

const cookieExtractor = (req) => req?.cookies?.token ?? null;

passport.use(
  "actual",
  new JwtStrategy(
    { jwtFromRequest: cookieExtractor, secretOrKey: env.JWT_SECRET },
    async (payload, done) => {
      try {
        const usuario = await usuarioRepository.findById(payload.id);
        if (!usuario) return done(null, false);
        return done(null, usuario);
      } catch (error) {
        return done(error);
      }
    }
  )
);
