import React, { useEffect, useState } from "react";

// Cargar las wallets desde el archivo JSON
import walletsData from "../../../public/ethwallets.json";

interface Wallet {
  address: string;
  balance: number;
  position?: { x: number; y: number; delay: number; duration: number }; // Nueva propiedad para guardar la posición
}

interface WalletBackgroundProps {
  onWalletClick: (address: string) => void; // Prop para manejar clics en el componente padre
}

const WalletBackground: React.FC<WalletBackgroundProps> = ({ onWalletClick }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    // Agrega posiciones aleatorias a cada wallet al cargar los datos
    const updatedWallets = walletsData.map((wallet) => ({
      ...wallet,
      position: getRandomValues(),
    }));
    setWallets(updatedWallets);
  }, []);

  // Función para generar valores aleatorios únicos
  const getRandomValues = () => {
    const randomX = Math.random() * 137 ; // Evitar bordes extremos (5% - 95%)
    const randomY = Math.random() * 90 ; // Evitar bordes extremos (5% - 95%)
    const randomDelay = Math.random() * 1370 / 130; // Retraso en segundos (0-5s)
    const randomDuration = 3 + Math.random() * 13; // Duración de animación (5-8s)

    return { x: randomX, y: randomY, delay: randomDelay, duration: randomDuration };
  };

  return (
    <div className="walletsBackground">
      {wallets.map((wallet, index) => {
        const { x, y, delay, duration } = wallet.position!; // Extraer los valores predefinidos
        return (
          <div
            key={index}
            className="wallet"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
            onClick={() => onWalletClick(wallet.address)} // Llamar al manejador con la dirección de la wallet
          >
            {wallet.address}: {wallet.balance.toLocaleString()}{" ETH"}
          </div>
        );
      })}
    </div>
  );
};

export default WalletBackground;
