"use client";
import { useState } from 'react';
import { generatePrivateKey, generateBTCAddress } from '../../utils/bitcoinUtilss'; // Importa las funciones desde utils
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';

const BTCPage = () => {
  const [inputText, setInputText] = useState('Satoshi Nakamoto');
  const [BTCAddress, setBTCAddress] = useState('17ZYZASydeA1xyfNrcYcLyqghmK3eGJpHq');
  const [privateKey, setPrivateKey] = useState('a0dc65ffca799873cbea0ac274015b9526505daaaed385155425f7337704883e');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [addressType, setAddressType] = useState('P2PKH'); // Estado para el tipo de dirección

  // Genera clave y dirección BTC cada vez que cambia el texto
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    if (text) {
      generateAddress(text); // Llama a la función para generar la dirección
    } else {
      setBTCAddress('');
      setPrivateKey('');
    }
  };

  // Función para generar dirección y clave BTC
  const generateAddress = (text: string) => {
    const privateKeyHex = generatePrivateKey(text); // Genera la clave privada
    setPrivateKey(privateKeyHex);

    let btcAddress = '';

    switch (addressType) {
      case 'P2PKH':
        btcAddress = generateBTCAddress(privateKeyHex, 'P2PKH');
        break;
      case 'BECH32':
        btcAddress = generateBTCAddress(privateKeyHex, 'BECH32');
        break;
      default:
        throw new Error('Tipo de dirección no soportado');
    }

    setBTCAddress(btcAddress);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
  };

  const handleAddressTypeChange = (type: string) => {
    setAddressType(type);
    generateAddress(inputText); // Generar la dirección cada vez que cambia el tipo
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center font-hacker justify-center">
      <div className="flex flex-col bg-white shadow-lg rounded-lg p-8 w-full max-w-md items-center">
        <div className="flex flex-col items-center mb-6">
          <Image className='mb-3' src="/Bitcoin.svg" alt="Bitcoin Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-black text-center mb-6 leading-relaxed md:text-base">
        <span className="text-orange-700 font-bold">Hashia</span>
        <span className="mx-1">can give you</span>
        <span className="text-orange-700 font-bold">wallets</span>
        <span className="mx-1">from text</span>
        </h1>
          {/*<h1 className="text-3xl font-bold text-gray-800 text-center">Free Bitcoin</h1>*/}
        </div>

        <div className="w-full mb-4">
          <div className='flex flex-fil text-center justify-between'>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insert Text:</label>
            <div className="flex items-center mb-4">
            <button
              className={`py-1 px-3 text-xs rounded-l-lg transition duration-200 ${addressType === 'P2PKH' ? 'bg-orange-400 text-white' : 'bg-orange-100 text-black'}`}
              onClick={() => handleAddressTypeChange('P2PKH')}
            >
              A
            </button>
            <button
              className={`py-1 px-3  text-xs rounded-r-lg transition duration-200 ${addressType === 'BECH32' ? 'bg-orange-400 text-white' : 'bg-orange-100 text-black'}`}
              onClick={() => handleAddressTypeChange('BECH32')}
            >
              B
            </button>
          </div>
        </div>
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 text-black text-sm"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Satoshi Nakamoto"
          />
        </div>

        {/* Selector de tipo de dirección */}



        <button
          className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
          onClick={() => generateAddress(inputText)} // Llama a la función para generar la dirección
        >
          GENERATE WALLET
        </button>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">BTC Address:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(BTCAddress)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={BTCAddress}
            />
                        <a
              className="rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              href={`https://www.blockchain.com/explorer/addresses/btc/${BTCAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/blockchain.svg" alt="Blockchain" width={26} height={26} />
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
              <Image src="./copy.svg" alt="Copy" width={16} height={16} />
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
            Airdrop:  
            <a 
              href="https://ggeese.fun" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 font-bold hover:underline"
            >
              ggeese.fun
            </a>
          </p>*/}
          <div
            className="flex items-center space-x-1 rounded-lg p-1 cursor-pointer transition duration-200"
            onClick={() => copyToClipboard("bc1q2qdqw82tqmt6ctt6ydr7lxg3mrg4ps4l6a6m9m")}
          >
            <span className="text-gray-700 text-xs transition duration-200 active:scale-95">bc1q2qdqw82tqmt6ctt6ydr7lxg3mrg4ps4l6a6m9m</span>
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

export default BTCPage;
