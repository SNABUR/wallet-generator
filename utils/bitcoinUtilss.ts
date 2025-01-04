import * as bitcoin from 'bitcoinjs-lib';
import * as tinysecp from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { sha256 } from 'js-sha256';

// Configura ECPair con tiny-secp256k1
const ECPair = ECPairFactory(tinysecp);

// Tipos de dirección
const ADDRESS_TYPES = {
  P2PKH: 'P2PKH',
  BECH32: 'BECH32',
};

// Función para generar una clave privada desde un texto
export const generatePrivateKey = (text: string): string => {
  // Convertir el texto a bytes usando ASCII
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  
  // Hashear los bytes
  const hashedOutput = sha256(textBytes);
  
  // Retornar la cadena hexadecimal de 64 caracteres
  return hashedOutput;
};

// Función para generar una dirección BTC según el tipo especificado
export const generateBTCAddress = (privateKeyHex: string, addressType: string): string => {
  const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'));
  
  let address;
  switch (addressType) {
    case ADDRESS_TYPES.P2PKH:
      address = bitcoin.payments.p2pkh({ pubkey: Buffer.from(keyPair.publicKey) }).address;
      break;
    case ADDRESS_TYPES.BECH32:
      address = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey) }).address;
      break;
    default:
      throw new Error('Tipo de dirección no soportado');
  }
  
  return address || ''; // `address` podría ser undefined
};
