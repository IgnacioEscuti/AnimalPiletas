import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function RegistroPage({ onIrALogin }) {
  const { registrar } = useAuth();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmarPin, setConfirmarPin] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (pin !== confirmarPin) {
      setError("Los PIN no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await registrar(email, pin);
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo registrar la cuenta.");
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <section className="card-mobile">
        <h2>Cuenta creada</h2>
        <p>Ya podés iniciar sesión con tu email y PIN.</p>
        <button onClick={onIrALogin}>Ir a iniciar sesión</button>
      </section>
    );
  }

  return (
    <section className="card-mobile">
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="PIN de 4 dígitos"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          required
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="Confirmar PIN"
          value={confirmarPin}
          onChange={(event) => setConfirmarPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          required
        />
        <button type="submit" disabled={enviando}>
          {enviando ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <button className="secondary" onClick={onIrALogin}>
        Ya tengo cuenta
      </button>
    </section>
  );
}
