import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getEmailRecordado, borrarEmailRecordado } from "../utils/authStorage.js";

export function LoginPage({ onIrARegistro }) {
  const { login } = useAuth();
  const [emailRecordado, setEmailRecordado] = useState(getEmailRecordado());
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(emailRecordado || email, pin);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  const handleNoSosVos = () => {
    borrarEmailRecordado();
    setEmailRecordado(null);
    setEmail("");
    setPin("");
  };

  return (
    <section>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        {emailRecordado ? (
          <p className="row-name">{emailRecordado}</p>
        ) : (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        )}
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="PIN de 4 dígitos"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          required
        />
        <button type="submit" disabled={enviando}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {emailRecordado && (
        <button className="secondary" onClick={handleNoSosVos}>
          ¿No sos vos?
        </button>
      )}

      <p className="empty-state">
        ¿No tenés cuenta? <button className="secondary" onClick={onIrARegistro}>Registrate</button>
      </p>
    </section>
  );
}
