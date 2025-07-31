import { payments, networks } from 'bitcoinjs-lib';
import { sha256 } from 'js-sha256';
import { ECPairFactory } from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';

// Configuración segura para navegadores
const ECPair = ECPairFactory(tinysecp);

// Tipos de dirección mejorados
export enum AddressType {
  P2PKH = 'P2PKH',
  P2WPKH = 'P2WPKH',
  BECH32 = 'BECH32',  // Soporte para direcciones BECH32 nativas
  P2SH_P2WPKH = 'P2SH-P2WPKH'
}

// Conversión segura de texto a bytes (UTF-8)
const textToBytes = (text: string): Uint8Array => {
  return new TextEncoder().encode(text);
};

// Conversión hexadecimal segura
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

// Generación mejorada de clave privada
export const generatePrivateKey = (text: string): string => {
  const hash = sha256.create();
  hash.update(textToBytes(text));
  return hash.hex();
};

// Generación de dirección BTC más robusta
export const generateBTCAddress = (
  privateKeyHex: string,
  addressType: String,
  network: networks.Network = networks.bitcoin // Usando `networks.Network` en lugar de `bitcoin.Network`
): string => {
  const privateKeyBytes = hexToBytes(privateKeyHex);
  const keyPair = ECPair.fromPrivateKey(privateKeyBytes, { network });
  
  const publicKey = keyPair.publicKey;
  
  switch (addressType) {
    case AddressType.P2PKH:
      return payments.p2pkh({ pubkey: publicKey, network }).address || '';
    
    case AddressType.P2WPKH:
      return payments.p2wpkh({ pubkey: publicKey, network }).address || '';
    
    case AddressType.BECH32:
      return payments.p2wpkh({ pubkey: publicKey, network }).address || ''; // BECH32 es el mismo caso que P2WPKH
    
    case AddressType.P2SH_P2WPKH:
      return payments.p2sh({
        redeem: payments.p2wpkh({ pubkey: publicKey, network })
      }).address || '';
    
    default:
      throw new Error(`Tipo de dirección no soportado: ${addressType}`);
  }
};
