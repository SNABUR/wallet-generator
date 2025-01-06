

// pages/index.js
"use client";
import { useState } from 'react';
import { keccak256, Message } from 'js-sha3';
import { ethers } from 'ethers';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ETHPage = () => {
  const [inputText, setInputText] = useState('vitalik');
  const [ethAddress, setEthAddress] = useState('0x89d768F75bd1Ae465876046d5e5466D0b1FdbD03');
  const [privateKey, setPrivateKey] = useState('0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Función para generar la clave y dirección cada vez que cambia el texto
  const simulateTyping = (duration: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?`~';
    const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));
  
    let timeElapsed = 0;
    const interval = 13.7; // Actualizar cada 100ms
  
    const timer = setInterval(() => {
      // Función para generar un número aleatorio dentro de un rango
      const getRandomLength = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
      const randomText = Array.from({ length: getRandomLength(137, 1370) }, randomChar).join('');  // Generar texto aleatorio
      
      // Simular valores aleatorios durante el efecto de escritura
      setInputText(randomText);  // Actualiza el texto simulado
  
      // Generar la wallet real mientras se simula el tipeo
      generateWallet(randomText);  // Usa la misma lógica para generar wallet
  
      timeElapsed += interval;
  
      if (timeElapsed >= duration) {
        clearInterval(timer);
        // Después de la simulación, puedes hacer algo más si es necesario
      }
    }, interval);
  };
  

  const generateWallet = (text: Message) => {
    // Generar hash del texto usando keccak256
    const hashedOutput = keccak256(text);
  
    // Usar el hash como clave privada (asegúrate de que sea válida)
    const privateKey = "0x" + hashedOutput;
  
    try {
      // Crear una wallet a partir de la clave privada
      const wallet = new ethers.Wallet(privateKey);
  
      // Actualizar el estado con la clave privada y la dirección
      setPrivateKey(wallet.privateKey);
      setEthAddress(wallet.address);
    } catch (error) {
      console.error("Error al generar la wallet:", error);
      setPrivateKey("");
      setEthAddress("");
    }
  };
  
  

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    // Solo generar la wallet si el texto no está vacío
    if (text) {
      generateWallet(text);  // Generar la wallet a partir del texto ingresado
    } else {
      setEthAddress('');  // Limpiar la dirección si no hay texto
      setPrivateKey('');   // Limpiar la clave privada si no hay texto
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center font-hacker justify-center">
      <div className="flex flex-col bg-white shadow-lg rounded-lg p-8 w-full max-w-md items-center relative">
      {/*<a href="https://t.me/ggeese_bot" target="_blank" rel="noopener noreferrer">
          <Image
            className="absolute top-0 right-0 cursor-pointer animate-pulse"
            src={"/airdrop.svg"}
            alt="Airdrop Icon"
            width={64}
            height={64}
          />
        </a>*/}
        <div className="flex flex-col items-center mb-6">
          <Image className='mb-3' src="/ethereum.svg" alt="Ethereum Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-black text-center mb-6 leading-relaxed md:text-base">
        <span className="text-blue-700 font-bold">Hashai</span>
        <span className="mx-1">can give you</span>
        <span className="text-blue-700 font-bold">wallets</span>
        <span className="mx-1">from text</span>
        </h1>
          {/*<h1 className="text-3xl font-bold text-gray-800 text-center">Free Ethereum</h1>*/}
        </div>
  
        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Insert Text:</label>
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 text-black text-sm"
            value={inputText}
            onChange={handleInputChange}
            placeholder="vitalik"
          />
        </div>
  
        <button
          className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
          onClick={() => simulateTyping(3000)} // Simula durante 3 segundos
        >
          GENERATE WALLET
        </button>
  
        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">ETH Address:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(ethAddress)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>
  
          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={ethAddress}
            />

            <a
              className="p-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              href={`https://etherscan.io/address/${ethAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/etherscan_logo.svg" alt="Etherscan" width={26} height={26} />
            </a>
          </div>
        </div>
  
        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">Private Key:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(privateKey)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>
  
          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={showPrivateKey ? privateKey : '*'.repeat(privateKey.length)}
            />
            <button
              className="p-1 rounded-xl hover:bg-gray-300 transition duration-200 active:scale-90 focus:outline-none"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? <FaEye className="text-black w-6 h-6" /> : <FaEyeSlash className="text-black w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mt-3 text-center">
          {/*<p className="text-sm text-gray-600 mb-2">
          made with ❤️ by GG

          </p>
          <p className="text-2sm text-gray-600 font-bold mb-2">
            <a 
              href="https://goosey.fun" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 font-bold hover:underline"
            >
              goosey.fun
            </a>
          </p>*/}
          <div
            className="flex items-center space-x-1 rounded-lg p-1 cursor-pointer transition duration-200"
            onClick={() => copyToClipboard("0x3d90Eb79C1e753Ca51D1447791C07e7CcC219e5C")}
          >
            <span className="text-gray-700 text-xs transition duration-200 active:scale-95">0x3d90Eb79C1e753Ca51D1447791C07e7CcC219e5C</span>
            <button
              className="p-2 rounded-lg transition duration-200 active:scale-90 focus:outline-none"
              aria-label="Copy to clipboard"
            >
              <Image src="/copy.svg" alt="Copy" width={12} height={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETHPage;
