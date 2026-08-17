import { clienteService } from "../services/cliente.service.js";
import { ClienteDTO } from "../DTOs/cliente.dto.js";

export async function createCliente(req, res, next) {
  try {
    const cliente = await clienteService.createCliente(req.body, req.usuario);
    res.status(201).json({ cliente: new ClienteDTO(cliente) });
  } catch (error) {
    next(error);
  }
}

export async function getClientes(req, res, next) {
  try {
    const clientes = await clienteService.getClientes(req.usuario);
    res.status(200).json({ clientes: clientes.map((cliente) => new ClienteDTO(cliente)) });
  } catch (error) {
    next(error);
  }
}

export async function getCliente(req, res, next) {
  try {
    const cliente = await clienteService.getClienteById(req.params.id, req.usuario);
    res.status(200).json({ cliente: new ClienteDTO(cliente) });
  } catch (error) {
    next(error);
  }
}

export async function updateCliente(req, res, next) {
  try {
    const cliente = await clienteService.updateCliente(req.params.id, req.body, req.usuario);
    res.status(200).json({ cliente: new ClienteDTO(cliente) });
  } catch (error) {
    next(error);
  }
}

export async function reordenarClientesEnBarrio(req, res, next) {
  try {
    await clienteService.reordenarEnBarrio(req.body.ids);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}
